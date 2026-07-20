# Nodivra

Fresh build of Nodivra Pages, Blocks, Projects, Path, Notes, and Talks: a polished public profile and safe, flexible page builder for developers.

## Stack

- Next.js App Router
- Supabase for auth and storage
- Tailwind CSS for styling
- Vitest for tests

## Setup

1. Copy `.env.example` to `.env.local`.
1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
1. Set `NEXT_PUBLIC_SITE_URL` to your local or deployed URL.
1. Run `database/migrations/001_nodivra_pages.sql` and `database/migrations/002_nodivra_blocks.sql`, then apply `supabase/migrations/20260719000000_nodivra_projects.sql`, `supabase/migrations/20260719010000_nodivra_repos.sql`, `supabase/migrations/20260719020000_nodivra_stack.sql`, `supabase/migrations/20260719030000_nodivra_path.sql`, `supabase/migrations/20260720000000_nodivra_notes.sql`, and `supabase/migrations/20260720010000_nodivra_talks.sql`.
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
- Path is a manually curated timeline for work, freelance engagements, internships, education, certifications, volunteering, and career milestones. Each entry supports bounded highlights, technologies, safe links, draft/published state, and current-role status.
- The Path archive at `/u/[handle]/path` supports bounded text search, entry-type filters, and eight-item pagination. Public dates can be exact or year-only, and related Project links resolve only to published case studies.
- Path is bounded to 40 entries, eight highlights and technologies per entry, and four links per entry. Path summaries use the existing limited SafeMarkdown renderer; raw HTML, JavaScript, and embeds are not supported.
- Notes are manually authored Markdown articles with private drafts, published dates, reading-time labels, tags, canonical URLs, optional covers, safe links, and lightweight revision snapshots.
- The Notes archive at `/u/[handle]/notes` supports bounded search, tag filters, and eight-item pagination. Published articles use server-rendered detail pages at `/u/[handle]/notes/[slug]` with related-note links and canonical/Open Graph metadata.
- Notes are bounded to 40 per profile, eight tags and four links per note, with no more than three featured notes. Notes reject raw HTML, scripts, iframes, unsafe schemes, email newsletters, AI writing, external publishing integrations, and runtime analytics.
- Note Highlight blocks resolve only to published Notes and can be placed alongside other curated Blocks.
- Talks are manually curated appearances for conferences, workshops, podcasts, panels, meetups, and livestreams. Each entry has a required event date, format, role, summary, tags, optional cover, and safe outbound links for recordings, slides, and event pages.
- The Talks archive at `/u/[handle]/talks` supports bounded text search, format/year filters, timeline grouping, and eight-item pagination. Talk detail pages connect only to published Projects, Stack items, and Notes.
- Talks are bounded to 40 entries, eight tags and eight context links per talk, with no more than three featured talks. Nodivra never hosts or proxies video, audio, slides, or event media and does not use external media APIs.
- Public blocks are rendered from bounded published snapshots. Unsafe URLs, arbitrary HTML, JavaScript, and iframe embeds are rejected.
- `docs/` and `.agents/` are kept in the repo as project references.
- Generated artifacts like `node_modules/` and `.next/` are ignored.
