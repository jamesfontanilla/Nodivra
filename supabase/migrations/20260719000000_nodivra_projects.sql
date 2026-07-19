begin;

-- Nodivra Projects extends the existing profile foundation with curated case studies.

alter table if exists public.public_profile_settings
  add column if not exists published_projects jsonb not null default '[]'::jsonb;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  project_name text not null,
  short_summary text not null,
  case_study_markdown text not null,
  role text not null default '',
  project_type text not null default 'product' check (project_type in ('product', 'open_source', 'client', 'experiment', 'talk', 'other')),
  start_date date,
  end_date date,
  status text not null default 'in_progress' check (status in ('idea', 'in_progress', 'shipped', 'archived')),
  cover_image_url text not null default '',
  lessons_learned text not null default '',
  is_featured boolean not null default false,
  is_published boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (profile_id, slug),
  check (char_length(slug) between 1 and 72),
  check (char_length(project_name) between 1 and 72),
  check (char_length(short_summary) between 1 and 240),
  check (char_length(case_study_markdown) between 1 and 12000),
  check (cover_image_url = '' or cover_image_url ~* '^https?://'),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.project_technologies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  technology text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(technology) between 1 and 32)
);

create table if not exists public.project_tags (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  tag text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(tag) between 1 and 32)
);

create table if not exists public.project_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null check (kind in ('live', 'repository', 'demo')),
  label text not null default '',
  url text not null check (url ~* '^https?://'),
  position integer not null default 0 check (position >= 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, kind)
);

create index if not exists projects_profile_position_idx on public.projects(profile_id, position);
create index if not exists projects_profile_published_idx on public.projects(profile_id, is_published, is_featured);
create index if not exists projects_slug_idx on public.projects(slug);
create index if not exists project_technologies_project_position_idx on public.project_technologies(project_id, position);
create index if not exists project_tags_project_position_idx on public.project_tags(project_id, position);
create index if not exists project_links_project_position_idx on public.project_links(project_id, position);
create unique index if not exists project_technologies_unique_idx on public.project_technologies(project_id, lower(technology));
create unique index if not exists project_tags_unique_idx on public.project_tags(project_id, lower(tag));

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();

drop trigger if exists project_technologies_touch_updated_at on public.project_technologies;
create trigger project_technologies_touch_updated_at
before update on public.project_technologies
for each row execute function public.touch_updated_at();

drop trigger if exists project_tags_touch_updated_at on public.project_tags;
create trigger project_tags_touch_updated_at
before update on public.project_tags
for each row execute function public.touch_updated_at();

drop trigger if exists project_links_touch_updated_at on public.project_links;
create trigger project_links_touch_updated_at
before update on public.project_links
for each row execute function public.touch_updated_at();

alter table public.projects enable row level security;
alter table public.project_technologies enable row level security;
alter table public.project_tags enable row level security;
alter table public.project_links enable row level security;

create policy "Project owners can manage projects"
  on public.projects for all
  using (exists (select 1 from public.profiles where profiles.id = projects.profile_id and profiles.owner_id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = projects.profile_id and profiles.owner_id = auth.uid()));

create policy "Published projects are public"
  on public.projects for select
  using (is_published = true and deleted_at is null and exists (
    select 1 from public.profiles
    where profiles.id = projects.profile_id and profiles.is_published = true and profiles.deleted_at is null
  ));

create policy "Project owners can manage technologies"
  on public.project_technologies for all
  using (exists (select 1 from public.profiles where profiles.id = project_technologies.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.projects where projects.id = project_technologies.project_id and projects.profile_id = project_technologies.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = project_technologies.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.projects where projects.id = project_technologies.project_id and projects.profile_id = project_technologies.profile_id));

create policy "Published project technologies are public"
  on public.project_technologies for select
  using (exists (select 1 from public.projects where projects.id = project_technologies.project_id and projects.profile_id = project_technologies.profile_id and projects.is_published = true and projects.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = project_technologies.profile_id and profiles.is_published = true and profiles.deleted_at is null));

create policy "Project owners can manage tags"
  on public.project_tags for all
  using (exists (select 1 from public.profiles where profiles.id = project_tags.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.projects where projects.id = project_tags.project_id and projects.profile_id = project_tags.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = project_tags.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.projects where projects.id = project_tags.project_id and projects.profile_id = project_tags.profile_id));

create policy "Published project tags are public"
  on public.project_tags for select
  using (exists (select 1 from public.projects where projects.id = project_tags.project_id and projects.profile_id = project_tags.profile_id and projects.is_published = true and projects.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = project_tags.profile_id and profiles.is_published = true and profiles.deleted_at is null));

create policy "Project owners can manage links"
  on public.project_links for all
  using (exists (select 1 from public.profiles where profiles.id = project_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.projects where projects.id = project_links.project_id and projects.profile_id = project_links.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = project_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.projects where projects.id = project_links.project_id and projects.profile_id = project_links.profile_id));

create policy "Published project links are public"
  on public.project_links for select
  using (exists (select 1 from public.projects where projects.id = project_links.project_id and projects.profile_id = project_links.profile_id and projects.is_published = true and projects.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = project_links.profile_id and profiles.is_published = true and profiles.deleted_at is null));

commit;
