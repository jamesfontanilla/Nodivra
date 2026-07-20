begin;

-- Nodivra Talks stores manually curated appearances and links out to hosted media.

alter table if exists public.public_profile_settings
  add column if not exists published_talks jsonb not null default '[]'::jsonb;

create table if not exists public.talks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  event_name text not null,
  event_date date not null,
  location_text text not null default '',
  format text not null check (format in ('conference', 'workshop', 'podcast', 'panel', 'meetup', 'livestream')),
  role text not null,
  summary text not null,
  slides_url text not null default '',
  recording_url text not null default '',
  event_url text not null default '',
  cover_image_url text not null default '',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (profile_id, slug),
  check (char_length(title) between 1 and 96),
  check (char_length(slug) between 1 and 96),
  check (char_length(event_name) between 1 and 96),
  check (char_length(location_text) <= 96),
  check (char_length(role) between 1 and 72),
  check (char_length(summary) between 1 and 600),
  check (slides_url = '' or slides_url ~* '^https?://'),
  check (recording_url = '' or recording_url ~* '^https?://'),
  check (event_url = '' or event_url ~* '^https?://'),
  check (cover_image_url = '' or cover_image_url ~* '^https?://'),
  check (summary !~* '<[^>]+>' and summary !~* '(javascript|data):'),
  check (not is_featured or is_published)
);

create table if not exists public.talk_tags (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  talk_id uuid not null references public.talks(id) on delete cascade,
  tag text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(tag) between 1 and 32)
);

create table if not exists public.talk_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  talk_id uuid not null references public.talks(id) on delete cascade,
  kind text not null check (kind in ('project', 'stack', 'note', 'website', 'resource')),
  project_id uuid references public.projects(id) on delete cascade,
  stack_item_id uuid references public.stack_items(id) on delete cascade,
  note_id uuid references public.notes(id) on delete cascade,
  label text not null,
  url text not null default '',
  position integer not null default 0 check (position >= 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(label) between 1 and 72),
  check (
    (kind = 'project' and project_id is not null and stack_item_id is null and note_id is null and url = '')
    or (kind = 'stack' and project_id is null and stack_item_id is not null and note_id is null and url = '')
    or (kind = 'note' and project_id is null and stack_item_id is null and note_id is not null and url = '')
    or (kind in ('website', 'resource') and project_id is null and stack_item_id is null and note_id is null and url ~* '^https?://')
  )
);

create unique index if not exists talks_profile_slug_idx on public.talks(profile_id, lower(slug));
create index if not exists talks_profile_position_idx on public.talks(profile_id, position);
create index if not exists talks_profile_event_date_idx on public.talks(profile_id, event_date desc);
create index if not exists talks_profile_published_idx on public.talks(profile_id, is_published, event_date desc);
create index if not exists talks_featured_idx on public.talks(profile_id, is_featured, position);
create index if not exists talks_created_at_idx on public.talks(created_at desc);
create index if not exists talk_tags_talk_position_idx on public.talk_tags(talk_id, position);
create unique index if not exists talk_tags_unique_idx on public.talk_tags(talk_id, lower(tag));
create index if not exists talk_links_talk_position_idx on public.talk_links(talk_id, position);
create index if not exists talk_links_project_idx on public.talk_links(project_id);
create index if not exists talk_links_stack_idx on public.talk_links(stack_item_id);
create index if not exists talk_links_note_idx on public.talk_links(note_id);

drop trigger if exists talks_touch_updated_at on public.talks;
create trigger talks_touch_updated_at
before update on public.talks
for each row execute function public.touch_updated_at();

drop trigger if exists talk_tags_touch_updated_at on public.talk_tags;
create trigger talk_tags_touch_updated_at
before update on public.talk_tags
for each row execute function public.touch_updated_at();

drop trigger if exists talk_links_touch_updated_at on public.talk_links;
create trigger talk_links_touch_updated_at
before update on public.talk_links
for each row execute function public.touch_updated_at();

