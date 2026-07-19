begin;

-- Nodivra Stack is a manually curated technology and working-preferences layer.
-- Icons are controlled local identifiers; no external icon service is required.

alter table if exists public.public_profile_settings
  add column if not exists published_stack_categories jsonb not null default '[]'::jsonb,
  add column if not exists published_stack_items jsonb not null default '[]'::jsonb;

create table if not exists public.stack_categories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  key text not null check (key in ('languages', 'frontend', 'backend', 'databases', 'cloud', 'testing', 'tooling', 'design', 'mobile', 'other', 'custom')),
  name text not null,
  slug text not null,
  is_built_in boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (profile_id, slug),
  check (char_length(name) between 1 and 48),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 1 and 48),
  check ((is_built_in and key <> 'custom') or (not is_built_in and key = 'custom'))
);

create table if not exists public.stack_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.stack_categories(id) on delete restrict,
  technology_name text not null,
  proficiency_label text not null default '',
  years_text text not null default '',
  confidence_label text not null default '',
  learning_status text not null check (learning_status in ('used_daily', 'comfortable', 'learning', 'exploring')),
  short_description text not null default '',
  icon_identifier text not null default 'code' check (icon_identifier in ('code', 'database', 'cloud', 'terminal', 'palette', 'mobile', 'tool', 'spark', 'book', 'shield')),
  is_featured boolean not null default false,
  is_published boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (char_length(technology_name) between 1 and 72),
  check (char_length(proficiency_label) <= 40),
  check (char_length(years_text) <= 24),
  check (char_length(confidence_label) <= 40),
  check (char_length(short_description) <= 180)
);

create table if not exists public.stack_projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  stack_item_id uuid not null references public.stack_items(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  position integer not null default 0 check (position >= 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stack_item_id, project_id)
);

create table if not exists public.stack_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  stack_item_id uuid not null references public.stack_items(id) on delete cascade,
  kind text not null check (kind in ('documentation', 'resource', 'tool')),
  label text not null,
  url text not null,
  position integer not null default 0 check (position >= 0),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(label) between 1 and 72),
  check (url ~* '^https?://')
);

create unique index if not exists stack_categories_builtin_key_unique_idx
  on public.stack_categories(profile_id, key)
  where is_built_in = true;
create unique index if not exists stack_items_profile_name_unique_idx
  on public.stack_items(profile_id, lower(technology_name));
create unique index if not exists stack_links_item_url_unique_idx
  on public.stack_links(stack_item_id, lower(url));
create index if not exists stack_categories_profile_position_idx on public.stack_categories(profile_id, position);
create index if not exists stack_categories_slug_idx on public.stack_categories(slug);
create index if not exists stack_items_profile_position_idx on public.stack_items(profile_id, position);
create index if not exists stack_items_profile_published_idx on public.stack_items(profile_id, is_published, is_featured);
create index if not exists stack_items_category_position_idx on public.stack_items(category_id, position);
create index if not exists stack_items_learning_status_idx on public.stack_items(learning_status);
create index if not exists stack_items_created_at_idx on public.stack_items(created_at desc);
create index if not exists stack_projects_item_position_idx on public.stack_projects(stack_item_id, position);
create index if not exists stack_projects_project_idx on public.stack_projects(project_id);
create index if not exists stack_links_item_position_idx on public.stack_links(stack_item_id, position);

insert into public.stack_categories (profile_id, key, name, slug, is_built_in, position)
select
  profiles.id,
  categories.key,
  categories.name,
  categories.key,
  true,
  categories.position
from public.profiles
cross join (values
  ('languages', 'Languages', 0),
  ('frontend', 'Frontend', 1),
  ('backend', 'Backend', 2),
  ('databases', 'Databases', 3),
  ('cloud', 'Cloud', 4),
  ('testing', 'Testing', 5),
  ('tooling', 'Tooling', 6),
  ('design', 'Design', 7),
  ('mobile', 'Mobile', 8),
  ('other', 'Other', 9)
) as categories(key, name, position)
where profiles.deleted_at is null
on conflict (profile_id, slug) do nothing;

drop trigger if exists stack_categories_touch_updated_at on public.stack_categories;
create trigger stack_categories_touch_updated_at
before update on public.stack_categories
for each row execute function public.touch_updated_at();

drop trigger if exists stack_items_touch_updated_at on public.stack_items;
create trigger stack_items_touch_updated_at
before update on public.stack_items
for each row execute function public.touch_updated_at();

drop trigger if exists stack_projects_touch_updated_at on public.stack_projects;
create trigger stack_projects_touch_updated_at
before update on public.stack_projects
for each row execute function public.touch_updated_at();

