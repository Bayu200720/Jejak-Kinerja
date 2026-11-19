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

  // Upload ke Supabase Storage (anon key; bucket policy harus izinkan authenticated upload)
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

  // Dapatkan public URL (atau kita bisa generate signed URL di server nanti)
  const { data: urlData } = supabase.storage
    .from("activity-evidences")
    .getPublicUrl(path);

  // Simpan record ke tabel activity_evidences
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
      uploaded_by: (await supabase.auth.getUser()).data.user?.id || null,
    });

  if (dbError) {
    console.error("Evidence DB insert error:", dbError);
    // Opsional: kita bisa hapus file storage jika insert gagal
    return { error: "Gagal menyimpan catatan bukti. Upload file sudah selesai tapi gagal catat." };
  }

  revalidatePath(`/dashboard/aktivitas/${activity_id}`);
  return { success: true, url: urlData.publicUrl };
}

export async function listEvidenceByActivity(activity_id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_evidences")
    .select("*")
    .eq("activity_id", activity_id)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error(" listEvidence error:", error);
    return { error: "Gagal memuat daftar bukti.", data: [] };
  }

  return { success: true, data: data || [] };
}