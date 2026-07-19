"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, LinkIcon, PlusIcon, SparkIcon, TrashIcon } from "@/components/icons";
import { NoteDetailPreview, draftToPublicNote } from "@/components/note-detail";
import { cn } from "@/lib/classnames";
import { NOTE_LINK_KINDS, type NoteLinkDraft, type NoteLinkKind, type ProfileNoteDraft, type ProfileProjectDraft } from "@/types/nodivra";
import { Badge, Button, EmptyState, FieldShell, Input, Panel, Select, Textarea } from "@/components/ui";

const MAX_FEATURED_NOTES = 3;

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

function createNote(profileId: string, position: number): ProfileNoteDraft {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    title: "A note in progress",
    slug: `note-${position + 1}`,
    excerpt: "A clear introduction to the idea, decision, or question this note explores.",
    bodyMarkdown: "## The idea\n\nWrite the useful part first. Keep the shape of the argument human and the scope intentionally small.",
    coverImageUrl: "",
    tags: ["field note"],
    publishedAt: "",
    readingTimeText: "3 min read",
    canonicalUrl: "",
    isPublished: false,
    isFeatured: false,
    position,
    links: [],
    createdAt: now,
    updatedAt: now,
  };
}

function linkLabel(kind: NoteLinkKind) {
  return kind === "repository" ? "Repository" : kind === "resource" ? "Resource" : "Website";
}

