import Link from "next/link";
import { ArrowUpRightIcon, LinkIcon, SparkIcon } from "@/components/icons";
import { sortRepositories } from "@/lib/snapshot";
import { Badge, Divider } from "@/components/ui";
import type {
  ProfileRepositoryDraft,
  PublicRepositorySnapshot,
  PublicProjectSnapshot,
} from "@/types/nodivra";

const statusLabels: Record<PublicRepositorySnapshot["status"], string> = {
  active: "Active",
  maintenance: "Maintenance",
  paused: "Paused",
  archived: "Archived",
};

function draftToPublicRepository(repository: ProfileRepositoryDraft): PublicRepositorySnapshot {
  return {
    id: repository.id,
    repositoryName: repository.repositoryName,
    providerLabel: repository.providerLabel,
    repositoryUrl: repository.repositoryUrl,
    description: repository.description,
    language: repository.language,
    framework: repository.framework,
    topics: repository.topics,
    starsText: repository.starsText,
    forksText: repository.forksText,
    activityLabel: repository.activityLabel,
    status: repository.status,
    isStatsVisible: repository.isStatsVisible,
    isFeatured: repository.isFeatured,
    position: repository.position,
    links: repository.links.map((link) => ({
      id: link.id,
      kind: link.kind,
      projectId: link.projectId,
      label: link.label,
      url: link.url,
      position: link.position,
      isEnabled: link.isEnabled,
    })),
  };
}

function relatedProject(
  link: PublicRepositorySnapshot["links"][number],
  projects: PublicProjectSnapshot[],
) {
  return projects.find((project) => project.id === link.projectId);
}

