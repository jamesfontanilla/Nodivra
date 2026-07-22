import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceArticle } from "@/components/work-detail";
import { Badge } from "@/components/ui";
import { buildPublicWorkMetadata } from "@/lib/metadata";
import { getPublicWorkService } from "@/lib/workspace";
import { siteName } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ handle: string; slug: string }> }): Promise<Metadata> {
  const { handle, slug } = await params;
  const result = await getPublicWorkService(handle, slug);
  if (!result) return { title: `${slug} - ${siteName}` };
  return buildPublicWorkMetadata(result.profile, result.service);
}

export default async function PublicWorkDetailPage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const result = await getPublicWorkService(handle, slug);
  if (!result) notFound();
  const { profile, service } = result ?? notFound();
  const relatedServices = profile.publishedServices.filter((candidate) => candidate.id !== service.id).map((candidate) => ({ service: candidate, score: candidate.skills.filter((skill) => service.skills.includes(skill)).length })).sort((left, right) => right.score - left.score || left.service.position - right.service.position).map((candidate) => candidate.service);
  return <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12"><div className="space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><Link href={`/u/${profile.handle}/work`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to Work</Link><div className="flex items-center gap-2"><Badge tone="accent">{profile.displayName}</Badge><Link href={`/u/${profile.handle}`} className="text-xs uppercase tracking-[0.18em] text-sand-300/60 underline decoration-white/20 underline-offset-4">Profile</Link></div></div><ServiceArticle service={service} projects={profile.publishedProjects} profileHandle={profile.handle} relatedServices={relatedServices} /></div></main>;
}
