# Spec: JEJAK KINERJA AI — MVP

Status: ready-for-agent

## Problem Statement

ASN (Aparatur Sipil Negara) kesulitan mencatat aktivitas pekerjaan harian karena proses manual yang memakan waktu. Bukti pendukung (berkas, foto) menyebar di berbagai lokasi, dan laporan bulanan dibuat tanpa sarana terpusat. Supervisor tidak memiliki visibilitas real-time mengenai sub-bagian tim, sehingga evaluasi menjadi reaktif dan tidak terstruktur. Aplikasi ini bertujuan untuk memudahkan pencatatan harian, menyentralkan bukti pendukung, dan menghasilkan laporan bulanan yang terstruktur dengan bantuan AI.

## Solution

Solusi berbasis web dengan stack Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui, terintegrasi dengan Supabase (Postgres/Auth/Storage) dan di-deploy ke Vercel. Fitur utama mencakup:

- **Autentikasi dan peran** — login email/password via Supabase Auth; multi-role melalui tabel `profile_roles` (`asn`, `supervisor`, `admin`); setiap profile memiliki peran `asn` default; admin dapat menambah `supervisor`/`admin`; redirect peran melalui top-nav; session melalui supabase SSR cookies.
- **RHK (Renja Kerja Harian)** — templates dikelola admin; target per ASN dibuat/edit per periode; status `draft`/`validated`; aktivitas memilih RHK; AI menyarankan RHK tetapi konfirmasi user.
- **Catat aktivitas harian** — tanggal, kategori, judul, deskripsi, hasil, volume/satuan; waktu mulai/selesai, lokasi opsional; catatan tambahan; status `draft`/`submitted`; *autosave/draft recovery*; soft delete; *validasi inline*; *pencocokan volume*; *kategorisasi otomatis AI*.
- **Bukti pendukung** — upload maksimal 5 file per aktivitas, max 5 MB/Mime allowlist (JPG/PNG/WEBP/PDF/DOCX); *preview*; *caption*; *kompresi client-side*; *signed URL* (TTL 15 menit) untuk download; *validasi ekstensi/MIME/magic bytes*; *hapus* soft-delete metadata; *audit trail*.
- **Penulisan AI** — *mode* *improve* (grammar/clarity), *simplify* (lampirkan panjang), *suggest kategori/RHK* (advisory); output editabel pengguna sebelum disimpan; *manual fallback* saat kuota habis/unavailable; *pencegahan inventasi angka* (AI tidak memperoleh nilai yang tidak disediakan user); *rate-limit* per pengguna.
- **Laporan bulanan** — satu laporan per ASN per (tahun, bulan); status `draft`/`submitted`/`revision_requested`/`approved`; *snapshot JSONB* disimpan pada generasi; komponen data dihasilkan dari aktivitas tercatat; narasi manual (eksekutif, evaluasi, kesimpulan) disimpan terpisah; ekspor PDF/DOCX via server-side; riwayat laporan; ekspor hanya untuk status `approved` atau `submitted` jika policy enable; *regenerasi draft* menghitung ulang data namun mempertahankan narasi manual jika user memilih menyimpan.
- **Review supervisora** — transisi status: `draft → submitted` (ASN), `submitted → approved` (supervisor), `submitted → revision_requested` (supervisor), `revision_requested → submitted` (ASN setelah diperbaiki); *komentar* wajib untuk `revision_requested`; *audit log* tiap transisi; hanya supervisora yang ter-assignment yang dapat review; admin baca-only.
- **Dashboard** — ASN: count aktivitas per bulan, hari tercatat, count bukti, RHK aktif, status laporan, aktivitas terakhir, *pengingat hari tanpa aktivitas*; grafik distribusi RHK. Supervisor: ukuran tim, laporan menunggu, permintaan revisi, *kompleksitas dokumentasi* (aktivitas dengan bukti / total), grafik tim. Admin: total user/ASN/supervisor/aktivitas/bukti, penggunaan kuota, riwayat audit.
- **Admin** — *deactivate* user; *manage* unit/unit‑keanggotaan; *manage* RHK templates; *manage* kategori aktivitas; *view* audit log untuk aksi sensitif; *konfigurasi* batas ukuran file, batas AI rate‑limit.

## User Stories

