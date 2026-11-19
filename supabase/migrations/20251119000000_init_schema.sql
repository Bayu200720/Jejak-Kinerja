-- JEJAK KINERJA AI MVP - initial schema
-- Aligns with spec.md (more detailed) + PRD §9 core tables
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type app_role as enum ('asn','supervisor','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rhk_target_status as enum ('draft','validated','inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type daily_activity_status as enum ('draft','submitted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type monthly_report_status as enum ('draft','submitted','revision_requested','approved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_review_action as enum ('submitted','approved','revision_requested');
exception when duplicate_object then null; end $$;

do $$ begin
  create type audit_action as enum ('create','update','delete','submit','approve','review','role_change','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('info','warning','success');
exception when duplicate_object then null; end $$;

-- Tables
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  slug varchar(255) not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  auth_user_id uuid not null unique,
  full_name varchar(255) not null,
  nip varchar(100),
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_org_nip_unique
  on public.profiles(organization_id, nip)
  where nip is not null;

create table if not exists public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role app_role not null,
  primary key (profile_id, role)
);

create table if not exists public.employee_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  jabatan varchar(255),
  bidang_keahlian text,
  tmt date,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name varchar(255) not null,
  parent_unit_id uuid references public.organization_units(id) on delete set null,
  head_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  unit_id uuid not null references public.organization_units(id) on delete cascade,
  active_from date not null default current_date,
  active_to date,
  primary key (profile_id, unit_id, active_from)
);

create table if not exists public.supervisor_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supervisor_profile_id uuid not null references public.profiles(id) on delete cascade,
  asn_profile_id uuid not null references public.profiles(id) on delete cascade,
  unit_id uuid references public.organization_units(id) on delete set null,
  active_from date not null default current_date,
  active_to date,
  created_at timestamptz not null default now()
);

create index if not exists supervisor_assignments_supervisor_asn_idx
  on public.supervisor_assignments(supervisor_profile_id, asn_profile_id);

create unique index if not exists supervisor_assignments_unique_active
  on public.supervisor_assignments(supervisor_profile_id, asn_profile_id, active_from);

create table if not exists public.activity_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name varchar(255) not null,
  slug varchar(255) not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.rhk_targets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  organization_unit_id uuid references public.organization_units(id) on delete set null,
  asn_profile_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid,
  name varchar(255) not null,
  period_start date,
  period_end date,
  period_label varchar(100),
  indikator_keberhasilan text,
  target_kuantitas integer,
  satuan_target varchar(100),
  ekspektasi_hasil_kerja text,
  keterangan text,
  status rhk_target_status not null default 'draft',
  validated_by uuid references public.profiles(id) on delete set null,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, asn_profile_id, name, period_start, period_end)
);

create table if not exists public.daily_activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  asn_profile_id uuid not null references public.profiles(id) on delete cascade,
  tanggal date not null,
  nama_kegiatan varchar(200) not null,
  rhk_id uuid references public.rhk_targets(id) on delete set null,
  category_id uuid references public.activity_categories(id) on delete set null,
  uraian_hasil_pekerjaan text,
  volume_pekerjaan numeric,
  satuan_output varchar(50),
  waktu_mulai time,
  waktu_selesai time,
  lokasi_kegiatan varchar(200),
  catatan_tambahan text,
  status daily_activity_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists daily_activities_asn_date_idx on public.daily_activities(asn_profile_id, tanggal);
create index if not exists daily_activities_org_date_idx on public.daily_activities(organization_id, tanggal);

create table if not exists public.activity_evidences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  activity_id uuid not null references public.daily_activities(id) on delete cascade,
  storage_bucket text not null default 'activity-evidences',
  storage_path text not null,
  original_filename varchar(255) not null,
  mime_type varchar(100) not null,
  file_size integer not null,
  caption varchar(500),
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists activity_evidences_activity_idx on public.activity_evidences(activity_id);

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  asn_profile_id uuid not null references public.profiles(id) on delete cascade,
  tahun integer not null,
  bulan integer not null check (bulan >= 1 and bulan <= 12),
  status monthly_report_status not null default 'draft',
  snapshot jsonb,
  narasi_ringkasan text,
  narasi_eksekutif text,
  kesimpulan text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, asn_profile_id, tahun, bulan)
);

create index if not exists monthly_reports_asn_period_idx on public.monthly_reports(asn_profile_id, tahun, bulan);

