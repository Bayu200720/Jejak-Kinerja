# Jejak Kinerja AI — Tiket (MVP)

Sumber: `docs/PRD-JEJAK-KINERJA-AI.md`, `.scratch/jejak-kinerja-ai-mvp/spec.md`  
Format kolom (untuk impor): **Epic, Key/Judul, Tipe, Prioritas, Deskripsi, AC, Referensi PRD**

> Catatan: Issue tracker eksternal belum dikonfigurasi di repo; file ini dan CSV adalah artefak siap tempel.

---

## E1. Foundation & Deployment

### JKI-001 — Inisialisasi proyek Next.js App Router + TypeScript + Tailwind + shadcn/ui (Epic, P1)

**Deskripsi:** Setup monorepo/struktur Next.js (App Router), TypeScript strict, Tailwind CSS, shadcn/ui, Lucide Icons, React Hook Form + Zod, Recharts. Pastikan struktur folder mendukung rute per role (asn/supervisor/admin).

**AC:**
- Repo dapat menjalankan `dev`/`build` tanpa error
- Konfigurasi TS/Tailwind/shadcn terpasang
- Struktur rute dasar (auth, dashboard) ada (placeholder)
- README dev setup singkat

**Referensi PRD:** PRD §2 Platform/Tech (Frontend/Deployment), §8 Technology and Infrastructure Recommendations (Frontend)

---

### JKI-002 — Integrasi Supabase (Auth, Postgres, Storage) dan variabel lingkungan (Tugas, P1)

**Deskripsi:** Konfigurasi klien Supabase (server/client) sesuai Next.js App Router + SSR cookies. Definisikan env vars di Vercel/local (`.env.example`). Siapkan koneksi Postgres dan Storage (default MVP).

**AC:**
- `.env.example` lengkap (Supabase URL/anon/service key jika perlu server-side dengan aman)
- Helper auth SSR berfungsi
- Koneksi DB terverifikasi
- Storage bucket dasar tervalidasi (konfigurasi dokumentasi)

**Referensi PRD:** PRD §8 Backend and Database, §10 DevOps (Vercel + GitHub); Spec MVP stack & Deployment notes

---

### JKI-003 — Deploy ke Vercel (Hobby) + pipeline GitHub (Tugas, P1)

**Deskripsi:** Hubungkan repo GitHub ke Vercel Hobby, atur env vars, verifikasi build otomatis pada push. Sesuaikan `vercel.json` bila perlu (`functions.maxDuration` 30s).

**AC:**
- Preview/production URL tersedia
- Push ke branch utama memicu deploy
- Build sukses
- Catatan batasan Hobby terdokumentasi

**Referensi PRD:** PRD §2 Deployment, §8 Deployment, §10 DevOps Notes

---

### JKI-004 — RLS dan skema database awal (migrasi Supabase) (Tugas, P1)

**Deskripsi:** Buat migrasi SQL sesuai PRD §9 (tabel inti MVP: organizations, profiles + profile_roles/multi-role per spec, employee_profiles, organization_units, rhk_targets, daily_activities, activity_evidences, monthly_reports, supervisor_feedback, activity_categories, audit_logs, notifications minimal). Aktifkan RLS dan policy dasar per role.

**AC:**
- Migrasi dapat dijalankan (lokal/remote)
- RLS aktif pada tabel sensitif
- Policy dasar ASN hanya data sendiri, supervisor tim, admin sesuai kebutuhan
- Dokumentasi skema singkat

**Referensi PRD:** PRD §9 Database Design; Spec Data Model & Security/RLS notes

---

## E2. Autentikasi & Profil

### JKI-010 — Login email/password (Supabase Auth) (Cerita, P1)

**Deskripsi:** Sebagai ASN, saya ingin login dengan email/password agar dapat mengakses workspace saya. (Spec US-01)

**AC:**
- Form login validasi Zod
- Sukses redirect sesuai role (top-nav/role redirect)
- Error message jelas (Bahasa Indonesia)
- Session via Supabase SSR cookies