1. Seorang ASN ingin login dengan email/password sehingga dapat mengakses workspace-nya.
2. Seorang ASN ingin logout sehingga session-nya tidak digunakan orang lain.
3. Seorang ASN ingin reset password via email sehingga dapat kembali mengakses akun.
4. Seorang ASN ingin dialihkan ke dashboard peran setelah login sehingga UI sesuai tugas.
5. Seorang ASN ingin session persisten di refresh sehingga tidak kehilangan kerja.
6. Admin ingin membuat akun pengguna sehingga hanya pengguna berwenang yang dapat mengakses.
7. Admin ingin menetapkan peran supervisor/admin sehingga akses dikontrol.
8. Seorang ASN ingin mengedit nama, foto, NIP sehingga laporan mengidentifikasi dengan benar.
9. Seorang ASN ingin melihat unit dan supervisor-nya sehingga tahu siapa yang meninjau.
10. Seorang supervisor ingin melihat daftar timnya sehingga tahu tanggung jawab.
11. Admin ingin mengelola unit organisasi dan penugasan supervisora sehingga struktur tetap.
12. Seorang ASN ingin membuat target RHK dengan indikator/target sehingga aktivitas dimetrikkan terhadap SKP.
13. Seorang ASN ingin mengedit/arsip target RHK sehingga rencana tetap aktual.
14. Seorang ASN ingin memilih RHK saat mencatat aktivitas sehingga bukti dikelompokkan.
15. Seorang ASN ingin AI menyarankan RHK berdasarkan teks aktivitas namun konfirmasi user.
16. Seorang supervisor ingin memvalidasi target RHK sehingga sesuai rencana unit.
17. Admin ingin mengelola template RHK sehingga ASN bisa mulai lebih cepat.
18. Seorang ASN ingin melihat RHK yang belum memiliki aktivitas sehingga dapat mengisi.
19. Seorang ASN ingin membuat aktivitas harian dengan tanggal/judul/kategori/deskripsi sehingga kerja dicatat.
20. Seorang ASN ingin menambahkan waktu mulai/selesai, lokasi, catatan opsional.
21. Seorang ASN ingin menyimpan *draft* sehingga bisa diakhiri nanti.
22. Seorang ASN ingin mengedit aktivitas draft/submitted sehingga kesalahan diperbaiki.
23. Seorang ASN ingin menghapus aktivitas dengan konfirmasi sehingga data tidak hilang secara tumpang tindih.
24. Seorang ASN ingin menyalin format aktivitas sebelumnya untuk mempercepat input.
25. Seorang ASN ingin mencari/filter aktivitas berdasarkan tanggal/bulan/kategori/RHK.
26. Seorang ASN ingin melihat kalender hari dengan/ tanpa entri.
27. Seorang ASN ingin melihat sejarah aktivitas dan log perubahan.
28. Seorang ASN ingin kesalahan validasi muncul secara inline sehingga bisa diperbaiki.
29. Seorang ASN ingin autosave/recovery draft sehingga refresh tidak kehilangan input.
30. Seorang ASN ingin *pagination* sehingga daftar besar muat cepat.
31. Seorang supervisor ingin melihat aktivitas anggota bawahinya berdasarkan tanggal sehingga dapat monitoring.
32. Seorang supervisor ingin filter aktivitas tim berdasarkan ASN/RHK/tanggal.
33. Seorang ASN ingin mengunggah banyak file (JPG/PNG/WEBP/PDF/DOCX) ke satu aktivitas.
34. Seorang ASN ingin *preview* gambar/PDF sebelum/selempang unggah.
35. Seorang ASN ingin menambahkan *caption* pada bukti.
36. Seorang ASN ingin *download* bukti yang dapat diakses.
37. Seorang ASN ingin menghapus bukti dengan konfirmasi.
38. Seorang ASN ingin validasi tipe/ukuran file dengan pesan error jelas.
39. Seorang ASN ingin *kompresi* gambar sebelum unggah untuk hemat kuota.
40. Seorang ASN ingin signed URL dengan kadaluarsa sehingga file privat dilindungi.
41. Seorang supervisor ingin melihat bukti anggota yang diawasi.
42. Admin ingin statistik penggunaan penyimpanan agar dapat mengelola kuota.
43. Seorang ASN ingin mengubah catatan singkat menjadi narasi profesional.
44. Seorang ASN ingin *perbaiki* tata bahasa/kelbihan kata.
45. Seorang ASN ingin *sederhanakan* teks yang terlalu panjang.
46. Seorang ASN ingin AI menyarinkan kategori/RHK berdasarkan narasi, namun konfirmasi user.
47. Seorang ASN ingin mengedit output AI sebelum disimpan.
48. Seorang ASN ingin input manual bekerja ketika AI tidak tersedia/kuota habis.
49. Seorang ASN ingin AI tidak pernah memvalidasi nilai yang tidak diberikan user.
50. Admin ingin mengonfigurasi AI provider/rate limit tanpa perubahan kode.
51. Seorang ASN ingin membuat laporan bulanan untuk bulan/year tertentu.
52. Laporan hanya mencakup aktivitas yang tercatat (deleted_at is null).
53. Laporan dikelompokkan berdasarkan RHK.
54. Laporan memiliki bagian ringkasan eksekutif dan kesimpulan.
55. Seorang ASN ingin *preview* laporan sebelum akhir.
56. Seorang ASN ingin mengedit narasi dalam *draft*.
57. Seorang ASN ingin *regenerasi* draft laporan.
58. Seorang ASN ingin unduh PDF.
59. Seorang ASN ingin unduh DOCX.
60. Seorang ASN ingin histori laporan bulanan.
61. Laporan mencantumkan bukti dengan nama file/tanggal.
62. Laporan mengelompokkan aktivitas yang tidak memiliki RHK sebagai "Lainnya".
63. Seorang ASN ingin *submit* laporan untuk review.
64. Supervisor ingin melihat laporan menunggu review.
65. Supervisor ingin menginspeksi aktivitas/bukti dalam laporan.
66. Supervisor ingin *approve* laporan.
67. Supervisor ingin *permintaan revisi* dengan komentar.
68. Seorang ASN ingin melihat *feedback* dan *revisi*.
69. Seorang ASN ingin *resubmit* setelah revisi.
70. Supervisor ingin histori status untuk setiap laporan.
71. Seorang ASN ingin melihat ringkasan bulanan: count aktivitas, hari tercatak, count bukti, RHK aktif, status laporan.
72. ASN ingin *reminder* hari tanpa aktivitas.
73. ASN ingin grafik distribusi RHK.
74. Supervisor ingin *tim size*, *pending reports*, *revision requests*, *kompleksitas dokumentasi*.
75. Supervisor ingin grafik aktivitas tim.
76. Admin ingin total user/ASN/supervisor/aktivitas/bukti.
77. Admin ingin *usage statistics*.
78. ASN ingin state *empty* saat tidak ada data.
79. Admin ingin *deactivate* user sehingga depart staff kehilangan akses.
80. Admin ingin *manage* unit dan penugasan supervisora.
81. Admin ingin *manage* template RHK.
82. Admin ingin *manage* kategori aktivitas.
83. Admin ingin *view* audit log untuk aksi sensitif.
84. Admin ingin *konfigurasi* batas ukuran file, batas AI rate‑limit tanpa kode.
85. Seorang ASN ingin data-nya tidak dapat diakses ASN lain.
86. Supervisor ingin akses hanya ke anggota yang diawasi.
87. Admin ingin akses dikontrol organisasi.
88. Pengguna ingin signed URL kadaluarsa.
89. Pengguna ingin validasi server-side untuk semua input.
90. Pengguna ingin audit log untuk create/update/delete/submit/approve.
91. Pengguna ingin *rate limiting* pada endpoint AI.
92. Pengguna ingin rahasia tidak terpapar ke browser.
93. Pengguna ingin aplikasi bekerja di mobile/tablet/desktop.
94. Pengguna ingin *skeleton loading* dan *toasts*.
95. Pengguna ingin pesan error jelas.
96. Pengguna ingin *pagination/search*.
97. Pengguna ingin data selamat saat refresh.
98. Pengguna ingin aplikasi dalam Bahasa Indonesia.
99. Pengguna ingin *aksesibilitas* form (label, focus, touch target).
100. Pengguna ingin aplikasi *PWA-installable* (SHOULD, *out of scope MVP*).

