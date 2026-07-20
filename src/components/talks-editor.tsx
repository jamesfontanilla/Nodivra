"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, LinkIcon, PlusIcon, SparkIcon, TrashIcon } from "@/components/icons";
import { draftToPublicTalk, TalkDetailPreview, talkDate, talkFormatLabel } from "@/components/talk-detail";
import { cn } from "@/lib/classnames";
import { TALK_FORMATS, TALK_LINK_KINDS, type ProfileNoteDraft, type ProfileProjectDraft, type ProfileStackItemDraft, type ProfileTalkDraft, type TalkLinkDraft, type TalkLinkKind, type TalkFormat } from "@/types/nodivra";
import { Badge, Button, EmptyState, FieldShell, Input, Panel, Select, Textarea } from "@/components/ui";

const MAX_FEATURED_TALKS = 3;

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `00000000-0000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value: string, fallback: string) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function createTalk(profileId: string, position: number): ProfileTalkDraft {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    title: "A talk in progress",
    slug: `talk-${position + 1}`,
    eventName: "Your event",
    eventDate: today(),
    locationText: "",
    format: "conference",
    role: "Speaker",
    summary: "A short, useful summary of the conversation and why it mattered.",
    slidesUrl: "",
    recordingUrl: "",
    eventUrl: "",
    coverImageUrl: "",
    tags: ["systems"],
    isPublished: false,
    isFeatured: false,
    position,
    links: [],
    createdAt: now,
    updatedAt: now,
  };
}

function emptyRelation(kind: TalkLinkKind) {
  return { projectId: "", stackItemId: "", noteId: "", url: kind === "website" || kind === "resource" ? "https://example.com" : "" };
}

export function TalksEditor({
  profileId,
  talks,
  projects,
  stackItems,
  notes,
  onChange,
  fieldErrors,
}: {
  profileId: string;
  talks: ProfileTalkDraft[];
  projects: ProfileProjectDraft[];
  stackItems: ProfileStackItemDraft[];
  notes: ProfileNoteDraft[];
  onChange: (talks: ProfileTalkDraft[]) => void;
  fieldErrors: Record<string, string>;
}) {
  const [selectedTalkId, setSelectedTalkId] = useState<string | null>(talks[0]?.id ?? null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedTalk = talks.find((talk) => talk.id === selectedTalkId) ?? null;
  const selectedIndex = selectedTalk ? talks.findIndex((talk) => talk.id === selectedTalk.id) : -1;

  function update(nextTalks: ProfileTalkDraft[]) {
    onChange(nextTalks.map((talk, position) => ({ ...talk, position })));
  }

  function addTalk() {
    const talk = createTalk(profileId, talks.length);
    setSelectedTalkId(talk.id);
    setMessage(null);
    update([...talks, talk]);
  }

  function patchTalk<K extends keyof ProfileTalkDraft>(id: string, key: K, value: ProfileTalkDraft[K]) {
    update(talks.map((talk) => talk.id === id ? { ...talk, [key]: value, updatedAt: timestamp() } : talk));
  }

  function patchText(id: string, key: keyof Pick<ProfileTalkDraft, "title" | "slug" | "eventName" | "eventDate" | "locationText" | "role" | "summary" | "slidesUrl" | "recordingUrl" | "eventUrl" | "coverImageUrl">, value: string) {
    patchTalk(id, key, key === "slug" ? slugify(value, "talk") : value);
  }

  function patchTags(id: string, value: string) {
    patchTalk(id, "tags", value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 8));
  }

  function setPublished(talk: ProfileTalkDraft, isPublished: boolean) {
    update(talks.map((candidate) => candidate.id === talk.id ? { ...candidate, isPublished, isFeatured: isPublished ? candidate.isFeatured : false, updatedAt: timestamp() } : candidate));
  }

  function toggleFeatured(talk: ProfileTalkDraft) {
    if (!talk.isPublished) {
      setMessage("Publish a talk before featuring it.");
      return;
    }
    if (!talk.isFeatured && talks.filter((candidate) => candidate.isFeatured).length >= MAX_FEATURED_TALKS) {
      setMessage(`Choose ${MAX_FEATURED_TALKS} featured talks or fewer.`);
      return;
    }
    setMessage(null);
    patchTalk(talk.id, "isFeatured", !talk.isFeatured);
  }

  function addLink(talk: ProfileTalkDraft, kind: TalkLinkKind) {
    if (talk.links.length >= 8) {
      setMessage("A talk can have eight links or fewer.");
      return;
    }
    const relation = emptyRelation(kind);
    const now = timestamp();
    const link: TalkLinkDraft = {
      id: createId(), profileId, talkId: talk.id, kind,
      ...relation,
      label: kind === "project" ? "Related project" : kind === "stack" ? "Related tool" : kind === "note" ? "Related note" : kind === "resource" ? "Resource" : "Website",
      position: talk.links.length, isEnabled: true, createdAt: now, updatedAt: now,
    };
    if (kind === "project") link.projectId = projects.find((project) => !talk.links.some((candidate) => candidate.projectId === project.id))?.id ?? "";
    if (kind === "stack") link.stackItemId = stackItems.find((item) => !talk.links.some((candidate) => candidate.stackItemId === item.id))?.id ?? "";
    if (kind === "note") link.noteId = notes.find((note) => !talk.links.some((candidate) => candidate.noteId === note.id))?.id ?? "";
    patchTalk(talk.id, "links", [...talk.links, link]);
  }

  function patchLink(talkId: string, linkId: string, key: keyof Pick<TalkLinkDraft, "projectId" | "stackItemId" | "noteId" | "label" | "url" | "isEnabled">, value: string | boolean) {
    const talk = talks.find((candidate) => candidate.id === talkId);
    if (!talk) return;
    patchTalk(talkId, "links", talk.links.map((link) => link.id === linkId ? { ...link, [key]: value, updatedAt: timestamp() } as TalkLinkDraft : link));
  }

  function removeLink(talkId: string, linkId: string) {
    const talk = talks.find((candidate) => candidate.id === talkId);
    if (!talk) return;
    patchTalk(talkId, "links", talk.links.filter((link) => link.id !== linkId).map((link, position) => ({ ...link, position })));
  }

  function moveTalk(id: string, direction: "up" | "down") {
    const index = talks.findIndex((talk) => talk.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= talks.length) return;
    const next = [...talks];
    const [selected] = next.splice(index, 1);
    next.splice(target, 0, selected!);
    update(next);
  }

  function removeTalk(id: string) {
    setSelectedTalkId((current) => current === id ? null : current);
    update(talks.filter((talk) => talk.id !== id));
  }

  return <div className="space-y-6"><Panel tone="dark"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div className="space-y-3"><Badge tone="accent">Nodivra Talks</Badge><h2 className="font-display text-3xl tracking-tight text-sand-50 sm:text-4xl">Put the ideas in context.</h2><p className="max-w-2xl text-sm leading-7 text-sand-200/80">Curate the rooms, conversations, and appearances that help people understand how you think. Nothing is hosted here; every media link stays an intentional outbound reference.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant={showPreview ? "primary" : "secondary"} onClick={() => setShowPreview((value) => !value)}>{showPreview ? "Hide preview" : "Preview talk"}</Button><Button type="button" variant="secondary" onClick={addTalk} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>New talk</Button></div></div><div className="mt-5 flex flex-wrap items-center gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 ring-1 ring-white/10"><SparkIcon className="h-4 w-4 text-sand-200/75" /><span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Draft sync</span><span className="text-sm text-sand-200/75">Private until saved or deliberately published.</span><Badge tone={message ? "danger" : "muted"}>{message ?? "Ready to save"}</Badge></div>{fieldErrors.talks ? <p className="mt-4 rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-300/30">{fieldErrors.talks}</p> : null}</Panel>{showPreview && selectedTalk ? <TalkDetailPreview talk={draftToPublicTalk(selectedTalk)} /> : null}{talks.length === 0 ? <EmptyState title="Start the speaking archive" description="Add a public appearance when you have a clear title, event date, and useful context." action={<Button type="button" variant="secondary" onClick={addTalk} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add your first talk</Button>} /> : <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start"><div className="space-y-4">{talks.map((talk, index) => <article key={talk.id} className={cn("rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[background-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]", selectedTalkId === talk.id && "bg-sand-100/10")}><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6"><div className="flex flex-col gap-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-950"><SparkIcon className="h-4 w-4" /></div><div className="min-w-0 flex-1 space-y-3"><div className="flex flex-wrap items-center gap-2"><Badge tone={talk.isPublished ? "success" : "muted"}>{talk.isPublished ? "Published" : "Draft"}</Badge>{talk.isFeatured ? <Badge tone="accent">Featured</Badge> : null}<Badge tone="muted">{talkFormatLabel(talk.format)}</Badge><Badge tone="muted">{talkDate(talk.eventDate)}</Badge></div><div><h3 className="font-display text-2xl tracking-tight text-sand-50">{talk.title}</h3><p className="mt-2 text-sm leading-7 text-sand-200/75">{talk.eventName} · {talk.role}</p></div></div></div><div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4"><Button type="button" variant={selectedTalkId === talk.id ? "primary" : "secondary"} onClick={() => setSelectedTalkId(talk.id)}>{selectedTalkId === talk.id ? "Editing" : "Edit talk"}</Button><Button type="button" variant="ghost" onClick={() => moveTalk(talk.id, "up")} disabled={index === 0} trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}>Up</Button><Button type="button" variant="ghost" onClick={() => moveTalk(talk.id, "down")} disabled={index === talks.length - 1} trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}>Down</Button><Button type="button" variant="ghost" onClick={() => toggleFeatured(talk)}>{talk.isFeatured ? "Unfeature" : "Feature"}</Button><Button type="button" variant="ghost" onClick={() => setPublished(talk, !talk.isPublished)}>{talk.isPublished ? "Unpublish" : "Publish"}</Button><Button type="button" variant="danger" onClick={() => removeTalk(talk.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button></div></div></div></article>)}</div><aside className="lg:sticky lg:top-6"><div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">{selectedTalk ? <div className="space-y-5"><div><p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sand-300/70">Talk settings</p><h3 className="mt-2 font-display text-2xl tracking-tight text-sand-50">{selectedTalk.title}</h3><p className="mt-2 text-xs leading-6 text-sand-300/70">Keep the entry specific. The archive works best when the event, date, and point of view are easy to scan.</p></div><div className="space-y-5 border-t border-white/10 pt-5"><FieldShell label="Title" error={fieldErrors[`talks.${selectedIndex}.title`]}><Input value={selectedTalk.title} onChange={(event) => patchText(selectedTalk.id, "title", event.target.value)} /></FieldShell><FieldShell label="Slug" hint="Used in the public talk URL." error={fieldErrors[`talks.${selectedIndex}.slug`]}><Input value={selectedTalk.slug} onChange={(event) => patchText(selectedTalk.id, "slug", event.target.value)} /></FieldShell><FieldShell label="Event name" error={fieldErrors[`talks.${selectedIndex}.eventName`]}><Input value={selectedTalk.eventName} onChange={(event) => patchText(selectedTalk.id, "eventName", event.target.value)} /></FieldShell><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Event date" error={fieldErrors[`talks.${selectedIndex}.eventDate`]}><Input type="date" value={selectedTalk.eventDate} onChange={(event) => patchText(selectedTalk.id, "eventDate", event.target.value)} /></FieldShell><FieldShell label="Format"><Select value={selectedTalk.format} onChange={(event) => patchTalk(selectedTalk.id, "format", event.target.value as TalkFormat)}>{TALK_FORMATS.map((format) => <option key={format} value={format}>{talkFormatLabel(format)}</option>)}</Select></FieldShell></div><FieldShell label="Role"><Input value={selectedTalk.role} onChange={(event) => patchText(selectedTalk.id, "role", event.target.value)} /></FieldShell><FieldShell label="Location" hint="Optional city, venue, or remote note."><Input value={selectedTalk.locationText} onChange={(event) => patchText(selectedTalk.id, "locationText", event.target.value)} /></FieldShell><FieldShell label="Summary" hint="600 characters or fewer." error={fieldErrors[`talks.${selectedIndex}.summary`]}><Textarea value={selectedTalk.summary} onChange={(event) => patchText(selectedTalk.id, "summary", event.target.value)} /></FieldShell><FieldShell label="Tags" hint="Comma-separated, up to eight."><Input value={selectedTalk.tags.join(", ")} onChange={(event) => patchTags(selectedTalk.id, event.target.value)} /></FieldShell><FieldShell label="Cover image URL" hint="Optional, safe https image URL."><Input value={selectedTalk.coverImageUrl} onChange={(event) => patchText(selectedTalk.id, "coverImageUrl", event.target.value)} /></FieldShell><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Recording URL" hint="Optional outbound link."><Input value={selectedTalk.recordingUrl} onChange={(event) => patchText(selectedTalk.id, "recordingUrl", event.target.value)} /></FieldShell><FieldShell label="Slides URL" hint="Optional outbound link."><Input value={selectedTalk.slidesUrl} onChange={(event) => patchText(selectedTalk.id, "slidesUrl", event.target.value)} /></FieldShell><FieldShell label="Event URL" hint="Optional outbound link."><Input value={selectedTalk.eventUrl} onChange={(event) => patchText(selectedTalk.id, "eventUrl", event.target.value)} /></FieldShell></div><div className="space-y-3 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Related context</p><p className="mt-1 text-xs text-sand-300/60">Connect published work, tools, notes, or a safe external reference.</p></div><div className="flex flex-wrap justify-end gap-2">{TALK_LINK_KINDS.map((kind) => <Button key={kind} type="button" variant="ghost" onClick={() => addLink(selectedTalk, kind)}><LinkIcon className="mr-1 h-3.5 w-3.5" />{kind}</Button>)}</div></div>{selectedTalk.links.map((link, linkIndex) => <div key={link.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-3"><div className="flex items-center justify-between gap-3"><Badge tone="muted">{link.kind}</Badge><Button type="button" variant="ghost" onClick={() => removeLink(selectedTalk.id, link.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Remove</Button></div>{link.kind === "project" ? <FieldShell label="Project" error={fieldErrors[`talks.${selectedIndex}.links.${linkIndex}.projectId`]}><Select value={link.projectId} onChange={(event) => patchLink(selectedTalk.id, link.id, "projectId", event.target.value)}><option value="">Choose a Project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}</Select></FieldShell> : link.kind === "stack" ? <FieldShell label="Stack item" error={fieldErrors[`talks.${selectedIndex}.links.${linkIndex}.stackItemId`]}><Select value={link.stackItemId} onChange={(event) => patchLink(selectedTalk.id, link.id, "stackItemId", event.target.value)}><option value="">Choose a Stack item</option>{stackItems.map((item) => <option key={item.id} value={item.id}>{item.technologyName}</option>)}</Select></FieldShell> : link.kind === "note" ? <FieldShell label="Note" error={fieldErrors[`talks.${selectedIndex}.links.${linkIndex}.noteId`]}><Select value={link.noteId} onChange={(event) => patchLink(selectedTalk.id, link.id, "noteId", event.target.value)}><option value="">Choose a Note</option>{notes.map((note) => <option key={note.id} value={note.id}>{note.title}</option>)}</Select></FieldShell> : <FieldShell label="Label"><Input value={link.label} onChange={(event) => patchLink(selectedTalk.id, link.id, "label", event.target.value)} /></FieldShell>}{link.kind === "website" || link.kind === "resource" ? <FieldShell label="URL" hint="http or https only." error={fieldErrors[`talks.${selectedIndex}.links.${linkIndex}.url`]}><Input value={link.url} onChange={(event) => patchLink(selectedTalk.id, link.id, "url", event.target.value)} /></FieldShell> : null}<label className="flex items-center gap-2 text-xs text-sand-200/75"><input type="checkbox" checked={link.isEnabled} onChange={(event) => patchLink(selectedTalk.id, link.id, "isEnabled", event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent text-sand-100 focus:ring-sand-200/20" />Show this link publicly</label></div>)}</div><div className="flex flex-wrap gap-2"><Button type="button" variant={selectedTalk.isFeatured ? "primary" : "secondary"} onClick={() => toggleFeatured(selectedTalk)}>{selectedTalk.isFeatured ? "Featured talk" : "Mark featured"}</Button><Button type="button" variant={selectedTalk.isPublished ? "primary" : "secondary"} onClick={() => setPublished(selectedTalk, !selectedTalk.isPublished)}>{selectedTalk.isPublished ? "Published talk" : "Keep private"}</Button></div></div></div> : <div className="space-y-4"><Badge tone="muted">Talk settings</Badge><h3 className="font-display text-2xl tracking-tight text-sand-50">Select a talk to edit it.</h3><p className="text-sm leading-7 text-sand-200/80">The archive should feel like a trail of ideas, not a list of appearances.</p></div>}</div></div></aside></div>}</div>;
}
