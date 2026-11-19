"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email atau password salah, atau akun belum diaktifkan." };
  }

  // redirect berdasarkan role dari profile (middleware juga akan mengatur ini)
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPasswordRequest(email: string) {
  const supabase = await createClient();
  // request password reset; Supabase akan mengirim email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-callback`,
  });

  if (error) {
    return { error: "Gagal mengirim email reset password. Cek email yang dimasukkan." };
  }

  // tampilkan pesan sukses namun jangan leak info; redirect ke login
  redirect("/login?reset_sent=1");
}

export async function handlePasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Email wajib diisi." };
  }

  const result = await resetPasswordRequest(email);

  // result.error sudah keluar ke redirect, tapi tetap kembalikan untuk UI
  if (result?.error && !formData.get("redirect")) {
    return { error: result.error };
  }

  // jika ada query param redirect, kembali ke halaman sebelumnya
  redirect("/login?reset_sent=1");
}