## Implementation Decisions

**Architecture & stack**
- Full‑stack Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui components.
- Backend: Supabase (Postgres, Auth, Storage, Realtime).
- Deploy: Vercel Hobby tier; serverless functions with `maxDuration` 30 s for PDF/DOCX generation.
- API: route handlers for upload/export/AI; server actions for form CRUD.
- Styling: Bahasa Indonesia UI strings; tailwind‑base color palette respecting dark mode.

**Roles & permissions**
- Multi‑role via `profile_roles(profile_id, role)` where role ∈ {`asn`, `supervisor`, `admin`}.
- Setiap profile dipastikan memiliki `asn` default; admin dapat menambah `supervisor`/`admin`.
- Penugasan supervisora: tabel `supervisor_assignments(id, organization_id, supervisor_profile_id, asn_profile_id, unit_id, active_from, active_to)` dengan unik `(supervisor_profile_id, asn_profile_id, active_from)`; RLS memverifikasi penugasan aktif sebelum membizakan data.
- RLS defense‑in‑depth pada semua tabel; semua handler resolve `profile_id` dari session dan cek capability sebelum operasi.

**Data model (core tables)**
- `organizations(id, name, slug, created_at, updated_at)`
- `profiles(id, organization_id, auth_user_id, full_name, nip, photo_path, created_at, updated_at)` — kolom `role` dihapus; peran dikelola melalui `profile_roles`.
- `employee_profiles(profile_id PK, jabatan, bidang_keahlian, tmt)`
- `organization_units(id, organization_id, name, parent_unit_id, head_profile_id)`
- `organization_memberships(profile_id, unit_id, active_from, active_to)` — asosiasi ASN/pegawai ke unit.
- `supervisor_assignments(...)` — lihat di atas.
- `rhk_templates(id, organization_id, name, indicator, target_quantity, target_unit, expected_result, active)`
- `rhk_targets(id, organization_id, asn_profile_id, template_id nullable, name, period_start, period_end, indicator, target_quantity, target_unit, expected_result, notes, status enum draft|validated|inactive, validated_by, validated_at)`
- `activity_categories(id, organization_id, name, slug, active)` — PK `(organization_id, slug)`.
- `daily_activities(id, organization_id, asn_profile_id, activity_date date, title varchar(200), category_id uuid FK → activity_categories, description text, result_description text, volume numeric, output_unit varchar(50), start_time time nullable, end_time time nullable, location varchar(200) nullable, notes text nullable, status enum draft|submitted, created_at, updated_at, deleted_at)`
- `activity_evidences(id, organization_id, activity_id, storage_bucket, storage_path, original_filename, mime_type, file_size, caption nullable, uploaded_by, uploaded_at, deleted_at)`
- `monthly_reports(id, organization_id, asn_profile_id, period_year int, period_month int, status enum draft|submitted|revision_requested|approved, snapshot jsonb, executive_summary text, conclusion text, submitted_at nullable, reviewed_at nullable, approved_at nullable, created_at, updated_at)`
- `report_reviews(id, report_id, reviewer_profile_id, action enum submitted|approved|revision_requested, comment text nullable, created_at)`
- `audit_logs(id, organization_id, actor_profile_id, entity_type varchar(50), entity_id uuid, action varchar(50), metadata jsonb, created_at)`
- `notifications(id, organization_id, recipient_profile_id, type varchar(30), title varchar(200), body text, read_at nullable, created_at)`