create table if not exists public.report_reviews (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  reviewer_profile_id uuid not null references public.profiles(id) on delete cascade,
  action report_review_action not null,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.supervisor_feedback (
  id uuid primary key default gen_random_uuid(),
  monthly_report_id uuid not null references public.monthly_reports(id) on delete cascade,
  supervisor_profile_id uuid not null references public.profiles(id) on delete cascade,
  komentar text not null,
  perubahan_dilakukan boolean not null default false,
  ditambahkan_pada timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  entity_type varchar(50) not null,
  entity_id uuid,
  action varchar(50) not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index if not exists audit_logs_org_created_idx on public.audit_logs(organization_id, created_at);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null default 'info',
  title varchar(200) not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_read_idx on public.notifications(recipient_profile_id, read_at);

-- Helpers
create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.has_role(p_role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profile_roles pr
    join public.profiles p on p.id = pr.profile_id
    where p.auth_user_id = auth.uid() and pr.role = p_role
  );
$$;

create or replace function public.is_supervisor_of(p_asn_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.supervisor_assignments sa
    join public.profiles p on p.id = sa.supervisor_profile_id
    where p.auth_user_id = auth.uid()
      and sa.asn_profile_id = p_asn_profile_id
      and (sa.active_to is null or sa.active_to >= current_date)
      and sa.active_from <= current_date
  );
$$;

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_roles enable row level security;
alter table public.employee_profiles enable row level security;
alter table public.organization_units enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.supervisor_assignments enable row level security;
alter table public.activity_categories enable row level security;
alter table public.rhk_targets enable row level security;
alter table public.daily_activities enable row level security;
alter table public.activity_evidences enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.report_reviews enable row level security;
alter table public.supervisor_feedback enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- RLS Policies

-- organizations
create policy "org_select_member" on public.organizations
  for select using (id = public.current_org_id() or public.has_role('admin'));

-- profiles
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (
    auth_user_id = auth.uid()
    or public.has_role('admin')
    or organization_id = public.current_org_id()
  );

create policy "profiles_insert_admin" on public.profiles
  for insert with check (public.has_role('admin'));

create policy "profiles_update_self_or_admin" on public.profiles
  for update using (
    auth_user_id = auth.uid() or public.has_role('admin')
  );

-- profile_roles
create policy "profile_roles_select_admin_or_self" on public.profile_roles
  for select using (
    profile_id = public.current_profile_id() or public.has_role('admin')
  );

create policy "profile_roles_admin_all" on public.profile_roles
  for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- employee_profiles
create policy "employee_profiles_select" on public.employee_profiles
  for select using (
    profile_id = public.current_profile_id()
    or public.has_role('admin')
    or exists (
      select 1 from public.profiles p
      where p.id = employee_profiles.profile_id
        and p.organization_id = public.current_org_id()
    )
  );

create policy "employee_profiles_write_admin" on public.employee_profiles
  for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- organization_units
create policy "org_units_select_org" on public.organization_units
  for select using (organization_id = public.current_org_id() or public.has_role('admin'));
create policy "org_units_admin_write" on public.organization_units
  for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- organization_memberships
create policy "org_memberships_select_org" on public.organization_memberships
  for select using (
    public.has_role('admin')
    or exists (
      select 1 from public.organization_units ou
      where ou.id = organization_memberships.unit_id
        and ou.organization_id = public.current_org_id()
    )
    or profile_id = public.current_profile_id()
  );
create policy "org_memberships_admin_write" on public.organization_memberships
  for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- supervisor_assignments
create policy "supervisor_assignments_select" on public.supervisor_assignments
  for select using (
    public.has_role('admin')
    or supervisor_profile_id = public.current_profile_id()
    or asn_profile_id = public.current_profile_id()
  );
create policy "supervisor_assignments_admin_write" on public.supervisor_assignments
  for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- activity_categories
create policy "activity_categories_select_org" on public.activity_categories
  for select using (organization_id = public.current_org_id() or public.has_role('admin'));
create policy "activity_categories_admin_write" on public.activity_categories
  for all using (public.has_role('admin')) with check (public.has_role('admin'));

-- rhk_targets
create policy "rhk_targets_select" on public.rhk_targets
  for select using (
    public.has_role('admin')
    or asn_profile_id = public.current_profile_id()
    or public.is_supervisor_of(asn_profile_id)
  );
create policy "rhk_targets_insert_asn_or_admin" on public.rhk_targets
  for insert with check (
    public.has_role('admin')
    or (asn_profile_id = public.current_profile_id() and public.has_role('asn'))
  );
create policy "rhk_targets_update" on public.rhk_targets
  for update using (
    public.has_role('admin')
    or asn_profile_id = public.current_profile_id()
    or public.is_supervisor_of(asn_profile_id)
  );
create policy "rhk_targets_delete_admin_or_self" on public.rhk_targets
  for delete using (public.has_role('admin') or asn_profile_id = public.current_profile_id());

-- daily_activities
create policy "daily_activities_select" on public.daily_activities
  for select using (
    public.has_role('admin')
    or asn_profile_id = public.current_profile_id()
    or public.is_supervisor_of(asn_profile_id)
  );
create policy "daily_activities_insert_own" on public.daily_activities
  for insert with check (asn_profile_id = public.current_profile_id());
create policy "daily_activities_update_own" on public.daily_activities
  for update using (asn_profile_id = public.current_profile_id());
create policy "daily_activities_delete_own" on public.daily_activities
  for delete using (asn_profile_id = public.current_profile_id());

-- activity_evidences
create policy "activity_evidences_select" on public.activity_evidences
  for select using (
    public.has_role('admin')
    or exists (
      select 1 from public.daily_activities da
      where da.id = activity_evidences.activity_id
        and (
          da.asn_profile_id = public.current_profile_id()
          or public.is_supervisor_of(da.asn_profile_id)
        )
    )
  );
create policy "activity_evidences_insert_own_activity" on public.activity_evidences
  for insert with check (
    exists (
      select 1 from public.daily_activities da
      where da.id = activity_evidences.activity_id
        and da.asn_profile_id = public.current_profile_id()
    )
  );
create policy "activity_evidences_update_own_activity" on public.activity_evidences
  for update using (
    exists (
      select 1 from public.daily_activities da
      where da.id = activity_evidences.activity_id
        and da.asn_profile_id = public.current_profile_id()
    )
  );
create policy "activity_evidences_delete_own_activity" on public.activity_evidences
  for delete using (
    exists (
      select 1 from public.daily_activities da
      where da.id = activity_evidences.activity_id
        and da.asn_profile_id = public.current_profile_id()
    )
  );

-- monthly_reports
create policy "monthly_reports_select" on public.monthly_reports
  for select using (
    public.has_role('admin')
    or asn_profile_id = public.current_profile_id()
    or public.is_supervisor_of(asn_profile_id)
  );
create policy "monthly_reports_insert_own" on public.monthly_reports
  for insert with check (asn_profile_id = public.current_profile_id());
create policy "monthly_reports_update_own" on public.monthly_reports
  for update using (asn_profile_id = public.current_profile_id());
create policy "monthly_reports_delete_own_draft" on public.monthly_reports
  for delete using (asn_profile_id = public.current_profile_id() and status = 'draft');

-- report_reviews
create policy "report_reviews_select" on public.report_reviews
  for select using (
    public.has_role('admin')
    or exists (
      select 1 from public.monthly_reports mr
      where mr.id = report_reviews.report_id
        and (mr.asn_profile_id = public.current_profile_id() or public.is_supervisor_of(mr.asn_profile_id))
    )
  );
create policy "report_reviews_insert_supervisor" on public.report_reviews
  for insert with check (
    exists (
      select 1 from public.monthly_reports mr
      where mr.id = report_reviews.report_id
        and (public.is_supervisor_of(mr.asn_profile_id) or public.has_role('admin'))
    )
  );

-- supervisor_feedback
create policy "supervisor_feedback_select" on public.supervisor_feedback
  for select using (
    public.has_role('admin')
    or exists (
      select 1 from public.monthly_reports mr
      where mr.id = supervisor_feedback.monthly_report_id
        and (mr.asn_profile_id = public.current_profile_id() or public.is_supervisor_of(mr.asn_profile_id))
    )
  );
create policy "supervisor_feedback_insert_supervisor" on public.supervisor_feedback
  for insert with check (
    exists (
      select 1 from public.monthly_reports mr
      where mr.id = supervisor_feedback.monthly_report_id
        and (public.is_supervisor_of(mr.asn_profile_id) or public.has_role('admin'))
    )
  );

-- audit_logs (admin can read; inserts typically via service role or server actions with care)
create policy "audit_logs_select_admin" on public.audit_logs
  for select using (public.has_role('admin'));
create policy "audit_logs_insert_authenticated" on public.audit_logs
  for insert with check (actor_profile_id = public.current_profile_id());

-- notifications
create policy "notifications_select_own" on public.notifications
  for select using (recipient_profile_id = public.current_profile_id());
create policy "notifications_update_own" on public.notifications
  for update using (recipient_profile_id = public.current_profile_id());

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_rhk_targets_updated_at on public.rhk_targets;
create trigger set_rhk_targets_updated_at before update on public.rhk_targets
for each row execute function public.set_updated_at();

drop trigger if exists set_daily_activities_updated_at on public.daily_activities;
create trigger set_daily_activities_updated_at before update on public.daily_activities
for each row execute function public.set_updated_at();

drop trigger if exists set_monthly_reports_updated_at on public.monthly_reports;
create trigger set_monthly_reports_updated_at before update on public.monthly_reports
for each row execute function public.set_updated_at();
