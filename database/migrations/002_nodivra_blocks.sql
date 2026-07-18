begin;

alter table public.public_profile_settings
  add column if not exists published_sections jsonb not null default '[]'::jsonb,
  add column if not exists published_blocks jsonb not null default '[]'::jsonb;

create table if not exists public.profile_sections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  position integer not null default 0 check (position >= 0),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profile_sections_title_length check (char_length(title) between 1 and 48),
  constraint profile_sections_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug) between 1 and 48
  ),
  constraint profile_sections_profile_slug_unique unique (profile_id, slug)
);

create table if not exists public.profile_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  section_id uuid not null references public.profile_sections(id) on delete cascade,
  type text not null check (type in (
    'link_button',
    'social_link',
    'project_highlight',
    'text_section',
    'image_card',
    'divider',
    'cta_card',
    'availability_card',
    'external_resource'
  )),
  title text not null,
  visibility text not null default 'public' check (visibility in ('public', 'hidden')),
  position integer not null default 0 check (position >= 0),
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profile_blocks_title_length check (char_length(title) between 1 and 80),
  constraint profile_blocks_configuration_object check (jsonb_typeof(configuration) = 'object')
);

create index if not exists profile_sections_profile_id_idx on public.profile_sections (profile_id);
create index if not exists profile_sections_position_idx on public.profile_sections (profile_id, position);
create index if not exists profile_sections_visibility_idx on public.profile_sections (is_visible);
create index if not exists profile_sections_created_at_idx on public.profile_sections (created_at desc);

create index if not exists profile_blocks_profile_id_idx on public.profile_blocks (profile_id);
create index if not exists profile_blocks_section_position_idx on public.profile_blocks (section_id, position);
create index if not exists profile_blocks_visibility_idx on public.profile_blocks (visibility);
create index if not exists profile_blocks_created_at_idx on public.profile_blocks (created_at desc);

drop trigger if exists profile_sections_touch_updated_at on public.profile_sections;
create trigger profile_sections_touch_updated_at
before update on public.profile_sections
for each row execute function public.touch_updated_at();

drop trigger if exists profile_blocks_touch_updated_at on public.profile_blocks;
create trigger profile_blocks_touch_updated_at
before update on public.profile_blocks
for each row execute function public.touch_updated_at();

alter table public.profile_sections enable row level security;
alter table public.profile_blocks enable row level security;

drop policy if exists profile_sections_owner_select on public.profile_sections;
create policy profile_sections_owner_select
  on public.profile_sections
  for select
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_sections.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists profile_sections_owner_insert on public.profile_sections;
create policy profile_sections_owner_insert
  on public.profile_sections
  for insert
  with check (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_sections.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists profile_sections_owner_update on public.profile_sections;
create policy profile_sections_owner_update
  on public.profile_sections
  for update
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_sections.profile_id
        and profiles.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_sections.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists profile_sections_owner_delete on public.profile_sections;
create policy profile_sections_owner_delete
  on public.profile_sections
  for delete
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_sections.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists profile_sections_public_select on public.profile_sections;
create policy profile_sections_public_select
  on public.profile_sections
  for select
  using (
    profile_sections.is_visible = true
    and exists (
      select 1
      from public.public_profile_settings settings
      where settings.profile_id = profile_sections.profile_id
        and settings.is_published = true
    )
  );

drop policy if exists profile_blocks_owner_select on public.profile_blocks;
create policy profile_blocks_owner_select
  on public.profile_blocks
  for select
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_blocks.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists profile_blocks_owner_insert on public.profile_blocks;
create policy profile_blocks_owner_insert
  on public.profile_blocks
  for insert
  with check (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_blocks.profile_id
        and profiles.owner_id = auth.uid()
    )
    and exists (
      select 1
      from public.profile_sections sections
      where sections.id = profile_blocks.section_id
        and sections.profile_id = profile_blocks.profile_id
    )
  );

drop policy if exists profile_blocks_owner_update on public.profile_blocks;
create policy profile_blocks_owner_update
  on public.profile_blocks
  for update
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_blocks.profile_id
        and profiles.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_blocks.profile_id
        and profiles.owner_id = auth.uid()
    )
    and exists (
      select 1
      from public.profile_sections sections
      where sections.id = profile_blocks.section_id
        and sections.profile_id = profile_blocks.profile_id
    )
  );

drop policy if exists profile_blocks_owner_delete on public.profile_blocks;
create policy profile_blocks_owner_delete
  on public.profile_blocks
  for delete
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_blocks.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists profile_blocks_public_select on public.profile_blocks;
create policy profile_blocks_public_select
  on public.profile_blocks
  for select
  using (
    profile_blocks.visibility = 'public'
    and exists (
      select 1
      from public.profile_sections sections
      join public.public_profile_settings settings
        on settings.profile_id = sections.profile_id
      where sections.id = profile_blocks.section_id
        and sections.is_visible = true
        and settings.is_published = true
    )
  );

commit;