**Unique & index constraints**
- `organizations(slug)` unique.
- `profiles(organization_id, nip)` unique (nullable NIP bila belum diisi).
- `activity_categories(organization_id, slug)` unique.
- `rhk_targets(organization_id, asn_profile_id, name, period_start, period_end)` unique (single target per ASN periode).
- `monthly_reports(organization_id, asn_profile_id, period_year, period_month)` unique (satu laporan per masa).
- `daily_activities(asn_profile_id, activity_date)` index; `(organization_id, activity_date)` index.
- `activity_evidences(activity_id)` index.
- `supervisor_assignments(supervisor_profile_id, asn_profile_id)` index; `(supervisor_profile_id, asn_profile_id, active_from)` partial unique.
- `audit_logs(entity_type, entity_id)` index; `(organization_id, created_at)` index.
- `notifications(recipient_profile_id, read_at)` index.

**Activity & evidence**
- Max 5 file per aktivitas, max 5 MB/Mime allowlist (JPG/PNG/WEBP/PDF/DOCX).
- Kompresi client-side: gambar dipotong/resize maksimal 1920 px, kualitas 0.8 sebelum unggah.
- *Signed URL* TTL 15 menit untuk *download*; 15 menit untuk *preview*; *URL* dibuat server‑side setelah otorisasi.
- Validasi *magic bytes* sebagai lapisan kedua setelah ekstensi/MIME.
- *Soft delete* metadata (`deleted_at`) + penghapusan objek storage setelah 30 hari (retensi); *audit log* merekam path lama.

