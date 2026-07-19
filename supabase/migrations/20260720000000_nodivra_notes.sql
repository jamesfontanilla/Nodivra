begin;

-- Nodivra Notes is a manually authored, publish-controlled writing archive.

alter table if exists public.public_profile_settings
  add column if not exists published_notes jsonb not null default '[]'::jsonb;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text not null,
  body_markdown text not null,
  cover_image_url text not null default '',
  published_at date,
  reading_time_text text not null default '',
  canonical_url text not null default '',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (profile_id, slug),
  check (char_length(title) between 1 and 96),
  check (char_length(slug) between 1 and 96),
  check (char_length(excerpt) between 1 and 280),
  check (char_length(body_markdown) between 1 and 16000),
  check (char_length(reading_time_text) <= 32),
  check (cover_image_url = '' or cover_image_url ~* '^https?://'),
  check (canonical_url = '' or canonical_url ~* '^https?://'),
  check (body_markdown !~* '<[^>]+>' and body_markdown !~* '(javascript|data):'),
  check (not is_published or published_at is not null),
  check (not is_featured or is_published)
);

create table if not exists public.note_tags (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  tag text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(tag) between 1 and 32)
);

create table if not exists public.note_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  kind text not null check (kind in ('project', 'website', 'repository', 'resource')),
  project_id uuid references public.projects(id) on delete cascade,
  label text not null,
  url text not null default '',
  position integer not null default 0 check (position >= 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(label) between 1 and 72),
  check ((kind = 'project' and project_id is not null and url = '') or (kind <> 'project' and project_id is null and url ~* '^https?://'))
);

create table if not exists public.note_revisions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  actor_id uuid not null,
  title text not null,
  excerpt text not null,
  body_markdown text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists notes_profile_slug_idx on public.notes(profile_id, lower(slug));
create index if not exists notes_profile_position_idx on public.notes(profile_id, position);
create index if not exists notes_profile_published_idx on public.notes(profile_id, is_published, published_at desc);
create index if not exists notes_featured_idx on public.notes(profile_id, is_featured, position);
create index if not exists notes_created_at_idx on public.notes(created_at desc);
create index if not exists note_tags_note_position_idx on public.note_tags(note_id, position);
create unique index if not exists note_tags_unique_idx on public.note_tags(note_id, lower(tag));
create index if not exists note_links_note_position_idx on public.note_links(note_id, position);
create index if not exists note_links_project_idx on public.note_links(project_id);
create index if not exists note_revisions_note_created_idx on public.note_revisions(note_id, created_at desc);

drop trigger if exists notes_touch_updated_at on public.notes;
create trigger notes_touch_updated_at
before update on public.notes
for each row execute function public.touch_updated_at();

drop trigger if exists note_tags_touch_updated_at on public.note_tags;
create trigger note_tags_touch_updated_at
before update on public.note_tags
for each row execute function public.touch_updated_at();

drop trigger if exists note_links_touch_updated_at on public.note_links;
create trigger note_links_touch_updated_at
before update on public.note_links
for each row execute function public.touch_updated_at();

alter table public.notes enable row level security;
alter table public.note_tags enable row level security;
alter table public.note_links enable row level security;
alter table public.note_revisions enable row level security;

drop policy if exists notes_owner_manage on public.notes;
create policy notes_owner_manage
  on public.notes for all
  using (exists (select 1 from public.profiles where profiles.id = notes.profile_id and profiles.owner_id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = notes.profile_id and profiles.owner_id = auth.uid()));

drop policy if exists notes_public_select on public.notes;
create policy notes_public_select
  on public.notes for select
  using (is_published = true and deleted_at is null and exists (
    select 1 from public.profiles
    where profiles.id = notes.profile_id and profiles.is_published = true and profiles.deleted_at is null
  ));

drop policy if exists note_tags_owner_manage on public.note_tags;
create policy note_tags_owner_manage
  on public.note_tags for all
  using (exists (select 1 from public.profiles where profiles.id = note_tags.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.notes where notes.id = note_tags.note_id and notes.profile_id = note_tags.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = note_tags.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.notes where notes.id = note_tags.note_id and notes.profile_id = note_tags.profile_id));

drop policy if exists note_tags_public_select on public.note_tags;
create policy note_tags_public_select
  on public.note_tags for select
  using (exists (select 1 from public.notes where notes.id = note_tags.note_id and notes.profile_id = note_tags.profile_id and notes.is_published = true and notes.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = note_tags.profile_id and profiles.is_published = true and profiles.deleted_at is null));

drop policy if exists note_links_owner_manage on public.note_links;
create policy note_links_owner_manage
  on public.note_links for all
  using (exists (select 1 from public.profiles where profiles.id = note_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.notes where notes.id = note_links.note_id and notes.profile_id = note_links.profile_id)
    and (note_links.project_id is null or exists (select 1 from public.projects where projects.id = note_links.project_id and projects.profile_id = note_links.profile_id)))
  with check (exists (select 1 from public.profiles where profiles.id = note_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.notes where notes.id = note_links.note_id and notes.profile_id = note_links.profile_id)
    and (note_links.project_id is null or exists (select 1 from public.projects where projects.id = note_links.project_id and projects.profile_id = note_links.profile_id)));

drop policy if exists note_links_public_select on public.note_links;
create policy note_links_public_select
  on public.note_links for select
  using (is_enabled = true
    and exists (select 1 from public.notes where notes.id = note_links.note_id and notes.profile_id = note_links.profile_id and notes.is_published = true and notes.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = note_links.profile_id and profiles.is_published = true and profiles.deleted_at is null)
    and (note_links.project_id is null or exists (select 1 from public.projects where projects.id = note_links.project_id and projects.profile_id = note_links.profile_id and projects.is_published = true and projects.deleted_at is null)));

drop policy if exists note_revisions_owner_manage on public.note_revisions;
create policy note_revisions_owner_manage
  on public.note_revisions for all
  using (exists (select 1 from public.profiles where profiles.id = note_revisions.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.notes where notes.id = note_revisions.note_id and notes.profile_id = note_revisions.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = note_revisions.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.notes where notes.id = note_revisions.note_id and notes.profile_id = note_revisions.profile_id));

commit;