**Referensi PRD:** PRD §5 Roles, §6 User Journey; Spec User Stories 1,5

---

### JKI-011 — Logout (Cerita, P1)

**Deskripsi:** Sebagai ASN, saya ingin logout agar session tidak digunakan orang lain. (Spec US-02)

**AC:**
- Tombol/logout action tersedia
- Session dihapus
- Redirect ke halaman login/public sesuai desain

**Referensi PRD:** Spec US-02

---

### JKI-012 — Reset password via email (Cerita, P1)

**Deskripsi:** Sebagai ASN, saya ingin reset password via email agar dapat kembali mengakses akun. (Spec US-03)

**AC:**
- Alur reset password Supabase (request + set password)
- Email terkirim (konfigurasi tercatat)
- Halaman konfirmasi dan error handling

**Referensi PRD:** Spec US-03

---

### JKI-013 — Redirect & navigasi per role (Cerita, P1)

**Deskripsi:** Setelah login, pengguna diarahkan ke area sesuai role (ASN/Supervisor/Admin).

**AC:**
- Mapping role dari profile_roles/profiles konsisten
- Middleware/guard melindungi rute
- Forbidden page/redirect untuk akses tidak sah

**Referensi PRD:** PRD §5; Spec Autentikasi dan peran

---

### JKI-014 — Manajemen profil dasar ASN (lihat/edit terbatas) (Tugas, P2)

**Deskripsi:** Profil menampilkan data dasar; edit field yang diizinkan (sesuai PRD employee_profiles/profiles) dengan validasi. Tidak dapat mengubah role sendiri.

**AC:**
- Halaman profil baca/tulis sesuai izin
- Perubahan tercatat (updated_at)
- Tidak dapat mengubah role sendiri

**Referensi PRD:** PRD §5 Batasan Role, §6.1, §9 profiles/employee_profiles

---

## E3. RHK & Kategori

### JKI-020 — CRUD RHK templates (Admin) (Cerita, P1)

**Deskripsi:** Admin mengelola template RHK/kategori konteks sesuai kebutuhan instansi.

**AC:**
- List/create/edit/deactivate template
- Validasi wajib diisi
- Audit log untuk aksi admin (minimal tercatat)

**Referensi PRD:** PRD §7 MODUL 4, §9 rhk_targets/activity_categories

---

### JKI-021 — Target RHK per ASN per periode (draft/validated) (Cerita, P1)

**Deskripsi:** Admin/Supervisor atau alur yang disepakati dapat menetapkan target RHK per ASN per periode; status draft/validated.

**AC:**
- Halaman/panel target RHK
- Filter periode
- Status draft→validated
- ASN melihat target berlaku

**Referensi PRD:** PRD §7 MODUL 4 AC; Spec RHK

---

### JKI-022 — Pemilihan RHK pada aktivitas + saran AI (advisory) (Cerita, P2)

**Deskripsi:** Saat mengisi aktivitas, ASN memilih RHK; AI boleh menyarankan RHK namun konfirmasi user tetap wajib.

**AC:**
- UI pemilih RHK
- Indikasi saran AI (non-blocking)
- Simpan relasi aktivitas–RHK

**Referensi PRD:** PRD §7 MODUL 4; Spec RHK & Catat aktivitas

---

## E4. Aktivitas Harian

### JKI-030 — CRUD aktivitas harian (draft/submitted) (Cerita, P1)

**Deskripsi:** ASN mencatat aktivitas: tanggal, kategori, judul, deskripsi, hasil, volume/satuan, waktu mulai/selesai, lokasi opsional, catatan tambahan; status draft/submitted.

**AC:**
- Form lengkap + validasi Zod
- List/filter aktivitas (tanggal, status, kategori)
- Edit draft, submit
- Soft delete sesuai kebijakan

**Referensi PRD:** PRD §6.1, §7 MODUL 3; Spec Catat aktivitas harian

