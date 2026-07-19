begin;

-- Nodivra Repos is a manual, provider-neutral repository showcase. It never
-- scrapes providers or stores live provider credentials.

alter table if exists public.public_profile_settings
  add column if not exists published_repositories jsonb not null default '[]'::jsonb;

create table if not exists public.repositories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  repository_name text not null,
  provider_label text not null default '',
  repository_url text not null,
  description text not null,
  language text not null default '',
  framework text not null default '',
  stars_text text not null default '',
  forks_text text not null default '',
  activity_label text not null default '',
  status text not null default 'active' check (status in ('active', 'maintenance', 'paused', 'archived')),
  is_stats_visible boolean not null default false,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (char_length(repository_name) between 1 and 72),
  check (char_length(provider_label) between 1 and 32),
  check (repository_url ~* '^https?://'),
  check (char_length(description) between 1 and 280),
  check (char_length(language) <= 48),
  check (char_length(framework) <= 64),
  check (char_length(stars_text) <= 32),
  check (char_length(forks_text) <= 32),
  check (char_length(activity_label) <= 80)
);

create table if not exists public.repository_topics (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  repository_id uuid not null references public.repositories(id) on delete cascade,
  topic text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(topic) between 1 and 32)
);

create table if not exists public.repository_languages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  repository_id uuid not null references public.repositories(id) on delete cascade,
  language text not null,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(language) between 1 and 48)
);

create table if not exists public.repository_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  repository_id uuid not null references public.repositories(id) on delete cascade,
  kind text not null check (kind in ('project', 'stack')),
  project_id uuid references public.projects(id) on delete cascade,
  label text not null default '',
  url text not null default '',
  position integer not null default 0 check (position >= 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (url = '' or url ~* '^https?://'),
  check ((kind = 'project' and project_id is not null and url = '') or (kind = 'stack' and project_id is null and char_length(label) between 1 and 72 and url ~* '^https?://'))
);

create unique index if not exists repositories_profile_url_unique_idx
  on public.repositories(profile_id, lower(repository_url));
create unique index if not exists repository_topics_unique_idx
  on public.repository_topics(repository_id, lower(topic));
create unique index if not exists repository_languages_unique_idx
  on public.repository_languages(repository_id, lower(language));
create unique index if not exists repository_links_project_unique_idx
  on public.repository_links(repository_id, project_id)
  where kind = 'project';
create unique index if not exists repository_links_stack_url_unique_idx
  on public.repository_links(repository_id, lower(url))
  where kind = 'stack';

create index if not exists repositories_profile_position_idx on public.repositories(profile_id, position);
create index if not exists repositories_profile_published_idx on public.repositories(profile_id, is_published, is_featured);
create index if not exists repositories_status_idx on public.repositories(status);
create index if not exists repositories_created_at_idx on public.repositories(created_at desc);
create index if not exists repository_topics_repository_position_idx on public.repository_topics(repository_id, position);
create index if not exists repository_languages_repository_position_idx on public.repository_languages(repository_id, position);
create index if not exists repository_links_repository_position_idx on public.repository_links(repository_id, position);

drop trigger if exists repositories_touch_updated_at on public.repositories;
create trigger repositories_touch_updated_at
before update on public.repositories
for each row execute function public.touch_updated_at();

drop trigger if exists repository_topics_touch_updated_at on public.repository_topics;
create trigger repository_topics_touch_updated_at
before update on public.repository_topics
for each row execute function public.touch_updated_at();

drop trigger if exists repository_languages_touch_updated_at on public.repository_languages;
create trigger repository_languages_touch_updated_at
before update on public.repository_languages
for each row execute function public.touch_updated_at();

drop trigger if exists repository_links_touch_updated_at on public.repository_links;
create trigger repository_links_touch_updated_at
before update on public.repository_links
for each row execute function public.touch_updated_at();

alter table public.repositories enable row level security;
alter table public.repository_topics enable row level security;
alter table public.repository_languages enable row level security;
alter table public.repository_links enable row level security;

drop policy if exists repositories_owner_manage on public.repositories;
create policy repositories_owner_manage
  on public.repositories for all
  using (exists (select 1 from public.profiles where profiles.id = repositories.profile_id and profiles.owner_id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = repositories.profile_id and profiles.owner_id = auth.uid()));

drop policy if exists repositories_public_select on public.repositories;
create policy repositories_public_select
  on public.repositories for select
  using (is_published = true and deleted_at is null and exists (
    select 1 from public.profiles
    where profiles.id = repositories.profile_id and profiles.is_published = true and profiles.deleted_at is null
  ));

drop policy if exists repository_topics_owner_manage on public.repository_topics;
create policy repository_topics_owner_manage
  on public.repository_topics for all
  using (exists (select 1 from public.profiles where profiles.id = repository_topics.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.repositories where repositories.id = repository_topics.repository_id and repositories.profile_id = repository_topics.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = repository_topics.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.repositories where repositories.id = repository_topics.repository_id and repositories.profile_id = repository_topics.profile_id));

drop policy if exists repository_topics_public_select on public.repository_topics;
create policy repository_topics_public_select
  on public.repository_topics for select
  using (exists (select 1 from public.repositories where repositories.id = repository_topics.repository_id and repositories.profile_id = repository_topics.profile_id and repositories.is_published = true and repositories.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = repository_topics.profile_id and profiles.is_published = true and profiles.deleted_at is null));

drop policy if exists repository_languages_owner_manage on public.repository_languages;
create policy repository_languages_owner_manage
  on public.repository_languages for all
  using (exists (select 1 from public.profiles where profiles.id = repository_languages.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.repositories where repositories.id = repository_languages.repository_id and repositories.profile_id = repository_languages.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = repository_languages.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.repositories where repositories.id = repository_languages.repository_id and repositories.profile_id = repository_languages.profile_id));

drop policy if exists repository_languages_public_select on public.repository_languages;
create policy repository_languages_public_select
  on public.repository_languages for select
  using (exists (select 1 from public.repositories where repositories.id = repository_languages.repository_id and repositories.profile_id = repository_languages.profile_id and repositories.is_published = true and repositories.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = repository_languages.profile_id and profiles.is_published = true and profiles.deleted_at is null));

drop policy if exists repository_links_owner_manage on public.repository_links;
create policy repository_links_owner_manage
  on public.repository_links for all
  using (exists (select 1 from public.profiles where profiles.id = repository_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.repositories where repositories.id = repository_links.repository_id and repositories.profile_id = repository_links.profile_id)
    and (repository_links.project_id is null or exists (select 1 from public.projects where projects.id = repository_links.project_id and projects.profile_id = repository_links.profile_id)))
  with check (exists (select 1 from public.profiles where profiles.id = repository_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.repositories where repositories.id = repository_links.repository_id and repositories.profile_id = repository_links.profile_id)
    and (repository_links.project_id is null or exists (select 1 from public.projects where projects.id = repository_links.project_id and projects.profile_id = repository_links.profile_id)));

drop policy if exists repository_links_public_select on public.repository_links;
create policy repository_links_public_select
  on public.repository_links for select
  using (exists (select 1 from public.repositories where repositories.id = repository_links.repository_id and repositories.profile_id = repository_links.profile_id and repositories.is_published = true and repositories.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = repository_links.profile_id and profiles.is_published = true and profiles.deleted_at is null)
    and (repository_links.project_id is null or exists (select 1 from public.projects where projects.id = repository_links.project_id and projects.profile_id = repository_links.profile_id and projects.is_published = true and projects.deleted_at is null)));

commit;
