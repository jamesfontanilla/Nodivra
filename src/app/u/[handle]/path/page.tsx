import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PathCard, pathTypeLabels } from "@/components/path-detail";
import { Badge, EmptyState, Input, Panel, Select } from "@/components/ui";
import { buildPublicProfileMetadata } from "@/lib/metadata";
import { getPublicProfile } from "@/lib/workspace";
import { siteName } from "@/lib/site";
import { PATH_ENTRY_TYPES } from "@/types/nodivra";

const PAGE_SIZE = 8;

function pageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function pageHref(handle: string, page: number, query: string, type: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  if (type) params.set("type", type);
  const suffix = params.toString();
  return `/u/${handle}/path${suffix ? `?${suffix}` : ""}`;
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) return { title: `${handle} path - ${siteName}` };
  const metadata = buildPublicProfileMetadata(profile, handle);
  return { ...metadata, title: `Path - ${profile.displayName} - ${siteName}` };
}

export default async function PublicPathPage({
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
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const query = (first(search.q) ?? "").trim().slice(0, 64);
  const type = (first(search.type) ?? "").trim().toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const filteredEntries = activeProfile.publishedPathEntries.filter((entry) => {
    const matchesQuery = !normalizedQuery || [entry.title, entry.organization, entry.locationText, entry.summary, ...entry.highlights.map((highlight) => highlight.content), ...entry.technologies.map((technology) => technology.technology)].join(" ").toLowerCase().includes(normalizedQuery);
    const matchesType = !type || entry.entryType === type;
    return matchesQuery && matchesType;
  });
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const currentPage = Math.min(pageNumber(first(search.page)), totalPages);
  const visibleEntries = filteredEntries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Panel tone="dark">
          <div className="space-y-6">
            <div className="space-y-3">
              <Link href={`/u/${activeProfile.handle}`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to profile</Link>
              <div className="flex flex-wrap items-center gap-2"><Badge tone="accent">{activeProfile.displayName}</Badge><Badge tone="muted">Path archive</Badge></div>
              <h1 className="font-display text-4xl tracking-tight text-sand-50 sm:text-6xl">A career is more than a list of titles.</h1>
              <p className="max-w-2xl text-sm leading-7 text-sand-200/80">Browse the roles, study, and turning points that shaped the work. Exact dates appear only when they were intentionally shared.</p>
            </div>
            <form method="get" action={`/u/${activeProfile.handle}/path`} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
              <Input name="q" defaultValue={query} placeholder="Search the Path" aria-label="Search the Path" />
              <Select name="type" defaultValue={type} aria-label="Filter by Path entry type"><option value="">All entry types</option>{PATH_ENTRY_TYPES.map((entryType) => <option key={entryType} value={entryType}>{pathTypeLabels[entryType]}</option>)}</Select>
              <button type="submit" className="rounded-full bg-sand-100 px-5 py-2.5 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200 active:scale-[0.98]">Filter</button>
            </form>
          </div>
        </Panel>

        {visibleEntries.length === 0 ? <Panel tone="dark"><EmptyState title={query || type ? "No matching Path entries" : "No public Path yet"} description={query || type ? "Try another search term or entry type." : "Published timeline entries will appear here when they are ready to share."} /></Panel> : <div className="space-y-5">{visibleEntries.map((entry) => <PathCard key={entry.id} entry={entry} projects={activeProfile.publishedProjects} profileHandle={activeProfile.handle} />)}</div>}

        {totalPages > 1 ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">
          {currentPage > 1 ? <Link href={pageHref(activeProfile.handle, currentPage - 1, query, type)} className="rounded-full px-4 py-2 text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">Previous</Link> : <span className="px-4 py-2 text-sand-300/40">Previous</span>}
          <span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages ? <Link href={pageHref(activeProfile.handle, currentPage + 1, query, type)} className="rounded-full bg-sand-100 px-4 py-2 font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-sand-200">Next</Link> : <span className="px-4 py-2 text-sand-300/40">Next</span>}
        </div> : null}
      </div>
    </main>
  );
}