---

### JKI-031 — Autosave/draft recovery (Cerita, P2)

**Deskripsi:** Sistem menyimpan draft otomatis atau recovery saat keluar halaman tidak sengaja.

**AC:**
- Mekanisme autosave (interval/debounce) atau recovery dari localStorage+server draft
- UX jelas (indikator tersimpan)

**Referensi PRD:** Spec Catat aktivitas harian (autosave/draft recovery)

---

### JKI-032 — Validasi inline & pencocokan volume/satuan (Tugas, P2)

**Deskripsi:** Validasi input inline; aturan pencocokan volume–satuan konsisten.

**AC:**
- Pesan error inline
- Aturan volume/satuan terdokumentasi dan diuji

**Referensi PRD:** Spec validation & volume matching

---

## E5. Bukti Pendukung

### JKI-040 — Upload bukti (max 5, 5MB, allowlist) + validasi (Cerita, P1)

**Deskripsi:** Upload hingga 5 file per aktivitas dengan batas 5MB dan MIME/ekstensi allowlist (JPG/PNG/WEBP/PDF/DOCX); validasi ekstensi/MIME/magic bytes.

**AC:**
- Reject file tidak sesuai
- Pesan error jelas
- Metadata tersimpan
- Batas jumlah dipatuhi

**Referensi PRD:** PRD §7 MODUL 5; Spec Bukti pendukung

---

### JKI-041 — Preview, caption, kompresi client-side (Cerita, P2)

**Deskripsi:** User dapat preview file yang diizinkan, menambah caption, dan kompresi client-side sebelum upload bila berlaku.

**AC:**
- Preview image/PDF sesuai dukungan
- Caption tersimpan
- Kompresi tidak merusak konten kritis (atau dinonaktifkan dengan fallback)

**Referensi PRD:** Spec Bukti pendukung

---

### JKI-042 — Signed URL (TTL 15 menit) + hapus soft-delete + audit trail (Tugas, P1)

**Deskripsi:** Download via signed URL TTL 15 menit; hapus menandai soft-delete metadata; audit trail tersimpan.

**AC:**
- URL kedaluwarsa sesuai TTL
- Tidak bisa akses file setelah soft-delete sesuai kebijakan
- Log audit mencatat aksi

**Referensi PRD:** Spec Bukti pendukung, Audit log

---

## E6. AI Assistant

### JKI-050 — Penulisan AI: mode improve/simplify/suggest (server-side) (Cerita, P1)

**Deskripsi:** AI membantu improve grammar/clarity, simplify (perhatikan panjang), suggest kategori/RHK (advisory) melalui API server-side; output editabel sebelum disimpan.

**AC:**
- Endpoint server-side
- UI mode jelas
- Hasil dapat diedit dan disimpan ke field terkait
- Tidak ada kunci API di client

**Referensi PRD:** PRD §7 MODUL 6, §8 AI; Spec Penulisan AI

---

### JKI-051 — Rate limit, fallback manual, pencegahan inventasi angka (Tugas, P1)

**Deskripsi:** Rate-limit per user; fallback manual jika kuota/unavailable; AI tidak boleh inventasi angka/nilai tidak disediakan user.

**AC:**
- Throttle teruji
- Pesan fallback jelas
- Guardrail prompt/pasca-proses sesuai kebijakan (dokumentasi)

**Referensi PRD:** Spec Penulisan AI

---

## E7. Laporan Bulanan

### JKI-060 — Buat/generate laporan bulanan (draft) dengan snapshot JSONB (Cerita, P1)

**Deskripsi:** Satu laporan per ASN per (tahun,bulan); generate draft dari aktivitas tercatat + narasi manual terpisah; simpan snapshot JSONB saat generasi/regenerasi sesuai aturan spec.

**AC:**
- Halaman laporan bulanan
- Snapshot tersimpan
- Regenerasi draft menghitung ulang data, narasi manual dipertahankan jika dipilih
- Status awal draft

