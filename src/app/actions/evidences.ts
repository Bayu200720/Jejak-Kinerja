"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type EvidenceFormValues = {
  activity_id: string;
  caption: string;
  file: File; // from client formData
};

export async function uploadEvidence(activity_id: string, file: File, caption: string) {
  const supabase = await createClient();

  // Generate a unique path: activity_id/timestamp_filename
  const fileExt = file.name.split(".").pop() || "bin";
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
  const path = `evidences/${activity_id}/${fileName}`;

  // Upload ke Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("activity-evidences")
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Evidence upload error:", uploadError);
    return { error: "Gagal upload file ke storage. Cek konfigurasi bucket." };
  }

  // Generate signed URL TTL 15 menit untuk download/preview
  const { data: signData, error: signError } = await supabase.storage
    .from("activity-evidences")
    .createSignedUrl(path, 15 * 60); // 15 minutes in seconds

  if (signError) {
    console.error("Signed URL error:", signError);
    return { error: "Gagal generate signed URL untuk bukti." };
  }

  // Simpan record ke tabel activity_evidences dengan soft-delete
  const { error: dbError } = await supabase
    .from("activity_evidences")
    .insert({
      activity_id: activity_id,
      storage_bucket: "activity-evidences",
      storage_path: path,
      original_filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      caption: caption || null,
      deleted_at: null, // Soft-delete marker
      uploaded_by: (await supabase.auth.getUser()).data.user?.id || null,
    });

  if (dbError) {
    console.error("Evidence DB insert error:", dbError);
    // Jika insert gagal, hapus file storage
    await supabase.storage
      .from("activity-evidences")
      .remove([path]);
    return { error: "Gagal menyimpan catatan bukti. Upload file sudah selesai tapi gagal catat." };
  }

  revalidatePath(`/dashboard/aktivitas/${activity_id}`);
  return { success: true, signedUrl: signData.signedUrl };
}

export async function listEvidenceByActivity(activity_id: string) {
  const supabase = await createClient();
  // Hanya tampilkan evidences yang belum soft-deleted
  const { data, error } = await supabase
    .from("activity_evidences")
    .select("*")
    .eq("activity_id", activity_id)
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error(" listEvidence error:", error);
    return { error: "Gagal memuat daftar bukti.", data: [] };
  }

  return { success: true, data: data || [] };
}

// Soft-delete evidence (mark as deleted, don't remove from DB immediately)
export async function softDeleteEvidence(evidence_id: string) {
  const supabase = await createClient();

  const { error: dbError } = await supabase
    .from("activity_evidences")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", evidence_id);

  if (dbError) {
    console.error("Evidence soft-delete error:", dbError);
    return { error: "Gagal menghapus catatan bukti." };
  }

  // Audit log akan ditambahkan di sini jika ada tabel audit_logs
  // Untungnya: file storage akan dibersihkan secara periodik (30 hari)

  revalidatePath(`/dashboard/aktivitas`);
  return { success: true };
}

// Permanent delete evidence (remove from storage after soft-delete periode)
export async function permanentDeleteEvidence(evidence_id: string) {
  const supabase = await createClient();

  // Ambil path dulu sebelum dihapus dari DB
  const { data: evidence } = await supabase
    .from("activity_evidences")
    .select("storage_path")
    .eq("id", evidence_id)
    .single();

  if (!evidence) {
    return { error: "Bukti tidak ditemukan." };
  }

  // Hapus dari storage
  const { error: storageError } = await supabase.storage
    .from("activity-evidences")
    .remove([evidence.storage_path]);

  if (storageError) {
    console.error("Permanent delete storage error:", storageError);
    // Tidak kembalikan error krusial, lanjutkan delete DB
  }

  // Hapus dari DB
  const { error: dbError } = await supabase
    .from("activity_evidences")
    .delete()
    .eq("id", evidence_id);

  if (dbError) {
    console.error("Permanent delete DB error:", dbError);
    return { error: "Gagal menghapus permanen catatan bukti." };
  }

  revalidatePath(`/dashboard/aktivitas`);
  return { success: true };
}