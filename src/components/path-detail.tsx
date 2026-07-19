import Link from "next/link";
import { ArrowUpRightIcon, ClockIcon, LinkIcon } from "@/components/icons";
import { sortPathEntries } from "@/lib/snapshot";
import { Badge, Divider } from "@/components/ui";
import { SafeMarkdown } from "@/components/safe-markdown";
import type {
  ProfilePathEntryDraft,
  PublicPathEntrySnapshot,
  PublicProjectSnapshot,
  PathEntryType,
} from "@/types/nodivra";

export const pathTypeLabels: Record<PathEntryType, string> = {
  work: "Work",
  freelance: "Freelance",
  internship: "Internship",
  education: "Education",
  certification: "Certification",
  volunteer: "Volunteer",
  career_milestone: "Milestone",
};

function pathDateRange(entry: PublicPathEntrySnapshot) {
  const start = entry.startDate || "A starting point";
  if (entry.isCurrent) return `${start} - Present`;
  return entry.endDate ? `${start} - ${entry.endDate}` : start;
}

export function draftToPublicPathEntry(entry: ProfilePathEntryDraft): PublicPathEntrySnapshot {
  return {
    id: entry.id,
    entryType: entry.entryType,
    title: entry.title,
    organization: entry.organization,
    locationText: entry.locationText,
    startDate: entry.dateVisibility === "year_only" ? entry.startDate.slice(0, 4) : entry.startDate,
    endDate: entry.dateVisibility === "year_only" && entry.endDate ? entry.endDate.slice(0, 4) : entry.endDate,
    isCurrent: entry.isCurrent,
    dateVisibility: entry.dateVisibility,
    summary: entry.summary,
    highlights: entry.highlights.filter((highlight) => highlight.content.trim()).map((highlight) => ({
      id: highlight.id,
      content: highlight.content,
      position: highlight.position,
    })),
    technologies: entry.technologies.filter((technology) => technology.technology.trim()).map((technology) => ({
      id: technology.id,
      technology: technology.technology,
      position: technology.position,
    })),
    links: entry.links.filter((link) => link.isEnabled).map((link) => ({
      id: link.id,
      kind: link.kind,
      projectId: link.projectId,
      label: link.label,
      url: link.url,
      position: link.position,
      isEnabled: link.isEnabled,
    })),
    position: entry.position,
  };
}

function PathLinks({
  entry,
  projects,
  profileHandle,
}: {
  entry: PublicPathEntrySnapshot;
  projects: PublicProjectSnapshot[];
  profileHandle?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {entry.links.map((link) => {
        const project = projects.find((candidate) => candidate.id === link.projectId);
        if (link.kind === "project" && project && profileHandle) {
          return (
            <Link key={link.id} href={`/u/${profileHandle}/projects/${project.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">
              <LinkIcon className="h-3.5 w-3.5" />
              {link.label || project.projectName}
            </Link>
          );
        }
        if (link.kind === "project" && project) {
          return <span key={link.id} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10"><LinkIcon className="h-3.5 w-3.5" />{link.label || project.projectName}</span>;
        }
        if (!link.url) return null;
        return (
          <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
            {link.label}
          </a>
        );
      })}
    </div>
  );
}

export function PathCard({
  entry,
  projects = [],
  profileHandle,
}: {
  entry: PublicPathEntrySnapshot;
  projects?: PublicProjectSnapshot[];
  profileHandle?: string;
}) {
  return (
    <article className="group relative rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-white/10">
      <div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <div className="shrink-0 lg:w-44">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-sand-300/70">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>{pathDateRange(entry)}</span>
            </div>
            {entry.dateVisibility === "year_only" ? <p className="mt-2 text-xs text-sand-300/55">Year shown publicly</p> : null}
          </div>

          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={entry.isCurrent ? "success" : "muted"}>{entry.isCurrent ? "Current" : pathTypeLabels[entry.entryType]}</Badge>
                  {entry.isCurrent ? <Badge tone="accent">In progress</Badge> : null}
                </div>
                <h3 className="font-display text-3xl leading-tight tracking-tight text-sand-50 sm:text-4xl">{entry.title}</h3>
                <p className="text-sm uppercase tracking-[0.16em] text-sand-300/70">{entry.organization}{entry.locationText ? ` - ${entry.locationText}` : ""}</p>
              </div>
            </div>

            <SafeMarkdown markdown={entry.summary} className="max-w-3xl text-sm leading-7 text-sand-200/85 sm:text-base" />

            {entry.highlights.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {entry.highlights.map((highlight) => <li key={highlight.id} className="rounded-[1.25rem] bg-white/5 p-4 text-sm leading-6 text-sand-200/80 ring-1 ring-white/10">{highlight.content}</li>)}
              </ul>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {entry.technologies.map((technology) => profileHandle ? (
                <Link key={technology.id} href={`/u/${profileHandle}/stack?q=${encodeURIComponent(technology.technology)}`} className="rounded-full bg-sand-100/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-sand-100 ring-1 ring-sand-200/20 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-sand-100/20">{technology.technology}</Link>
              ) : <span key={technology.id} className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-sand-200/80 ring-1 ring-white/10">{technology.technology}</span>)}
            </div>

            {entry.links.length > 0 ? <><Divider className="my-5" /><PathLinks entry={entry} projects={projects} profileHandle={profileHandle} /></> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function PublicPath({
  entries,
  projects,
  profileHandle,
}: {
  entries: PublicPathEntrySnapshot[];
  projects: PublicProjectSnapshot[];
  profileHandle: string;
}) {
  const visibleEntries = sortPathEntries(entries).slice(0, 6);
  if (visibleEntries.length === 0) return null;

  return (
    <section className="space-y-8 py-16 sm:py-24" aria-labelledby="path-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Badge tone="muted">The path</Badge>
          <h2 id="path-heading" className="font-display text-4xl tracking-tight text-sand-50 sm:text-5xl">The work behind the work.</h2>
          <p className="max-w-2xl text-sm leading-7 text-sand-200/80">A living timeline of roles, study, and turning points, shared with the amount of detail that feels right.</p>
        </div>
        <Link href={`/u/${profileHandle}/path`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4 transition-[color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-50">Explore full path <ArrowUpRightIcon className="h-3.5 w-3.5" /></Link>
      </div>
      <div className="space-y-5">
        {visibleEntries.map((entry) => <PathCard key={entry.id} entry={entry} projects={projects} profileHandle={profileHandle} />)}
      </div>
    </section>
  );
}

export function PathDetailPreview({ entry, projects = [] }: { entry: PublicPathEntrySnapshot; projects?: PublicProjectSnapshot[] }) {
  return <PathCard entry={entry} projects={projects} />;
}

export { pathDateRange };