alter table public.talks enable row level security;
alter table public.talk_tags enable row level security;
alter table public.talk_links enable row level security;

drop policy if exists talks_owner_manage on public.talks;
create policy talks_owner_manage
  on public.talks for all
  using (exists (select 1 from public.profiles where profiles.id = talks.profile_id and profiles.owner_id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = talks.profile_id and profiles.owner_id = auth.uid()));

drop policy if exists talks_public_select on public.talks;
create policy talks_public_select
  on public.talks for select
  using (is_published = true and deleted_at is null and exists (
    select 1 from public.profiles
    where profiles.id = talks.profile_id and profiles.is_published = true and profiles.deleted_at is null
  ));

drop policy if exists talk_tags_owner_manage on public.talk_tags;
create policy talk_tags_owner_manage
  on public.talk_tags for all
  using (exists (select 1 from public.profiles where profiles.id = talk_tags.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.talks where talks.id = talk_tags.talk_id and talks.profile_id = talk_tags.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = talk_tags.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.talks where talks.id = talk_tags.talk_id and talks.profile_id = talk_tags.profile_id));

drop policy if exists talk_tags_public_select on public.talk_tags;
create policy talk_tags_public_select
  on public.talk_tags for select
  using (exists (select 1 from public.talks where talks.id = talk_tags.talk_id and talks.profile_id = talk_tags.profile_id and talks.is_published = true and talks.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = talk_tags.profile_id and profiles.is_published = true and profiles.deleted_at is null));

drop policy if exists talk_links_owner_manage on public.talk_links;
create policy talk_links_owner_manage
  on public.talk_links for all
  using (exists (select 1 from public.profiles where profiles.id = talk_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.talks where talks.id = talk_links.talk_id and talks.profile_id = talk_links.profile_id)
    and (talk_links.project_id is null or exists (select 1 from public.projects where projects.id = talk_links.project_id and projects.profile_id = talk_links.profile_id))
    and (talk_links.stack_item_id is null or exists (select 1 from public.stack_items where stack_items.id = talk_links.stack_item_id and stack_items.profile_id = talk_links.profile_id))
    and (talk_links.note_id is null or exists (select 1 from public.notes where notes.id = talk_links.note_id and notes.profile_id = talk_links.profile_id)))
  with check (exists (select 1 from public.profiles where profiles.id = talk_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.talks where talks.id = talk_links.talk_id and talks.profile_id = talk_links.profile_id)
    and (talk_links.project_id is null or exists (select 1 from public.projects where projects.id = talk_links.project_id and projects.profile_id = talk_links.profile_id))
    and (talk_links.stack_item_id is null or exists (select 1 from public.stack_items where stack_items.id = talk_links.stack_item_id and stack_items.profile_id = talk_links.profile_id))
    and (talk_links.note_id is null or exists (select 1 from public.notes where notes.id = talk_links.note_id and notes.profile_id = talk_links.profile_id)));

drop policy if exists talk_links_public_select on public.talk_links;
create policy talk_links_public_select
  on public.talk_links for select
  using (is_enabled = true
    and exists (select 1 from public.talks where talks.id = talk_links.talk_id and talks.profile_id = talk_links.profile_id and talks.is_published = true and talks.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = talk_links.profile_id and profiles.is_published = true and profiles.deleted_at is null)
    and (talk_links.project_id is null or exists (select 1 from public.projects where projects.id = talk_links.project_id and projects.profile_id = talk_links.profile_id and projects.is_published = true and projects.deleted_at is null))
    and (talk_links.stack_item_id is null or exists (select 1 from public.stack_items where stack_items.id = talk_links.stack_item_id and stack_items.profile_id = talk_links.profile_id and stack_items.is_published = true and stack_items.deleted_at is null))
    and (talk_links.note_id is null or exists (select 1 from public.notes where notes.id = talk_links.note_id and notes.profile_id = talk_links.profile_id and notes.is_published = true and notes.deleted_at is null)));

commit;
