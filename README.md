# Nodivra

Fresh build of Nodivra Pages, a polished public profile and workspace editor for developers.

## Stack

- Next.js App Router
- Supabase for auth and storage
- Tailwind CSS for styling
- Vitest for tests

## Setup

1. Copy `.env.example` to `.env.local`.
1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
1. Set `NEXT_PUBLIC_SITE_URL` to your local or deployed URL.
1. Run the database migration in `database/migrations/001_nodivra_pages.sql`.
1. Optionally seed demo data with `database/seed.sql`.

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Notes

- The app can run in demo mode when Supabase env vars are missing.
- `docs/` and `.agents/` are kept in the repo as project references.
- Generated artifacts like `node_modules/` and `.next/` are ignored.
