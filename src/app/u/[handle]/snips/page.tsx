import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SnipCard, snipLanguageLabel } from "@/components/snip-detail";
import { Badge, EmptyState, Input, Panel, Select } from "@/components/ui";
import { buildPublicProfileMetadata } from "@/lib/metadata";
import { getPublicProfile } from "@/lib/workspace";
import { siteName } from "@/lib/site";
import { SNIP_LANGUAGES } from "@/types/nodivra";

const PAGE_SIZE = 8;

function pageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function pageHref(handle: string, page: number, query: string, language: string, tag: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  if (language) params.set("language", language);
  if (tag) params.set("tag", tag);
  const suffix = params.toString();
  return `/u/${handle}/snips${suffix ? `?${suffix}` : ""}`;
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) return { title: `${handle} Snips - ${siteName}` };
  const metadata = buildPublicProfileMetadata(profile, handle);
  return { ...metadata, title: `Snips - ${profile.displayName} - ${siteName}` };
}

export default async function PublicSnipsPage({ params, searchParams }: { params: Promise<{ handle: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ handle }, search] = await Promise.all([params, searchParams]);
  const profile = await getPublicProfile(handle);
  if (!profile) notFound();
  const activeProfile = profile ?? notFound();
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const query = (first(search.q) ?? "").trim().slice(0, 64);
  const language = (first(search.language) ?? "").trim().toLowerCase();
  const tag = (first(search.tag) ?? "").trim().toLowerCase().slice(0, 32);
  const activeLanguage = SNIP_LANGUAGES.includes(language as (typeof SNIP_LANGUAGES)[number]) ? language : "";
  const tags = Array.from(new Set(activeProfile.publishedSnippets.flatMap((snip) => snip.tags))).sort();
  const normalizedQuery = query.toLowerCase();
  const filteredSnips = activeProfile.publishedSnippets
    .filter((snip) => {
      const matchesQuery = !normalizedQuery || [snip.title, snip.description, snip.code, snip.language, ...snip.tags].join(" ").toLowerCase().includes(normalizedQuery);
      const matchesLanguage = !activeLanguage || snip.language === activeLanguage;
      const matchesTag = !tag || snip.tags.some((candidate) => candidate.toLowerCase() === tag);
      return matchesQuery && matchesLanguage && matchesTag;
    })
    .sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured) || left.position - right.position);
  const totalPages = Math.max(1, Math.ceil(filteredSnips.length / PAGE_SIZE));
  const currentPage = Math.min(pageNumber(first(search.page)), totalPages);
  const visibleSnips = filteredSnips.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="space-y-6"><Panel tone="dark"><div className="space-y-6"><div className="space-y-3"><Link href={`/u/${activeProfile.handle}`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to profile</Link><div className="flex flex-wrap items-center gap-2"><Badge tone="accent">{activeProfile.displayName}</Badge><Badge tone="muted">Snips archive</Badge></div><h1 className="font-display text-4xl tracking-tight text-sand-50 sm:text-6xl">Small pieces, kept useful.</h1><p className="max-w-2xl text-sm leading-7 text-sand-200/80">Readable code references for patterns, boundaries, and the small details that make systems hold together.</p></div><form method="get" action={`/u/${activeProfile.handle}/snips`} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]"><Input name="q" defaultValue={query} placeholder="Search Snips" aria-label="Search Snips" /><Select name="language" defaultValue={activeLanguage} aria-label="Filter by language"><option value="">All languages</option>{SNIP_LANGUAGES.map((candidate) => <option key={candidate} value={candidate}>{snipLanguageLabel(candidate)}</option>)}</Select><Select name="tag" defaultValue={tag} aria-label="Filter by tag"><option value="">All tags</option>{tags.map((candidate) => <option key={candidate} value={candidate}>{candidate}</option>)}</Select><button type="submit" className="rounded-full bg-sand-100 px-5 py-2.5 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200 active:scale-[0.98]">Filter</button></form></div></Panel>{visibleSnips.length === 0 ? <Panel tone="dark"><EmptyState title={query || activeLanguage || tag ? "No matching Snips" : "No public Snips yet"} description={query || activeLanguage || tag ? "Try another phrase, language, or tag." : "Published code references will appear here when they are ready to share."} /></Panel> : <div className="grid gap-5 md:grid-cols-2">{visibleSnips.map((snip) => <SnipCard key={snip.id} snip={snip} profileHandle={activeProfile.handle} projects={activeProfile.publishedProjects} />)}</div>}{totalPages > 1 ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">{currentPage > 1 ? <Link href={pageHref(activeProfile.handle, currentPage - 1, query, activeLanguage, tag)} className="rounded-full px-4 py-2 text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">Previous</Link> : <span className="px-4 py-2 text-sand-300/40">Previous</span>}<span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Page {currentPage} of {totalPages}</span>{currentPage < totalPages ? <Link href={pageHref(activeProfile.handle, currentPage + 1, query, activeLanguage, tag)} className="rounded-full bg-sand-100 px-4 py-2 font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200">Next</Link> : <span className="px-4 py-2 text-sand-300/40">Next</span>}</div> : null}</div></main>;
}