**Referensi PRD:** PRD §6.2, §7 MODUL 8; Spec Laporan bulanan

---

### JKI-061 — Alur status laporan + riwayat (Cerita, P1)

**Deskripsi:** Status: draft/submitted/revision_requested/approved dengan transisi sesuai spec; riwayat tersimpan.

**AC:**
- UI status dan aksi sesuai role
- Riwayat perubahan status terlihat
- Timestamp dan actor tercatat

**Referensi PRD:** PRD §7 MODUL 8; Spec Review supervisora & Laporan (status)

---

### JKI-062 — Ekspor PDF/DOCX server-side (Cerita, P2)

**Deskripsi:** Ekspor laporan ke PDF/DOCX via server-side; akses ekspor hanya approved atau submitted sesuai policy (konfigurasi).

**AC:**
- Tombol ekspor kondisional
- File terunduh sesuai format
- Template mengikuti kebutuhan instansi (konfigurasi dasar)

**Referensi PRD:** PRD §7 MODUL 8; Spec Laporan bulanan

---

## E8. Review Supervisor

### JKI-070 — Dashboard bawahan & daftar laporan aktivitas untuk review (Cerita, P1)

**Deskripsi:** Supervisor melihat daftar bawahan, aktivitas/bukti (sesuai izin), dan laporan yang perlu ditinjau.

**AC:**
- Filter per bawahan/periode
- Akses terbatas pada assignment
- Admin baca-only

**Referensi PRD:** PRD §6.3, §7 MODUL 9; Spec Review supervisora

---

### JKI-071 — Transisi review: approve / minta revisi (+ komentar wajib) (Cerita, P1)

**Deskripsi:** Supervisor dapat setujui atau minta perbaikan; komentar wajib saat revision_requested; setiap perubahan status dicatat audit log.

**AC:**
- Validasi komentar wajib untuk revision_requested
- Notifikasi in-app minimal (tabel notifications) jika tersedia
- ASN melihat feedback

**Referensi PRD:** PRD §7 MODUL 9; Spec Review supervisora

---

## E9. Dashboard

### JKI-080 — Dashboard ASN (ringkasan & grafik) (Cerita, P2)

**Deskripsi:** Dashboard ASN menampilkan: jumlah aktivitas/bulan, hari tercatat, jumlah bukti, RHK aktif, status laporan, aktivitas terakhir, pengingat hari tanpa aktivitas, grafik distribusi RHK.

**AC:**
- Komponen sesuai spec
- Data akurat dari DB
- Responsif mobile-first

**Referensi PRD:** PRD §7 MODUL 1; Spec Dashboard ASN

---

### JKI-081 — Dashboard Supervisor (tim & metrik) (Cerita, P2)

**Deskripsi:** Dashboard supervisor: ukuran tim, laporan menunggu, permintaan revisi, kompleksitas dokumentasi (dengan bukti/total), grafik tim.

**AC:**
- Metrik sesuai definisi spec
- Akses hanya tim assignment

**Referensi PRD:** PRD §7 MODUL 1; Spec Dashboard Supervisor

---

### JKI-082 — Dashboard Admin (statistik & audit ringkas) (Cerita, P2)

**Deskripsi:** Admin melihat total user/ASN/supervisor/aktivitas/bukti, penggunaan kuota AI, riwayat audit (ringkas).

**AC:**
- Angka agregat
- Link ke audit log lengkap

**Referensi PRD:** PRD §7 MODUL 1; Spec Dashboard Admin

---

## E10. Administrasi

### JKI-090 — Manajemen user: deaktivasi & role assignment (admin only) (Cerita, P1)

**Deskripsi:** Admin dapat deactivate user dan mengatur role (menambah supervisor/admin) melalui admin panel; pengguna tidak bisa ubah role sendiri.

**AC:**
- UI admin
- Validasi
- Audit log aksi sensitif
- Pencegahan self-escalation