drop trigger if exists stack_links_touch_updated_at on public.stack_links;
create trigger stack_links_touch_updated_at
before update on public.stack_links
for each row execute function public.touch_updated_at();

alter table public.stack_categories enable row level security;
alter table public.stack_items enable row level security;
alter table public.stack_projects enable row level security;
alter table public.stack_links enable row level security;

drop policy if exists stack_categories_owner_manage on public.stack_categories;
create policy stack_categories_owner_manage
  on public.stack_categories for all
  using (exists (select 1 from public.profiles where profiles.id = stack_categories.profile_id and profiles.owner_id = auth.uid()))
  with check (exists (select 1 from public.profiles where profiles.id = stack_categories.profile_id and profiles.owner_id = auth.uid()));

drop policy if exists stack_categories_public_select on public.stack_categories;
create policy stack_categories_public_select
  on public.stack_categories for select
  using (exists (
    select 1 from public.stack_items
    join public.profiles on profiles.id = stack_items.profile_id
    where stack_items.category_id = stack_categories.id
      and stack_items.is_published = true
      and stack_items.deleted_at is null
      and stack_categories.deleted_at is null
      and profiles.is_published = true
      and profiles.deleted_at is null
  ));

drop policy if exists stack_items_owner_manage on public.stack_items;
create policy stack_items_owner_manage
  on public.stack_items for all
  using (exists (select 1 from public.profiles where profiles.id = stack_items.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.stack_categories where stack_categories.id = stack_items.category_id and stack_categories.profile_id = stack_items.profile_id and stack_categories.deleted_at is null))
  with check (exists (select 1 from public.profiles where profiles.id = stack_items.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.stack_categories where stack_categories.id = stack_items.category_id and stack_categories.profile_id = stack_items.profile_id and stack_categories.deleted_at is null));

drop policy if exists stack_items_public_select on public.stack_items;
create policy stack_items_public_select
  on public.stack_items for select
  using (is_published = true and deleted_at is null and exists (
    select 1 from public.profiles
    where profiles.id = stack_items.profile_id and profiles.is_published = true and profiles.deleted_at is null
  ) and exists (
    select 1 from public.stack_categories
    where stack_categories.id = stack_items.category_id and stack_categories.deleted_at is null
  ));

drop policy if exists stack_projects_owner_manage on public.stack_projects;
create policy stack_projects_owner_manage
  on public.stack_projects for all
  using (exists (select 1 from public.profiles where profiles.id = stack_projects.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.stack_items where stack_items.id = stack_projects.stack_item_id and stack_items.profile_id = stack_projects.profile_id)
    and exists (select 1 from public.projects where projects.id = stack_projects.project_id and projects.profile_id = stack_projects.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = stack_projects.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.stack_items where stack_items.id = stack_projects.stack_item_id and stack_items.profile_id = stack_projects.profile_id)
    and exists (select 1 from public.projects where projects.id = stack_projects.project_id and projects.profile_id = stack_projects.profile_id));

drop policy if exists stack_projects_public_select on public.stack_projects;
create policy stack_projects_public_select
  on public.stack_projects for select
  using (exists (select 1 from public.stack_items where stack_items.id = stack_projects.stack_item_id and stack_items.profile_id = stack_projects.profile_id and stack_items.is_published = true and stack_items.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = stack_projects.profile_id and profiles.is_published = true and profiles.deleted_at is null)
    and exists (select 1 from public.projects where projects.id = stack_projects.project_id and projects.profile_id = stack_projects.profile_id and projects.is_published = true and projects.deleted_at is null));

drop policy if exists stack_links_owner_manage on public.stack_links;
create policy stack_links_owner_manage
  on public.stack_links for all
  using (exists (select 1 from public.profiles where profiles.id = stack_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.stack_items where stack_items.id = stack_links.stack_item_id and stack_items.profile_id = stack_links.profile_id))
  with check (exists (select 1 from public.profiles where profiles.id = stack_links.profile_id and profiles.owner_id = auth.uid())
    and exists (select 1 from public.stack_items where stack_items.id = stack_links.stack_item_id and stack_items.profile_id = stack_links.profile_id));

drop policy if exists stack_links_public_select on public.stack_links;
create policy stack_links_public_select
  on public.stack_links for select
  using (exists (select 1 from public.stack_items where stack_items.id = stack_links.stack_item_id and stack_items.profile_id = stack_links.profile_id and stack_items.is_published = true and stack_items.deleted_at is null)
    and exists (select 1 from public.profiles where profiles.id = stack_links.profile_id and profiles.is_published = true and profiles.deleted_at is null));

commit;
