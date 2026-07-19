begin;

-- Nodivra Path is a manually curated, publish-controlled developer timeline.

alter table if exists public.public_profile_settings
  add column if not exists published_path_entries jsonb not null default '[]'::jsonb;

create table if not exists public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  entry_type text not null check (entry_type in ('work', 'freelance', 'internship', 'education', 'certification', 'volunteer', 'career_milestone')),
  title text not null,
  organization text not null,
  location_text text not null default '',
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  date_visibility text not null default 'exact' check (date_visibility in ('exact', 'year_only')),
  summary text not null,
  is_published boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (char_length(title) between 1 and 72),
  check (char_length(organization) between 1 and 72),
  check (char_length(location_text) <= 72),
  check (char_length(summary) between 1 and 420),
  check (end_date is null or end_date >= start_date),
  check (not is_current or end_date is null)
);

create table if not exists public.timeline_highlights (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  entry_id uuid not null references public.timeline_entries(id) on delete cascade,
  content text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(content) between 1 and 180)
);

create table if not exists public.timeline_technologies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  entry_id uuid not null references public.timeline_entries(id) on delete cascade,
  technology text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(technology) between 1 and 32)
);

create table if not exists public.timeline_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  entry_id uuid not null references public.timeline_entries(id) on delete cascade,
  kind text not null check (kind in ('project', 'website', 'certificate', 'resource')),
  project_id uuid references public.projects(id) on delete cascade,
  label text not null,
  url text not null default '',
  position integer not null default 0 check (position >= 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(label) between 1 and 72),
  check (url = '' or url ~* '^https?://')
);

create index if not exists timeline_entries_profile_position_idx on public.timeline_entries(profile_id, position);
create index if not exists timeline_entries_profile_published_idx on public.timeline_entries(profile_id, is_published, position);
create index if not exists timeline_entries_type_idx on public.timeline_entries(entry_type);
create index if not exists timeline_entries_organization_idx on public.timeline_entries(organization);
create index if not exists timeline_entries_created_at_idx on public.timeline_entries(created_at desc);
create index if not exists timeline_highlights_entry_position_idx on public.timeline_highlights(entry_id, position);
create index if not exists timeline_technologies_entry_position_idx on public.timeline_technologies(entry_id, position);
create index if not exists timeline_links_entry_position_idx on public.timeline_links(entry_id, position);
create index if not exists timeline_links_project_idx on public.timeline_links(project_id);
create unique index if not exists timeline_technologies_unique_idx on public.timeline_technologies(entry_id, lower(technology));

drop trigger if exists timeline_entries_touch_updated_at on public.timeline_entries;
create trigger timeline_entries_touch_updated_at
before update on public.timeline_entries
for each row execute function public.touch_updated_at();

drop trigger if exists timeline_highlights_touch_updated_at on public.timeline_highlights;
create trigger timeline_highlights_touch_updated_at
before update on public.timeline_highlights
for each row execute function public.touch_updated_at();

drop trigger if exists timeline_technologies_touch_updated_at on public.timeline_technologies;
create trigger timeline_technologies_touch_updated_at
before update on public.timeline_technologies
for each row execute function public.touch_updated_at();

drop trigger if exists timeline_links_touch_updated_at on public.timeline_links;
create trigger timeline_links_touch_updated_at
before update on public.timeline_links
for each row execute function public.touch_updated_at();

alter table public.timeline_entries enable row level security;
alter table public.timeline_highlights enable row level security;
alter table public.timeline_technologies enable row level security;
alter table public.timeline_links enable row level security;

drop policy if exists timeline_entries_owner_manage on public.timeline_entries;
create policy timeline_entries_owner_manage
  on public.timeline_entries for all
  using (exists (select 1 from public.profiles where profiles.id = timeline_entries.profile_id and profiles.owner_id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = timeline_entries.profile_id and profiles.owner_id = auth.uid()));

