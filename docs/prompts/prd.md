You are the lead full-stack engineer building Nodivra, a developer-first identity, portfolio, link-in-bio, and discovery platform.

Nodivra helps developers turn their online presence into a living proof-of-work profile. Users should be able to create one public developer page containing links, projects, repositories, technology stacks, experience, writing, talks, code snippets, services, testimonials, and contact options.

The platform must be production-feasible for approximately 1,500 registered or lightly active users on a completely free deployment stack. Do not claim support for 1,500 simultaneous users, enterprise traffic, or guaranteed uptime.

Use this stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui or an equivalent accessible component system
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Supabase Storage only for small optimized avatars or images
- Vercel for the single web application
- One Supabase project
- No required Render service
- No paid APIs

Do not depend on GitHub, GitLab, LinkedIn, Google, Stripe, PayPal, Gmail, Google Calendar, SendGrid, Twilio, OpenAI, Claude, Maps, OCR, video hosting, external analytics, Algolia, Elasticsearch, or any other paid or required third-party runtime integration.

Repository links, repository metadata, technology names, certifications, testimonials, talks, and experience records must be manually entered by the developer. You may create optional future integration adapters, but the core product must work without API keys.

Use path-based public profile URLs:

/u/[handle]

Do not require a custom domain. A future custom-domain feature must be optional and must not affect the free deployment.

Create one Vercel project containing the complete Nodivra product. Do not create 15 separate applications or databases.

The database must be designed for Supabase Free constraints:

- Use compact relational tables.
- Add indexes for handle, slug, owner_id, visibility, published status, and created_at.
- Use pagination everywhere.
- Never load unbounded collections.
- Keep analytics aggregated and retention-controlled.
- Keep uploaded files small.
- Do not store video or large media.
- Avoid realtime features.
- Do not rely on background workers.
- Do not require outbound email.

Core security requirements:

- Use Supabase SSR authentication correctly.
- Never expose service-role credentials to the browser.
- Public profile content must be explicitly published.
- Private dashboard records must remain private.
- Every mutation must validate authentication, ownership, input, and authorization.
- Use RLS policies for every user-owned table.
- Use UUID identifiers.
- Use timestamps with time zones.
- Use soft deletion where appropriate.
- Add audit records for important changes.
- Reserve handles such as admin, api, login, signup, settings, support, assets, and u.
- Validate handles with a safe lowercase format.
- Validate links as http or https only.
- Sanitize Markdown and user-generated HTML.
- Do not permit arbitrary CSS, JavaScript, HTML, or iframe injection.

Create a shared application shell containing:

- Public landing page
- Authenticated dashboard
- Profile editor
- Preview mode
- Responsive navigation
- Mobile navigation
- Profile handle display
- Module registry
- Settings
- Command palette placeholder
- Toasts
- Loading states
- Empty states
- Error states
- Confirmation dialogs
- Accessible form components

Create shared database conventions:

- profiles
- public_profile_settings
- profile_modules
- audit_logs
- public_events
- moderation_flags
- notification_records
- feature_flags

All future modules must integrate with the shared profile, public page, preview, search, analytics, and audit patterns.

The public profile should be fast and cache-friendly. Use server-rendered pages where appropriate, bounded queries, optimized images, small payloads, and cache-friendly response behavior. Never expose private dashboard data through the public profile.

Implement the initial foundation only. Do not build all 15 modules in this prompt.

The foundation must include:

1. Next.js project structure.
2. Supabase client setup.
3. Authentication scaffolding.
4. Public and authenticated route groups.
5. Shared layout and design system.
6. Module registry.
7. Migration folder.
8. Seed-data strategy.
9. Environment-variable example file.
10. RLS policy conventions.
11. Shared validation helpers.
12. Shared error handling.
13. Test setup.
14. Production build setup.
15. README with local development, Supabase setup, migrations, seeding, testing, and Vercel deployment.

Do not merely explain the architecture. Inspect the repository, implement the foundation, run linting, type checking, tests, and production build, and report the results.