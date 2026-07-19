import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StackCard } from "@/components/stack-detail";
import { Badge, EmptyState, Input, Panel, Select } from "@/components/ui";
import { buildPublicProfileMetadata } from "@/lib/metadata";
import { getPublicProfile } from "@/lib/workspace";
import { siteName } from "@/lib/site";
import type { StackLearningStatus } from "@/types/nodivra";

const PAGE_SIZE = 12;
const learningStatusLabels: Record<StackLearningStatus, string> = {
  used_daily: "Used Daily",
  comfortable: "Comfortable",
  learning: "Learning",
  exploring: "Exploring",
};

function pageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function pageHref(handle: string, page: number, query: string, category: string, status: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  if (status) params.set("status", status);
  const suffix = params.toString();
  return `/u/${handle}/stack${suffix ? `?${suffix}` : ""}`;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) return { title: `${handle} stack - ${siteName}` };
  const metadata = buildPublicProfileMetadata(profile, handle);
  return { ...metadata, title: `Stack - ${profile.displayName} - ${siteName}` };
}

export default async function PublicStackPage({
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
  const category = (first(search.category) ?? "").trim().slice(0, 48);
  const status = (first(search.status) ?? "").trim() as StackLearningStatus | "";
  const normalizedQuery = query.toLowerCase();
  const normalizedCategory = category.toLowerCase();
  const normalizedStatus = status.toLowerCase();
  const filteredItems = activeProfile.publishedStackItems.filter((item) => {
    const matchesQuery = !normalizedQuery || [item.technologyName, item.categoryName, item.proficiencyLabel, item.confidenceLabel, item.learningStatus, item.shortDescription].join(" ").toLowerCase().includes(normalizedQuery);
    const matchesCategory = !normalizedCategory || item.categorySlug.toLowerCase() === normalizedCategory;
    const matchesStatus = !normalizedStatus || item.learningStatus === normalizedStatus;
    return matchesQuery && matchesCategory && matchesStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(pageNumber(first(search.page)), totalPages);
  const visibleItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Panel tone="dark">
          <div className="space-y-6">
            <div className="space-y-3">
              <Link href={`/u/${activeProfile.handle}`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to profile</Link>
              <div className="flex flex-wrap items-center gap-2"><Badge tone="accent">{activeProfile.displayName}</Badge><Badge tone="muted">Stack archive</Badge></div>
              <h1 className="font-display text-4xl tracking-tight text-sand-50 sm:text-6xl">The working stack, without the scoreboard.</h1>
              <p className="max-w-2xl text-sm leading-7 text-sand-200/80">Browse technologies, tools, and platforms through self-described context instead of calculated rankings.</p>
            </div>
            <form method="get" action={`/u/${activeProfile.handle}/stack`} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_190px_auto]">
              <Input name="q" defaultValue={query} placeholder="Search the stack" aria-label="Search the stack" />
              <Select name="category" defaultValue={category} aria-label="Filter by category"><option value="">All categories</option>{activeProfile.publishedStackCategories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</Select>
              <Select name="status" defaultValue={status} aria-label="Filter by learning status"><option value="">All statuses</option>{Object.entries(learningStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
              <button type="submit" className="rounded-full bg-sand-100 px-5 py-2.5 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200 active:scale-[0.98]">Filter</button>
            </form>
          </div>
        </Panel>

        {visibleItems.length === 0 ? <Panel tone="dark"><EmptyState title={query || category || status ? "No matching technologies" : "No public stack yet"} description={query || category || status ? "Try another technology, category, or learning status." : "Published stack items will appear here when they are ready to share."} /></Panel> : <div className="grid gap-5 md:grid-cols-2">{visibleItems.map((item) => <StackCard key={item.id} item={item} projects={activeProfile.publishedProjects} profileHandle={activeProfile.handle} />)}</div>}

        {totalPages > 1 ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">
          {currentPage > 1 ? <Link href={pageHref(activeProfile.handle, currentPage - 1, query, category, status)} className="rounded-full px-4 py-2 text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">Previous</Link> : <span className="px-4 py-2 text-sand-300/40">Previous</span>}
          <span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages ? <Link href={pageHref(activeProfile.handle, currentPage + 1, query, category, status)} className="rounded-full bg-sand-100 px-4 py-2 font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-sand-200">Next</Link> : <span className="px-4 py-2 text-sand-300/40">Next</span>}
        </div> : null}
      </div>
    </main>
  );
}
