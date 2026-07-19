# Nodivra

Fresh build of Nodivra Pages, Blocks, and Projects, a polished public profile and safe, flexible page builder for developers.

## Stack

- Next.js App Router
- Supabase for auth and storage
- Tailwind CSS for styling
- Vitest for tests

## Setup

1. Copy `.env.example` to `.env.local`.
1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
1. Set `NEXT_PUBLIC_SITE_URL` to your local or deployed URL.
1. Run `database/migrations/001_nodivra_pages.sql` and `database/migrations/002_nodivra_blocks.sql`, then apply `supabase/migrations/20260719000000_nodivra_projects.sql`, `supabase/migrations/20260719010000_nodivra_repos.sql`, and `supabase/migrations/20260719020000_nodivra_stack.sql`.
1. Optionally seed the demo workspace through the app's demo mode.

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Notes

- The app can run in demo mode when Supabase env vars are missing.
- Blocks use strict typed configurations for link buttons, social links, project highlights, text, images, dividers, CTAs, availability, and external resources.
- Projects are manually curated case studies with summaries, Markdown narratives, roles, technologies, dates, status, tags, lessons learned, cover images, and up to three links.
- Project slugs publish at `/u/[handle]/projects/[slug]`; published Projects can also be connected to Project Highlight blocks.
- The project archive at `/u/[handle]/projects` supports bounded text search and six-item pagination without requiring repository or deployment integrations.
- Projects are bounded to 30 per profile, with no more than three featured projects. Markdown is rendered through a safe limited renderer with no arbitrary HTML or embeds.
- Repositories are manual records with provider labels, safe repository URLs, optional language/framework/topics, explicit status, and optional manual stats. Stats are labeled as manual and never fetched live.
- The repository archive at `/u/[handle]/repos` supports bounded text search, language/topic filters, and six-item pagination. Repository links can point to published Projects or manual Stack items.
- Repositories are bounded to 30 per profile, with no more than three featured repositories. Nodivra does not scrape providers, proxy repository pages, sync background jobs, or require external API keys.
- Stack is a manually curated list of technologies, tools, platforms, and working preferences with built-in or custom text categories, controlled local icon identifiers, and label-based learning states: Used Daily, Comfortable, Learning, and Exploring.
- The Stack archive at `/u/[handle]/stack` supports bounded text search, category/status filters, and twelve-item pagination. Stack items can link to published Projects and safe manual documentation, resource, or tool URLs.
- Stack is bounded to 20 categories and 60 items per profile, with no more than six featured items. Nodivra does not use objective proficiency scores, runtime icon services, external technology APIs, scraping, or background sync jobs.
- Public blocks are rendered from bounded published snapshots. Unsafe URLs, arbitrary HTML, JavaScript, and iframe embeds are rejected.
- `docs/` and `.agents/` are kept in the repo as project references.
- Generated artifacts like `node_modules/` and `.next/` are ignored.
