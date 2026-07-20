begin;

-- Nodivra Snips stores manually authored code references as inert text.

alter table if exists public.public_profile_settings
  add column if not exists published_snippets jsonb not null default '[]'::jsonb;

create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null,
  code text not null,
  language text not null check (language in ('typescript', 'javascript', 'tsx', 'jsx', 'python', 'sql', 'bash', 'json', 'css', 'html', 'markdown', 'yaml', 'go', 'rust', 'java', 'php', 'plaintext')),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  source_url text not null default '',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (profile_id, slug),
  check (char_length(title) between 1 and 96),
  check (char_length(slug) between 1 and 96),
  check (char_length(description) between 1 and 280),
  check (char_length(code) between 1 and 24000),
  check (source_url = '' or source_url ~* '^https?://'),
  check (not is_featured or (is_published and visibility = 'public'))
);

create table if not exists public.snippet_tags (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  snip_id uuid not null references public.snippets(id) on delete cascade,
  tag text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(tag) between 1 and 32)
);

create table if not exists public.snippet_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  snip_id uuid not null references public.snippets(id) on delete cascade,
  kind text not null check (kind in ('project', 'resource')),
  project_id uuid references public.projects(id) on delete cascade,
  label text not null,
  url text not null default '',
  position integer not null default 0 check (position >= 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(label) between 1 and 72),
  check (
    (kind = 'project' and project_id is not null and url = '')
    or (kind = 'resource' and project_id is null and url ~* '^https?://')
  )
);

create unique index if not exists snippets_profile_slug_idx on public.snippets(profile_id, lower(slug));
create index if not exists snippets_profile_position_idx on public.snippets(profile_id, position);
create index if not exists snippets_profile_published_idx on public.snippets(profile_id, is_published, visibility, position);
create index if not exists snippets_featured_idx on public.snippets(profile_id, is_featured, position);
create index if not exists snippets_created_at_idx on public.snippets(created_at desc);
create index if not exists snippet_tags_snip_position_idx on public.snippet_tags(snip_id, position);
create unique index if not exists snippet_tags_unique_idx on public.snippet_tags(snip_id, lower(tag));
create index if not exists snippet_links_snip_position_idx on public.snippet_links(snip_id, position);
create index if not exists snippet_links_project_idx on public.snippet_links(project_id);

drop trigger if exists snippets_touch_updated_at on public.snippets;
create trigger snippets_touch_updated_at
before update on public.snippets
for each row execute function public.touch_updated_at();

drop trigger if exists snippet_tags_touch_updated_at on public.snippet_tags;
create trigger snippet_tags_touch_updated_at
before update on public.snippet_tags
for each row execute function public.touch_updated_at();

drop trigger if exists snippet_links_touch_updated_at on public.snippet_links;
create trigger snippet_links_touch_updated_at
before update on public.snippet_links
for each row execute function public.touch_updated_at();

alter table public.snippets enable row level security;
alter table public.snippet_tags enable row level security;
alter table public.snippet_links enable row level security;

drop policy if exists snippets_owner_manage on public.snippets;
create policy snippets_owner_manage
  on public.snippets for all
  using (exists (select 1 from public.profiles where profiles.id = snippets.profile_id and profiles.owner_id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = snippets.profile_id and profiles.owner_id = auth.uid()));

drop policy if exists snippets_public_select on public.snippets;
create policy snippets_public_select
  on public.snippets for select
  using (is_published = true and visibility = 'public' and deleted_at is null and exists (
    select 1 from public.profiles
    where profiles.id = snippets.profile_id and profiles.is_published = true and profiles.deleted_at is null
  ));

drop policy if exists snippet_tags_owner_manage on public.snippet_tags;
create policy snippet_tags_owner_manage
  on public.snippet_tags for all
  using (exists (select 1 from public.profiles where profiles.id = snippet_tags.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.snippets where snippets.id = snippet_tags.snip_id and snippets.profile_id = snippet_tags.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = snippet_tags.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.snippets where snippets.id = snippet_tags.snip_id and snippets.profile_id = snippet_tags.profile_id));

drop policy if exists snippet_tags_public_select on public.snippet_tags;
create policy snippet_tags_public_select
  on public.snippet_tags for select
  using (exists (select 1 from public.snippets where snippets.id = snippet_tags.snip_id and snippets.profile_id = snippet_tags.profile_id and snippets.is_published = true and snippets.visibility = 'public' and snippets.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = snippet_tags.profile_id and profiles.is_published = true and profiles.deleted_at is null));

drop policy if exists snippet_links_owner_manage on public.snippet_links;
create policy snippet_links_owner_manage
  on public.snippet_links for all
  using (exists (select 1 from public.profiles where profiles.id = snippet_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.snippets where snippets.id = snippet_links.snip_id and snippets.profile_id = snippet_links.profile_id)
    and (snippet_links.project_id is null or exists (select 1 from public.projects where projects.id = snippet_links.project_id and projects.profile_id = snippet_links.profile_id)))
  with check (exists (select 1 from public.profiles where profiles.id = snippet_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.snippets where snippets.id = snippet_links.snip_id and snippets.profile_id = snippet_links.profile_id)
    and (snippet_links.project_id is null or exists (select 1 from public.projects where projects.id = snippet_links.project_id and projects.profile_id = snippet_links.profile_id)));

drop policy if exists snippet_links_public_select on public.snippet_links;
create policy snippet_links_public_select
  on public.snippet_links for select
  using (is_enabled = true
    and exists (select 1 from public.snippets where snippets.id = snippet_links.snip_id and snippets.profile_id = snippet_links.profile_id and snippets.is_published = true and snippets.visibility = 'public' and snippets.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = snippet_links.profile_id and profiles.is_published = true and profiles.deleted_at is null)
    and (snippet_links.project_id is null or exists (select 1 from public.projects where projects.id = snippet_links.project_id and projects.profile_id = snippet_links.profile_id and projects.is_published = true and projects.deleted_at is null)));

commit;
