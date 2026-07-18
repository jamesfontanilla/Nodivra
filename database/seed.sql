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

insert into public.profile_sections (
  id,
  profile_id,
  title,
  slug,
  position,
  is_visible,
  created_at,
  updated_at
)
values
  (
    '0b8f8ad4-1aa1-4c20-9a01-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'About',
    'about',
    0,
    true,
    now(),
    now()
  ),
  (
    '0b8f8ad4-1aa1-4c20-9a01-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Selected work',
    'selected-work',
    1,
    true,
    now(),
    now()
  ),
  (
    '0b8f8ad4-1aa1-4c20-9a01-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Elsewhere',
    'elsewhere',
    2,
    true,
    now(),
    now()
  )
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  position = excluded.position,
  is_visible = excluded.is_visible,
  updated_at = now();

insert into public.profile_blocks (
  id,
  profile_id,
  section_id,
  type,
  title,
  visibility,
  position,
  configuration,
  created_at,
  updated_at
)
values
  (
    '7e5a1d12-9d10-42d7-a001-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '0b8f8ad4-1aa1-4c20-9a01-000000000001',
    'text_section',
    'A little context',
    'public',
    0,
    jsonb_build_object(
      'body', 'I shape product systems, developer tools, and public surfaces where clarity is part of the craft.',
      'align', 'left'
    ),
    now(),
    now()
  ),
  (
    '7e5a1d12-9d10-42d7-a001-000000000002',
    '11111111-1111-1111-1111-111111111111',
    '0b8f8ad4-1aa1-4c20-9a01-000000000001',
    'availability_card',
    'Availability',
    'public',
    1,
    jsonb_build_object(
      'status', 'available',
      'detail', 'Open to thoughtful product and platform work this quarter.',
      'timezone', 'America/Chicago'
    ),
    now(),
    now()
  ),
  (
    '7e5a1d12-9d10-42d7-a001-000000000003',
    '11111111-1111-1111-1111-111111111111',
    '0b8f8ad4-1aa1-4c20-9a01-000000000002',
    'project_highlight',
    'Signal / proof of work',
    'public',
    0,
    jsonb_build_object(
      'projectName', 'Signal',
      'summary', 'A calm operating surface for teams shipping complex developer products.',
      'role', 'Product design and systems',
      'technologies', jsonb_build_array('Next.js', 'TypeScript', 'Supabase'),
      'url', 'https://example.com/signal'
    ),
    now(),
    now()
  ),
  (
    '7e5a1d12-9d10-42d7-a001-000000000004',
    '11111111-1111-1111-1111-111111111111',
    '0b8f8ad4-1aa1-4c20-9a01-000000000002',
    'image_card',
    'The workbench',
    'public',
    1,
    jsonb_build_object(
      'imageUrl', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
      'altText', 'Laptop showing a dark developer workspace',
      'caption', 'Interfaces should make the next good decision easier.'
    ),
    now(),
    now()
  ),
  (
    '7e5a1d12-9d10-42d7-a001-000000000005',
    '11111111-1111-1111-1111-111111111111',
    '0b8f8ad4-1aa1-4c20-9a01-000000000002',
    'divider',
    'Work divider',
    'public',
    2,
    jsonb_build_object('style', 'line', 'label', 'More soon'),
    now(),
    now()
  ),
  (
    '7e5a1d12-9d10-42d7-a001-000000000009',
    '11111111-1111-1111-1111-111111111111',
    '0b8f8ad4-1aa1-4c20-9a01-000000000002',
    'link_button',
    'Open the workbench',
    'public',
    3,
    jsonb_build_object(
      'label', 'See the full workbench',
      'url', 'https://example.com/workbench',
      'detail', 'example.com',
      'iconLabel', 'GO'
    ),
    now(),
    now()
  ),
  (
    '7e5a1d12-9d10-42d7-a001-000000000006',
    '11111111-1111-1111-1111-111111111111',
    '0b8f8ad4-1aa1-4c20-9a01-000000000003',
    'social_link',
    'Find me elsewhere',
    'public',
    0,
    jsonb_build_object(
      'network', 'Mastodon',
      'label', '@nodivra',
      'url', 'https://example.com/social',
      'iconLabel', 'M'
    ),
    now(),
    now()
  ),
  (
    '7e5a1d12-9d10-42d7-a001-000000000007',
    '11111111-1111-1111-1111-111111111111',
    '0b8f8ad4-1aa1-4c20-9a01-000000000003',
    'external_resource',
    'A useful resource',
    'public',
    1,
    jsonb_build_object(
      'resourceType', 'article',
      'url', 'https://example.com/reading',
      'description', 'A manually curated link with no embedded third-party content.'
    ),
    now(),
    now()
  ),
  (
    '7e5a1d12-9d10-42d7-a001-000000000008',
    '11111111-1111-1111-1111-111111111111',
    '0b8f8ad4-1aa1-4c20-9a01-000000000003',
    'cta_card',
    'Start a conversation',
    'public',
    2,
    jsonb_build_object(
      'body', 'Have a product surface that needs more clarity? Let''s compare notes.',
      'ctaLabel', 'Say hello',
      'ctaUrl', 'https://example.com/contact',
      'accent', 'moss'
    ),
    now(),
    now()
  )
on conflict (id) do update set
  section_id = excluded.section_id,
  type = excluded.type,
  title = excluded.title,
  visibility = excluded.visibility,
  position = excluded.position,
  configuration = excluded.configuration,
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
  published_sections,
  published_blocks,
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
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', title,
          'slug', slug,
          'position', position
        ) order by position
      ),
      '[]'::jsonb
    )
    from public.profile_sections
    where profile_id = '11111111-1111-1111-1111-111111111111'
      and is_visible = true
  ),
  (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'sectionId', section_id,
          'type', type,
          'title', title,
          'visibility', visibility,
          'position', position,
          'configuration', configuration
        ) order by position
      ),
      '[]'::jsonb
    )
    from public.profile_blocks
    where profile_id = '11111111-1111-1111-1111-111111111111'
      and visibility = 'public'
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
  published_sections = excluded.published_sections,
  published_blocks = excluded.published_blocks,
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
