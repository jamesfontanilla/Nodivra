import type { ReactNode } from "react";
import { cn } from "@/lib/classnames";
import { sortBlocks, sortSections } from "@/lib/snapshot";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ClockIcon,
  LinkIcon,
  SparkIcon,
} from "@/components/icons";
import { Badge, StatusPill } from "@/components/ui";
import type {
  AvailabilityCardConfiguration,
  CtaCardConfiguration,
  DividerConfiguration,
  ExternalResourceConfiguration,
  ImageCardConfiguration,
  LinkButtonConfiguration,
  ProjectHighlightConfiguration,
  PublicBlockSnapshot,
  PublicSectionSnapshot,
  SocialLinkConfiguration,
  TextSectionConfiguration,
} from "@/types/nodivra";

function BlockShell({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10", className)}>
      <div className="h-full rounded-[1.625rem] bg-ink-950/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
        <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.22em] text-sand-300/70">
          {title}
        </p>
        {children}
      </div>
    </article>
  );
}

function externalLinkClasses() {
  return "group inline-flex items-center gap-3 rounded-full bg-sand-100 px-4 py-2.5 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200 active:scale-[0.98]";
}

function iconCircle() {
  return "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105";
}

function blockWidth(type: PublicBlockSnapshot["type"]) {
  switch (type) {
    case "project_highlight":
    case "image_card":
      return "md:col-span-7";
    case "text_section":
    case "cta_card":
      return "md:col-span-5";
    default:
      return "md:col-span-4";
  }
}

