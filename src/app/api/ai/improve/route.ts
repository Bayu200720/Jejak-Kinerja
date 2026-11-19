import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, mode } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Teks wajib diisi." },
        { status: 400 }
      );
    }

    if (mode !== "improve" && mode !== "simplify") {
      return NextResponse.json(
        { error: "Mode tidak valid. Gunakan 'improve' atau 'simplify'." },
        { status: 400 }
      );
    }

    // Gunakan Gemini free tier (atau Groq fallback)
    const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Fallback: return edited text manually when no AI key configured
      const edited = mode === "improve" 
        ? improveText(text) 
        : simplifyText(text);
      return NextResponse.json({ text: edited, fallback: true });
    }

    // Call AI provider
    let aiText: string;

    if (process.env.GEMINI_API_KEY) {
      aiText = await callGemini(text, mode);
    } else if (process.env.GROQ_API_KEY) {
      aiText = await callGroq(text, mode);
    } else {
      // Should not reach here due to earlier check
      const edited = mode === "improve" 
        ? improveText(text) 
        : simplifyText(text);
      return NextResponse.json({ text: edited, fallback: true });
    }

    return NextResponse.json({ text: aiText, fallback: false });
  } catch (error: any) {
    console.error("AI improve error:", error);
    return NextResponse.json(
      { error: "Gagal memproses permintaan AI. Coba lagi nanti." },
      { status: 500 }
    );
  }
}

// Fungsi bantu: improve grammar/clarity
function improveText(text: string): string {
  // Basic improvements: fix double spaces, capitalize start
  let result = text.trim();
  result = result.replace(/\s+/g, " ");
  // Simple heuristic: ensure sentence starts with capital
  result = result.replace(/(^|\.)\s*([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  return result;
}

// Fungsi bantu: simplify long text
function simplifyText(text: string): string {
  // Basic simplification: truncate to first sentence + ellipsis
  const firstSentence = text.split(". ")[0];
  return firstSentence + (text.includes(". ") ? "..." : "");
}

// Call Gemini API
async function callGemini(text: string, mode: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  const prompt = mode === "improve"
    ? `Improve the following Indonesian text for grammar and clarity. Keep the meaning intact. Return only the improved text, no analysis:
"${text}"`
    : `Simplify the following Indonesian text. Make it shorter and clearer. Return only the simplified text, no analysis:
"${text}"`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error("Gemini API unexpected response format");
}

// Call Groq API
async function callGroq(text: string, mode: string): Promise<string> {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  const systemPrompt = mode === "improve"
    ? "Improve the following Indonesian text for grammar and clarity. Keep the meaning intact. Return only the improved text."
    : "Simplify the following Indonesian text. Make it shorter and clearer. Return only the simplified text.";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768", // Groq model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
    return data.choices[0].message.content;
  }

  throw new Error("Groq API unexpected response format");
}