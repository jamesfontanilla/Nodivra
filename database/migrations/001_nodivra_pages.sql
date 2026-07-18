begin;

create extension if not exists pgcrypto;

create or replace function public.is_reserved_handle(candidate text)
returns boolean
language sql
immutable
as $$
  select lower(candidate) = any (
    array['admin', 'api', 'assets', 'login', 'settings', 'signup', 'support', 'u']
  );
$$;

create or replace function public.is_safe_http_url(candidate text)
returns boolean
language sql
immutable
as $$
  select candidate ~* '^https?://';
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique,
  handle text not null unique,
  display_name text not null default '',
  headline text not null default '',
  bio text not null default '',
  location_text text not null default '',
  timezone text not null default 'UTC',
  avatar_initials text not null default '',
  avatar_url text,
  primary_cta_label text not null default '',
  primary_cta_url text,
  availability_status text not null default 'available'
    check (availability_status in ('available', 'busy', 'away', 'offline')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profiles_handle_format check (
    handle = lower(handle)
    and handle ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(handle) between 3 and 32
    and not public.is_reserved_handle(handle)
  ),
  constraint profiles_avatar_url_safe check (
    avatar_url is null or public.is_safe_http_url(avatar_url)
  ),
  constraint profiles_primary_cta_url_safe check (
    primary_cta_url is null or public.is_safe_http_url(primary_cta_url)
  ),
  constraint profiles_avatar_initials_length check (char_length(avatar_initials) <= 4)
);

create table if not exists public.profile_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text not null,
  icon_label text not null default '',
  visibility text not null default 'public'
    check (visibility in ('public', 'social', 'hidden')),
  is_enabled boolean not null default true,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint profile_links_url_safe check (public.is_safe_http_url(url))
);

create table if not exists public.public_profile_settings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  handle text not null unique,
  display_name text not null,
  headline text not null default '',
  bio text not null default '',
  location_text text not null default '',
  timezone text not null default 'UTC',
  avatar_initials text not null default '',
  avatar_url text,
  primary_cta_label text not null default '',
  primary_cta_url text,
  availability_status text not null default 'available'
    check (availability_status in ('available', 'busy', 'away', 'offline')),
  published_links jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint public_profile_settings_handle_format check (
    handle = lower(handle)
    and handle ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(handle) between 3 and 32
    and not public.is_reserved_handle(handle)
  ),
  constraint public_profile_settings_avatar_url_safe check (
    avatar_url is null or public.is_safe_http_url(avatar_url)
  ),
  constraint public_profile_settings_primary_cta_url_safe check (
    primary_cta_url is null or public.is_safe_http_url(primary_cta_url)
  ),
  constraint public_profile_settings_avatar_initials_length check (char_length(avatar_initials) <= 4)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists profiles_owner_id_idx on public.profiles (owner_id);
create index if not exists profiles_handle_idx on public.profiles (handle);
create index if not exists profiles_is_published_idx on public.profiles (is_published);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

create index if not exists profile_links_profile_id_idx on public.profile_links (profile_id);
create index if not exists profile_links_position_idx on public.profile_links (profile_id, position);
create index if not exists profile_links_visibility_idx on public.profile_links (visibility);
create index if not exists profile_links_is_enabled_idx on public.profile_links (is_enabled);
create index if not exists profile_links_created_at_idx on public.profile_links (created_at desc);

create index if not exists public_profile_settings_handle_idx on public.public_profile_settings (handle);
create index if not exists public_profile_settings_is_published_idx on public.public_profile_settings (is_published);
create index if not exists public_profile_settings_created_at_idx on public.public_profile_settings (created_at desc);

create index if not exists audit_logs_profile_id_idx on public.audit_logs (profile_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists profile_links_touch_updated_at on public.profile_links;
create trigger profile_links_touch_updated_at
before update on public.profile_links
for each row execute function public.touch_updated_at();

drop trigger if exists public_profile_settings_touch_updated_at on public.public_profile_settings;
create trigger public_profile_settings_touch_updated_at
before update on public.public_profile_settings
for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.profile_links enable row level security;
alter table public.public_profile_settings enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_owner_select on public.profiles;
create policy profiles_owner_select
  on public.profiles
  for select
  using (auth.uid() = owner_id);

drop policy if exists profiles_owner_insert on public.profiles;
create policy profiles_owner_insert
  on public.profiles
  for insert
  with check (auth.uid() = owner_id);

drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update
  on public.profiles
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists profiles_owner_delete on public.profiles;
create policy profiles_owner_delete
  on public.profiles
  for delete
  using (auth.uid() = owner_id);

drop policy if exists profiles_public_select on public.profiles;
create policy profiles_public_select
  on public.profiles
  for select
  using (is_published = true);

drop policy if exists profile_links_owner_select on public.profile_links;
create policy profile_links_owner_select
  on public.profile_links
  for select
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_links.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists profile_links_owner_insert on public.profile_links;
create policy profile_links_owner_insert
  on public.profile_links
  for insert
  with check (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_links.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists profile_links_owner_update on public.profile_links;
create policy profile_links_owner_update
  on public.profile_links
  for update
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_links.profile_id
        and profiles.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_links.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists profile_links_owner_delete on public.profile_links;
create policy profile_links_owner_delete
  on public.profile_links
  for delete
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = profile_links.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists profile_links_public_select on public.profile_links;
create policy profile_links_public_select
  on public.profile_links
  for select
  using (
    exists (
      select 1
      from public.public_profile_settings settings
      where settings.profile_id = profile_links.profile_id
        and settings.is_published = true
    )
  );

drop policy if exists public_profile_settings_owner_select on public.public_profile_settings;
create policy public_profile_settings_owner_select
  on public.public_profile_settings
  for select
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = public_profile_settings.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists public_profile_settings_owner_insert on public.public_profile_settings;
create policy public_profile_settings_owner_insert
  on public.public_profile_settings
  for insert
  with check (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = public_profile_settings.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists public_profile_settings_owner_update on public.public_profile_settings;
create policy public_profile_settings_owner_update
  on public.public_profile_settings
  for update
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = public_profile_settings.profile_id
        and profiles.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = public_profile_settings.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists public_profile_settings_owner_delete on public.public_profile_settings;
create policy public_profile_settings_owner_delete
  on public.public_profile_settings
  for delete
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = public_profile_settings.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists public_profile_settings_public_select on public.public_profile_settings;
create policy public_profile_settings_public_select
  on public.public_profile_settings
  for select
  using (is_published = true);

drop policy if exists audit_logs_owner_select on public.audit_logs;
create policy audit_logs_owner_select
  on public.audit_logs
  for select
  using (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = audit_logs.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

drop policy if exists audit_logs_owner_insert on public.audit_logs;
create policy audit_logs_owner_insert
  on public.audit_logs
  for insert
  with check (
    exists (
      select 1
      from public.profiles profiles
      where profiles.id = audit_logs.profile_id
        and profiles.owner_id = auth.uid()
    )
  );

commit;
