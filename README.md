# Nodivra

Fresh build of Nodivra Pages and Blocks, a polished public profile and safe, flexible page builder for developers.

## Stack

- Next.js App Router
- Supabase for auth and storage
- Tailwind CSS for styling
- Vitest for tests

## Setup

1. Copy `.env.example` to `.env.local`.
1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
1. Set `NEXT_PUBLIC_SITE_URL` to your local or deployed URL.
1. Run the database migrations in order: `database/migrations/001_nodivra_pages.sql`, then `database/migrations/002_nodivra_blocks.sql`.
1. Optionally seed demo data with `database/seed.sql`.

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Notes

- The app can run in demo mode when Supabase env vars are missing.
- Blocks use strict typed configurations for link buttons, social links, project highlights, text, images, dividers, CTAs, availability, and external resources.
- Public blocks are rendered from bounded published snapshots. Unsafe URLs, arbitrary HTML, JavaScript, and iframe embeds are rejected.
- `docs/` and `.agents/` are kept in the repo as project references.
- Generated artifacts like `node_modules/` and `.next/` are ignored.
