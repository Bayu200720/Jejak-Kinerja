# Seed / demo data

- Run migrations in order (e.g. `supabase db push` or apply SQL files).
- `20251119000001_seed_data.sql` inserts a demo organization and activity categories.
- Auth users must exist in Supabase Auth (`auth.users`) first; then create matching rows in `public.profiles` with the same `auth_user_id`, and assign roles in `public.profile_roles` (at least `asn`).
- After that, you can insert demo `rhk_targets` / `daily_activities` linked to the real profile UUIDs.

## Local quick steps (Supabase CLI)
1. `supabase start`
2. `supabase db push` (or `supabase migration up`)
3. Create test users in Auth (Dashboard or CLI), copy their UUIDs.
4. Insert profiles + roles via SQL editor or a small script.
