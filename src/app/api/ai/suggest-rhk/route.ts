import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Teks wajib diisi." },
        { status: 400 }
      );
    }

    // Gunakan Gemini free tier (atau Groq fallback)
    const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Fallback: extract potential RHK IDs dari teks (heuristic)
      const suggestedIds = suggestRHKHeuristic(text);
      return NextResponse.json({ rhcIds: suggestedIds, fallback: true });
    }

    // Call AI provider
    let rhcIds: string[];

    if (process.env.GEMINI_API_KEY) {
      rhcIds = await suggestRHKViaGemini(text);
    } else if (process.env.GROQ_API_KEY) {
      rhcIds = await suggestRHKViaGroq(text);
    } else {
      const suggestedIds = suggestRHKHeuristic(text);
      return NextResponse.json({ rhcIds: suggestedIds, fallback: true });
    }

    return NextResponse.json({ rhcIds, fallback: false });
  } catch (error: any) {
    console.error("AI suggest RHK error:", error);
    // Fallback heuristic
    const suggestedIds = suggestRHKHeuristic("");
    return NextResponse.json({ rhcIds: suggestedIds, fallback: true, error: "AI unavailable" });
  }
}

// Heuristic: extract potential kategori/RHK keywords from text
function suggestRHKHeuristic(text: string): string[] {
  const keywords: string[] = [];
  const lower = text.toLowerCase();

  // Kategori kerja umum
  const kategoriMap: Record<string, string> = {
    "rapat": "rapat",
    "pertemuan": "pertemuan",
    "penelitian": "penelitian",
    "pengabdian": "pengabdian",
    "pembelajaran": "pembelajaran",
    "pelayanan": "pelayanan",
    "pengkajian": "pengkajian",
    "pengolahan": "pengolahan",
    "pembangunan": "pembangunan",
    "pengawasan": "pengawasan",
    "penulisan": "penulisan",
    "presentasi": "presentasi",
    "laporan": "laporan",
    "diskusi": "diskusi",
    "training": "training",
    "workshop": "workshop",
    "evaluasi": "evaluasi",
    "audit": "audit",
  };

  for (const [keyword, category] of Object.entries(kategoriMap)) {
    if (lower.includes(keyword)) {
      keywords.push(category);
    }
  }

  // Jika tidak ditemukan kategori, return keywords umum
  if (keywords.length === 0) {
    // Ambil kata-kata penting (simple extraction)
    const words = lower.split(" ").filter((w: string) => w.length > 3);
    // Simple deduplication without Set
    const unique: string[] = [];
    for (const w of words) {
      if (!unique.includes(w)) {
        unique.push(w);
      }
    }
    return unique.slice(0, 3); // max 3 suggestions
  }

  return keywords;
}

// Call Gemini API for RHK suggestion
async function suggestRHKViaGemini(text: string): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Based on the following Indonesian text about work activities, suggest relevant RHK (Renja Kerja Hariai) template IDs or categories. Return as a JSON array of strings, e.g., ["penelitian", "rapat"]. Keep it concise. Text: "${text}"`;

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
    const result = data.candidates[0].content.parts[0].text;
    // Parse JSON array from response
    try {
      return JSON.parse(result);
    } catch {
      // Fallback: extract keywords
      return suggestRHKHeuristic(text);
    }
  }

  throw new Error("Gemini API unexpected response format");
}

// Call Groq API for RHK suggestion
async function suggestRHKViaGroq(text: string): Promise<string[]> {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: "Based on the following Indonesian text about work activities, suggest relevant RHK (Renja Kerja Harian) categories. Return as a JSON array of strings, e.g., [\"penelitian\", \"rapat\"]. Keep it concise." },
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
    const result = data.choices[0].message.content;
    try {
      return JSON.parse(result);
    } catch {
      return suggestRHKHeuristic(text);
    }
  }

  throw new Error("Groq API unexpected response format");
}