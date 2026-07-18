Implement Nodivra Page as the first complete product module: a working developer link-in-bio page.

Extend the existing Nodivra foundation without breaking it. Build authentication-aware profile onboarding where a developer chooses a unique handle, display name, headline, short bio, location text, timezone, avatar initials or a small avatar image, and primary call-to-action.

Create the public route:

/u/[handle]

The public page must show the developer’s identity, bio, primary links, social links, availability indicator, and a clean mobile-first layout. The first version should support a basic ordered list of links with title, URL, icon label, visibility, and enabled status.

Build the private dashboard page editor with live preview mode. Developers must be able to create, edit, reorder, enable, disable, and delete links. Add draft and published states so unpublished changes never appear publicly.

Create database migrations and RLS for profiles, profile_links, and public_profile_settings. Enforce unique handles, reserved handles, safe URL validation, ownership checks, and published-only public access.

Add share/copy-profile-link actions, SEO metadata, Open Graph metadata, loading states, empty states, mobile responsiveness, seed data, tests, audit logs, and README updates.

Do not use external APIs, email, realtime, payments, or custom domains.