import Link from "next/link";
import { ArrowUpRightIcon, ClockIcon, LinkIcon, SparkIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import type {
  ProfileTalkDraft,
  PublicNoteSnapshot,
  PublicProjectSnapshot,
  PublicStackItemSnapshot,
  PublicTalkSnapshot,
  TalkLinkKind,
} from "@/types/nodivra";

export function talkFormatLabel(format: PublicTalkSnapshot["format"]) {
  return format === "livestream" ? "Live stream" : format.charAt(0).toUpperCase() + format.slice(1);
}

export function talkDate(value: string) {
  if (!value) return "Date to be announced";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00.000Z`));
}

export function draftToPublicTalk(talk: ProfileTalkDraft): PublicTalkSnapshot {
  return {
    id: talk.id,
    title: talk.title,
    slug: talk.slug,
    eventName: talk.eventName,
    eventDate: talk.eventDate,
    locationText: talk.locationText,
    format: talk.format,
    role: talk.role,
    summary: talk.summary,
    slidesUrl: talk.slidesUrl,
    recordingUrl: talk.recordingUrl,
    eventUrl: talk.eventUrl,
    coverImageUrl: talk.coverImageUrl,
    tags: talk.tags,
    isFeatured: talk.isFeatured,
    position: talk.position,
    links: talk.links.filter((link) => link.isEnabled).map((link) => ({
      id: link.id,
      kind: link.kind,
      projectId: link.projectId,
      stackItemId: link.stackItemId,
      noteId: link.noteId,
      label: link.label,
      url: link.url,
      position: link.position,
      isEnabled: link.isEnabled,
    })),
  };
}

function linkLabel(kind: TalkLinkKind) {
  return kind === "stack" ? "Stack" : kind.charAt(0).toUpperCase() + kind.slice(1);
}

function TalkLinks({
  talk,
  projects,
  stackItems,
  notes,
  profileHandle,
}: {
  talk: PublicTalkSnapshot;
  projects: PublicProjectSnapshot[];
  stackItems: PublicStackItemSnapshot[];
  notes: PublicNoteSnapshot[];
  profileHandle: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {talk.links.map((link) => {
        const project = projects.find((candidate) => candidate.id === link.projectId);
        const stackItem = stackItems.find((candidate) => candidate.id === link.stackItemId);
        const note = notes.find((candidate) => candidate.id === link.noteId);
        if (link.kind === "project" && project) {
          return <Link key={link.id} href={`/u/${profileHandle}/projects/${project.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"><LinkIcon className="h-3.5 w-3.5" />{link.label || project.projectName}</Link>;
        }
        if (link.kind === "stack" && stackItem) {
          return <Link key={link.id} href={`/u/${profileHandle}/stack#${stackItem.id}`} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"><LinkIcon className="h-3.5 w-3.5" />{link.label || stackItem.technologyName}</Link>;
        }
        if (link.kind === "note" && note) {
          return <Link key={link.id} href={`/u/${profileHandle}/notes/${note.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"><LinkIcon className="h-3.5 w-3.5" />{link.label || note.title}</Link>;
        }
        if (!link.url) return null;
        return <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"><ArrowUpRightIcon className="h-3.5 w-3.5" />{link.label || linkLabel(link.kind)}</a>;
      })}
    </div>
  );
}

function MediaLinks({ talk }: { talk: PublicTalkSnapshot }) {
  const links = [
    [talk.recordingUrl, "Watch recording"],
    [talk.slidesUrl, "View slides"],
    [talk.eventUrl, "Event details"],
  ] as const;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map(([url, label]) => url ? <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2.5 text-sm font-medium text-ink-950 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-sand-200"><ArrowUpRightIcon className="h-3.5 w-3.5" />{label}</a> : null)}
    </div>
  );
}

export function TalkCard({
  talk,
  profileHandle,
  projects = [],
  stackItems = [],
  notes = [],
}: {
  talk: PublicTalkSnapshot;
  profileHandle: string;
  projects?: PublicProjectSnapshot[];
  stackItems?: PublicStackItemSnapshot[];
  notes?: PublicNoteSnapshot[];
}) {
  return (
    <article className="group rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-white/10">
      <div className="h-full overflow-hidden rounded-[1.625rem] bg-ink-950/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {talk.coverImageUrl ? <img src={talk.coverImageUrl} alt="" loading="lazy" className="aspect-[16/8] w-full object-cover opacity-90 transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02] group-hover:opacity-100" /> : <div className="flex aspect-[16/8] items-end bg-[radial-gradient(circle_at_top_left,rgba(224,198,158,0.22),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(95,139,104,0.12))] p-5"><SparkIcon className="h-5 w-5 text-sand-100/80" /></div>}
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-sand-300/70"><ClockIcon className="h-3.5 w-3.5" /><span>{talkDate(talk.eventDate)}</span><span>| {talkFormatLabel(talk.format)}</span></div>
          <div className="flex flex-wrap gap-2">{talk.isFeatured ? <Badge tone="accent">Featured</Badge> : null}{talk.tags.slice(0, 3).map((tag) => <Badge key={tag} tone="muted">{tag}</Badge>)}</div>
          <div className="space-y-3"><h3 className="font-display text-3xl leading-tight tracking-tight text-sand-50"><Link href={`/u/${profileHandle}/talks/${talk.slug}`} className="transition-[color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-sand-200">{talk.title}</Link></h3><p className="text-xs uppercase tracking-[0.16em] text-sand-300/65">{talk.eventName} · {talk.role}</p><p className="text-sm leading-7 text-sand-200/80 sm:text-base">{talk.summary}</p></div>
          {talk.locationText ? <p className="text-sm text-sand-200/70">{talk.locationText}</p> : null}
          <TalkLinks talk={talk} projects={projects} stackItems={stackItems} notes={notes} profileHandle={profileHandle} />
          <Link href={`/u/${profileHandle}/talks/${talk.slug}`} className="inline-flex w-fit items-center gap-2 text-sm text-sand-50 underline decoration-white/20 underline-offset-4 transition-[transform,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-200">View talk <ArrowUpRightIcon className="h-4 w-4" /></Link>
        </div>
      </div>
    </article>
  );
}

export function PublicTalks({
  talks,
  profileHandle,
  projects = [],
  stackItems = [],
  notes = [],
}: {
  talks: PublicTalkSnapshot[];
  profileHandle: string;
  projects?: PublicProjectSnapshot[];
  stackItems?: PublicStackItemSnapshot[];
  notes?: PublicNoteSnapshot[];
}) {
  const visibleTalks = [...talks].sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured) || right.eventDate.localeCompare(left.eventDate) || left.position - right.position).slice(0, 3);
  if (visibleTalks.length === 0) return null;
  return <section className="space-y-8 py-16 sm:py-24" aria-labelledby="talks-heading"><div className="flex flex-wrap items-end justify-between gap-4"><div className="space-y-3"><Badge tone="muted">On the record</Badge><h2 id="talks-heading" className="font-display text-4xl tracking-tight text-sand-50 sm:text-5xl">Ideas, in the room.</h2><p className="max-w-2xl text-sm leading-7 text-sand-200/80">A curated archive of talks, workshops, conversations, and the ideas worth carrying forward.</p></div><Link href={`/u/${profileHandle}/talks`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4 transition-[color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-50">Explore all talks <ArrowUpRightIcon className="h-3.5 w-3.5" /></Link></div><div className="grid gap-5 lg:grid-cols-3">{visibleTalks.map((talk) => <TalkCard key={talk.id} talk={talk} profileHandle={profileHandle} projects={projects} stackItems={stackItems} notes={notes} />)}</div></section>;
}

export function TalkArticle({
  talk,
  projects,
  stackItems,
  notes,
  profileHandle,
  relatedTalks = [],
}: {
  talk: PublicTalkSnapshot;
  projects: PublicProjectSnapshot[];
  stackItems: PublicStackItemSnapshot[];
  notes: PublicNoteSnapshot[];
  profileHandle: string;
  relatedTalks?: PublicTalkSnapshot[];
}) {
  return <article className="space-y-10"><header className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-10"><div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-sand-300/70"><ClockIcon className="h-3.5 w-3.5" /><span>{talkDate(talk.eventDate)}</span><span>| {talkFormatLabel(talk.format)}</span></div><div className="mt-6 flex flex-wrap gap-2">{talk.tags.map((tag) => <Badge key={tag} tone="muted">{tag}</Badge>)}</div><h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.98] tracking-tight text-sand-50 sm:text-7xl">{talk.title}</h1><p className="mt-5 text-xs uppercase tracking-[0.18em] text-sand-300/70">{talk.eventName} · {talk.role}{talk.locationText ? ` · ${talk.locationText}` : ""}</p><p className="mt-6 max-w-3xl text-lg leading-8 text-sand-200/85">{talk.summary}</p>{talk.coverImageUrl ? <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-ink-900 ring-1 ring-white/10"><img src={talk.coverImageUrl} alt="" className="aspect-[16/7] w-full object-cover" /></div> : null}<div className="mt-8"><MediaLinks talk={talk} /></div></div></header><div className="mx-auto max-w-3xl space-y-8"><div><Badge tone="muted">Context</Badge><h2 className="mt-3 font-display text-3xl tracking-tight text-sand-50">Keep following the thread.</h2><p className="mt-3 text-sm leading-7 text-sand-200/80">This appearance connects to the projects, tools, and notes that shaped the conversation.</p></div><TalkLinks talk={talk} projects={projects} stackItems={stackItems} notes={notes} profileHandle={profileHandle} /></div>{relatedTalks.length > 0 ? <aside className="space-y-5"><div className="flex items-end justify-between gap-4"><div><Badge tone="muted">More from the archive</Badge><h2 className="mt-3 font-display text-3xl tracking-tight text-sand-50">Related talks</h2></div><Link href={`/u/${profileHandle}/talks`} className="text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4">All talks</Link></div><div className="grid gap-5 md:grid-cols-2">{relatedTalks.slice(0, 3).map((related) => <TalkCard key={related.id} talk={related} profileHandle={profileHandle} projects={projects} stackItems={stackItems} notes={notes} />)}</div></aside> : null}</article>;
}

export function TalkDetailPreview({ talk }: { talk: PublicTalkSnapshot }) {
  return <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"><Badge tone="accent">Talk preview</Badge><p className="mt-4 text-xs uppercase tracking-[0.18em] text-sand-300/70">{talkDate(talk.eventDate)} · {talkFormatLabel(talk.format)}</p><h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-sand-50">{talk.title}</h2><p className="mt-3 text-xs uppercase tracking-[0.16em] text-sand-300/70">{talk.eventName} · {talk.role}</p><p className="mt-4 text-sm leading-7 text-sand-200/80">{talk.summary}</p></div></div>;
}
