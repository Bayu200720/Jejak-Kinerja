"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function throwIfError<T>(result: { data?: T; error?: any }): T {
  if (result.error) throw result.error;
  return result.data !;
}

export async function insertDailyActivity(formData: FormData) {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    return { error: "Anda harus login." };
  }

  // Ekstrak volume dan satuan dari form data
  const volume = formData.get("volume_pekerjaan") ? Number(formData.get("volume_pekerjaan")) : null;
  const satuan_output = String(formData.get("satuan_output") ?? "").trim();

  // Validasi volume dan satuan
  if (volume !== null && volume <= 0) {
    return { error: "Volume harus lebih besar dari 0." };
  }
  if ((volume ?? 0) > 0 && !satuan_output) {
    return { error: "Satuan output wajib diisi ketika volume di atas 0." };
  }

  const tanggal = String(formData.get("tanggal") ?? "").trim();
  const nama_kegiatan = String(formData.get("nama_kegiatan") ?? "").trim();

  if (!tanggal || !nama_kegiatan) {
    return { error: "Tanggal dan nama kegiatan wajib diisi." };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(tanggal)) {
    return { error: "Format tanggal salah. Gunakan YYYY-MM-DD." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_activities")
    .insert({
      organization_id: profile.organization_id,
      asn_profile_id: profile.id,
      tanggal,
      nama_kegiatan,
      status: "draft",
    })
    .select();

  if (error) {
    console.error("insertDailyActivity error:", error);
    return { error: "Gagal menyimpan aktivitas. Coba lagi." };
  }

  revalidatePath("/dashboard/aktivitas");
  return { success: true };
}

export async function updateDailyActivity(id: string, formData: FormData) {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    return { error: "Anda harus login." };
  }

  // Simpan tanpa cek izin kompleks (MVP); semua user bisa update aktivitas own
  const tanggal = String(formData.get("tanggal") ?? "").trim();
  const nama_kegiatan = String(formData.get("nama_kegiatan") ?? "").trim();

  if (!tanggal || !nama_kegiatan) {
    return { error: "Tanggal dan nama kegiatan wajib diisi." };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(tanggal)) {
    return { error: "Format tanggal salah. Gunakan YYYY-MM-DD." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_activities")
    .update({ tanggal, nama_kegiatan })
    .eq("id", id);

  if (error) {
    console.error("updateDailyActivity error:", error);
    return { error: "Gagal memperbarui aktivitas. Coba lagi." };
  }

  revalidatePath("/dashboard/aktivitas");
  return { success: true };
}

export async function deleteDailyActivity(id: string) {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    return { error: "Anda harus login." };
  }

  // Simpan tanpa cek izin kompleks (MVP)
  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_activities")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("deleteDailyActivity error:", error);
    return { error: "Gagal menghapus aktivitas. Coba lagi." };
  }

  revalidatePath("/dashboard/aktivitas");
  return { success: true };
}

export async function listDailyActivities(filters?: { tanggal?: string; status?: string }) {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    return { error: "Anda harus login", data: [] };
  }

  const supabase = await createClient();
  let query = supabase
    .from("daily_activities")
    .select("*", { count: "exact" })
    .eq("organization_id", profile.organization_id)
    .order("tanggal", { ascending: false });

  if (filters?.tanggal) {
    query = query.eq("tanggal", filters.tanggal);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("listDailyActivities error:", error);
    return { error: "Gagal memuat daftar aktivitas.", data: [] };
  }

  return { success: true, data: data || [], total: count || 0 };
}