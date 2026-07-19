import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RepositoryCard } from "@/components/repository-detail";
import { Badge, EmptyState, Input, Panel, Select } from "@/components/ui";
import { buildPublicProfileMetadata } from "@/lib/metadata";
import { getPublicProfile } from "@/lib/workspace";
import { siteName } from "@/lib/site";

const PAGE_SIZE = 6;

function pageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function pageHref(handle: string, page: number, query: string, language: string, topic: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  if (language) params.set("language", language);
  if (topic) params.set("topic", topic);
  const suffix = params.toString();
  return `/u/${handle}/repos${suffix ? `?${suffix}` : ""}`;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) return { title: `${handle} repositories · ${siteName}` };
  const metadata = buildPublicProfileMetadata(profile, handle);
  return { ...metadata, title: `Repositories · ${profile.displayName} · ${siteName}` };
}

export default async function PublicRepositoriesPage({
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
  const language = (first(search.language) ?? "").trim().slice(0, 48);
  const topic = (first(search.topic) ?? "").trim().slice(0, 48);
  const normalizedQuery = query.toLowerCase();
  const normalizedLanguage = language.toLowerCase();
  const normalizedTopic = topic.toLowerCase();
  const filteredRepositories = activeProfile.publishedRepositories.filter((repository) => {
    const matchesQuery = !normalizedQuery || [repository.repositoryName, repository.providerLabel, repository.description, repository.framework, ...repository.topics].join(" ").toLowerCase().includes(normalizedQuery);
    const matchesLanguage = !normalizedLanguage || repository.language.toLowerCase() === normalizedLanguage;
    const matchesTopic = !normalizedTopic || repository.topics.some((item) => item.toLowerCase() === normalizedTopic);
    return matchesQuery && matchesLanguage && matchesTopic;
  });
  const totalPages = Math.max(1, Math.ceil(filteredRepositories.length / PAGE_SIZE));
  const currentPage = Math.min(pageNumber(first(search.page)), totalPages);
  const visibleRepositories = filteredRepositories.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const languages = [...new Set(activeProfile.publishedRepositories.map((repository) => repository.language).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  const topics = [...new Set(activeProfile.publishedRepositories.flatMap((repository) => repository.topics))].sort((left, right) => left.localeCompare(right));

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Panel tone="dark">
          <div className="space-y-6">
            <div className="space-y-3">
              <Link href={`/u/${activeProfile.handle}`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to profile</Link>
              <div className="flex flex-wrap items-center gap-2"><Badge tone="accent">{activeProfile.displayName}</Badge><Badge tone="muted">Repository archive</Badge></div>
              <h1 className="font-display text-4xl tracking-tight text-sand-50 sm:text-6xl">Code with enough context to be useful.</h1>
              <p className="max-w-2xl text-sm leading-7 text-sand-200/80">Browse a manually curated set of repositories, with honest labels and no live provider sync.</p>
            </div>
            <form method="get" action={`/u/${activeProfile.handle}/repos`} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
              <Input name="q" defaultValue={query} placeholder="Search repositories" aria-label="Search repositories" />
              <Select name="language" defaultValue={language} aria-label="Filter by language"><option value="">All languages</option>{languages.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
              <Select name="topic" defaultValue={topic} aria-label="Filter by topic"><option value="">All topics</option>{topics.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
              <button type="submit" className="rounded-full bg-sand-100 px-5 py-2.5 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200 active:scale-[0.98]">Filter</button>
            </form>
          </div>
        </Panel>

        {visibleRepositories.length === 0 ? (
          <Panel tone="dark"><EmptyState title={query || language || topic ? "No matching repositories" : "No public repositories yet"} description={query || language || topic ? "Try a different search term, language, or topic." : "Published repositories will appear here when they are ready to share."} /></Panel>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">{visibleRepositories.map((repository) => <RepositoryCard key={repository.id} repository={repository} profileHandle={activeProfile.handle} projects={activeProfile.publishedProjects} />)}</div>
        )}

        {totalPages > 1 ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">
          {currentPage > 1 ? <Link href={pageHref(activeProfile.handle, currentPage - 1, query, language, topic)} className="rounded-full px-4 py-2 text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">Previous</Link> : <span className="px-4 py-2 text-sand-300/40">Previous</span>}
          <span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Page {currentPage} of {totalPages}</span>
          {currentPage < totalPages ? <Link href={pageHref(activeProfile.handle, currentPage + 1, query, language, topic)} className="rounded-full bg-sand-100 px-4 py-2 font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-sand-200">Next</Link> : <span className="px-4 py-2 text-sand-300/40">Next</span>}
        </div> : null}
      </div>
    </main>
  );
}