drop policy if exists timeline_entries_public_select on public.timeline_entries;
create policy timeline_entries_public_select
  on public.timeline_entries for select
  using (is_published = true and deleted_at is null and exists (
    select 1 from public.profiles
    where profiles.id = timeline_entries.profile_id and profiles.is_published = true and profiles.deleted_at is null
  ));

drop policy if exists timeline_highlights_owner_manage on public.timeline_highlights;
create policy timeline_highlights_owner_manage
  on public.timeline_highlights for all
  using (exists (select 1 from public.profiles where profiles.id = timeline_highlights.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.timeline_entries where timeline_entries.id = timeline_highlights.entry_id and timeline_entries.profile_id = timeline_highlights.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = timeline_highlights.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.timeline_entries where timeline_entries.id = timeline_highlights.entry_id and timeline_entries.profile_id = timeline_highlights.profile_id));

drop policy if exists timeline_highlights_public_select on public.timeline_highlights;
create policy timeline_highlights_public_select
  on public.timeline_highlights for select
  using (exists (select 1 from public.timeline_entries where timeline_entries.id = timeline_highlights.entry_id and timeline_entries.profile_id = timeline_highlights.profile_id and timeline_entries.is_published = true and timeline_entries.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = timeline_highlights.profile_id and profiles.is_published = true and profiles.deleted_at is null));

drop policy if exists timeline_technologies_owner_manage on public.timeline_technologies;
create policy timeline_technologies_owner_manage
  on public.timeline_technologies for all
  using (exists (select 1 from public.profiles where profiles.id = timeline_technologies.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.timeline_entries where timeline_entries.id = timeline_technologies.entry_id and timeline_entries.profile_id = timeline_technologies.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = timeline_technologies.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.timeline_entries where timeline_entries.id = timeline_technologies.entry_id and timeline_entries.profile_id = timeline_technologies.profile_id));

drop policy if exists timeline_technologies_public_select on public.timeline_technologies;
create policy timeline_technologies_public_select
  on public.timeline_technologies for select
  using (exists (select 1 from public.timeline_entries where timeline_entries.id = timeline_technologies.entry_id and timeline_entries.profile_id = timeline_technologies.profile_id and timeline_entries.is_published = true and timeline_entries.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = timeline_technologies.profile_id and profiles.is_published = true and profiles.deleted_at is null));

drop policy if exists timeline_links_owner_manage on public.timeline_links;
create policy timeline_links_owner_manage
  on public.timeline_links for all
  using (exists (select 1 from public.profiles where profiles.id = timeline_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.timeline_entries where timeline_entries.id = timeline_links.entry_id and timeline_entries.profile_id = timeline_links.profile_id)
    and (timeline_links.project_id is null or exists (select 1 from public.projects where projects.id = timeline_links.project_id and projects.profile_id = timeline_links.profile_id)))
  with check (exists (select 1 from public.profiles where profiles.id = timeline_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.timeline_entries where timeline_entries.id = timeline_links.entry_id and timeline_entries.profile_id = timeline_links.profile_id)
    and (timeline_links.project_id is null or exists (select 1 from public.projects where projects.id = timeline_links.project_id and projects.profile_id = timeline_links.profile_id)));

drop policy if exists timeline_links_public_select on public.timeline_links;
create policy timeline_links_public_select
  on public.timeline_links for select
  using (is_enabled = true
    and exists (select 1 from public.timeline_entries where timeline_entries.id = timeline_links.entry_id and timeline_entries.profile_id = timeline_links.profile_id and timeline_entries.is_published = true and timeline_entries.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = timeline_links.profile_id and profiles.is_published = true and profiles.deleted_at is null)
    and (timeline_links.project_id is null or exists (select 1 from public.projects where projects.id = timeline_links.project_id and projects.profile_id = timeline_links.profile_id and projects.is_published = true and projects.deleted_at is null)));

commit;
