import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteArticle } from "@/components/note-detail";
import { Badge } from "@/components/ui";
import { buildPublicNoteMetadata } from "@/lib/metadata";
import { getPublicNote } from "@/lib/workspace";
import { siteName } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ handle: string; slug: string }> }): Promise<Metadata> {
  const { handle, slug } = await params;
  const result = await getPublicNote(handle, slug);
  if (!result) return { title: `${slug} - ${siteName}` };
  return buildPublicNoteMetadata(result.profile, result.note);
}

export default async function PublicNotePage({ params }: { params: Promise<{ handle: string; slug: string }> }) {
  const { handle, slug } = await params;
  const result = await getPublicNote(handle, slug);
  if (!result) notFound();
  const { profile, note } = result ?? notFound();
  const relatedNotes = profile.publishedNotes
    .filter((candidate) => candidate.id !== note.id)
    .map((candidate) => ({
      note: candidate,
      score: candidate.tags.filter((tag) => note.tags.includes(tag)).length,
    }))
    .sort((left, right) => right.score - left.score || left.note.position - right.note.position)
    .filter((candidate) => candidate.score > 0)
    .map((candidate) => candidate.note);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
      <div className="space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><Link href={`/u/${profile.handle}/notes`} className="text-xs uppercase tracking-[0.2em] text-sand-300/70 underline decoration-white/20 underline-offset-4">Back to notes</Link><div className="flex items-center gap-2"><Badge tone="accent">{profile.displayName}</Badge><Link href={`/u/${profile.handle}`} className="text-xs uppercase tracking-[0.18em] text-sand-300/60 underline decoration-white/20 underline-offset-4">Profile</Link></div></div><NoteArticle note={note} projects={profile.publishedProjects} profileHandle={profile.handle} relatedNotes={relatedNotes} /></div>
    </main>
  );
}