**Referensi PRD:** PRD §5 Batasan Role, §7 MODUL 7; Spec Admin

---

### JKI-091 — Manajemen unit organisasi & keanggotaan (Cerita, P2)

**Deskripsi:** Admin mengelola organization_units dan keanggotaan (termasuk head_id sesuai skema).

**AC:**
- CRUD unit
- Relasi parent/head
- Tampil di struktur dasar

**Referensi PRD:** PRD §9 organization_units

---

### JKI-092 — Konfigurasi batas file & rate limit AI (admin) (Tugas, P2)

**Deskripsi:** Admin dapat mengatur batas ukuran file dan batas rate-limit AI (disimpan di konfigurasi sistem).

**AC:**
- UI atau seed config terdokumentasi
- Berlaku di validasi/upload dan AI endpoint

**Referensi PRD:** Spec Admin (konfigurasi)

---

### JKI-093 — Audit log viewer (aksi sensitif) (Tugas, P2)

**Deskripsi:** Admin dapat melihat audit log untuk aksi sensitif (role change, delete important, status transitions kunci).

**AC:**
- Tabel/filter dasar
- Minimal kolom actor, action, target, timestamp

**Referensi PRD:** PRD §9 audit_logs; Spec Admin

---

## E11. Non-fungsional & Kepatuhan

### JKI-100 — Keamanan data & RLS menyeluruh (Tugas, P1)

**Deskripsi:** Pastikan RLS dan checks mencegah akses lintas organisasi/tim yang tidak diizinkan; uji skenario dasar.

**AC:**
- Checklist RLS per tabel utama
- Tes manual/otomasi minimal untuk kasus ASN vs supervisor vs admin

**Referensi PRD:** PRD §8 Supabase RLS, §9; Spec Security notes

---

### JKI-101 — Aksesibilitas & i18n dasar (ID, responsif mobile-first) (Tugas, P2)

**Deskripsi:** UI memenuhi dasar WCAG 2.1 AA (label, fokus, target sentuh), responsif mobile-first, semua konten UI Bahasa Indonesia.

**AC:**
- Audit singkat (axe/lighthouse manual) dicatat
- Tidak ada teks kunci berbahasa Inggris di UI utama

**Referensi PRD:** Spec Aksesibilitas, Bahasa, Zona waktu

---

### JKI-102 — Kinerja & batasan Vercel Hobby (Tugas, P3)

**Deskripsi:** Perhatikan fungsi server maxDuration 30s, optimasi query, dan batasan free tier; dokumentasikan trade-off.

**AC:**
- Catatan di README/deploy doc
- Tidak ada proses berat di request tanpa strategi

**Referensi PRD:** PRD §8/§10, Spec Deployment

---

## E12. Quality & Testing

### JKI-110 — Domain service tests (Vitest) untuk status machine & report composer (Tugas, P1)

**Deskripsi:** Unit/integration domain: statusMachine, reportComposer (snapshot deterministic), permissionPolicy matrix, validationSchemas.

**AC:**
- Vitest berjalan di CI/local
- Coverage minimal pada modul kritis
- Fixture jelas

**Referensi PRD:** Spec Testing/Seams

---

### JKI-111 — E2E Playwright (flow utama MVP) (Tugas, P2)

**Deskripsi:** E2E melawan app + Supabase local (seeded) untuk flow: login → buat aktivitas → upload bukti → AI improve → generate report → review supervisor → approve.

**AC:**
- Spec Playwright
- Dapat dijalankan secara dokumentasi (setup Supabase local)

**Referensi PRD:** Spec Testing/Seams (HTTP/UI E2E)

---

### JKI-112 — Adapter fakes (AI, ObjectStorage) + contract checks (Tugas, P2)

**Deskripsi:** Implementasi fake adapter untuk AI dan storage di test; pastikan API shape konsisten.

**AC:**
- Test menggunakan fake
- Dokumentasi cara mock di dev

**Referensi PRD:** Spec Adapter seams
