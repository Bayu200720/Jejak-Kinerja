"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordRequest } from "@/app/actions/auth";
import Link from "next/link";

const schema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Masukkan email yang valid"),
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [serverError, setServerError] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    const result = await resetPasswordRequest(values.email);
    if (result?.error) {
      setServerError(result.error);
    } else {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Periksa Email</h1>
        <p className="text-sm text-muted-foreground">
          Jika email terdaftar, tautan reset password telah dikirim. Silakan cek inbox Anda.
        </p>
        <Link href="/login" className="text-sm text-primary underline">
          Kembali ke halaman login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Reset Password</h1>
      <p className="text-sm text-muted-foreground">
        Masukkan email akun Anda untuk menerima tautan reset password.
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Tautan Reset"}
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
