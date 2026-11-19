"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/app/actions/auth";
import Link from "next/link";

const schema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Masukkan email yang valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [serverError, setServerError] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    const result = await signIn(formData);
    if (result?.error) {
      setServerError(result.error);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Masuk</h1>
      <p className="text-sm text-muted-foreground">
        Masuk menggunakan email dan password akun Supabase Anda.
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
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="nama@instansi.go.id"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="text-xs text-muted-foreground">
        Lupa password? <Link href="/reset-password" className="underline text-primary">Reset di sini</Link>.
      </p>
      <p className="text-sm">
        Belum punya akun? <Link href="/signup" className="text-primary underline">Daftar di sini</Link>.
      </p>
      <p className="text-sm">
        <Link href="/" className="text-muted-foreground underline hover:text-foreground">
          Kembali ke beranda
        </Link>
      </p>
    </main>
  );
}
