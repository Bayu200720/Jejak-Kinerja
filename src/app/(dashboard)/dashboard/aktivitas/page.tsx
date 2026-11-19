"use client";

import { useState } from "react";
import Link from "next/link";

export default function AktivitasPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Aktivitas Harian</h1>

      <div className="mt-4">
        <Link
          href="/dashboard/aktivitas/tambah"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <span className="inline-block animate-bounce">Tambah Aktivitas</span>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground mt-2">
        Halaman ini akan segera terisi daftar aktivitas dan form input setelah integrasi server action selesai.
      </p>
    </div>
  );
}