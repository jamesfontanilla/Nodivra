begin;

-- Nodivra Work keeps services and availability explicit, bounded, and inquiry-led.

alter table if exists public.public_profile_settings
  add column if not exists published_availability jsonb,
  add column if not exists published_services jsonb not null default '[]'::jsonb;

create table if not exists public.availability_settings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open_to_conversations' check (status in ('available', 'limited_availability', 'not_available', 'open_to_conversations')),
  headline text not null default '',
  detail text not null default '',
  contact_cta_label text not null default '',
  contact_cta_url text not null default '',
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id),
  check (char_length(headline) <= 120),
  check (char_length(detail) <= 280),
  check (char_length(contact_cta_label) <= 72),
  check (contact_cta_url = '' or contact_cta_url ~* '^https?://')
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null,
  starting_price_text text not null default '',
  delivery_time_text text not null default '',
  availability_status text not null default 'open_to_conversations' check (availability_status in ('available', 'limited_availability', 'not_available', 'open_to_conversations')),
  contact_cta_label text not null default '',
  contact_cta_url text not null default '',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (profile_id, slug),
  check (char_length(title) between 1 and 96),
  check (char_length(slug) between 1 and 96),
  check (char_length(description) between 1 and 600),
  check (char_length(starting_price_text) <= 72),
  check (char_length(delivery_time_text) <= 72),
  check (char_length(contact_cta_label) <= 72),
  check (contact_cta_url = '' or contact_cta_url ~* '^https?://'),
  check (not is_featured or is_published)
);

create table if not exists public.service_skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  skill text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(skill) between 1 and 32)
);

create table if not exists public.service_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  kind text not null check (kind in ('project', 'resource')),
  project_id uuid references public.projects(id) on delete cascade,
  label text not null,
  url text not null default '',
  position integer not null default 0 check (position >= 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(label) between 1 and 72),
  check ((kind = 'project' and project_id is not null and url = '') or (kind = 'resource' and project_id is null and url ~* '^https?://'))
);

create unique index if not exists services_profile_slug_idx on public.services(profile_id, lower(slug));
create index if not exists services_profile_position_idx on public.services(profile_id, position);
create index if not exists services_profile_published_idx on public.services(profile_id, is_published, availability_status, position);
create index if not exists services_featured_idx on public.services(profile_id, is_featured, position);
create index if not exists services_created_at_idx on public.services(created_at desc);
create index if not exists service_skills_service_position_idx on public.service_skills(service_id, position);
create unique index if not exists service_skills_unique_idx on public.service_skills(service_id, lower(skill));
create index if not exists service_links_service_position_idx on public.service_links(service_id, position);
create index if not exists service_links_project_idx on public.service_links(project_id);

drop trigger if exists availability_settings_touch_updated_at on public.availability_settings;
create trigger availability_settings_touch_updated_at before update on public.availability_settings for each row execute function public.touch_updated_at();
drop trigger if exists services_touch_updated_at on public.services;
create trigger services_touch_updated_at before update on public.services for each row execute function public.touch_updated_at();
drop trigger if exists service_skills_touch_updated_at on public.service_skills;
create trigger service_skills_touch_updated_at before update on public.service_skills for each row execute function public.touch_updated_at();
drop trigger if exists service_links_touch_updated_at on public.service_links;
create trigger service_links_touch_updated_at before update on public.service_links for each row execute function public.touch_updated_at();

alter table public.availability_settings enable row level security;
alter table public.services enable row level security;
alter table public.service_skills enable row level security;
alter table public.service_links enable row level security;

drop policy if exists availability_settings_owner_manage on public.availability_settings;
create policy availability_settings_owner_manage on public.availability_settings for all using (exists (select 1 from public.profiles where profiles.id = availability_settings.profile_id and profiles.owner_id = auth.uid())) with check (exists (select 1 from public.profiles where profiles.id = availability_settings.profile_id and profiles.owner_id = auth.uid()));
drop policy if exists availability_settings_public_select on public.availability_settings;
create policy availability_settings_public_select on public.availability_settings for select using (is_enabled = true and exists (select 1 from public.profiles where profiles.id = availability_settings.profile_id and profiles.is_published = true and profiles.deleted_at is null));

drop policy if exists services_owner_manage on public.services;
create policy services_owner_manage on public.services for all using (exists (select 1 from public.profiles where profiles.id = services.profile_id and profiles.owner_id = auth.uid())) with check (exists (select 1 from public.profiles where profiles.id = services.profile_id and profiles.owner_id = auth.uid()));
drop policy if exists services_public_select on public.services;
create policy services_public_select on public.services for select using (is_published = true and deleted_at is null and exists (select 1 from public.profiles where profiles.id = services.profile_id and profiles.is_published = true and profiles.deleted_at is null));

drop policy if exists service_skills_owner_manage on public.service_skills;
create policy service_skills_owner_manage on public.service_skills for all using (exists (select 1 from public.profiles where profiles.id = service_skills.profile_id and profiles.owner_id = auth.uid()) and exists (select 1 from public.services where services.id = service_skills.service_id and services.profile_id = service_skills.profile_id)) with check (exists (select 1 from public.profiles where profiles.id = service_skills.profile_id and profiles.owner_id = auth.uid()) and exists (select 1 from public.services where services.id = service_skills.service_id and services.profile_id = service_skills.profile_id));
drop policy if exists service_skills_public_select on public.service_skills;
create policy service_skills_public_select on public.service_skills for select using (exists (select 1 from public.services where services.id = service_skills.service_id and services.profile_id = service_skills.profile_id and services.is_published = true and services.deleted_at is null) and exists (select 1 from public.profiles where profiles.id = service_skills.profile_id and profiles.is_published = true and profiles.deleted_at is null));

drop policy if exists service_links_owner_manage on public.service_links;
create policy service_links_owner_manage on public.service_links for all using (exists (select 1 from public.profiles where profiles.id = service_links.profile_id and profiles.owner_id = auth.uid()) and exists (select 1 from public.services where services.id = service_links.service_id and services.profile_id = service_links.profile_id) and (service_links.project_id is null or exists (select 1 from public.projects where projects.id = service_links.project_id and projects.profile_id = service_links.profile_id))) with check (exists (select 1 from public.profiles where profiles.id = service_links.profile_id and profiles.owner_id = auth.uid()) and exists (select 1 from public.services where services.id = service_links.service_id and services.profile_id = service_links.profile_id) and (service_links.project_id is null or exists (select 1 from public.projects where projects.id = service_links.project_id and projects.profile_id = service_links.profile_id)));
drop policy if exists service_links_public_select on public.service_links;
create policy service_links_public_select on public.service_links for select using (is_enabled = true and exists (select 1 from public.services where services.id = service_links.service_id and services.profile_id = service_links.profile_id and services.is_published = true and services.deleted_at is null) and exists (select 1 from public.profiles where profiles.id = service_links.profile_id and profiles.is_published = true and profiles.deleted_at is null) and (service_links.project_id is null or exists (select 1 from public.projects where projects.id = service_links.project_id and projects.profile_id = service_links.profile_id and projects.is_published = true and projects.deleted_at is null)));

commit;
