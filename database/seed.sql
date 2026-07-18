begin;

insert into public.profiles (
  id,
  owner_id,
  handle,
  display_name,
  headline,
  bio,
  location_text,
  timezone,
  avatar_initials,
  avatar_url,
  primary_cta_label,
  primary_cta_url,
  availability_status,
  is_published,
  created_at,
  updated_at
)
values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'nodivra',
  'Nodivra Studio',
  'Developer pages that feel calm, sharp, and earned.',
  'A fresh Nodivra workspace for developers who want a public page that reads like proof of work instead of a generic profile card.',
  'Austin, TX',
  'America/Chicago',
  'ND',
  null,
  'Open the workbench',
  'https://example.com/workbench',
  'available',
  true,
  now(),
  now()
)
on conflict (id) do update set
  handle = excluded.handle,
  display_name = excluded.display_name,
  headline = excluded.headline,
  bio = excluded.bio,
  location_text = excluded.location_text,
  timezone = excluded.timezone,
  avatar_initials = excluded.avatar_initials,
  avatar_url = excluded.avatar_url,
  primary_cta_label = excluded.primary_cta_label,
  primary_cta_url = excluded.primary_cta_url,
  availability_status = excluded.availability_status,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.profile_links (
  id,
  profile_id,
  title,
  url,
  icon_label,
  visibility,
  is_enabled,
  position,
  created_at,
  updated_at
)
values
  (
    '2b1a05d7-2b8d-4a18-a1fd-4a00d3e1cb10',
    '11111111-1111-1111-1111-111111111111',
    'Selected work',
    'https://example.com/work',
    '01',
    'public',
    true,
    0,
    now(),
    now()
  ),
  (
    '7a2a7f69-1a90-4a07-8fd1-2f14a2f8e2f1',
    '11111111-1111-1111-1111-111111111111',
    'Short bio',
    'https://example.com/bio',
    '02',
    'social',
    true,
    1,
    now(),
    now()
  ),
  (
    'fd5d77bf-c7ae-437c-bcea-91770a727bb9',
    '11111111-1111-1111-1111-111111111111',
    'Contact',
    'https://example.com/contact',
    '03',
    'social',
    true,
    2,
    now(),
    now()
  )
on conflict (id) do update set
  title = excluded.title,
  url = excluded.url,
  icon_label = excluded.icon_label,
  visibility = excluded.visibility,
  is_enabled = excluded.is_enabled,
  position = excluded.position,
  updated_at = now();

insert into public.public_profile_settings (
  id,
  profile_id,
  handle,
  display_name,
  headline,
  bio,
  location_text,
  timezone,
  avatar_initials,
  avatar_url,
  primary_cta_label,
  primary_cta_url,
  availability_status,
  published_links,
  is_published,
  published_at,
  created_at,
  updated_at
)
values (
  '4f9239dd-6a6d-45fa-a1b8-fb8c0f1f1a11',
  '11111111-1111-1111-1111-111111111111',
  'nodivra',
  'Nodivra Studio',
  'Developer pages that feel calm, sharp, and earned.',
  'A fresh Nodivra workspace for developers who want a public page that reads like proof of work instead of a generic profile card.',
  'Austin, TX',
  'America/Chicago',
  'ND',
  null,
  'Open the workbench',
  'https://example.com/workbench',
  'available',
  jsonb_build_array(
    jsonb_build_object(
      'id', '2b1a05d7-2b8d-4a18-a1fd-4a00d3e1cb10',
      'title', 'Selected work',
      'url', 'https://example.com/work',
      'iconLabel', '01',
      'visibility', 'public',
      'isEnabled', true,
      'position', 0
    ),
    jsonb_build_object(
      'id', '7a2a7f69-1a90-4a07-8fd1-2f14a2f8e2f1',
      'title', 'Short bio',
      'url', 'https://example.com/bio',
      'iconLabel', '02',
      'visibility', 'social',
      'isEnabled', true,
      'position', 1
    ),
    jsonb_build_object(
      'id', 'fd5d77bf-c7ae-437c-bcea-91770a727bb9',
      'title', 'Contact',
      'url', 'https://example.com/contact',
      'iconLabel', '03',
      'visibility', 'social',
      'isEnabled', true,
      'position', 2
    )
  ),
  true,
  now(),
  now(),
  now()
)
on conflict (profile_id) do update set
  handle = excluded.handle,
  display_name = excluded.display_name,
  headline = excluded.headline,
  bio = excluded.bio,
  location_text = excluded.location_text,
  timezone = excluded.timezone,
  avatar_initials = excluded.avatar_initials,
  avatar_url = excluded.avatar_url,
  primary_cta_label = excluded.primary_cta_label,
  primary_cta_url = excluded.primary_cta_url,
  availability_status = excluded.availability_status,
  published_links = excluded.published_links,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  updated_at = now();

insert into public.audit_logs (
  id,
  profile_id,
  actor_id,
  action,
  entity_type,
  entity_id,
  summary,
  metadata,
  created_at
)
values (
  '3a2a6f3d-10a6-44f2-b3f0-5f0edee24c5d',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'profile_published',
  'profile',
  '11111111-1111-1111-1111-111111111111',
  'Demo workspace published',
  '{"source":"seed"}'::jsonb,
  now()
)
on conflict (id) do update set
  summary = excluded.summary,
  metadata = excluded.metadata,
  created_at = now();

commit;
