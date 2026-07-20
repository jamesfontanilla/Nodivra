import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TalkArticle } from "@/components/talk-detail";
import { Badge } from "@/components/ui";
import { buildPublicTalkMetadata } from "@/lib/metadata";
import { getPublicTalk } from "@/lib/workspace";
import { siteName } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ handle: string; slug: string }> }): Promise<Metadata> {
  const { handle, slug } = await params;
  const result = await getPublicTalk(handle, slug);
  if (!result) return { title: `${slug} - ${siteName}` };
  return buildPublicTalkMetadata(result.profile, result.talk);
}

export default async function PublicTalkPage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const result = await getPublicTalk(handle, slug);
  if (!result) notFound();
  const { profile, talk } = result ?? notFound();
  const relatedTalks = profile.publishedTalks
    .filter((candidate) => candidate.id !== talk.id)
    .map((candidate) => ({ talk: candidate, score: candidate.tags.filter((tag) => talk.tags.includes(tag)).length + (candidate.format === talk.format ? 1 : 0) }))
    .sort((left, right) => right.score - left.score || right.talk.eventDate.localeCompare(left.talk.eventDate))
    .filter((candidate) => candidate.score > 0)
    .map((candidate) => candidate.talk);

  return <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12"><div className="space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><Link href={`/u/${profile.handle}/talks`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to talks</Link><div className="flex items-center gap-2"><Badge tone="accent">{profile.displayName}</Badge><Link href={`/u/${profile.handle}`} className="text-xs uppercase tracking-[0.18em] text-sand-300/60 underline decoration-white/20 underline-offset-4">Profile</Link></div></div><TalkArticle talk={talk} projects={profile.publishedProjects} stackItems={profile.publishedStackItems} notes={profile.publishedNotes} profileHandle={profile.handle} relatedTalks={relatedTalks} /></div></main>;
}
