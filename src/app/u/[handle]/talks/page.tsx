import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TalkCard, talkFormatLabel } from "@/components/talk-detail";
import { Badge, EmptyState, Input, Panel, Select } from "@/components/ui";
import { buildPublicProfileMetadata } from "@/lib/metadata";
import { getPublicProfile } from "@/lib/workspace";
import { siteName } from "@/lib/site";
import { TALK_FORMATS } from "@/types/nodivra";

const PAGE_SIZE = 8;

function pageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function pageHref(handle: string, page: number, query: string, format: string, year: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  if (format) params.set("format", format);
  if (year) params.set("year", year);
  const suffix = params.toString();
  return `/u/${handle}/talks${suffix ? `?${suffix}` : ""}`;
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) return { title: `${handle} talks - ${siteName}` };
  const metadata = buildPublicProfileMetadata(profile, handle);
  return { ...metadata, title: `Talks - ${profile.displayName} - ${siteName}` };
}

export default async function PublicTalksPage({ params, searchParams }: { params: Promise<{ handle: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ handle }, search] = await Promise.all([params, searchParams]);
  const profile = await getPublicProfile(handle);
  if (!profile) notFound();
  const activeProfile = profile ?? notFound();
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const query = (first(search.q) ?? "").trim().slice(0, 64);
  const format = (first(search.format) ?? "").trim().toLowerCase();
  const year = (first(search.year) ?? "").trim().slice(0, 4);
  const activeFormat = TALK_FORMATS.includes(format as (typeof TALK_FORMATS)[number]) ? format : "";
  const years = Array.from(new Set(activeProfile.publishedTalks.map((talk) => talk.eventDate.slice(0, 4)).filter(Boolean))).sort().reverse();
  const normalizedQuery = query.toLowerCase();
  const filteredTalks = activeProfile.publishedTalks
    .filter((talk) => {
      const matchesQuery = !normalizedQuery || [talk.title, talk.eventName, talk.role, talk.summary, talk.locationText, ...talk.tags].join(" ").toLowerCase().includes(normalizedQuery);
      const matchesFormat = !activeFormat || talk.format === activeFormat;
      const matchesYear = !year || talk.eventDate.startsWith(year);
      return matchesQuery && matchesFormat && matchesYear;
    })
    .sort((left, right) => right.eventDate.localeCompare(left.eventDate) || left.position - right.position);
  const totalPages = Math.max(1, Math.ceil(filteredTalks.length / PAGE_SIZE));
  const currentPage = Math.min(pageNumber(first(search.page)), totalPages);
  const visibleTalks = filteredTalks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const groups = visibleTalks.reduce<Record<string, typeof visibleTalks>>((result, talk) => {
    const key = talk.eventDate.slice(0, 4) || "Undated";
    (result[key] ??= []).push(talk);
    return result;
  }, {});

  return <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="space-y-6"><Panel tone="dark"><div className="space-y-6"><div className="space-y-3"><Link href={`/u/${activeProfile.handle}`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to profile</Link><div className="flex flex-wrap items-center gap-2"><Badge tone="accent">{activeProfile.displayName}</Badge><Badge tone="muted">Talks archive</Badge></div><h1 className="font-display text-4xl tracking-tight text-sand-50 sm:text-6xl">Ideas, in the room.</h1><p className="max-w-2xl text-sm leading-7 text-sand-200/80">A timeline of talks, workshops, conversations, and the contexts that made them worth sharing.</p></div><form method="get" action={`/u/${activeProfile.handle}/talks`} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px_auto]"><Input name="q" defaultValue={query} placeholder="Search talks" aria-label="Search talks" /><Select name="format" defaultValue={activeFormat} aria-label="Filter by format"><option value="">All formats</option>{TALK_FORMATS.map((candidate) => <option key={candidate} value={candidate}>{talkFormatLabel(candidate)}</option>)}</Select><Select name="year" defaultValue={year} aria-label="Filter by year"><option value="">All years</option>{years.map((candidate) => <option key={candidate} value={candidate}>{candidate}</option>)}</Select><button type="submit" className="rounded-full bg-sand-100 px-5 py-2.5 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200 active:scale-[0.98]">Filter</button></form></div></Panel>{visibleTalks.length === 0 ? <Panel tone="dark"><EmptyState title={query || activeFormat || year ? "No matching talks" : "No public talks yet"} description={query || activeFormat || year ? "Try another phrase, format, or year." : "Published appearances will appear here when they are ready to share."} /></Panel> : <div className="space-y-12">{Object.entries(groups).map(([group, groupTalks]) => <section key={group} className="space-y-5" aria-labelledby={`talk-year-${group}`}><div className="flex items-center gap-4"><p id={`talk-year-${group}`} className="font-display text-4xl tracking-tight text-sand-50">{group}</p><span className="h-px flex-1 bg-white/10" /><span className="text-xs uppercase tracking-[0.18em] text-sand-300/60">{groupTalks.length} {groupTalks.length === 1 ? "appearance" : "appearances"}</span></div><div className="grid gap-5 md:grid-cols-2">{groupTalks.map((talk) => <TalkCard key={talk.id} talk={talk} profileHandle={activeProfile.handle} projects={activeProfile.publishedProjects} stackItems={activeProfile.publishedStackItems} notes={activeProfile.publishedNotes} />)}</div></section>)}</div>}{totalPages > 1 ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">{currentPage > 1 ? <Link href={pageHref(activeProfile.handle, currentPage - 1, query, activeFormat, year)} className="rounded-full px-4 py-2 text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10">Previous</Link> : <span className="px-4 py-2 text-sand-300/40">Previous</span>}<span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Page {currentPage} of {totalPages}</span>{currentPage < totalPages ? <Link href={pageHref(activeProfile.handle, currentPage + 1, query, activeFormat, year)} className="rounded-full bg-sand-100 px-4 py-2 font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-sand-200">Next</Link> : <span className="px-4 py-2 text-sand-300/40">Next</span>}</div> : null}</div></main>;
}
