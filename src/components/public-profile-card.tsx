import { cn } from "@/lib/classnames";
import { splitVisibleLinks } from "@/lib/snapshot";
import { siteName } from "@/lib/site";
import {
  ArrowUpRightIcon,
  ClockIcon,
  GlobeIcon,
  LinkIcon,
  SparkIcon,
  UserIcon,
} from "@/components/icons";
import { Badge, Divider, Panel, StatusPill } from "@/components/ui";
import type { PublicProfileSnapshot } from "@/types/nodivra";

function availabilityCopy(status: PublicProfileSnapshot["availabilityStatus"]) {
  switch (status) {
    case "busy":
      return { label: "Heads down", tone: "muted" as const };
    case "away":
      return { label: "Away", tone: "muted" as const };
    case "offline":
      return { label: "Offline", tone: "danger" as const };
    default:
      return { label: "Open for work", tone: "success" as const };
  }
}

function shortUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function LinkCard({
  href,
  title,
  description,
  badge,
}: {
  href: string;
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex items-center gap-4 rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4 transition-[transform,background-color,border-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-sand-200/30 hover:bg-white/10",
      )}
    >
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-950 ring-1 ring-sand-200/40">
        {badge ? (
          <span className="text-[11px] font-semibold tracking-[0.24em]">{badge}</span>
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-sand-50">{title}</span>
        {description ? (
          <span className="mt-1 block truncate text-xs text-sand-200/70">
            {description}
          </span>
        ) : null}
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-sand-100 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
        <ArrowUpRightIcon className="h-4 w-4" />
      </span>
    </a>
  );
}

export function PublicProfileCard({
  profile,
  mode = "public",
  className,
}: {
  profile: PublicProfileSnapshot;
  mode?: "public" | "preview";
  className?: string;
}) {
  const { primary, social } = splitVisibleLinks(profile.publishedLinks);
  const availability = availabilityCopy(profile.availabilityStatus);
  const hasAvatar = profile.avatarUrl.trim().length > 0;

  return (
    <section className={cn("relative", className)}>
      <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(224,198,158,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(95,139,104,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_40%)]" />
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2.5rem] bg-white/5 p-1.5 ring-1 ring-white/10 shadow-halo">
          <div className="rounded-[2rem] bg-ink-950/92 px-5 py-5 text-sand-50 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-sand-100 to-moss-100 p-0.5 ring-1 ring-white/10">
                      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.2rem] bg-ink-950 text-ink-950">
                        {hasAvatar ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-semibold tracking-[0.18em] text-sand-50">
                            {profile.avatarInitials || "ND"}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="absolute -right-1 -bottom-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30">
                      <SparkIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={mode === "preview" ? "muted" : "accent"}>
                        {mode === "preview" ? "Draft preview" : siteName}
                      </Badge>
                      <StatusPill tone={availability.tone}>{availability.label}</StatusPill>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.28em] text-sand-300/70">
                        @{profile.handle}
                      </p>
                      <h1 className="mt-2 font-display text-3xl leading-tight tracking-tight sm:text-5xl">
                        {profile.displayName}
                      </h1>
                      {profile.headline ? (
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-sand-200/80 sm:text-base">
                          {profile.headline}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {profile.locationText ? (
                    <Badge tone="muted">
                      <GlobeIcon className="h-3.5 w-3.5" />
                      {profile.locationText}
                    </Badge>
                  ) : null}
                  {profile.timezone ? (
                    <Badge tone="muted">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {profile.timezone}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {profile.bio ? (
                <p className="max-w-3xl text-sm leading-7 text-sand-100/90 sm:text-base">
                  {profile.bio}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {profile.primaryCtaLabel && profile.primaryCtaUrl ? (
                  <a
                    href={profile.primaryCtaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-3 rounded-full bg-sand-100 px-5 py-3 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200 active:scale-[0.98]"
                  >
                    <span>{profile.primaryCtaLabel}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                      <ArrowUpRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ) : null}
                <Badge tone="muted">Public page powered by Nodivra</Badge>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-sand-100 ring-1 ring-white/10">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-sand-300/70">
                        Primary links
                      </h2>
                    </div>
                    <Badge tone="muted">{primary.length} live</Badge>
                  </div>

                  <div className="space-y-3">
                    {primary.length > 0 ? (
                      primary.map((link) => (
                        <LinkCard
                          key={link.id}
                          href={link.url}
                          title={link.title}
                          description={shortUrl(link.url)}
                          badge={link.iconLabel || undefined}
                        />
                      ))
                    ) : (
                      <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-5 text-sm text-sand-200/70">
                        No primary links are published yet.
                      </div>
                    )}
                  </div>
                </div>

                <Panel tone="dark" className="self-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-sand-100 ring-1 ring-white/10">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-sand-50">Social links</p>
                        <p className="text-xs text-sand-200/70">
                          Compact links for places where people already know you.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {social.length > 0 ? (
                        social.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-sand-100 transition hover:border-sand-200/30 hover:bg-white/10"
                          >
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sand-100/10 text-[10px] font-semibold tracking-[0.22em] text-sand-100 ring-1 ring-white/10">
                              {link.iconLabel || "→"}
                            </span>
                            <span>{link.title}</span>
                          </a>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-sand-200/70">
                          No social links published.
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>
              </div>

              <Divider />

              <div className="flex items-center justify-between gap-4 text-xs text-sand-300/70">
                <span>Published with careful bounds and no unsafe embeds.</span>
                <span>Handles stay lowercase and reserved words stay blocked.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