**AI writing**
- Provider‑agnostic adapter; default Gemini free tier, Groq fallback; *server‑side only*; data minimisasi (kirim hanya teks aktivitas, judul kategori opsional, RHK title opsional).
- Rate‑limit: 20 request/user/jam; enforced via tabel `rate_limits` Supabase (atomiik `upsert` + window).
- Output editabel pengguna sebelum disimpan.
- *Manual fallback* ketika kuota habis/unavailable; pesan "AI unavailable, please edit manually".
- *Pencegahan inventasi angka*: AI tidak menghasilkan angka/volume/date yang tidak ada di input user.
- *Prompt template* dalam bahasa Inggris untuk menurunkan bias; *few‑shot* contoh dalam PRD.

**Monthly report**
- Satu laporan per `(asn_profile_id, period_year, period_month)`; *unique* constraint; *draft* dapat dibuat ulang kapan saja.
- *Snapshot JSONB* berisi: narasi tiap RHK, aktivitas grouped, volume totals, list bukti (path/caption), executive_summary, conclusion.
- Regenerasi *draft* menghitung ulang data terbaru sambil mempertahankan narasi manual jika user memilih "pertahankan narasi"; jika memilih "reset narasi", snapshot digenerate ulang dari nol.
- *Export PDF* menggunakan `@react-pdf/renderer` server‑side; *Export DOCX* menggunakan library `docx`; hasil disimpan ke bucket privat; *signed URL* TTL 24 menit (dokumen raport).
- Laporan *tidak mencakup* aktivitas dengan `deleted_at is null` dan `activity_date` luar periode.
- Laporan *menampilkan* kategori "Lainnya" untuk aktivitas tanpa RHK.
- Narasi manual (eksekutif, evaluasi, kesimpulan) *dapat diedit* dalam *draft*; data‑derived sections (aktivitas, volume, RHK) *baca‑only*.

**Supervisor review**
- Transisi status melalui tabel `report_reviews` dengan `action` dan `comment`.
- Hanya supervisora yang ter‑assignment ke ASN yang dapat *approve/revision_requested*; admin hanya baca.
- `revision_requested` memerlukan *comment*; `approved` opsional.
- Setiap transisi menulis baris `audit_logs(entity_type='report', entity_id=..., action=..., metadata=...)`.

