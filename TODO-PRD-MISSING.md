# TODO — Fitur PRD yang Belum Diimplementasikan (MVP)

Checklist aksi untuk fitur yang masih 🚧/❌ pada `PRD-IMPLEMENTATION-CHECKLIST.md`.

## E2. Autentikasi & Profil
- [x] JKI-010 Login email/password (Supabase Auth) — form aktif + server action + redirect ke `/dashboard`
- [x] JKI-011 Logout — action + hapus session + redirect ke `/login`
- [x] JKI-012 Reset password via email — form request (`/reset-password`) + action `resetPasswordRequest` + halaman set password (`/reset-callback`)
- [x] JKI-013 Redirect & navigasi per role — middleware mengatur akses dasar; `/dashboard` redirect ke dashboard per role berdasarkan `profile_roles` (via `getCurrentUserProfile`)
- [x] JKI-014 Manajemen profil dasar ASN — halaman profil (`/dashboard/settings`) lihat/edit nama dan NIP (server action `updateProfile`)

## E3. RHK & Kategori
- [x] JKI-030 CRUD aktivitas harian (draft/submitted) — form, list/filter, edit draft, submit, soft delete
- [ ] JKI-031 Autosave/draft recovery — indikator tersimpan + recovery
- [ ] JKI-032 Validasi inline & pencocokan volume/satuan — pesan error inline + aturan terdokumentasi

## E4. Bukti Pendukung
- [ ] JKI-040 Upload bukti (max 5, ≤5MB, allowlist) + validasi ekstensi/MIME/magic bytes
- [ ] JKI-041 Preview, caption, kompresi client-side (gambar)
- [ ] JKI-042 Signed URL TTL 15 menit + hapus soft-delete metadata + audit trail

## E5. Bukti Pendukung (lanjutan sesuai tiket E5)
- [ ] Halaman/komponen manajemen bukti per aktivitas (list, preview, download via signed URL, hapus)

## E6. AI Assistant
- [ ] Integrasi AI provider (server-side) + mode improve/simplify/suggest kategori/RHK (advisory)
- [ ] Rate limit per user + fallback manual saat AI tidak tersedia/kuota habis
- [ ] Pencegahan inventasi angka (AI tidak menambah angka/hasil yang tidak ada di input)

## E7. Laporan Bulanan
- [ ] Generate laporan per (ASN, tahun, bulan) dari aktivitas tercatat
- [ ] Preview + edit narasi (eksekutif/kesimpulan) di draft
- [ ] Export PDF/DOCX (server-side) + riwayat laporan
- [ ] Status workflow laporan dasar (draft/submitted/revision_requested/approved) minimal untuk alur inti

## E9. Review Supervisora
- [ ] Supervisora melihat laporan tim yang menunggu review
- [ ] Approve / request revision (komentar wajib untuk revision)
- [ ] Audit log transisi status + histori review

## Deployment / Ops
- [ ] JKI-003 Deploy ke Vercel (Hobby) + GitHub integration + env vars di Vercel
- [ ] Konfigurasi Storage bucket `activity-evidences` di Supabase (private + MIME/size policy)

## Catatan
- Data dummy/demo hanya untuk pengujian; tidak ada data ASN asli.
- Semua akses data harus melalui RLS + pengecekan server-side (profile_id dari session).