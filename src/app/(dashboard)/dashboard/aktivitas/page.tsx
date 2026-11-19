"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { insertDailyActivity, updateDailyActivity, deleteDailyActivity } from "@/app/actions/daily-activities";
import { usePathname, useRouter } from "next/navigation";
const AUTO_SAVE_KEY = "jk-aktivitas-draft";
const AUTO_SAVE_DELAY = 1000; // ms sebelum menyimpan setelah terakhir kali ketik

export default function AktivitasPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  // State form
  const [formData, setFormData] = useState({
    tanggal: "",
    nama_kegiatan: "",
    deskripsi: "",
    volume_pekerjaan: null as number | null,
    satuan_output: "",
    start_time: null as string | null,
    end_time: null as string | null,
    lokasi: "",
    catatan: "",
    status: "draft" as "draft" | "submitted",
  });

  // Autosave ke localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(formData));
      } catch (e) {
        // localStorage penuh atau error, abaikan
      }
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timer);
  }, [formData]);

  // Memulihkan draft dari localStorage saat load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Hanya overwrite jika form masih dalam draft (belum pernah submit)
        const existingPath = pathname.includes("/aktivitas/tambah")
          ? "tambah"
          : pathname.split("/").pop() === "aktivitas";
        if (existingPath) {
          setFormData(parsed);
        }
      }
    } catch (e) {
      // abaikan error localStorage
    }
  }, [pathname]);

  // Bersihkan draft setelah berhasil disubmit
  useEffect(() => {
    // Cek apakah ada URL submit success (bisa ditambahkan query param)
    // Untuk sekarang, kita bersihkan draft jika user kembali ke halaman utama
    if (pathname === "/dashboard/aktivitas" || pathname === "/") {
      try {
        localStorage.removeItem(AUTO_SAVE_KEY);
      } catch (e) {
        // abaikan
      }
    }
  }, [pathname]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? (name === "volume_pekerjaan" ? null : "") : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const num = value === "" ? null : Number(value);
    const name = e.target.name as keyof typeof formData;
    setFormData((prev) => ({
      ...prev,
      [name]: num !== null && !isNaN(num) ? num : prev[name],
    }));
  };

  // AI state
  const [aiMode, setAiMode] = useState<"improve" | "suggest" | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string | string[] | null>(null);
  const [aiFallback, setAiFallback] = useState<boolean>(false);

