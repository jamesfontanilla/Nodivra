import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SnippetArticle } from "@/components/snip-detail";
import { Badge } from "@/components/ui";
import { buildPublicSnipMetadata } from "@/lib/metadata";
import { getPublicSnip } from "@/lib/workspace";
import { siteName } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ handle: string; slug: string }> }): Promise<Metadata> {
  const { handle, slug } = await params;
  const result = await getPublicSnip(handle, slug);
  if (!result) return { title: `${slug} - ${siteName}` };
  return buildPublicSnipMetadata(result.profile, result.snippet);
}

export default async function PublicSnipPage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const result = await getPublicSnip(handle, slug);
  if (!result) notFound();
  const { profile, snippet } = result ?? notFound();
  const relatedSnips = profile.publishedSnippets
    .filter((candidate) => candidate.id !== snippet.id)
    .map((candidate) => ({ snip: candidate, score: candidate.tags.filter((tag) => snippet.tags.includes(tag)).length + (candidate.language === snippet.language ? 1 : 0) }))
    .sort((left, right) => right.score - left.score || left.snip.position - right.snip.position)
    .filter((candidate) => candidate.score > 0)
    .map((candidate) => candidate.snip);

  return <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12"><div className="space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><Link href={`/u/${profile.handle}/snips`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to Snips</Link><div className="flex items-center gap-2"><Badge tone="accent">{profile.displayName}</Badge><Link href={`/u/${profile.handle}`} className="text-xs uppercase tracking-[0.18em] text-sand-300/60 underline decoration-white/20 underline-offset-4">Profile</Link></div></div><SnippetArticle snip={snippet} projects={profile.publishedProjects} profileHandle={profile.handle} relatedSnips={relatedSnips} /></div></main>;
}