**API contracts (route handlers)**
- `POST /api/auth/signin` — Supabase session; redirect peran.
- `POST /api/auth/signout` — clear session.
- `GET /api/auth/me` — { profile_id, role, organization_id, ... }.
- `POST /api/activities` — buat *draft*; validasi Zod; RLS.
- `PATCH /api/activities/:id` — edit draft; validasi inline; tidak boleh mengubah `activity_date` setelah `submitted`.
- `POST /api/activities/:id/submit` — pindah status `submitted`; *harden* data (freeze `deleted_at`, `activity_date`).
- `DELETE /api/activities/:id` (soft) — `deleted_at = now()`; *audit log*.
- `POST /api/activities/:id/evidences` — multipart upload; validasi; *signed URL* return.
- `DELETE /api/evidences/:id` (soft) — `deleted_at = now();` hapus object setelah 30 hari.
- `GET /api/evidences/:id/url` — signed URL (TTL 15 menit).
- `POST /api/ai/improve` — { text, mode } → { text }; rate‑limit; fallback manual.
- `POST /api/ai/suggest-rhk` — { text } → { rhkIds[] }; advisory only.
- `POST /api/reports` — generate laporan bulanan; *snapshot* disimpan; *regenerasi* hanya *draft*.
- `PATCH /api/reports/:id` — edit narasi manual (eksekutif, evaluasi, kesimpulan) hanya pada *draft*.
- `POST /api/reports/:id/submit` — *status* `submitted`; *audit log*.
- `POST /api/reports/:id/review` — { action: approve|request_revision, comment? }; hanya supervisora ter‑assignment; *audit log*.
- `GET /api/reports/:id/export?format=pdf|docx` — signed URL TTL 24 menit.
- `GET /api/dashboard/asn` — { activity_count, days_recorded, evidence_count, active_rhk, report_status, recent_activities, missing_days, chart_data }.
- `GET /api/dashboard/supervisor` — { team_size, pending_reports, revision_requests, documentation_completeness, team_chart }.
- `GET /api/dashboard/admin` — { user_counts, activity_counts, evidence_storage_used, ai_usage_estimate }.
- `POST /api/admin/users` — create user via Supabase Admin; send invite email.
- `PATCH /api/admin/users/:id/roles` — grant/revoke `supervisor`/`admin`.
- `POST /api/admin/units` — buat unit; *head_profile_id*.
- `POST /api/admin/rhk-templates` — buat template; *organization_id*.
- `POST /api/admin/categories` — buat kategori; *organization_id*.
- `GET /api/admin/audit-log` — *paginated* filter entity_type, action, date range (hanya admin).

**Security & privacy**
- RLS pada semua tabel; semua handler resolve `profile_id` dari session dan cek capability; *tidak boleh* client‑side ID saja.
- Bucket storage privat; *signed URL* 15 menit (bukti) / 24 menit (laporan); *tidak pernah* service role key ke klien.
- Validasi *magic bytes* & ukuran file; *re‑encode gambar* untuk strips EXIF/ketas metadata.
- *CSRF* proteksi otomatis Next.js server actions; route handlers cek *same‑origin* header.
- *XSS*: konten render sebagai teks mentah (escape HTML); jika ada rich‑text, gunakan *sanitizer* (MVP gunakan plain text).
- *PII*: AI request mengirim hanya teks narasi, judul kategori/RHK; *tidak* NIP/email/nama/file.
- *Audit log* untuk create/update/delete/submit/approve/role‑change; hanya admin yang dapat *view*.
- *Rate limit*: AI 20/user/jam; upload 50 file/user/hari; didukung tabel `rate_limits` Supabase.
- *Demo data*: hanyalah data dummy; tidak ada data ASN/pegawai asli.

**Free‑tier limits & caps**
- Supabase free: DB 500 MB, Storage 1 GB, Egress 2 GB/bulan (estimasi); *tidak mengutak‑atik* kuota spesifik melainkan menerapkan batasan aplikasi: 5 MB/file, 5 file/aktivitas, *pagination* 20/page, *kompresi gambar*.
- Vercel Hobby: *maxDuration* 30 s per fungsi; PDF/DOCX generator dipotong jika aktivitas > 31 hari atau > 200 *activities*; error yang mengarahkan user memilih periode lebih kecil.
- AI: gratis tier Gemini/Groq; *rate‑limit* 20/user/jam; jika habis → *fallback manual*.
- Tidak ada *long‑running* proses; semua tugas selesai dalam request/response.

**Testing Decisions**

**Good test practices**
- Deterministic; seeded DB; no jaringan ke AI (adapter *fake*); *isolated* dari infrastruktur luar.
- *One source of truth*: test data hidup dalam `supabase start` container; *migrate* otomatis via `supabase gen from db`.
- *CI* hanya menjalankan *smoke* + *unit*; *E2E* di `vercel dev` atau lingkungan lokal.

**Seams (proposed)**
1. **HTTP/UI E2E seam** (tinggi): Playwright melawan aplikasi Next.js berjalan + *seeded* Supabase *local* (`supabase start`). Cover flow: login → create activity → upload evidence → AI improve → generate report → supervisor review → approve. Ini *primary seam* dan menguji kebijakan user‑visible.
2. **Domain service seam**: *pure* modul TypeScript untuk `reportComposer`, `statusMachine`, `permissionPolicy`, `rhkMatcher`, `validationSchemas`. *Vitest* dengan *fixture* DB. Mengalami *fast feedback* untuk transisi status dan komposisi laporan tanpa *network* atau *render*.
3. **Adapter seams**: *interface* `AIProvider` dan `ObjectStorage` dengan implementasi *fake* dalam *unit test*; *E2E* menggunakan *fake* untuk menghindari biaya/latensi jaringan. *Contract test* memastikan *API shape* konsisten.

