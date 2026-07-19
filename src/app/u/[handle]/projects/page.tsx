import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-detail";
import { Badge, EmptyState, Input, Panel } from "@/components/ui";
import { buildPublicProfileMetadata } from "@/lib/metadata";
import { getPublicProfile } from "@/lib/workspace";
import { siteName } from "@/lib/site";

const PAGE_SIZE = 6;

function pageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function pageHref(handle: string, page: number, query: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  const suffix = params.toString();
  return `/u/${handle}/projects${suffix ? `?${suffix}` : ""}`;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) return { title: `${handle} projects · ${siteName}` };
  const metadata = buildPublicProfileMetadata(profile, handle);
  return { ...metadata, title: `Projects · ${profile.displayName} · ${siteName}` };
}

export default async function PublicProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ handle }, search] = await Promise.all([params, searchParams]);
  const profile = await getPublicProfile(handle);
  if (!profile) notFound();

  const activeProfile = profile ?? notFound();
  const rawQuery = Array.isArray(search.q) ? search.q[0] : search.q;
  const rawPage = Array.isArray(search.page) ? search.page[0] : search.page;
  const query = (rawQuery ?? "").trim().slice(0, 64);
  const normalizedQuery = query.toLowerCase();
  const filteredProjects = normalizedQuery
    ? activeProfile.publishedProjects.filter((project) => [
        project.projectName,
        project.shortSummary,
        project.role,
        project.caseStudyMarkdown,
        ...project.technologies,
        ...project.tags,
      ].join(" ").toLowerCase().includes(normalizedQuery))
    : activeProfile.publishedProjects;
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const currentPage = Math.min(pageNumber(rawPage), totalPages);
  const visibleProjects = filteredProjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Panel tone="dark">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Link href={`/u/${activeProfile.handle}`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to profile</Link>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{activeProfile.displayName}</Badge>
                <Badge tone="muted">Project archive</Badge>
              </div>
              <h1 className="font-display text-4xl tracking-tight text-sand-50 sm:text-6xl">Selected work, with the thinking left in.</h1>
              <p className="max-w-2xl text-sm leading-7 text-sand-200/80">Browse the public case studies, decisions, and lessons behind the work.</p>
            </div>
            <form method="get" action={`/u/${activeProfile.handle}/projects`} className="flex w-full max-w-md gap-2">
              <Input name="q" defaultValue={query} placeholder="Search projects" aria-label="Search projects" />
              <button type="submit" className="shrink-0 rounded-full bg-sand-100 px-4 py-2.5 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200 active:scale-[0.98]">Search</button>
            </form>
          </div>
        </Panel>

        {visibleProjects.length === 0 ? (
          <Panel tone="dark">
            <EmptyState title={query ? "No matching projects" : "No public projects yet"} description={query ? "Try a different title, technology, or tag." : "Published case studies will appear here when they are ready to share."} />
          </Panel>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} profileHandle={activeProfile.handle} />)}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">
            {currentPage > 1 ? <Link href={pageHref(activeProfile.handle, currentPage - 1, query)} className="rounded-full px-4 py-2 text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">Previous</Link> : <span className="px-4 py-2 text-sand-300/40">Previous</span>}
            <span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Page {currentPage} of {totalPages}</span>
            {currentPage < totalPages ? <Link href={pageHref(activeProfile.handle, currentPage + 1, query)} className="rounded-full bg-sand-100 px-4 py-2 font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-sand-200">Next</Link> : <span className="px-4 py-2 text-sand-300/40">Next</span>}
          </div>
        ) : null}
      </div>
    </main>
  );
}