function RepositoryLinks({
  repository,
  projects,
  profileHandle,
}: {
  repository: PublicRepositorySnapshot;
  projects: PublicProjectSnapshot[];
  profileHandle?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={repository.repositoryUrl}
        target="_blank"
        rel="noreferrer"
        className="group/link inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2.5 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-sand-200 active:scale-[0.98]"
      >
        Open repository
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-px">
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </span>
      </a>
      {repository.links.map((link) => {
        const project = link.kind === "project" ? relatedProject(link, projects) : null;
        if (link.kind === "project" && !project) return null;

        return project && profileHandle ? (
          <Link
            key={link.id}
            href={`/u/${profileHandle}/projects/${project.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            {link.label || project.projectName}
          </Link>
        ) : project ? (
          <span key={link.id} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10">
            <LinkIcon className="h-3.5 w-3.5" />
            {link.label || project.projectName}
          </span>
        ) : (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"
          >
            <SparkIcon className="h-3.5 w-3.5" />
            {link.label || "Stack item"}
          </a>
        );
      })}
    </div>
  );
}

export function RepositoryCard({
  repository,
  profileHandle,
  projects = [],
}: {
  repository: PublicRepositorySnapshot;
  profileHandle: string;
  projects?: PublicProjectSnapshot[];
}) {
  return (
    <article className="group rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-white/10">
      <div className="flex h-full flex-col rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-950 ring-1 ring-sand-200/50">
              <span className="font-mono text-xs font-semibold">&lt;/&gt;</span>
            </div>
            <div className="min-w-0">
              <p className="truncate font-mono text-sm text-sand-50">{repository.repositoryName}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-sand-300/65">{repository.providerLabel}</p>
            </div>
          </div>
          {repository.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge tone={repository.status === "active" ? "success" : "muted"}>{statusLabels[repository.status]}</Badge>
          {repository.language ? <Badge tone="muted">{repository.language}</Badge> : null}
          {repository.framework ? <Badge tone="muted">{repository.framework}</Badge> : null}
        </div>

        <div className="mt-5 space-y-3">
          <h3 className="font-display text-3xl leading-tight tracking-tight text-sand-50">{repository.repositoryName}</h3>
          <p className="text-sm leading-7 text-sand-200/80">{repository.description}</p>
        </div>

        {repository.topics.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {repository.topics.map((topic) => <span key={topic} className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-sand-200/80 ring-1 ring-white/10">{topic}</span>)}
          </div>
        ) : null}

        {repository.isStatsVisible ? (
          <div className="mt-6 rounded-[1.35rem] bg-sand-100/10 p-4 ring-1 ring-sand-200/15">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-sand-200/70">Manual stats</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-sand-300/60">Not live</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-sand-50">
              <div><p className="text-xs text-sand-300/60">Stars</p><p className="mt-1 font-medium">{repository.starsText || "Not provided"}</p></div>
              <div><p className="text-xs text-sand-300/60">Forks</p><p className="mt-1 font-medium">{repository.forksText || "Not provided"}</p></div>
            </div>
            {repository.activityLabel ? <p className="mt-3 text-xs text-sand-200/70">{repository.activityLabel}</p> : null}
          </div>
        ) : null}

        <Divider className="my-6" />
        <RepositoryLinks repository={repository} projects={projects} profileHandle={profileHandle} />
      </div>
    </article>
  );
}

export function PublicRepositories({
  repositories,
  profileHandle,
  projects = [],
}: {
  repositories: PublicRepositorySnapshot[];
  profileHandle: string;
  projects?: PublicProjectSnapshot[];
}) {
  const visibleRepositories = sortRepositories(repositories).slice(0, 6);
  if (visibleRepositories.length === 0) return null;

  return (
    <section className="space-y-7 py-8 sm:py-12" aria-labelledby="repositories-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Badge tone="muted">Code and craft</Badge>
          <h2 id="repositories-heading" className="font-display text-4xl tracking-tight text-sand-50 sm:text-5xl">Selected repositories.</h2>
          <p className="max-w-2xl text-sm leading-7 text-sand-200/80">A manually curated code archive with context, stack, and the work it connects to.</p>
        </div>
        <Link href={`/u/${profileHandle}/repos`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4 transition-[color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-50">
          View all repos <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {visibleRepositories.map((repository) => <RepositoryCard key={repository.id} repository={repository} profileHandle={profileHandle} projects={projects} />)}
      </div>
    </section>
  );
}

export function RepositoryDetailPreview({
  repository,
  projects = [],
}: {
  repository: PublicRepositorySnapshot;
  projects?: PublicProjectSnapshot[];
}) {
  return (
    <article className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10">
      <div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Draft repository preview</Badge>
            <Badge tone={repository.status === "active" ? "success" : "muted"}>{statusLabels[repository.status]}</Badge>
            <Badge tone="muted">{repository.providerLabel}</Badge>
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-4xl leading-tight tracking-tight text-sand-50 sm:text-6xl">{repository.repositoryName}</h2>
            <p className="max-w-3xl text-base leading-8 text-sand-200/85 sm:text-lg">{repository.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><p className="text-[10px] uppercase tracking-[0.2em] text-sand-300/70">Language</p><p className="mt-2 text-sm text-sand-50">{repository.language || "Not set"}</p></div>
            <div className="rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><p className="text-[10px] uppercase tracking-[0.2em] text-sand-300/70">Framework</p><p className="mt-2 text-sm text-sand-50">{repository.framework || "Not set"}</p></div>
            <div className="rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><p className="text-[10px] uppercase tracking-[0.2em] text-sand-300/70">Activity</p><p className="mt-2 text-sm text-sand-50">{repository.activityLabel || "Manual label not set"}</p></div>
          </div>
          {repository.isStatsVisible ? <p className="text-xs uppercase tracking-[0.18em] text-sand-300/65">Manual stats: {repository.starsText || "No stars text"} stars · {repository.forksText || "No forks text"} forks</p> : <p className="text-xs uppercase tracking-[0.18em] text-sand-300/65">Stats hidden from the public page</p>}
          <Divider />
          <RepositoryLinks repository={repository} projects={projects} profileHandle="" />
        </div>
      </div>
    </article>
  );
}

export { draftToPublicRepository };
