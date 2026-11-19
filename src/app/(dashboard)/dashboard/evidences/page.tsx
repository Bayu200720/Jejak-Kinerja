"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { listEvidenceByActivity, uploadEvidence, softDeleteEvidence, permanentDeleteEvidence } from "@/app/actions/evidences";

import { createClient } from "@/lib/supabase/client";

// Compress image client-side: resize max dimension, adjust quality
const compressImage = async (file: File, maxDim = 1920, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      img.src = e.target!.result as string;
    };
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Resize jika melebihi maxDim
      if (width > height) {
        if (width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Cannot get canvas context"));
      ctx.drawImage(img, 0, 0, width, height);

      // Output as JPEG/WebP dengan kualitas yang ditentukan
      const mimeType = file.type.startsWith("image/") ? file.type : "image/jpeg";
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Failed to create blob"));
        const compressedFile = new File([blob], file.name, {
          type: mimeType,
        });
        resolve(compressedFile);
      }, mimeType, quality);
    };
    img.onerror = (err) => reject(err);
  });
};

export default function EvidencesPage() {
  const params = useSearchParams();
  const activity_id = params.get("activity_id") || "";

  const [file, setFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [evidences, setEvidence] = useState<Array<{ id: string; original_filename: string; caption: string; uploaded_at: string; storage_path: string; deleted_at: string | null }>>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load evidences for this activity
  useEffect(() => {
    const fetchEvidence = async () => {
      const result = await listEvidenceByActivity(activity_id as string);
      if (result.error) {
        setUploadError(result.error);
      } else {
        setEvidence(result.data || []);
      }
    };
    fetchEvidence();
  }, [activity_id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      // Kompresi client-side sebelum simpan state
      compressImage(file).then((compressed) => {
        setFile(compressed);
        setCaptions((prev) => ({ ...prev, [compressed.name]: "" }));
      }).catch((err) => {
        // Jika kompresi gagal, simpan file asli
        setFile(file);
        setCaptions((prev) => ({ ...prev, [file.name]: "" }));
      });
    } else {
      setFile(file);
      setCaptions((prev) => ({ ...prev, [file.name]: "" }));
    }
  };

  // Hilangkan caption ketika file baru dipilih
  useEffect(() => {
    if (file) {
      setCaptions((prev) => ({ ...prev, [file.name]: "" }));
    }
  }, [file]);

  const handleSubmit = async () => {
    if (!file || !activity_id) return;
    setUploadError("");
    setUploadSuccess(false);
    setLoading(true);
    // Ambil caption untuk file ini
    const currentCaption = captions[file.name] || "";
    const result = await uploadEvidence(activity_id as string, file, currentCaption);
    setLoading(false);
    if (result.error) {
      setUploadError(result.error);
    } else {
      setUploadSuccess(true);
      // Reset form
      setFile(null);
      // Hapus caption untuk file ini dari state local (server sudah menyimpannya)
      setCaptions((prev) => {
        const newPrev = { ...prev };
        delete newPrev[file.name];
        return newPrev;
      });
    }
  };

  // Saat activity_id berubah, reset captions local
  useEffect(() => {
    setCaptions({});
  }, [activity_id]);

  // Fungsi download dengan signed URL
  const handleDownload = async (evidence: { id: string; storage_path: string }) => {
    const supa = createClient() as any;
    const { data: signData, error: signError } = await supa.storage
      .from("activity-evidences")
      .createSignedUrl(evidence.storage_path, 15 * 60);

    if (signError) {
      alert("Gagal generate signed URL untuk download.");
      return;
    }

    // Arahkan ke URL dengan kadaluarsa
    window.open(signData.signedUrl, "_blank");
  };

  // Fungsi soft-delete evidence
  const handleSoftDelete = async (evidence: { id: string; original_filename: string }) => {
    setDeleting(evidence.id);
    const result = await softDeleteEvidence(evidence.id);
    setDeleting(null);
    if (result.error) {
      alert(result.error);
    } else {
      alert("Bukti berhasil dihapus (soft-delete). File akan dibersihkan setelah 30 hari.");
      // Refresh daftar evidences
      const result2 = await listEvidenceByActivity(activity_id as string);
      if (!result2.error) {
        setEvidence(result2.data || []);
      }
    }
  };

  // Fungsi permanent delete evidence
  const handlePermanentDelete = async (evidence: { id: string; storage_path: string }) => {
    const result = await permanentDeleteEvidence(evidence.id);
    if (result.error) {
      alert(result.error);
    } else {
      alert("Bukti berhasil dihapus permanen.");
      // Refresh daftar evidences
      const result2 = await listEvidenceByActivity(activity_id as string);
      if (!result2.error) {
        setEvidence(result2.data || []);
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Bukti Kegiatan</h1>

      {activity_id ? (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Aktivitas ID: {activity_id}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Pilih aktivitas untuk menambah bukti.
        </p>
      )}

      {/* Upload form */}
      <div className="card bg-background p-6 mb-6">
        <h2 className="font-semibold mb-4">Unggah Bukti</h2>

        {/* Preview area */}
        {file && (
          <div className="mb-4 p-4 border rounded-md border-primary/30">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="max-w-full max-h-64 object-cover"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {file.name} ({formatFileSize(file.size)})
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* File input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <span>File Bukti</span>
            </label>
            <input
              type="file"
              accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessing.document"
              onChange={handleFileChange}
              className="w-full border rounded-md py-2 px-3 cursor-pointer bg-secondary/50 text-sm"
            />
            {file && (
              <p className="text-xs text-muted-foreground mt-1">
                Dipilih: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          {/* Caption input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <span>Caption</span>
              <span className="text-red-500">*</span>
            </label>
            {file && (
              <input
                type="text"
                value={captions[file.name] || ""}
                onChange={(e) =>
                  setCaptions((prev) => ({ ...prev, [file.name]: e.target.value }))
                }
                className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tuliskan caption bukti..."
                required
              />
            )}
          </div>
        </div>
      </div>

      {/* Upload status */}
      {uploadError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Bukti berhasil diupload.
        </div>
      )}

      {/* Daftar bukti existente */}
      <div className="mt-6">
        <h2 className="font-semibold mb-4">Bukti yang Sudah Ada</h2>
        {evidences.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tidak ada bukti untuk aktivitas ini.
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {evidences.map((ev) => (
              <div
                key={ev.id}
                className="p-3 border rounded-md border-secondary/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {ev.storage_path?.includes(".pdf") ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-secondary"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 13h-6v6h-2v6h6v-6H16v-6H9c-1.7 0-3-1.3-3-3V9c0-1.7 1.3-3 3-3h10c1.7 0 3 1.3 3 3v2h2V9c0-1.7-1.3-3-3-3m0 6h-6v2h2v-2h6v-2H19v2H19v-2m3 9c-2.2 0-4 1.8-4 4v2h2V5c0-2.2-1.8-4-4-4m3 13c1.1 0 2.2-.4 3-1.1 0.5-0.5 0.9-1.1 1.2-1.8l2-2c0.3-0.3 0.3-0.8 0-1.1-0.4-0.2-0.8-0.2-1.2 0l-2 2c-0.5 0.5-1.1 0.9-1.8 1.2M4.3 9.1l1.4 1.4c0.2 0.2 0.5 0.3 0.8 0.3s0.6-0.1 0.8-0.3l1.4-1.4c0.2-0.2 0.2-0.5 0-0.8s-0.5-0.3-0.8 0.1L4.3 9.1m7.4 3.8l1.4 1.4c0.2 0.2 0.5 0.3 0.8 0.3s0.6-0.1 0.8-0.3l1.4-1.4c0.2-0.2 0.2-0.5 0-0.8s-0.5-0.3-0.8 0.1L7.4 9.1m7.4 8.6l1.4 1.4c0.2 0.2 0.5 0.3 0.8 0.3s0.6-0.1 0.8-0.3l1.4-1.4c0.2-0.2 0.2-0.5 0-0.8s-0.5-0.3-0.8 0.1L12.4 12.6m-6.6-6.6l1.4 1.4c0.2 0.2 0.5 0.3 0.8 0.3s0.6-0.1 0.8-0.3l1.4-1.4c0.2-0.2 0.2-0.5 0-0.8s-0.5-0.3-0.8 0.1L8.8 8.8"/>
                    </svg>
                  ) : (
                    <img
                      src={`data:image/jpeg;base64,${ev.storage_path.substring(0, 20)}...`}
                      alt="Evidence"
                      className="h-5 w-5 rounded-md object-cover mr-2"
                    />
                  )}
                  <span className="text-sm">{ev.original_filename}</span>
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {ev.caption || "(tanpa caption)"}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  {ev.deleted_at ? (
                    <span className="text-muted-foreground">Dihapus</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Download button */}
                      <button
                        onClick={() => handleDownload(ev)}
                        className="rounded-md bg-secondary px-2 py-1 text-secondary hover:bg-secondary/90 text-sm"
                        title="Download bukti"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M21 15v4h-4m-5.5-5.5L15.5 12l-2.5 2.5M1 21l4-4m5.66-5.66l2.12 2.12m0 5.66l-2.12 2.12m14.14-9.9l-2.12-2.12m-5.66 5.66l2.12-2.12m2.12 5.66l2.12 2.12"/>
                        </svg>
                      </button>

                      {/* Soft-delete button */}
                      {!ev.deleted_at && (
                        <button
                          onClick={() => handleSoftDelete(ev)}
                          className="rounded-md bg-destructive px-2 py-1 text-destructive hover:bg-destructive/90 text-sm"
                          title="Hapus bukti (soft-delete)"
                        >
                          Hapus
                        </button>
                      )}

                      {/* Permanent delete button (only if not already deleted) */}
                      {!ev.deleted_at && (
                        <button
                          onClick={() => handlePermanentDelete(ev)}
                          className="rounded-md bg-destructive/60 px-2 py-1 text-destructive hover:bg-destructive/60 text-sm"
                          title="Hapus permanen"
                        >
                          Perma
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}