export function NotesEditor({ profileId, notes, projects, onChange, fieldErrors }: { profileId: string; notes: ProfileNoteDraft[]; projects: ProfileProjectDraft[]; onChange: (notes: ProfileNoteDraft[]) => void; fieldErrors: Record<string, string> }) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id ?? null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;
  const selectedIndex = selectedNote ? notes.findIndex((note) => note.id === selectedNote.id) : -1;

  function update(nextNotes: ProfileNoteDraft[]) {
    onChange(nextNotes.map((note, position) => ({ ...note, position })));
  }

  function addNote() {
    const note = createNote(profileId, notes.length);
    setSelectedNoteId(note.id);
    setMessage(null);
    update([...notes, note]);
  }

  function patchNote<K extends keyof ProfileNoteDraft>(id: string, key: K, value: ProfileNoteDraft[K]) {
    update(notes.map((note) => note.id === id ? { ...note, [key]: value, updatedAt: timestamp() } : note));
  }

  function patchText(id: string, key: keyof Pick<ProfileNoteDraft, "title" | "slug" | "excerpt" | "bodyMarkdown" | "coverImageUrl" | "publishedAt" | "readingTimeText" | "canonicalUrl">, value: string) {
    patchNote(id, key, key === "slug" ? slugify(value, "note") : value);
  }

  function patchList(id: string, key: "tags", value: string) {
    patchNote(id, key, value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8));
  }

  function setPublished(note: ProfileNoteDraft, isPublished: boolean) {
    update(notes.map((candidate) => candidate.id === note.id ? {
      ...candidate,
      isPublished,
      publishedAt: isPublished ? candidate.publishedAt || today() : candidate.publishedAt,
      isFeatured: isPublished ? candidate.isFeatured : false,
      updatedAt: timestamp(),
    } : candidate));
  }

  function toggleFeatured(note: ProfileNoteDraft) {
    if (!note.isPublished) {
      setMessage("Publish a note before featuring it.");
      return;
    }
    if (!note.isFeatured && notes.filter((candidate) => candidate.isFeatured).length >= MAX_FEATURED_NOTES) {
      setMessage(`Choose ${MAX_FEATURED_NOTES} featured notes or fewer.`);
      return;
    }
    setMessage(null);
    patchNote(note.id, "isFeatured", !note.isFeatured);
  }

  function addLink(note: ProfileNoteDraft, kind: NoteLinkKind) {
    if (note.links.length >= 4) {
      setMessage("A note can have four links or fewer.");
      return;
    }
    const project = kind === "project" ? projects.find((candidate) => !note.links.some((link) => link.projectId === candidate.id)) : null;
    if (kind === "project" && !project) {
      setMessage(projects.length === 0 ? "Add a Project before linking it here." : "This note already links to every Project.");
      return;
    }
    const now = timestamp();
    patchNote(note.id, "links", [...note.links, {
      id: createId(),
      profileId,
      noteId: note.id,
      kind,
      projectId: project?.id ?? "",
      label: kind === "project" ? "Related project" : linkLabel(kind),
      url: kind === "project" ? "" : "https://example.com",
      position: note.links.length,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    }]);
  }

  function patchLink(noteId: string, linkId: string, key: keyof Pick<NoteLinkDraft, "projectId" | "label" | "url" | "isEnabled">, value: string | boolean) {
    const note = notes.find((candidate) => candidate.id === noteId);
    if (!note) return;
    patchNote(noteId, "links", note.links.map((link) => link.id === linkId ? { ...link, [key]: value, updatedAt: timestamp() } as NoteLinkDraft : link));
  }

  function removeLink(noteId: string, linkId: string) {
    const note = notes.find((candidate) => candidate.id === noteId);
    if (!note) return;
    patchNote(noteId, "links", note.links.filter((link) => link.id !== linkId).map((link, position) => ({ ...link, position })));
  }

  function moveNote(id: string, direction: "up" | "down") {
    const index = notes.findIndex((note) => note.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= notes.length) return;
    const next = [...notes];
    const [selected] = next.splice(index, 1);
    next.splice(target, 0, selected!);
    update(next);
  }

  function removeNote(id: string) {
    setSelectedNoteId((current) => current === id ? null : current);
    update(notes.filter((note) => note.id !== id));
  }

  return (
    <div className="space-y-6">
      <Panel tone="dark"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div className="space-y-3"><Badge tone="accent">Nodivra Notes</Badge><h2 className="font-display text-3xl tracking-tight text-sand-50 sm:text-4xl">Give the thinking a place to live.</h2><p className="max-w-2xl text-sm leading-7 text-sand-200/80">Write small, useful articles about the choices behind the work. Drafts stay private until you deliberately publish them.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant={showPreview ? "primary" : "secondary"} onClick={() => setShowPreview((value) => !value)}>{showPreview ? "Hide preview" : "Preview note"}</Button><Button type="button" variant="secondary" onClick={addNote} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>New note</Button></div></div><div className="mt-5 flex flex-wrap items-center gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 ring-1 ring-white/10"><SparkIcon className="h-4 w-4 text-sand-200/75" /><span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Draft sync</span><span className="text-sm text-sand-200/75">Changes are held in the private workspace until you save or publish.</span><Badge tone={message ? "danger" : "muted"}>{message ?? "Ready to save"}</Badge></div>{fieldErrors.notes ? <p className="mt-4 rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-300/30">{fieldErrors.notes}</p> : null}</Panel>
      {showPreview && selectedNote ? <NoteDetailPreview note={draftToPublicNote(selectedNote)} /> : null}
      {notes.length === 0 ? <EmptyState title="Start your notebook" description="Publish the first useful idea, decision, or field note when it is ready." action={<Button type="button" variant="secondary" onClick={addNote} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Write your first note</Button>} /> : <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start"><div className="space-y-4">{notes.map((note, index) => <article key={note.id} className={cn("rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[background-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]", selectedNoteId === note.id && "bg-sand-100/10")}><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6"><div className="flex flex-col gap-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-950"><SparkIcon className="h-4 w-4" /></div><div className="min-w-0 flex-1 space-y-3"><div className="flex flex-wrap items-center gap-2"><Badge tone={note.isPublished ? "success" : "muted"}>{note.isPublished ? "Published" : "Draft"}</Badge>{note.isFeatured ? <Badge tone="accent">Featured</Badge> : null}<Badge tone="muted">{note.readingTimeText || "No reading time"}</Badge></div><div><h3 className="font-display text-2xl tracking-tight text-sand-50">{note.title}</h3><p className="mt-2 text-sm leading-7 text-sand-200/75">{note.excerpt}</p></div></div></div><div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4"><Button type="button" variant={selectedNoteId === note.id ? "primary" : "secondary"} onClick={() => setSelectedNoteId(note.id)}>{selectedNoteId === note.id ? "Editing" : "Edit note"}</Button><Button type="button" variant="ghost" onClick={() => moveNote(note.id, "up")} disabled={index === 0} trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}>Up</Button><Button type="button" variant="ghost" onClick={() => moveNote(note.id, "down")} disabled={index === notes.length - 1} trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}>Down</Button><Button type="button" variant="ghost" onClick={() => toggleFeatured(note)}>{note.isFeatured ? "Unfeature" : "Feature"}</Button><Button type="button" variant="ghost" onClick={() => setPublished(note, !note.isPublished)}>{note.isPublished ? "Unpublish" : "Publish"}</Button><Button type="button" variant="danger" onClick={() => removeNote(note.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button></div></div></div></article>)}</div><aside className="lg:sticky lg:top-6"><div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">{selectedNote ? <div className="space-y-5"><div><p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sand-300/70">Note settings</p><h3 className="mt-2 font-display text-2xl tracking-tight text-sand-50">{selectedNote.title}</h3><p className="mt-2 text-xs leading-6 text-sand-300/70">Keep the title specific, the excerpt generous, and the body useful enough to stand on its own.</p></div><div className="space-y-5 border-t border-white/10 pt-5"><FieldShell label="Title" error={fieldErrors[`notes.${selectedIndex}.title`]}><Input value={selectedNote.title} onChange={(event) => patchText(selectedNote.id, "title", event.target.value)} /></FieldShell><FieldShell label="Slug" hint="Used in the public note URL." error={fieldErrors[`notes.${selectedIndex}.slug`]}><Input value={selectedNote.slug} onChange={(event) => patchText(selectedNote.id, "slug", event.target.value)} /></FieldShell><FieldShell label="Excerpt" hint="280 characters or fewer." error={fieldErrors[`notes.${selectedIndex}.excerpt`]}><Textarea value={selectedNote.excerpt} onChange={(event) => patchText(selectedNote.id, "excerpt", event.target.value)} /></FieldShell><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Published date" hint="Required for public notes." error={fieldErrors[`notes.${selectedIndex}.publishedAt`]}><Input type="date" value={selectedNote.publishedAt} onChange={(event) => patchText(selectedNote.id, "publishedAt", event.target.value)} /></FieldShell><FieldShell label="Reading time" hint="Example: 5 min read."><Input value={selectedNote.readingTimeText} onChange={(event) => patchText(selectedNote.id, "readingTimeText", event.target.value)} /></FieldShell></div><FieldShell label="Tags" hint="Comma-separated, up to eight."><Input value={selectedNote.tags.join(", ")} onChange={(event) => patchList(selectedNote.id, "tags", event.target.value)} /></FieldShell><FieldShell label="Cover image URL" hint="Optional, small https image."><Input value={selectedNote.coverImageUrl} onChange={(event) => patchText(selectedNote.id, "coverImageUrl", event.target.value)} /></FieldShell><FieldShell label="Canonical URL" hint="Optional http or https URL."><Input value={selectedNote.canonicalUrl} onChange={(event) => patchText(selectedNote.id, "canonicalUrl", event.target.value)} /></FieldShell><FieldShell label="Body" hint="Safe Markdown, 16,000 characters or fewer." error={fieldErrors[`notes.${selectedIndex}.bodyMarkdown`]}><Textarea className="min-h-[280px]" value={selectedNote.bodyMarkdown} onChange={(event) => patchText(selectedNote.id, "bodyMarkdown", event.target.value)} /></FieldShell><div className="space-y-3 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Note links</p><p className="mt-1 text-xs text-sand-300/60">Connect a Project or share a safe external reference.</p></div><div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="ghost" onClick={() => addLink(selectedNote, "project")}><LinkIcon className="mr-1 h-3.5 w-3.5" />Project</Button>{NOTE_LINK_KINDS.filter((kind): kind is Exclude<NoteLinkKind, "project"> => kind !== "project").map((kind) => <Button key={kind} type="button" variant="ghost" onClick={() => addLink(selectedNote, kind)}>{kind}</Button>)}</div></div>{selectedNote.links.map((link, linkIndex) => <div key={link.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-3"><div className="flex items-center justify-between gap-3"><Badge tone="muted">{link.kind}</Badge><Button type="button" variant="ghost" onClick={() => removeLink(selectedNote.id, link.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Remove</Button></div>{link.kind === "project" ? <FieldShell label="Related Project" error={fieldErrors[`notes.${selectedIndex}.links.${linkIndex}.projectId`]}><Select value={link.projectId} onChange={(event) => patchLink(selectedNote.id, link.id, "projectId", event.target.value)}><option value="">Choose a Project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}</Select></FieldShell> : <><FieldShell label="Label" error={fieldErrors[`notes.${selectedIndex}.links.${linkIndex}.label`]}><Input value={link.label} onChange={(event) => patchLink(selectedNote.id, link.id, "label", event.target.value)} /></FieldShell><FieldShell label="URL" hint="http or https only." error={fieldErrors[`notes.${selectedIndex}.links.${linkIndex}.url`]}><Input value={link.url} onChange={(event) => patchLink(selectedNote.id, link.id, "url", event.target.value)} /></FieldShell></>}<label className="flex items-center gap-2 text-xs text-sand-200/75"><input type="checkbox" checked={link.isEnabled} onChange={(event) => patchLink(selectedNote.id, link.id, "isEnabled", event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent text-sand-100 focus:ring-sand-200/20" />Show this link publicly</label></div>)}</div><div className="flex flex-wrap gap-2"><Button type="button" variant={selectedNote.isFeatured ? "primary" : "secondary"} onClick={() => toggleFeatured(selectedNote)}>{selectedNote.isFeatured ? "Featured note" : "Mark featured"}</Button><Button type="button" variant={selectedNote.isPublished ? "primary" : "secondary"} onClick={() => setPublished(selectedNote, !selectedNote.isPublished)}>{selectedNote.isPublished ? "Published note" : "Keep private"}</Button></div></div></div> : <div className="space-y-4"><Badge tone="muted">Note settings</Badge><h3 className="font-display text-2xl tracking-tight text-sand-50">Select a note to edit it.</h3><p className="text-sm leading-7 text-sand-200/80">Your notebook is most useful when it shows the questions you keep returning to.</p></div>}</div></div></aside></div>}
    </div>
  );
}