Karena kodebase masih kosong, semua seam ini *new*. Idealnya ada *satu* seam, tetapi dengan layanan eksternal (AI, storage) diperlukan adapter seam. Dua seam utama (E2E + domain) cukup untuk coverage MVP; adapter seam adalah *orthogonal*.

**Modules to test**
- `reportComposer`: menghasilkan `snapshot` JSONB dari daftar aktivitas + RHK + narasi manual; hasil *deterministic* terhadap input yang sama.
- `statusMachine`: transisi `draft → submitted → approved|revision_requested → submitted`; *edge cases* (double‑submit, review oleh supervisor lain).
- `permissionPolicy`: setiap kombinasi role × resource × action → `allow`/`deny`; *matrix test*.
- `validationSchemas`: Zod schema *parse* input aktivitas/evidence/laporan; *fuzz test* batas.
- `AI adapter fake`: *prompt* dan *response* shape; *cost* 0; *latency* < 100 ms.
- `ObjectStorage fake`: *upload*, *signed URL*, *delete*; memastikan *path* unik dan *TTL*.

**Prior art**
- Proyek serupa: `j-ejakan-kinerja` BKN (loket fisik), tidak ada *codebase* open‑source.
- Patterns dari `nextjs/supabase` starter; *Playwright* + `supabase start` *smoke* di `vercel dev`.
- Tidak ada *library* AI wrapper khusus; adapter dibuat *in‑house* untuk *control*.

**Out of Scope**
- Voice‑to‑Activity (COULD), OCR, Google Drive/Sheets, email notifikasi, *dark mode*, *PWA install*, *multi‑org* UI, e‑Kinerja BKN integrasi, *native mobile*, *SSO*, *AI performance insights*, *duplicate detection UI*, *calendar* lengkap (hanya *reminder* hari tanpa aktivitas).
- *Supervisor approval* per‑aktivitas (tidak ada di MVP); *public registration*; *AI-generated performance scores*.

**Further Notes**

- **Setup belum lengkap**: *issue tracker*/*triage labels*/*glossary*/*ADR* tidak dikonfigurasi di repo ini. Spec ini diterbitkan ke konvensi *local markdown* (`.scratch/jejak-kinerja-ai-mvp/spec.md`) karena belum ada tracker remote. Jalankan `/setup-matt-pocock-skills` untuk merekam pilihan *Section A* (local) dan membuat `CLAUDE.md`/`AGENTS.md` agar skill‑selanjutnya bisa merujuk.
- **Keputusan grill**: Keputusan 9 dari *grill‑with‑docs* disajikan sebagai *recommendation*; spec ini mengasumsikan mereka. Jika pengguna tidak setuju, *update* spec sebelum implementasi.
- **Bahasa**: UI dan konten laporan dalam Bahasa Indonesia; identifikasi kode dalam Bahasa Inggris.
- **Zona waktu**: semua tanggal disimpan sebagai `date` (tanpa waktu) dan ditafsirkan di `Asia/Jakarta`; timestamp di‑UTC untuk *audit log*.
- **Angka/format**: Format Indonesia (ribu dengan titik, koma desimal); *localization* hanya ID untuk MVP.
- **Aksesibilitas**: WCAG 2.1 AA dasar: label form, fokus visual, target sentuh minimal 44 px, *color contrast* sesuai tema.
- **Deployment**: Vercel Hobby; `vercel.json` `functions` maxDuration 30 s; *environment variables* di `Vercel Dashboard` (Supabase URL/anon key, AI provider keys); *CI* hanya *build* + *type‑check*; *no* *runtime* *secrets* di repo.
- **Roadmap**: setelah MVP terverifikasi, tambahkan *SHOULD* (calendar, dark mode, multi‑org, SSO, AI insights) sebagai *increment*.

---
*(Triage label `ready-for-agent` diterapkan di atas; *issue tracker* belum terkonfigurasi — lihat *Further Notes*.)*