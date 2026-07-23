begin;

-- Nodivra Inbox stores private contact requests without promising delivery.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  contact_text text not null,
  subject text not null,
  message text not null,
  inquiry_type text not null check (inquiry_type in ('project', 'service', 'speaking', 'mentoring', 'other')),
  status text not null default 'unread' check (status in ('unread', 'read', 'archived', 'replied', 'spam')),
  consent_at timestamptz not null,
  source text not null default 'public_profile' check (source = 'public_profile'),
  related_service_id uuid references public.services(id) on delete set null,
  related_project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz,
  check (char_length(name) between 1 and 120),
  check (char_length(contact_text) between 1 and 200),
  check (char_length(subject) between 1 and 160),
  check (char_length(message) between 1 and 4000)
);

create table if not exists public.inquiry_status_history (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  from_status text check (from_status is null or from_status in ('unread', 'read', 'archived', 'replied', 'spam')),
  to_status text not null check (to_status in ('unread', 'read', 'archived', 'replied', 'spam')),
  actor_id uuid,
  note text not null default '',
  created_at timestamptz not null default now(),
  check (char_length(note) <= 240)
);

create table if not exists public.inquiry_links (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('service', 'project')),
  target_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiry_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 0 check (attempt_count between 0 and 5),
  last_seen_at timestamptz not null default now(),
  check (key_hash ~ '^[a-f0-9]{64}$')
);

create index if not exists inquiries_profile_created_idx on public.inquiries(profile_id, created_at desc);
create index if not exists inquiries_profile_status_idx on public.inquiries(profile_id, status, created_at desc);
create index if not exists inquiries_service_idx on public.inquiries(related_service_id);
create index if not exists inquiries_project_idx on public.inquiries(related_project_id);
create index if not exists inquiry_status_history_inquiry_created_idx on public.inquiry_status_history(inquiry_id, created_at desc);
create index if not exists inquiry_status_history_profile_created_idx on public.inquiry_status_history(profile_id, created_at desc);
create index if not exists inquiry_links_inquiry_idx on public.inquiry_links(inquiry_id);
create unique index if not exists inquiry_links_unique_target_idx on public.inquiry_links(inquiry_id, kind, target_id);

drop trigger if exists inquiries_touch_updated_at on public.inquiries;
create trigger inquiries_touch_updated_at before update on public.inquiries for each row execute function public.touch_updated_at();

alter table public.inquiries enable row level security;
alter table public.inquiry_status_history enable row level security;
alter table public.inquiry_links enable row level security;
alter table public.inquiry_rate_limits enable row level security;

drop policy if exists inquiries_owner_select on public.inquiries;
create policy inquiries_owner_select on public.inquiries for select using (
  exists (select 1 from public.profiles where profiles.id = inquiries.profile_id and profiles.owner_id = auth.uid())
);

drop policy if exists inquiries_owner_update on public.inquiries;
create policy inquiries_owner_update on public.inquiries for update using (
  exists (select 1 from public.profiles where profiles.id = inquiries.profile_id and profiles.owner_id = auth.uid())
) with check (
  exists (select 1 from public.profiles where profiles.id = inquiries.profile_id and profiles.owner_id = auth.uid())
);

drop policy if exists inquiries_owner_delete on public.inquiries;
create policy inquiries_owner_delete on public.inquiries for delete using (
  exists (select 1 from public.profiles where profiles.id = inquiries.profile_id and profiles.owner_id = auth.uid())
);

drop policy if exists inquiries_public_insert on public.inquiries;
create policy inquiries_public_insert on public.inquiries for insert to anon, authenticated with check (
  status = 'unread'
  and source = 'public_profile'
  and deleted_at is null
  and exists (
    select 1 from public.public_profile_settings settings
    where settings.profile_id = inquiries.profile_id and settings.is_published = true
  )
  and (related_service_id is null or exists (
    select 1 from public.services services
    where services.id = inquiries.related_service_id
      and services.profile_id = inquiries.profile_id
      and services.is_published = true
      and services.deleted_at is null
  ))
  and (related_project_id is null or exists (
    select 1 from public.projects projects
    where projects.id = inquiries.related_project_id
      and projects.profile_id = inquiries.profile_id
      and projects.is_published = true
      and projects.deleted_at is null
  ))
);

drop policy if exists inquiry_status_history_owner_manage on public.inquiry_status_history;
create policy inquiry_status_history_owner_manage on public.inquiry_status_history for all using (
  exists (select 1 from public.profiles where profiles.id = inquiry_status_history.profile_id and profiles.owner_id = auth.uid())
  and exists (select 1 from public.inquiries where inquiries.id = inquiry_status_history.inquiry_id and inquiries.profile_id = inquiry_status_history.profile_id)
) with check (
  exists (select 1 from public.profiles where profiles.id = inquiry_status_history.profile_id and profiles.owner_id = auth.uid())
  and exists (select 1 from public.inquiries where inquiries.id = inquiry_status_history.inquiry_id and inquiries.profile_id = inquiry_status_history.profile_id)
);

drop policy if exists inquiry_status_history_public_insert on public.inquiry_status_history;
create policy inquiry_status_history_public_insert on public.inquiry_status_history for insert to anon, authenticated with check (
  actor_id is null
  and from_status is null
  and to_status = 'unread'
  and exists (select 1 from public.public_profile_settings settings where settings.profile_id = inquiry_status_history.profile_id and settings.is_published = true)
);

drop policy if exists inquiry_links_owner_manage on public.inquiry_links;
create policy inquiry_links_owner_manage on public.inquiry_links for all using (
  exists (select 1 from public.profiles where profiles.id = inquiry_links.profile_id and profiles.owner_id = auth.uid())
  and exists (select 1 from public.inquiries where inquiries.id = inquiry_links.inquiry_id and inquiries.profile_id = inquiry_links.profile_id)
) with check (
  exists (select 1 from public.profiles where profiles.id = inquiry_links.profile_id and profiles.owner_id = auth.uid())
  and exists (select 1 from public.inquiries where inquiries.id = inquiry_links.inquiry_id and inquiries.profile_id = inquiry_links.profile_id)
);

drop policy if exists inquiry_links_public_insert on public.inquiry_links;
create policy inquiry_links_public_insert on public.inquiry_links for insert to anon, authenticated with check (
  exists (select 1 from public.public_profile_settings settings where settings.profile_id = inquiry_links.profile_id and settings.is_published = true)
  and ((kind = 'service' and exists (select 1 from public.services where services.id = inquiry_links.target_id and services.profile_id = inquiry_links.profile_id and services.is_published = true and services.deleted_at is null))
    or (kind = 'project' and exists (select 1 from public.projects where projects.id = inquiry_links.target_id and projects.profile_id = inquiry_links.profile_id and projects.is_published = true and projects.deleted_at is null)))
);

drop policy if exists inquiry_rate_limits_public_manage on public.inquiry_rate_limits;
create policy inquiry_rate_limits_public_manage on public.inquiry_rate_limits for all to anon, authenticated using (true) with check (
  key_hash ~ '^[a-f0-9]{64}$' and attempt_count between 0 and 5
);

commit;
