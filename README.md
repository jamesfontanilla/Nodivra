# Nodivra

A developer-first identity, portfolio, and link-in-bio platform. Build your proof-of-work profile in one fast, clean page.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Auth & Database:** Supabase (Auth, PostgreSQL, RLS)
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase project (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/your-username/nodivra.git
cd nodivra
npm install
```

### 2. Environment setup

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-side only, for seeding)
- `NEXT_PUBLIC_APP_URL` — your app URL (http://localhost:3000 for dev)

### 3. Database migrations

Run the SQL files in `supabase/migrations/` in order against your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually run each migration in the Supabase SQL editor:
# 00001_create_profiles.sql
# 00002_create_profile_links.sql
# 00003_create_public_profile_settings.sql
# 00004_create_audit_logs.sql
# 00005_reserved_handles_and_triggers.sql
# 00006_create_page_sections.sql
# 00007_create_page_blocks.sql
# 00008_fix_audit_log_function.sql
```

### 4. Seed data (optional)

```bash
npm run db:seed
```

This creates a test user (`dev@nodivra.test` / `password123`) with a sample profile at `/u/jane-dev`, plus sectioned page content for the Blocks editor and public profile preview.

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login/signup pages
│   ├── auth/             # Auth callback route
│   ├── dashboard/        # Authenticated dashboard
│   │   ├── links/        # Link management
│   │   ├── onboarding/   # First-time profile setup
│   │   └── settings/     # Account settings
│   └── u/[handle]/       # Public profile page
├── components/
│   ├── dashboard/        # Dashboard-specific components
│   ├── public/           # Public page components
│   └── ui/               # Base UI components (shadcn/ui)
├── hooks/                # React hooks
├── lib/
│   ├── supabase/         # Supabase client setup
│   └── validations/      # Zod schemas & validation
└── middleware.ts         # Auth session middleware

supabase/
└── migrations/           # SQL migration files

scripts/
└── seed.ts              # Database seeding script
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm run test` | Run tests (Vitest) |
| `npm run db:seed` | Seed database with test data |

## Features (Nodivra Page Module)

- **Profile onboarding** — Choose a unique handle, display name, headline, bio, location, timezone, avatar initials, and primary CTA
- **Public page** (`/u/[handle]`) — Clean mobile-first developer page with identity, bio, links, availability indicator
- **Link management** — Create, edit, reorder, enable/disable, and delete links with title, URL, icon label, visibility
- **Draft/Published states** — Unpublished changes never appear publicly
- **Live preview** — See changes in real-time while editing
- **Share/Copy link** — One-click copy of public profile URL
- **SEO & Open Graph** — Full metadata for social sharing
- **RLS enforcement** — Row-level security on all tables
- **Audit logging** — Automatic audit trail for profile and link changes
- **Reserved handles** — System paths blocked from registration
- **URL validation** — Only http/https URLs allowed

## Blocks

- Group content into ordered sections like About, Work, Writing, Contact, and Elsewhere
- Add typed blocks for links, social links, project highlights, text, images, dividers, CTA cards, availability, and safe external resources
- Collapse sections in the editor while keeping the public profile responsive and section-aware

## Deployment (Vercel)

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

## Security

- All mutations validate authentication, ownership, and input
- RLS policies enforce data isolation at the database level
- Handles are validated with format checks and reserved-word blocking
- URLs must be http/https only
- Service role key never exposed to the browser
- Soft deletion preserves data integrity
- Audit logs track all profile/link changes

## License

MIT
