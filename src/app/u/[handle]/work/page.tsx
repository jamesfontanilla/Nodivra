import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceCard, workAvailabilityLabel } from "@/components/work-detail";
import { Badge, EmptyState, Input, Panel, Select } from "@/components/ui";
import { buildPublicProfileMetadata } from "@/lib/metadata";
import { getPublicProfile } from "@/lib/workspace";
import { siteName } from "@/lib/site";
import { WORK_AVAILABILITY_STATUSES } from "@/types/nodivra";

const PAGE_SIZE = 8;

function pageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function pageHref(handle: string, page: number, query: string, status: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  if (status) params.set("status", status);
  const suffix = params.toString();
  return `/u/${handle}/work${suffix ? `?${suffix}` : ""}`;
}

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) return { title: `${handle} Work - ${siteName}` };
  const metadata = buildPublicProfileMetadata(profile, handle);
  return { ...metadata, title: `Work - ${profile.displayName} - ${siteName}` };
}

export default async function PublicWorkPage({ params, searchParams }: { params: Promise<{ handle: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ handle }, search] = await Promise.all([params, searchParams]);
  const profile = await getPublicProfile(handle);
  if (!profile) notFound();
  const activeProfile = profile ?? notFound();
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const query = (first(search.q) ?? "").trim().slice(0, 64);
  const rawStatus = (first(search.status) ?? "").trim();
  const status = WORK_AVAILABILITY_STATUSES.includes(rawStatus as (typeof WORK_AVAILABILITY_STATUSES)[number]) ? rawStatus : "";
  const normalizedQuery = query.toLowerCase();
  const filtered = activeProfile.publishedServices.filter((service) => {
    const matchesQuery = !normalizedQuery || [service.title, service.description, service.startingPriceText, service.deliveryTimeText, ...service.skills].join(" ").toLowerCase().includes(normalizedQuery);
    return matchesQuery && (!status || service.availabilityStatus === status);
  }).sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured) || left.position - right.position);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(pageNumber(first(search.page)), totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="space-y-6"><Panel tone="dark"><div className="space-y-6"><div className="space-y-3"><Link href={`/u/${activeProfile.handle}`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to profile</Link><div className="flex flex-wrap items-center gap-2"><Badge tone="accent">{activeProfile.displayName}</Badge><Badge tone="muted">Work archive</Badge>{activeProfile.publishedAvailability ? <Badge tone="success">{workAvailabilityLabel(activeProfile.publishedAvailability.status)}</Badge> : null}</div><h1 className="font-display text-4xl tracking-tight text-sand-50 sm:text-6xl">Useful work, clearly scoped.</h1><p className="max-w-2xl text-sm leading-7 text-sand-200/80">A bounded shelf of services, working styles, and useful next conversations.</p></div><form method="get" action={`/u/${activeProfile.handle}/work`} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px_auto]"><Input name="q" defaultValue={query} placeholder="Search services" aria-label="Search services" /><Select name="status" defaultValue={status} aria-label="Filter by availability"><option value="">All availability</option>{WORK_AVAILABILITY_STATUSES.map((candidate) => <option key={candidate} value={candidate}>{workAvailabilityLabel(candidate)}</option>)}</Select><button type="submit" className="rounded-full bg-sand-100 px-5 py-2.5 text-sm font-medium text-ink-950 hover:bg-sand-200">Filter</button></form></div></Panel>{visible.length === 0 ? <Panel tone="dark"><EmptyState title={query || status ? "No matching services" : "No public Work yet"} description={query || status ? "Try another phrase or availability status." : "Published services will appear here when they are ready to share."} /></Panel> : <div className="grid gap-5 md:grid-cols-2">{visible.map((service) => <ServiceCard key={service.id} service={service} profileHandle={activeProfile.handle} projects={activeProfile.publishedProjects} />)}</div>}{totalPages > 1 ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">{currentPage > 1 ? <Link href={pageHref(activeProfile.handle, currentPage - 1, query, status)} className="rounded-full px-4 py-2 text-sand-100 ring-1 ring-white/10 hover:bg-white/10">Previous</Link> : <span className="px-4 py-2 text-sand-300/40">Previous</span>}<span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Page {currentPage} of {totalPages}</span>{currentPage < totalPages ? <Link href={pageHref(activeProfile.handle, currentPage + 1, query, status)} className="rounded-full bg-sand-100 px-4 py-2 font-medium text-ink-950 hover:bg-sand-200">Next</Link> : <span className="px-4 py-2 text-sand-300/40">Next</span>}</div> : null}</div></main>;
}
