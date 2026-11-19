"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    return { error: "Anda harus login untuk mengubah profil." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const nip = String(formData.get("nip") ?? "").trim();

  if (!fullName) {
    return { error: "Nama lengkap wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, nip: nip || null })
    .eq("id", profile.id);

  if (error) {
    console.error("updateProfile error:", error);
    return { error: "Gagal memperbarui profil. Coba lagi." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