function availabilityCopy(status: AvailabilityCardConfiguration["status"]) {
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

function resourceLabel(resourceType: ExternalResourceConfiguration["resourceType"]) {
  return resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
}

function ctaAccent(accent: CtaCardConfiguration["accent"]) {
  switch (accent) {
    case "moss":
      return "bg-moss-100/15 text-moss-100 ring-moss-100/20";
    case "ink":
      return "bg-white/10 text-sand-50 ring-white/15";
    default:
      return "bg-sand-100 text-ink-950 ring-sand-200/40";
  }
}

function renderBlock(block: PublicBlockSnapshot) {
  switch (block.type) {
    case "link_button": {
      const config = block.configuration as LinkButtonConfiguration;
      return (
        <BlockShell title={block.title}>
          <a href={config.url} target="_blank" rel="noreferrer" className={externalLinkClasses()}>
            <span className="flex-1">{config.label}</span>
            {config.detail ? <span className="hidden text-xs text-ink-700 sm:inline">{config.detail}</span> : null}
            <span className={iconCircle()}>
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </span>
          </a>
        </BlockShell>
      );
    }
    case "social_link": {
      const config = block.configuration as SocialLinkConfiguration;
      return (
        <BlockShell title={block.title}>
          <a
            href={config.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-[1.35rem] bg-white/5 px-4 py-4 ring-1 ring-white/10 transition-[transform,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sand-100 text-xs font-semibold tracking-[0.18em] text-ink-950">
              {config.iconLabel || config.network.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-sand-50">{config.label}</span>
              <span className="mt-1 block text-xs text-sand-300/70">{config.network}</span>
            </span>
            <ArrowUpRightIcon className="h-4 w-4 text-sand-200/70 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px" />
          </a>
        </BlockShell>
      );
    }
    case "project_highlight": {
      const config = block.configuration as ProjectHighlightConfiguration;
      return (
        <BlockShell title={block.title} className="bg-sand-100/10">
          <div className="flex h-full flex-col justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="accent">Project highlight</Badge>
                {config.role ? <span className="text-xs text-sand-300/70">{config.role}</span> : null}
              </div>
              <h3 className="font-display text-3xl leading-tight tracking-tight text-sand-50 sm:text-4xl">
                {config.projectName}
              </h3>
              <p className="max-w-xl text-sm leading-7 text-sand-200/80">{config.summary}</p>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {config.technologies.map((technology) => (
                  <span key={technology} className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-sand-200/80 ring-1 ring-white/10">
                    {technology}
                  </span>
                ))}
              </div>
              {config.url ? (
                <a href={config.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-sand-50 underline decoration-white/20 underline-offset-4 transition-[transform,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-200">
                  View case study <ArrowUpRightIcon className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        </BlockShell>
      );
    }
    case "text_section": {
      const config = block.configuration as TextSectionConfiguration;
      return (
        <BlockShell title={block.title}>
          <p className={cn("text-base leading-8 text-sand-100/90 sm:text-lg", config.align === "center" && "text-center")}>{config.body}</p>
        </BlockShell>
      );
    }
    case "image_card": {
      const config = block.configuration as ImageCardConfiguration;
      return (
        <BlockShell title={block.title} className="overflow-hidden p-1.5">
          <div className="overflow-hidden rounded-[1.35rem] bg-ink-900">
            <img src={config.imageUrl} alt={config.altText} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02]" />
            {config.caption ? <p className="px-4 py-4 text-sm leading-6 text-sand-200/80">{config.caption}</p> : null}
          </div>
        </BlockShell>
      );
    }
    case "divider": {
      const config = block.configuration as DividerConfiguration;
      return (
        <div className={cn("col-span-1 flex items-center gap-3 py-4 md:col-span-12", config.style === "space" && "py-10")}>
          <div className="h-px flex-1 bg-white/10" />
          {config.label ? <span className="text-[10px] uppercase tracking-[0.22em] text-sand-300/60">{config.label}</span> : null}
          <div className="h-px flex-1 bg-white/10" />
        </div>
      );
    }
    case "cta_card": {
      const config = block.configuration as CtaCardConfiguration;
      return (
        <BlockShell title={block.title}>
          <div className="flex h-full flex-col justify-between gap-8">
            <div className="space-y-3">
              <SparkIcon className="h-5 w-5 text-sand-200" />
              <p className="text-base leading-7 text-sand-100/90">{config.body}</p>
            </div>
            <a href={config.ctaUrl} target="_blank" rel="noreferrer" className={cn("group inline-flex w-fit items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium ring-1 transition-[transform,filter] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:brightness-110 active:scale-[0.98]", ctaAccent(config.accent))}>
              <span>{config.ctaLabel}</span>
              <span className={cn(iconCircle(), config.accent === "sand" ? "bg-black/5" : "bg-white/10")}>
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </span>
            </a>
          </div>
        </BlockShell>
      );
    }
    case "availability_card": {
      const config = block.configuration as AvailabilityCardConfiguration;
      const availability = availabilityCopy(config.status);
      return (
        <BlockShell title={block.title}>
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/30">
                <CheckIcon className="h-5 w-5" />
              </div>
              <StatusPill tone={availability.tone}>{availability.label}</StatusPill>
            </div>
            <div className="space-y-2">
              <p className="text-sm leading-7 text-sand-100/90">{config.detail}</p>
              <p className="flex items-center gap-2 text-xs text-sand-300/70"><ClockIcon className="h-3.5 w-3.5" />{config.timezone}</p>
            </div>
          </div>
        </BlockShell>
      );
    }
    case "external_resource": {
      const config = block.configuration as ExternalResourceConfiguration;
      return (
        <BlockShell title={block.title}>
          <a href={config.url} target="_blank" rel="noreferrer" className="group flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-sand-100 ring-1 ring-white/10"><LinkIcon className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="muted">{resourceLabel(config.resourceType)}</Badge>
                <ArrowUpRightIcon className="h-4 w-4 text-sand-300/70 transition-[transform,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sand-50" />
              </div>
              <p className="text-sm leading-7 text-sand-100/90">{config.description}</p>
            </div>
          </a>
        </BlockShell>
      );
    }
  }
}

export function PublicBlocks({
  sections,
  blocks,
}: {
  sections: PublicSectionSnapshot[];
  blocks: PublicBlockSnapshot[];
}) {
  if (sections.length === 0 || blocks.length === 0) {
    return null;
  }

  const sortedSections = sortSections(sections);
  const sortedBlocks = sortBlocks(blocks);

  return (
    <div className="space-y-16 py-8 sm:space-y-24 sm:py-12">
      {sortedSections.map((section, index) => {
        const sectionBlocks = sortedBlocks.filter((block) => block.sectionId === section.id);
        if (sectionBlocks.length === 0) {
          return null;
        }

        return (
          <section key={section.id} aria-labelledby={`section-${section.id}`} className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-3">
                <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-sand-300/70 ring-1 ring-white/10">
                  {String(index + 1).padStart(2, "0")} / {section.slug}
                </span>
                <h2 id={`section-${section.id}`} className="font-display text-3xl tracking-tight text-sand-50 sm:text-4xl">
                  {section.title}
                </h2>
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-sand-300/60">{sectionBlocks.length} pieces</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {sectionBlocks.map((block) => (
                <div key={block.id} className={cn("col-span-1", blockWidth(block.type))}>
                  {renderBlock(block)}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
