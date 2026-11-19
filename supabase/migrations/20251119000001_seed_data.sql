-- Seed data for local/dev (idempotent where reasonable)
-- Run after base migration. Uses fixed UUIDs for demo.

-- Organization
insert into public.organizations (id, name, slug, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Dinas Contoh', 'dinas-contoh', now(), now())
on conflict (id) do nothing;

-- Categories
insert into public.activity_categories (id, organization_id, name, slug, description, active)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Pengelolaan Administrasi', 'pengelolaan-administrasi', 'Kegiatan administrasi rutin', true),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Pengembangan Aplikasi', 'pengembangan-aplikasi', 'Pengembangan/perbaikan aplikasi', true),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Pemeliharaan Infrastruktur TI', 'pemeliharaan-infrastruktur-ti', 'Perawatan server, jaringan, dll', true),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Koordinasi', 'koordinasi', 'Koordinasi internal/eksternal', true),
  ('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111111', 'Rapat', 'rapat', 'Rapat dinas/kelompok kerja', true),
  ('22222222-2222-2222-2222-222222222226', '11111111-1111-1111-1111-111111111111', 'Pelayanan', 'pelayanan', 'Pelayanan publik/internal', true),
  ('22222222-2222-2222-2222-222222222227', '11111111-1111-1111-1111-111111111111', 'Analisis Data', 'analisis-data', 'Pengolahan dan analisis data', true),
  ('22222222-2222-2222-2222-222222222228', '11111111-1111-1111-1111-111111111111', 'Penyusunan Laporan', 'penyusunan-laporan', 'Penyusunan laporan berkala', true),
  ('22222222-2222-2222-2222-222222222229', '11111111-1111-1111-1111-111111111111', 'Kegiatan Lainnya', 'kegiatan-lainnya', 'Kegiatan lain yang relevan', true)
on conflict (organization_id, slug) do nothing;

-- NOTE: Auth users (profiles.auth_user_id) must be created in Supabase Auth first.
-- After creating auth users in dashboard/local, insert profiles+roles manually or via admin script.
-- Example placeholders (replace auth_user_id with real UUIDs from auth.users):
-- insert into public.profiles (id, organization_id, auth_user_id, full_name, nip) values
-- ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','<AUTH_UUID_ASN>','ASN Contoh','198001012000121001');
-- insert into public.profile_roles (profile_id, role) values ('33333333-3333-3333-3333-333333333333','asn');

-- Example RHK target (optional demo):
insert into public.rhk_targets (
  id, organization_id, asn_profile_id, name, period_start, period_end, period_label,
  indikator_keberhasilan, target_kuantitas, satuan_target, ekspektasi_hasil_kerja, status
)
values (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'Contoh RHK: Pengelolaan Data Layanan',
  '2025-01-01',
  '2025-12-31',
  '2025',
  'Tersusunnya laporan bulanan tepat waktu',
  12,
  'laporan',
  'Laporan disusun setiap bulan dan diverifikasi atasan',
  'validated'
)
on conflict (id) do nothing;
