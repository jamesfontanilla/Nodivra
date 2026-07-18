import Link from "next/link";
import type { ReactNode } from "react";
import { PublicProfileCard } from "@/components/public-profile-card";
import { Reveal } from "@/components/reveal";
import { ArrowUpRightIcon, CheckIcon, GlobeIcon, SparkIcon, UserIcon } from "@/components/icons";
import { Badge, Button, Panel, SectionHeading } from "@/components/ui";
import { getDemoWorkspaceSnapshot } from "@/lib/fallback-data";
import { siteName } from "@/lib/site";

const demo = getDemoWorkspaceSnapshot();

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Panel tone="dark">
      <div className="space-y-4">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-sand-100 ring-1 ring-white/10">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-sand-50">{title}</h3>
          <p className="text-sm leading-7 text-sand-200/80">{description}</p>
        </div>
      </div>
    </Panel>
  );
}

export default function HomePage() {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sand-100 text-ink-950 ring-1 ring-sand-200/50">
            <SparkIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sand-300/70">{siteName}</p>
            <p className="text-sm text-sand-100/90">Pages module</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-full px-4 py-2 text-sm text-sand-200/80 transition hover:text-sand-50"
          >
            Sign in
          </Link>
          <Button href="/dashboard" trailingIcon={<ArrowUpRightIcon className="h-3.5 w-3.5" />}>
            Open dashboard
          </Button>
        </div>
      </header>

      <section className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-10">
        <Reveal className="space-y-8">
          <div className="space-y-6">
            <Badge tone="accent">Fresh build, no old footprint</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-5xl leading-[0.95] tracking-tight text-sand-50 sm:text-7xl">
                A developer page that feels like a finished product, not a template.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-sand-200/80 sm:text-lg">
                Nodivra Pages gives developers a private workspace, a live preview, and a published public profile at <span className="font-mono text-sand-100">@handle</span>. Drafts stay private until you explicitly publish them.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/u/nodivra" trailingIcon={<ArrowUpRightIcon className="h-3.5 w-3.5" />}>
              Open demo profile
            </Button>
            <Button href="/dashboard" variant="secondary" trailingIcon={<UserIcon className="h-3.5 w-3.5" />}>
              Open dashboard
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Drafts</p>
              <p className="mt-2 text-sm leading-7 text-sand-100/90">
                Edit privately, preview live, publish on your terms.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Safety</p>
              <p className="mt-2 text-sm leading-7 text-sand-100/90">
                Reserved handles, safe URLs, and no unsafe embeds.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Public</p>
              <p className="mt-2 text-sm leading-7 text-sand-100/90">
                Mobile-first profile pages with SEO and Open Graph metadata.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <PublicProfileCard profile={demo.published!} mode="preview" />
        </Reveal>
      </section>

      <section className="mt-20 space-y-8">
        <Reveal>
          <SectionHeading
            eyebrow="What ships in this module"
            title="A crisp editing flow, a fast public page, and a published snapshot model."
            description="The workspace is intentionally small for the first release: profile onboarding, ordered links, copy/share actions, a live preview, and private audit logs."
          />
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          <Reveal>
            <FeatureCard
              icon={<UserIcon className="h-4 w-4" />}
              title="Private onboarding"
              description="Choose a handle, display name, headline, bio, location, timezone, avatar, and primary CTA before publishing a public page."
            />
          </Reveal>
          <Reveal delay={80}>
            <FeatureCard
              icon={<GlobeIcon className="h-4 w-4" />}
              title="Safe public rendering"
              description="Public profile content comes from the published snapshot only. Draft changes stay out of the public route until you hit publish."
            />
          </Reveal>
          <Reveal delay={160}>
            <FeatureCard
              icon={<CheckIcon className="h-4 w-4" />}
              title="Bounded and auditable"
              description="Queries stay narrow, links are ordered and validated, and saves/publishes leave an audit trail for later review."
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
