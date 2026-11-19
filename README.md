# JEJAK KINERJA AI (MVP scaffold)

Web app MVP scaffold (Next.js App Router + TypeScript + Tailwind). Spec/PRD dan tiket berada di `docs/` dan `.scratch/jejak-kinerja-ai-mvp/`.

## Perintah

- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Struktur awal

- `src/app/(auth)/login` placeholder login
- `src/app/(dashboard)/*` placeholder dashboard (ASN/Supervisor/Admin)
- `docs/tickets/*` daftar tiket MVP (CSV/MD)
- `docs/PRD-JEJAK-KINERJA-AI.md` PRD
- `.scratch/jejak-kinerja-ai-mvp/spec.md` spec MVP

## Integrasi data (Supabase)

- Salin `.env.example` menjadi `.env.local` lalu isi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (dan opsional `SUPABASE_SERVICE_ROLE_KEY` di server saja).
- Migrasi SQL: `supabase/migrations/20251119000000_init_schema.sql` (schema + RLS + helpers).
- Seed awal: `supabase/migrations/20251119000001_seed_data.sql` (org demo + kategori aktivitas). Lihat juga `supabase/seed.md` dan `supabase/storage.md`.
- Jalankan dengan Supabase CLI (contoh): `supabase start`, lalu `supabase db push` atau terapkan SQL secara berurutan. Setelah membuat user di Auth, buat row `profiles` + `profile_roles` sesuai `supabase/seed.md`.

## Prioritas eksekusi (ringkas, dari tickets)

P1 pertama (E1 Foundation): JKI-001..JKI-006, lalu E2 Auth (JKI-010..JKI-015), E4 RHK (JKI-030..JKI-036), E5 Bukti (JKI-040..JKI-043), E3 Aktivitas+AI assist (JKI-020..JKI-028), dst sesuai `docs/tickets/jejak-kinerja-ai-tickets.md`.
