import Link from "next/link";
import { cn } from "@/lib/classnames";
import { sortProjects } from "@/lib/snapshot";
import { ArrowUpRightIcon, ClockIcon, GlobeIcon, LinkIcon, SparkIcon } from "@/components/icons";
import { Badge, Divider } from "@/components/ui";
import { SafeMarkdown } from "@/components/safe-markdown";
import type { ProfileProjectDraft, PublicProjectSnapshot, ProjectLinkKind } from "@/types/nodivra";

function statusLabel(status: PublicProjectSnapshot["status"]) {
  return status.replace("_", " ");
}

function typeLabel(type: PublicProjectSnapshot["projectType"]) {
  return type.replace("_", " ");
}

function linkLabel(kind: ProjectLinkKind) {
  if (kind === "repository") return "Repository";
  if (kind === "demo") return "Open demo";
  return "View project";
}

function draftToPublicProject(project: ProfileProjectDraft): PublicProjectSnapshot {
  return {
    id: project.id,
    slug: project.slug,
    projectName: project.projectName,
    shortSummary: project.shortSummary,
    caseStudyMarkdown: project.caseStudyMarkdown,
    role: project.role,
    technologies: project.technologies,
    projectType: project.projectType,
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status,
    coverImageUrl: project.coverImageUrl,
    lessonsLearned: project.lessonsLearned,
    tags: project.tags,
    isFeatured: project.isFeatured,
    position: project.position,
    links: project.links.map((link) => ({
      id: link.id,
      kind: link.kind,
      label: link.label,
      url: link.url,
      position: link.position,
      isEnabled: link.isEnabled,
    })),
  };
}

export function ProjectCard({
  project,
  profileHandle,
}: {
  project: PublicProjectSnapshot;
  profileHandle: string;
}) {
  return (
    <article className="group rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-white/10">
      <div className="h-full overflow-hidden rounded-[1.625rem] bg-ink-950/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {project.coverImageUrl ? (
          <img src={project.coverImageUrl} alt="" loading="lazy" className="aspect-[16/8] w-full object-cover opacity-90 transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02] group-hover:opacity-100" />
        ) : (
          <div className="flex aspect-[16/8] items-end bg-[radial-gradient(circle_at_top_left,rgba(224,198,158,0.22),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(95,139,104,0.12))] p-5">
            <SparkIcon className="h-5 w-5 text-sand-100/80" />
          </div>
        )}
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {project.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
            <Badge tone="muted">{typeLabel(project.projectType)}</Badge>
            <Badge tone={project.status === "shipped" ? "success" : "muted"}>{statusLabel(project.status)}</Badge>
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-3xl leading-tight tracking-tight text-sand-50">{project.projectName}</h3>
            <p className="text-sm leading-7 text-sand-200/80">{project.shortSummary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 5).map((technology) => <span key={technology} className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-sand-200/80 ring-1 ring-white/10">{technology}</span>)}
          </div>
          <Link href={`/u/${profileHandle}/projects/${project.slug}`} className="group/link inline-flex items-center gap-3 rounded-full bg-sand-100 px-4 py-2.5 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200 active:scale-[0.98]">
            Read the case study
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-px group-hover/link:scale-105"><ArrowUpRightIcon className="h-3.5 w-3.5" /></span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function PublicProjects({
  projects,
  profileHandle,
}: {
  projects: PublicProjectSnapshot[];
  profileHandle: string;
}) {
  const visibleProjects = sortProjects(projects).slice(0, 6);
  if (visibleProjects.length === 0) return null;

  return (
    <section className="space-y-7 py-8 sm:py-12" aria-labelledby="projects-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Badge tone="muted">Proof of work</Badge>
          <h2 id="projects-heading" className="font-display text-4xl tracking-tight text-sand-50 sm:text-5xl">Selected projects.</h2>
          <p className="max-w-2xl text-sm leading-7 text-sand-200/80">A few pieces of work, with the decisions and lessons behind them.</p>
        </div>
        <Link href={`/u/${profileHandle}/projects`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4 transition-[color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-50">
          View all projects <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} profileHandle={profileHandle} />)}
      </div>
    </section>
  );
}

export function ProjectDetailPreview({
  project,
  profileHandle,
  preview = false,
}: {
  project: PublicProjectSnapshot;
  profileHandle?: string;
  preview?: boolean;
}) {
  return (
    <article className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10">
      <div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8">
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-2">
            {preview ? <Badge tone="accent">Draft project preview</Badge> : <Badge tone="muted">Case study</Badge>}
            <Badge tone={project.status === "shipped" ? "success" : "muted"}>{statusLabel(project.status)}</Badge>
            <Badge tone="muted">{typeLabel(project.projectType)}</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-4xl leading-tight tracking-tight text-sand-50 sm:text-6xl">{project.projectName}</h1>
            <p className="max-w-3xl text-base leading-8 text-sand-200/85 sm:text-lg">{project.shortSummary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => <span key={tag} className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-sand-200/80 ring-1 ring-white/10">{tag}</span>)}
          </div>
          {project.coverImageUrl ? <img src={project.coverImageUrl} alt="" className="aspect-[16/7] w-full rounded-[1.5rem] object-cover ring-1 ring-white/10" /> : null}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><p className="text-[10px] uppercase tracking-[0.2em] text-sand-300/70">Role</p><p className="mt-2 text-sm text-sand-50">{project.role || "Independent"}</p></div>
            <div className="rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><p className="text-[10px] uppercase tracking-[0.2em] text-sand-300/70">Timeline</p><p className="mt-2 flex items-center gap-2 text-sm text-sand-50"><ClockIcon className="h-3.5 w-3.5 text-sand-300/70" />{project.startDate || "Open"}{project.endDate ? ` → ${project.endDate}` : " → now"}</p></div>
            <div className="rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><p className="text-[10px] uppercase tracking-[0.2em] text-sand-300/70">Stack</p><p className="mt-2 text-sm text-sand-50">{project.technologies.slice(0, 3).join(" · ") || "Curated work"}</p></div>
          </div>
          <Divider />
          <SafeMarkdown markdown={project.caseStudyMarkdown} />
          {project.lessonsLearned ? (
            <div className="rounded-[1.5rem] bg-sand-100/10 p-5 ring-1 ring-sand-200/20 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-sand-200/70">Lessons learned</p>
              <p className="mt-3 text-base leading-8 text-sand-50">{project.lessonsLearned}</p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {project.links.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">
                {link.kind === "repository" ? <LinkIcon className="h-4 w-4" /> : link.kind === "live" ? <GlobeIcon className="h-4 w-4" /> : <ArrowUpRightIcon className="h-4 w-4" />}
                {link.label || linkLabel(link.kind)}
              </a>
            ))}
            {profileHandle && !preview ? <Link href={`/u/${profileHandle}`} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-sand-200/70 underline decoration-white/20 underline-offset-4">Back to profile</Link> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export { draftToPublicProject };