// Handle AI improve/suggest via fetch
  // Helper functions for fallback (when AI API is unavailable)
  const improveText = (text: string): string => {
    let result = text.trim();
    result = result.replace(/\s+/g, " ");
    result = result.replace(/(^|\.)\s*([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
    return result;
  };

  const suggestRHKHeuristic = (text: string): string[] => {
    const keywords: string[] = [];
    const lower = text.toLowerCase();

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

    if (keywords.length === 0) {
      const words = lower.split(" ").filter((w: string) => w.length > 3);
      // Simple deduplication without Set
      const unique: string[] = [];
      for (const w of words) {
        if (!unique.includes(w)) {
          unique.push(w);
        }
      }
      return unique.slice(0, 3);
    }

    return keywords;
  };

  const handleAI = async (mode: "improve" | "suggest") => {
    if (!formData.nama_kegiatan || !formData.deskripsi) {
      alert("Isi nama kegiatan dan deskripsi terlebih dahulu.");
      return;
    }
    setAiLoading(true);
    setAiMode(mode);
    setAiResult(null);
    setAiFallback(false);

    try {
      let endpoint: string;
      if (mode === "improve") {
        endpoint = "/api/ai/improve";
      } else {
        endpoint = "/api/ai/suggest-rhk";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: formData.deskripsi, mode }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const result = await response.json();
      setAiResult(result.text ?? result.rhcIds ?? result);
      setAiFallback(result.fallback ?? false);
    } catch (err: any) {
      console.error("AI error:", err);
      // Fallback manual di klien
      if (mode === "improve") {
        const manualResult = improveText(formData.deskripsi);
        setAiResult(manualResult);
      } else {
        const manualResult = suggestRHKHeuristic(formData.deskripsi);
        setAiResult(manualResult);
      }
      setAiFallback(true);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Build FormData dari formData state
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        // Hindari mengirim null/undefined ke FormData
        if (value !== null && value !== undefined) {
          fd.append(key, String(value));
        }
      });
      const result = await insertDailyActivity(fd);

      if (result.error) {
        alert(result.error);
        return;
      }

      // Bersihkan draft setelah submit
      try {
        localStorage.removeItem(AUTO_SAVE_KEY);
      } catch (e) {
        // abaikan
      }

      router.push("/dashboard/aktivitas");
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.message || err));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Catat Aktivitas Harian</h1>

      <div className="mt-4">
        <Link
          href="/dashboard/aktivitas"
          className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
        >
          <span className="inline-block">Kembali daftar</span>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground mt-2">
        Data akan otomatis disimpan (autosave) setiap 1 detik setelah terakhir kali perubahan.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">Tanggal</label>
          <input
            type="date"
            name="tanggal"
            value={formData.tanggal}
            onChange={handleChange}
            required
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nama Kegiatan</label>
          <input
            type="text"
            name="nama_kegiatan"
            value={formData.nama_kegiatan}
            onChange={handleChange}
            required
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Misal: Rapat tim, Penelitian, dll"
          />
          <div className="mt-2 space-x-2">
            <button
              type="button"
              onClick={() => handleAI("improve")}
              disabled={!formData.nama_kegiatan || !formData.deskripsi || aiLoading}
              className="rounded-md bg-primary px-2 py-1 text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
              title="Improve teks AI"
            >
              {aiLoading && aiMode === "improve" ? "Memproses..." : "AI Improve"}
            </button>
            <button
              type="button"
              onClick={() => handleAI("suggest")}
              disabled={!formData.nama_kegiatan || !formData.deskripsi || aiLoading}
              className="rounded-md bg-secondary px-2 py-1 text-secondary text-sm hover:bg-secondary/90 disabled:opacity-50"
              title="Suggest RHK AI"
            >
              {aiLoading && aiMode === "suggest" ? "Memproses..." : "RHK Suggest"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea
            name="deskripsi"
            rows={3}
            value={formData.deskripsi}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, deskripsi: e.target.value }));
              setAiMode(null);
              setAiResult(null);
            }}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            placeholder="Tuliskan deskripsi aktivitas..."
          ></textarea>
          {aiLoading && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm text-blue-700">Memproses AI... Mohon tunggu.</span>
            </div>
          )}
          {aiMode && aiResult && !aiLoading && (
            <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-blue-900">
                  {aiMode === "improve" ? "✨ Hasil Perbaikan AI:" : "💡 Saran RHK:"}
                </p>
                {aiFallback && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Mode Offline
                  </span>
                )}
              </div>
              {aiMode === "improve" ? (
                <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-blue-100 leading-relaxed">
                  {aiResult as string}
                </div>
              ) : (
                <ul className="space-y-2">
                  {(aiResult as string[]).map((item, idx) => (
                    <li key={idx} className="bg-white p-2 rounded border border-blue-100 text-sm text-gray-800">
                      {idx + 1}. {item}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {aiMode === "improve" && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, deskripsi: aiResult as string }));
                      setAiMode(null);
                      setAiResult(null);
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Gunakan Hasil Ini
                  </button>
                )}
                {aiMode === "suggest" && (
                  <button
                    type="button"
                    onClick={() => {
                      const suggestions = aiResult as string[];
                      if (suggestions.length > 0) {
                        setFormData((prev) => ({ 
                          ...prev, 
                          nama_kegiatan: suggestions[0].charAt(0).toUpperCase() + suggestions[0].slice(1)
                        }));
                      }
                      setAiMode(null);
                      setAiResult(null);
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Gunakan Saran Pertama
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setAiMode(null);
                    setAiResult(null);
                  }}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Volume Pekerjaan</label>
          <input
            type="number"
            name="volume_pekerjaan"
            value={formData.volume_pekerjaan !== null ? String(formData.volume_pekerjaan) : ""}
            onChange={handleNumberChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Isi angka jika ada volume kerja (contoh: 50, 100, dll). Satuan opsional di bawah.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Satuan Output</label>
          <input
            type="text"
            name="satuan_output"
            value={formData.satuan_output}
            onChange={handleChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Contoh: lembar, paket, kali"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Harus diisi jika volume di atas 0.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Waktu Mulai</label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time || ""}
            onChange={handleChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Waktu Selesai</label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time || ""}
            onChange={handleChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lokasi</label>
          <input
            type="text"
            name="lokasi"
            value={formData.lokasi}
            onChange={handleChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Opsional: Kantor, Lapangan, dll"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Catatan</label>
          <textarea
            name="catatan"
            rows={3}
            value={formData.catatan}
            onChange={handleChange}
            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            placeholder="Catatan opsional..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full"
        >
          {formData.status === "draft" ? "Simpan & Lanjut" : "Perbarui Aktivitas"}
        </button>
      </form>
    </div>
  );
}