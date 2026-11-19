"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const schema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi tidak cocok",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function ResetCallbackPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>("");
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    // Supabase akan mengirim session recovery via URL hash di client
    const supabase = createClient();
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // coba parse dari URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.get("type") === "recovery") {
          // session recovery terdeteksi, tunggu
        } else {
          setServerError("Link reset tidak valid atau sudah kedaluwarsa.");
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      setServerError("Gagal mengubah password. Coba lagi atau minta link baru.");
      return;
    }

    setIsDone(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
        <p className="text-muted-foreground">Memverifikasi link reset...</p>
      </main>
    );
  }

  if (isDone) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Password Berhasil Diubah</h1>
        <p className="text-sm text-muted-foreground">Anda akan diarahkan ke halaman login...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Buat Password Baru</h1>
      <p className="text-sm text-muted-foreground">
        Masukkan password baru untuk akun Anda.
      </p>

      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {serverError}
        </div>
      )}

      <form
        className="space-y-4 rounded-lg border p-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password Baru
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Minimal 6 karakter"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Konfirmasi Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Ulangi password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? "Memproses..." : "Simpan Password Baru"}
        </button>
      </form>

      <p className="text-sm">
        <Link href="/login" className="text-muted-foreground underline hover:text-foreground">
          Kembali ke login
        </Link>
      </p>
    </main>
  );
}
