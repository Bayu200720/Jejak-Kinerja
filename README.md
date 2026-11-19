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

## Prioritas eksekusi (ringkas, dari tickets)

P1 pertama (E1 Foundation): JKI-001..JKI-006, lalu E2 Auth/JWT (JKI-010..JKI-015), E4 RHK (JKI-030..JKI-036), E5 Bukti (JKI-040..JKI-043), E3 Aktivitas+AI assist (JKI-020..JKI-028), dst sesuai `docs/tickets/jejak-kinerja-ai-tickets.md`.
