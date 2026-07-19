import Link from "next/link";
import { ArrowUpRightIcon, LinkIcon, SparkIcon } from "@/components/icons";
import { SafeMarkdown } from "@/components/safe-markdown";
import { Badge, Divider } from "@/components/ui";
import { sortNotes } from "@/lib/snapshot";
import type {
  NoteLinkKind,
  ProfileNoteDraft,
  PublicNoteSnapshot,
  PublicProjectSnapshot,
} from "@/types/nodivra";

function noteDate(value: string) {
  if (!value) return "Undated note";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00.000Z`));
}

function noteKindLabel(kind: NoteLinkKind) {
  return kind === "project" ? "Project" : kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function draftToPublicNote(note: ProfileNoteDraft): PublicNoteSnapshot {
  return {
    id: note.id,
    title: note.title,
    slug: note.slug,
    excerpt: note.excerpt,
    bodyMarkdown: note.bodyMarkdown,
    coverImageUrl: note.coverImageUrl,
    tags: note.tags,
    publishedAt: note.publishedAt,
    readingTimeText: note.readingTimeText,
    canonicalUrl: note.canonicalUrl,
    isFeatured: note.isFeatured,
    position: note.position,
    links: note.links.filter((link) => link.isEnabled).map((link) => ({
      id: link.id,
      kind: link.kind,
      projectId: link.projectId,
      label: link.label,
      url: link.url,
      position: link.position,
      isEnabled: link.isEnabled,
    })),
  };
}

function NoteLinks({ note, projects, profileHandle }: { note: PublicNoteSnapshot; projects: PublicProjectSnapshot[]; profileHandle?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {note.links.map((link) => {
        const project = projects.find((candidate) => candidate.id === link.projectId);
        if (link.kind === "project" && project && profileHandle) {
          return <Link key={link.id} href={`/u/${profileHandle}/projects/${project.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"><LinkIcon className="h-3.5 w-3.5" />{link.label || project.projectName}</Link>;
        }
        if (!link.url) return null;
        return <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"><ArrowUpRightIcon className="h-3.5 w-3.5" />{link.label || noteKindLabel(link.kind)}</a>;
      })}
    </div>
  );
}

export function NoteCard({ note, profileHandle }: { note: PublicNoteSnapshot; profileHandle: string }) {
  return (
    <article className="group rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-white/10">
      <div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-7">
        {note.coverImageUrl ? <div className="mb-6 overflow-hidden rounded-[1.35rem] bg-ink-900 ring-1 ring-white/10"><img src={note.coverImageUrl} alt="" loading="lazy" className="aspect-[16/8] w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02]" /></div> : null}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-sand-300/70"><SparkIcon className="h-3.5 w-3.5" /><span>{noteDate(note.publishedAt)}</span>{note.readingTimeText ? <span>| {note.readingTimeText}</span> : null}</div>
          <div className="space-y-3"><div className="flex flex-wrap gap-2">{note.isFeatured ? <Badge tone="accent">Featured note</Badge> : null}{note.tags.slice(0, 3).map((tag) => <Badge key={tag} tone="muted">{tag}</Badge>)}</div><h3 className="font-display text-3xl leading-tight tracking-tight text-sand-50 sm:text-4xl"><Link href={`/u/${profileHandle}/notes/${note.slug}`} className="transition-[color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-sand-200">{note.title}</Link></h3><p className="max-w-2xl text-sm leading-7 text-sand-200/80 sm:text-base">{note.excerpt}</p></div>
          <Link href={`/u/${profileHandle}/notes/${note.slug}`} className="inline-flex w-fit items-center gap-2 text-sm text-sand-50 underline decoration-white/20 underline-offset-4 transition-[transform,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-200">Read note <ArrowUpRightIcon className="h-4 w-4" /></Link>
        </div>
      </div>
    </article>
  );
}

export function PublicNotes({ notes, profileHandle }: { notes: PublicNoteSnapshot[]; profileHandle: string }) {
  const visibleNotes = sortNotes(notes).slice(0, 4);
  if (visibleNotes.length === 0) return null;
  return (
    <section className="space-y-8 py-16 sm:py-24" aria-labelledby="notes-heading">
      <div className="flex flex-wrap items-end justify-between gap-4"><div className="space-y-3"><Badge tone="muted">The notebook</Badge><h2 id="notes-heading" className="font-display text-4xl tracking-tight text-sand-50 sm:text-5xl">Ideas worth leaving open.</h2><p className="max-w-2xl text-sm leading-7 text-sand-200/80">Working notes on product systems, developer experience, and the choices behind the work.</p></div><Link href={`/u/${profileHandle}/notes`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4 transition-[color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-50">Explore all notes <ArrowUpRightIcon className="h-3.5 w-3.5" /></Link></div>
      <div className="grid gap-5 lg:grid-cols-2">{visibleNotes.map((note) => <NoteCard key={note.id} note={note} profileHandle={profileHandle} />)}</div>
    </section>
  );
}

export function NoteArticle({ note, projects, profileHandle, relatedNotes = [] }: { note: PublicNoteSnapshot; projects: PublicProjectSnapshot[]; profileHandle: string; relatedNotes?: PublicNoteSnapshot[] }) {
  return (
    <article className="space-y-10">
      <header className="space-y-6 rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-10"><div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-sand-300/70"><SparkIcon className="h-3.5 w-3.5" /><span>{noteDate(note.publishedAt)}</span>{note.readingTimeText ? <span>| {note.readingTimeText}</span> : null}</div><div className="mt-6 flex flex-wrap gap-2">{note.tags.map((tag) => <Badge key={tag} tone="muted">{tag}</Badge>)}</div><h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.98] tracking-tight text-sand-50 sm:text-7xl">{note.title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-sand-200/85">{note.excerpt}</p>{note.coverImageUrl ? <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-ink-900 ring-1 ring-white/10"><img src={note.coverImageUrl} alt="" className="aspect-[16/7] w-full object-cover" /></div> : null}</div></header>
      <div className="mx-auto max-w-3xl"><SafeMarkdown markdown={note.bodyMarkdown} className="space-y-6 text-base leading-8 text-sand-100/90 sm:text-lg" />{note.links.length > 0 ? <><Divider className="my-10" /><NoteLinks note={note} projects={projects} profileHandle={profileHandle} /></> : null}</div>
      {relatedNotes.length > 0 ? <aside className="space-y-5"><div className="flex items-end justify-between gap-4"><div><Badge tone="muted">Keep reading</Badge><h2 className="mt-3 font-display text-3xl tracking-tight text-sand-50">Related notes</h2></div><Link href={`/u/${profileHandle}/notes`} className="text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4">All notes</Link></div><div className="grid gap-5 md:grid-cols-2">{relatedNotes.slice(0, 3).map((related) => <NoteCard key={related.id} note={related} profileHandle={profileHandle} />)}</div></aside> : null}
    </article>
  );
}

export function NoteDetailPreview({ note }: { note: PublicNoteSnapshot }) {
  return <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"><Badge tone="accent">Preview</Badge><h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-sand-50">{note.title}</h2><p className="mt-4 text-sm leading-7 text-sand-200/80">{note.excerpt}</p><Divider className="my-6" /><SafeMarkdown markdown={note.bodyMarkdown} className="space-y-5 text-sm leading-7 text-sand-100/90" /></div></div>;
}
