import Link from "next/link";
import { ArrowUpRightIcon, LinkIcon } from "@/components/icons";
import { sortStackItems } from "@/lib/snapshot";
import { Badge, Divider } from "@/components/ui";
import type {
  ProfileStackCategoryDraft,
  ProfileStackItemDraft,
  PublicProjectSnapshot,
  PublicStackItemSnapshot,
  StackIconIdentifier,
} from "@/types/nodivra";

const iconGlyphs: Record<StackIconIdentifier, string> = {
  code: "</>",
  database: "DB",
  cloud: "CLD",
  terminal: ">_",
  palette: "PAL",
  mobile: "MOB",
  tool: "TL",
  spark: "*",
  book: "BK",
  shield: "SAFE",
};

const learningLabels: Record<PublicStackItemSnapshot["learningStatus"], string> = {
  used_daily: "Used Daily",
  comfortable: "Comfortable",
  learning: "Learning",
  exploring: "Exploring",
};

function learningTone(status: PublicStackItemSnapshot["learningStatus"]) {
  if (status === "used_daily") return "success" as const;
  if (status === "learning") return "accent" as const;
  return "muted" as const;
}

function draftToPublicStackItem(
  item: ProfileStackItemDraft,
  categories: ProfileStackCategoryDraft[],
): PublicStackItemSnapshot {
  const category = categories.find((candidate) => candidate.id === item.categoryId);
  return {
    id: item.id,
    categoryId: item.categoryId,
    categoryName: category?.name ?? "Uncategorized",
    categorySlug: category?.slug ?? "uncategorized",
    technologyName: item.technologyName,
    proficiencyLabel: item.proficiencyLabel,
    yearsText: item.yearsText,
    confidenceLabel: item.confidenceLabel,
    learningStatus: item.learningStatus,
    shortDescription: item.shortDescription,
    iconIdentifier: item.iconIdentifier,
    isFeatured: item.isFeatured,
    position: item.position,
    projects: item.projects.filter((project) => project.isEnabled).map((project) => ({
      id: project.id,
      projectId: project.projectId,
      position: project.position,
      isEnabled: project.isEnabled,
    })),
    links: item.links.filter((link) => link.isEnabled).map((link) => ({
      id: link.id,
      kind: link.kind,
      label: link.label,
      url: link.url,
      position: link.position,
      isEnabled: link.isEnabled,
    })),
  };
}

function StackLinks({
  item,
  projects,
  profileHandle,
}: {
  item: PublicStackItemSnapshot;
  projects: PublicProjectSnapshot[];
  profileHandle?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {item.projects.map((projectLink) => {
        const project = projects.find((candidate) => candidate.id === projectLink.projectId);
        if (!project || !profileHandle) return null;
        return (
          <Link key={projectLink.id} href={`/u/${profileHandle}/projects/${project.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">
            <LinkIcon className="h-3.5 w-3.5" />
            {project.projectName}
          </Link>
        );
      })}
      {item.links.map((link) => (
        <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function StackCard({
  item,
  projects = [],
  profileHandle,
}: {
  item: PublicStackItemSnapshot;
  projects?: PublicProjectSnapshot[];
  profileHandle?: string;
}) {
  return (
    <article className="group rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-white/10">
      <div className="flex h-full flex-col rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand-100 font-mono text-[10px] font-semibold tracking-[0.12em] text-ink-950 ring-1 ring-sand-200/50">
              {iconGlyphs[item.iconIdentifier]}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-2xl tracking-tight text-sand-50">{item.technologyName}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-sand-300/65">{item.categoryName}</p>
            </div>
          </div>
          {item.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge tone={learningTone(item.learningStatus)}>{learningLabels[item.learningStatus]}</Badge>
          {item.proficiencyLabel ? <Badge tone="muted">{item.proficiencyLabel}</Badge> : null}
        </div>
        <p className="mt-5 min-h-[3.5rem] text-sm leading-7 text-sand-200/80">{item.shortDescription || "A manually curated part of this developer's working stack."}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.25rem] bg-white/5 p-3 ring-1 ring-white/10"><p className="text-[10px] uppercase tracking-[0.18em] text-sand-300/60">Experience</p><p className="mt-2 text-sm text-sand-50">{item.yearsText || "Not listed"}</p></div>
          <div className="rounded-[1.25rem] bg-white/5 p-3 ring-1 ring-white/10"><p className="text-[10px] uppercase tracking-[0.18em] text-sand-300/60">Confidence</p><p className="mt-2 text-sm text-sand-50">{item.confidenceLabel || "Self-described"}</p></div>
          <div className="rounded-[1.25rem] bg-white/5 p-3 ring-1 ring-white/10"><p className="text-[10px] uppercase tracking-[0.18em] text-sand-300/60">Category</p><p className="mt-2 truncate text-sm text-sand-50">{item.categoryName}</p></div>
        </div>

        <Divider className="my-6" />
        <StackLinks item={item} projects={projects} profileHandle={profileHandle} />
      </div>
    </article>
  );
}

export function PublicStack({
  items,
  projects,
  profileHandle,
}: {
  items: PublicStackItemSnapshot[];
  projects: PublicProjectSnapshot[];
  profileHandle: string;
}) {
  const visibleItems = [...sortStackItems(items)].sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured)).slice(0, 8);
  if (visibleItems.length === 0) return null;

  return (
    <section className="space-y-8 py-16 sm:py-24" aria-labelledby="stack-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Badge tone="muted">Working stack</Badge>
          <h2 id="stack-heading" className="font-display text-4xl tracking-tight text-sand-50 sm:text-5xl">The tools behind the work.</h2>
          <p className="max-w-2xl text-sm leading-7 text-sand-200/80">A self-described stack with context, confidence, and the projects where it has been used.</p>
        </div>
        <Link href={`/u/${profileHandle}/stack`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4 transition-[color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-50">
          Explore full stack <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {visibleItems.map((item) => <StackCard key={item.id} item={item} projects={projects} profileHandle={profileHandle} />)}
      </div>
    </section>
  );
}

export function StackDetailPreview({
  item,
  projects = [],
}: {
  item: PublicStackItemSnapshot;
  projects?: PublicProjectSnapshot[];
}) {
  return <StackCard item={item} projects={projects} />;
}

export { draftToPublicStackItem, iconGlyphs, learningLabels };
