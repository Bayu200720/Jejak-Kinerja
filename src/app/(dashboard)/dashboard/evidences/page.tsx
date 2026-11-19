"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { listEvidenceByActivity, uploadEvidence } from "@/app/actions/evidences";

export default function EvidencesPage() {
  const params = useSearchParams();
  const activity_id = params.get("activity_id") || "";

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [evidences, setEvidence] = useState<Array<{ id: string; original_filename: string; caption: string; uploaded_at: string; storage_path: string }>>([]);

  // Load evidences for this activity
  useEffect(() => {
    const fetchEvidence = async () => {
      if (activity_id) {
        const result = await listEvidenceByActivity(activity_id as string);
        if (result.success) {
          setEvidence(result.data);
        }
      }
    };
    fetchEvidence();
  }, [activity_id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setCaption(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!file || !activity_id) return;
    setUploadError("");
    setUploadSuccess(false);
    setLoading(true);
    const result = await uploadEvidence(activity_id as string, file, caption);
    setLoading(false);
    if (result.error) {
      setUploadError(result.error);
    } else {
      setUploadSuccess(true);
      setFile(null);
      setCaption("");
      // router.refresh();
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">File Bukti *</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hidden"
              id="file-input"
            />
            <button
              type="button"
              onClick={() => document.getElementById("file-input")?.click()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <span>
                {file ? (
                  <span className="line-clamp-1">
                    {file.name.substring(0, 20)}{file.name.length > 20 ? "..." : ""}
                  </span>
                ) : (
                  "Pilih File"
                )}
              </span>
            </button>
          </div>

          <div>
            <label className="text-sm font-medium">Keterangan *</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Deskripsi singkat bukti (opsional)"
            ></textarea>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Mengupload..." : "Upload Bukti"}
            </button>
          </div>
        </form>
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
        <h2 className="font-medium mb-3">Daftar Bukti Terdaftar</h2>
        {evidences.length === 0 ? (
          <p className="text-muted-foreground">Belum ada bukti terdaftar.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-background">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-sm font-medium p-3">Nama File</th>
                  <th className="text-left text-sm font-medium p-3">Keterangan</th>
                  <th className="text-left text-sm font-medium p-3">Diunggah</th>
                  <th className="text-left text-sm font-medium p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {evidences.map((ev) => (
                  <tr key={ev.id} className="border-b p-3 hover:bg-muted/50">
                    <td className="p-3">
                      <a
                        href={ev.storage_path}
                        target="_blank"
                        rel="noopener"
                        className="text-primary hover underline"
                      >
                        {ev.original_filename}
                      </a>
                    </td>
                    <td className="p-3">{ev.caption || "-"}</td>
                    <td className="p-3">
                      {new Date(ev.uploaded_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-muted-foreground">Lihat</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}