"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";

type Props = {
  initialFullName: string;
  initialNip: string;
};

export default function SettingsForm({ initialFullName, initialNip }: Props) {
  const [serverError, setServerError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setServerError("");
    setSuccess(false);
    setIsSubmitting(true);
    
    const result = await updateProfile(formData);
    setIsSubmitting(false);
    
    if (result.error) {
      setServerError(result.error);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <h2 className="font-medium">Informasi Dasar</h2>
      
      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {serverError}
        </div>
      )}
      
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Profil berhasil diperbarui.
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm font-medium">
            Nama Lengkap *
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={initialFullName}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="nip" className="text-sm font-medium">
            NIP (opsional)
          </label>
          <input
            id="nip"
            name="nip"
            type="text"
            defaultValue={initialNip}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Contoh: 19900101 202301 1 001"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
