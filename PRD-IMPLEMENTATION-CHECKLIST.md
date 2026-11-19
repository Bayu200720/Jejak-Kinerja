# JEJAK KINERJA AI — PRD Implementation Checklist

**Status**: Berdasarkan kodebase saat ini (Nov 2025). "✅" = sudah terintegrasi/kode ada, "🚧" = belum dimulai/placeholder, "❌" = tidak ada.

---

## E1. Foundation & Deployment

| Tiket | Deskripsi | Status | Catatan |
|---|---|---|---|
| **JKI-001** | Inisialisasi proyek Next.js App Router + TS + Tailwind + shadcn/ui | ✅ | `src/app/`, `src/lib/`, Tailwind, shadcn components terinstal. |
| **JKI-002** | Integrasi Supabase (Auth, Postgres, Storage) + env vars | ✅ | `src/lib/supabase/`, `.env.example`, migrasi SQL dibuat. |
| **JKI-003** | Deploy ke Vercel (Hobby) + pipeline GitHub | 🚧 | Build sukses (`npm run build`), namun belum ter-deploy ke Vercel. |
| **JKI-004** | RLS dan skema database awal (migrasi Supabase) | ✅ | `supabase/migrations/20251119000000_init_schema.sql` lengkap beserta RLS policies. |

---

## E2. Autentikasi & Profil

| Tiket | Deskripsi | Status | Catatan |
|---|---|---|---|
| **JKI-010** | Login email/password (Supabase Auth) | ✅ | Form login (`/login`) + server action `signIn` (Supabase `signInWithPassword`) + validasi zod. |
| **JKI-011** | Logout | ✅ | Tombol keluar di sidebar dashboard memanggil `signOut`. |
| **JKI-012** | Reset password via email | ❌ | Belum dibuat (hanya catatan di UI). |
| **JKI-013** | Redirect & navigasi per role | 🚧 | Middleware `updateSession` + redirect ke `/login`/`/dashboard`; logika role belum di-load dari DB. |
| **JKI-014** | Manajemen profil dasar ASN | ❌ | Belum dibuat. |

---

## E3. RHK & Kategori

| Tiket | Deskripsi | Status | Catatan |
|---|---|---|---|
| **JKI-030** | CRUD aktivitas harian (draft/submitted) | ❌ | Belum dibuat halaman/form. |
| **JKI-031** | Autosave/draft recovery | ❌ | Belum dibuat. |
| **JKI-032** | Validasi inline & pencocokan volume/satuan | ❌ | Belum dibuat. |

---

## E4. Aktivitas Harian

| Tiket | Deskripsi | Status | Catatan |
|---|---|---|---|
| **JKI-040** | Upload bukti (max 5, 5MB, allowlist) + validasi | ❌ | Belum dibuat. |
| **JKI-041** | Preview, caption, kompresi client-side | ❌ | Belum dibuat. |
| **JKI-042** | Signed URL (TTL 15 menit) + hapus soft-delete + audit trail | ❌ | Belum dibuat. |

---

## E5. Bukti Pendukung

| Tiket | Deskripsi | Status | Catatan |
|---|---|---|---|
| **JKI-050** hingga **JKI-056** | Fitur bukti pendukung (upload, preview, download, signed URL, dll) | ❌ | Belum dibuat. |

---

## E6. AI Assistant

| Tiket | Deskripsi | Status | Catatan |
|---|---|---|---|
| **JKI-060** hingga **JKI-064** | Fitur AI (improve, suggest RHK/kategori, manual fallback) | ❌ | Belum terintegrasi. |

---

## E7. Laporan Bulanan

| Tiket | Deskripsi | Status | Catatan |
|---|---|---|---|
| **JKI-050** hingga **JKI-064** (E6 bagian laporan) | Generator laporan bulanan, export PDF/DOCX, riwayat | ❌ | Belum dibuat. |

---

## E9. Review Supervisora

| Tiket | Deskripsi | Status | Catatan |
|---|---|---|---|
| **JKI-070** hingga **JKI-084** | Workflow status laporan, audit log, hak akses per role | ❌ | Belum dibuat. |

---

## Umum / Non-Fitur MVP

| Item | Deskripsi | Status | Catatan |
|---|---|---|---|
| **Bahasa Indonesia UI** | Seluruh teks UI dalam Bahasa Indonesia | ✅ | Basa default di Tailwind warna dan beberapa teks sudah ID. |
| **Responsive / Mobile First** | Aplikasi responsive | ✅ | Sudah melalui Tailwind dan struktur App Router. |
| **PWA-installable** | Installable ke home screen | ❌ | Out of scope MVP. |
| **Dark mode** | Mode gelap | ❌ | Belum ditambahkan. |
| **Calendar lengkap** | Kalender hari tanpa aktivitas | ❌ | Hanya reminder sederhana. |
| **AI performance insights** | Insight performa AI | ❌ | Belum ada. |