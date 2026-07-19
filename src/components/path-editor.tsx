"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, ClockIcon, LinkIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { PathDetailPreview, draftToPublicPathEntry, pathTypeLabels } from "@/components/path-detail";
import { draftToPublicProject } from "@/components/project-detail";
import { cn } from "@/lib/classnames";
import {
  PATH_DATE_VISIBILITIES,
  PATH_ENTRY_TYPES,
  PATH_LINK_KINDS,
  type PathDateVisibility,
  type PathEntryType,
  type PathLinkDraft,
  type PathLinkKind,
  type ProfilePathEntryDraft,
  type ProfileProjectDraft,
} from "@/types/nodivra";
import { Badge, Button, EmptyState, FieldShell, Input, Panel, Select, Textarea } from "@/components/ui";

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `00000000-0000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function defaultStartDate() {
  return `${new Date().getFullYear()}-01-01`;
}

function createEntry(profileId: string, position: number): ProfilePathEntryDraft {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    entryType: "work",
    title: "A role or milestone worth remembering",
    organization: "Organization or place",
    locationText: "",
    startDate: defaultStartDate(),
    endDate: "",
    isCurrent: true,
    dateVisibility: "year_only",
    summary: "Describe the thread, responsibility, or change this entry represents.",
    highlights: [],
    technologies: [],
    links: [],
    isPublished: false,
    position,
    createdAt: now,
    updatedAt: now,
  };
}

function fieldError(fieldErrors: Record<string, string>, index: number, field: string) {
  return fieldErrors[`pathEntries.${index}.${field}`];
}

export function PathEditor({
  profileId,
  entries,
  projects,
  onChange,
  fieldErrors,
}: {
  profileId: string;
  entries: ProfilePathEntryDraft[];
  projects: ProfileProjectDraft[];
  onChange: (entries: ProfilePathEntryDraft[]) => void;
  fieldErrors: Record<string, string>;
}) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(entries[0]?.id ?? null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId) ?? null;
  const selectedIndex = selectedEntry ? entries.findIndex((entry) => entry.id === selectedEntry.id) : -1;
  const previewProjects = projects.filter((project) => project.isPublished).map(draftToPublicProject);

  function update(nextEntries: ProfilePathEntryDraft[]) {
    onChange(nextEntries.map((entry, position) => ({ ...entry, position })));
  }

  function addEntry() {
    const entry = createEntry(profileId, entries.length);
    setSelectedEntryId(entry.id);
    setMessage(null);
    update([...entries, entry]);
  }

  function patchEntry<K extends keyof ProfilePathEntryDraft>(id: string, key: K, value: ProfilePathEntryDraft[K]) {
    update(entries.map((entry) => {
      if (entry.id !== id) return entry;
      const nextEntry = { ...entry };
      Object.assign(nextEntry, { [key]: value, updatedAt: timestamp() });
      if (key === "isCurrent" && value === true) nextEntry.endDate = "";
      return nextEntry;
    }));
  }

  function moveEntry(id: string, direction: "up" | "down") {
    const index = entries.findIndex((entry) => entry.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= entries.length) return;
    const nextEntries = [...entries];
    const [moved] = nextEntries.splice(index, 1);
    nextEntries.splice(target, 0, moved!);
    update(nextEntries);
  }

  function removeEntry(id: string) {
    setSelectedEntryId((current) => current === id ? null : current);
    update(entries.filter((entry) => entry.id !== id));
  }

  function addHighlight(entry: ProfilePathEntryDraft) {
    if (entry.highlights.length >= 8) {
      setMessage("A Path entry can have eight highlights or fewer.");
      return;
    }
    const now = timestamp();
    patchEntry(entry.id, "highlights", [...entry.highlights, {
      id: createId(),
      profileId,
      entryId: entry.id,
      content: "Name a contribution, result, or useful lesson.",
      position: entry.highlights.length,
      createdAt: now,
      updatedAt: now,
    }]);
  }

  function patchHighlight(entryId: string, highlightId: string, content: string) {
    const entry = entries.find((candidate) => candidate.id === entryId);
    if (!entry) return;
    patchEntry(entryId, "highlights", entry.highlights.map((highlight) => highlight.id === highlightId ? { ...highlight, content, updatedAt: timestamp() } : highlight));
  }

  function removeHighlight(entryId: string, highlightId: string) {
    const entry = entries.find((candidate) => candidate.id === entryId);
    if (!entry) return;
    patchEntry(entryId, "highlights", entry.highlights.filter((highlight) => highlight.id !== highlightId).map((highlight, position) => ({ ...highlight, position })));
  }

  function patchTechnologies(entry: ProfilePathEntryDraft, value: string) {
    const names = value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8);
    const now = timestamp();
    patchEntry(entry.id, "technologies", names.map((name, position) => ({
      id: entry.technologies[position]?.id ?? createId(),
      profileId,
      entryId: entry.id,
      technology: name,
      position,
      createdAt: entry.technologies[position]?.createdAt ?? now,
      updatedAt: now,
    })));
  }

  function addExternalLink(entry: ProfilePathEntryDraft, kind: Exclude<PathLinkKind, "project">) {
    if (entry.links.length >= 4) {
      setMessage("A Path entry can have four links or fewer.");
      return;
    }
    const now = timestamp();
    patchEntry(entry.id, "links", [...entry.links, {
      id: createId(),
      profileId,
      entryId: entry.id,
      kind,
      projectId: "",
      label: kind === "certificate" ? "Certificate" : kind === "resource" ? "Resource" : "Website",
      url: "https://example.com",
      position: entry.links.length,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    }]);
  }

  function addProjectLink(entry: ProfilePathEntryDraft) {
    if (entry.links.length >= 4) {
      setMessage("A Path entry can have four links or fewer.");
      return;
    }
    const project = projects.find((candidate) => !entry.links.some((link) => link.projectId === candidate.id));
    if (!project) {
      setMessage(projects.length === 0 ? "Add a Project before linking it here." : "This entry already links to every Project.");
      return;
    }
    const now = timestamp();
    patchEntry(entry.id, "links", [...entry.links, {
      id: createId(),
      profileId,
      entryId: entry.id,
      kind: "project",
      projectId: project.id,
      label: "Related project",
      url: "",
      position: entry.links.length,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    }]);
  }

  function patchLink<K extends "kind" | "projectId" | "label" | "url" | "isEnabled">(entryId: string, linkId: string, key: K, value: PathLinkDraft[K]) {
    const entry = entries.find((candidate) => candidate.id === entryId);
    if (!entry) return;
    patchEntry(entryId, "links", entry.links.map((link) => link.id === linkId ? { ...link, [key]: value, updatedAt: timestamp() } as PathLinkDraft : link));
  }

  function removeLink(entryId: string, linkId: string) {
    const entry = entries.find((candidate) => candidate.id === entryId);
    if (!entry) return;
    patchEntry(entryId, "links", entry.links.filter((link) => link.id !== linkId).map((link, position) => ({ ...link, position })));
  }

  return (
    <div className="space-y-6">
      <Panel tone="dark">
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <Badge tone="accent">Nodivra Path</Badge>
              <h2 className="font-display text-3xl tracking-tight text-sand-50 sm:text-4xl">Make the through-line visible.</h2>
              <p className="max-w-2xl text-sm leading-7 text-sand-200/80">Keep the record human: roles, study, turning points, and the details you want a future collaborator to understand.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={showPreview ? "primary" : "secondary"} onClick={() => setShowPreview((value) => !value)}>{showPreview ? "Hide preview" : "Preview entry"}</Button>
              <Button type="button" variant="secondary" onClick={addEntry} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add entry</Button>
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
            <div className="flex items-start gap-3"><ClockIcon className="mt-0.5 h-4 w-4 text-sand-200/70" /><div><p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Privacy-aware dates</p><p className="mt-1 text-xs leading-5 text-sand-300/65">Choose exact dates or share year-only dates publicly. Draft details stay private until you publish.</p></div></div>
          </div>
          {fieldErrors.pathEntries ? <p className="rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-300/30">{fieldErrors.pathEntries}</p> : null}
          {message ? <p className="rounded-2xl bg-sand-100/10 px-4 py-3 text-sm text-sand-100 ring-1 ring-sand-200/20">{message}</p> : null}
        </div>
      </Panel>

      {showPreview && selectedEntry ? <PathDetailPreview entry={draftToPublicPathEntry(selectedEntry)} projects={previewProjects} /> : null}

      {entries.length === 0 ? <EmptyState title="Start your Path" description="Add the roles, education, and turning points that give your work context. Keep each entry private until it feels ready." action={<Button type="button" variant="secondary" onClick={addEntry} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add your first entry</Button>} /> : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="space-y-4">
            {entries.map((entry, index) => <article key={entry.id} className={cn("rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[background-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]", selectedEntryId === entry.id && "bg-sand-100/10")}><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6"><div className="flex flex-col gap-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-950"><ClockIcon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge tone={entry.isPublished ? "success" : "muted"}>{entry.isPublished ? "Published" : "Draft"}</Badge><Badge tone={entry.isCurrent ? "accent" : "muted"}>{entry.isCurrent ? "Current" : pathTypeLabels[entry.entryType]}</Badge></div><h3 className="mt-3 font-display text-2xl tracking-tight text-sand-50">{entry.title}</h3><p className="mt-1 text-sm text-sand-200/75">{entry.organization}</p><p className="mt-3 text-sm leading-7 text-sand-200/75">{entry.summary}</p></div></div><div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4"><Button type="button" variant={selectedEntryId === entry.id ? "primary" : "secondary"} onClick={() => setSelectedEntryId(entry.id)}>{selectedEntryId === entry.id ? "Editing" : "Edit entry"}</Button><Button type="button" variant="ghost" onClick={() => moveEntry(entry.id, "up")} disabled={index === 0} trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}>Up</Button><Button type="button" variant="ghost" onClick={() => moveEntry(entry.id, "down")} disabled={index === entries.length - 1} trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}>Down</Button><Button type="button" variant="ghost" onClick={() => patchEntry(entry.id, "isPublished", !entry.isPublished)}>{entry.isPublished ? "Unpublish" : "Publish"}</Button><Button type="button" variant="danger" onClick={() => removeEntry(entry.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button></div></div></div></article>)}
          </div>

          <aside className="lg:sticky lg:top-6"><div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">{selectedEntry ? <div className="space-y-5"><div><p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sand-300/70">Path entry settings</p><h3 className="mt-2 font-display text-2xl tracking-tight text-sand-50">{selectedEntry.title}</h3><p className="mt-2 text-xs leading-6 text-sand-300/70">Write for someone who wants to understand the choices behind your work, not just the job title.</p></div><div className="space-y-5 border-t border-white/10 pt-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Entry type" error={fieldError(fieldErrors, selectedIndex, "entryType")}><Select value={selectedEntry.entryType} onChange={(event) => patchEntry(selectedEntry.id, "entryType", event.target.value as PathEntryType)}>{PATH_ENTRY_TYPES.map((type) => <option key={type} value={type}>{pathTypeLabels[type]}</option>)}</Select></FieldShell><FieldShell label="Title" error={fieldError(fieldErrors, selectedIndex, "title")}><Input value={selectedEntry.title} onChange={(event) => patchEntry(selectedEntry.id, "title", event.target.value)} /></FieldShell></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Organization" error={fieldError(fieldErrors, selectedIndex, "organization")}><Input value={selectedEntry.organization} onChange={(event) => patchEntry(selectedEntry.id, "organization", event.target.value)} /></FieldShell><FieldShell label="Location" hint="Optional." error={fieldError(fieldErrors, selectedIndex, "locationText")}><Input value={selectedEntry.locationText} onChange={(event) => patchEntry(selectedEntry.id, "locationText", event.target.value)} /></FieldShell></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Start date" error={fieldError(fieldErrors, selectedIndex, "startDate")}><Input type="date" value={selectedEntry.startDate} onChange={(event) => patchEntry(selectedEntry.id, "startDate", event.target.value)} /></FieldShell><FieldShell label="End date" hint={selectedEntry.isCurrent ? "Current entries stay open." : "Optional for milestones."} error={fieldError(fieldErrors, selectedIndex, "endDate")}><Input type="date" value={selectedEntry.endDate} disabled={selectedEntry.isCurrent} onChange={(event) => patchEntry(selectedEntry.id, "endDate", event.target.value)} /></FieldShell></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Public date detail" error={fieldError(fieldErrors, selectedIndex, "dateVisibility")}><Select value={selectedEntry.dateVisibility} onChange={(event) => patchEntry(selectedEntry.id, "dateVisibility", event.target.value as PathDateVisibility)}>{PATH_DATE_VISIBILITIES.map((visibility) => <option key={visibility} value={visibility}>{visibility === "year_only" ? "Year only" : "Exact dates"}</option>)}</Select></FieldShell><label className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-sand-100 ring-1 ring-white/10"><input type="checkbox" checked={selectedEntry.isCurrent} onChange={(event) => patchEntry(selectedEntry.id, "isCurrent", event.target.checked ? true : false)} className="h-4 w-4 rounded border-white/20 bg-transparent text-sand-100 focus:ring-sand-200/20" />Current entry</label></div><FieldShell label="Summary" hint="420 characters or fewer." error={fieldError(fieldErrors, selectedIndex, "summary")}><Textarea value={selectedEntry.summary} onChange={(event) => patchEntry(selectedEntry.id, "summary", event.target.value)} /></FieldShell><div className="space-y-3 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Highlights</p><p className="mt-1 text-xs text-sand-300/60">A few concrete moments, not a wall of copy.</p></div><Button type="button" variant="ghost" onClick={() => addHighlight(selectedEntry)} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add</Button></div>{selectedEntry.highlights.map((highlight, highlightIndex) => <div key={highlight.id} className="flex items-start gap-2"><Textarea value={highlight.content} aria-label={`Highlight ${highlightIndex + 1}`} onChange={(event) => patchHighlight(selectedEntry.id, highlight.id, event.target.value)} /><Button type="button" variant="ghost" onClick={() => removeHighlight(selectedEntry.id, highlight.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Remove</Button></div>)}</div><FieldShell label="Technologies" hint="Comma-separated, up to eight." error={fieldError(fieldErrors, selectedIndex, "technologies")}><Input value={selectedEntry.technologies.map((technology) => technology.technology).join(", ")} onChange={(event) => patchTechnologies(selectedEntry, event.target.value)} /></FieldShell><div className="space-y-3 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Links</p><p className="mt-1 text-xs text-sand-300/60">Connect a Project or share a safe external reference.</p></div><div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="ghost" onClick={() => addProjectLink(selectedEntry)}><LinkIcon className="mr-1 h-3.5 w-3.5" />Project</Button>{PATH_LINK_KINDS.filter((kind): kind is Exclude<PathLinkKind, "project"> => kind !== "project").map((kind) => <Button key={kind} type="button" variant="ghost" onClick={() => addExternalLink(selectedEntry, kind)}>{kind}</Button>)}</div></div>{selectedEntry.links.map((link, linkIndex) => <div key={link.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-3"><div className="flex items-center justify-between gap-3"><Badge tone="muted">{link.kind}</Badge><Button type="button" variant="ghost" onClick={() => removeLink(selectedEntry.id, link.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Remove</Button></div>{link.kind === "project" ? <FieldShell label="Related Project" error={fieldErrors[`pathEntries.${selectedIndex}.links.${linkIndex}.projectId`]}><Select value={link.projectId} onChange={(event) => patchLink(selectedEntry.id, link.id, "projectId", event.target.value)}><option value="">Choose a Project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}</Select></FieldShell> : <><FieldShell label="Label" error={fieldErrors[`pathEntries.${selectedIndex}.links.${linkIndex}.label`]}><Input value={link.label} onChange={(event) => patchLink(selectedEntry.id, link.id, "label", event.target.value)} /></FieldShell><FieldShell label="URL" hint="http or https only." error={fieldErrors[`pathEntries.${selectedIndex}.links.${linkIndex}.url`]}><Input value={link.url} onChange={(event) => patchLink(selectedEntry.id, link.id, "url", event.target.value)} /></FieldShell></>}<label className="flex items-center gap-2 text-xs text-sand-200/75"><input type="checkbox" checked={link.isEnabled} onChange={(event) => patchLink(selectedEntry.id, link.id, "isEnabled", event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent text-sand-100 focus:ring-sand-200/20" />Show this link publicly</label></div>)}</div><div className="flex flex-wrap gap-2"><Button type="button" variant={selectedEntry.isPublished ? "primary" : "secondary"} onClick={() => patchEntry(selectedEntry.id, "isPublished", !selectedEntry.isPublished)}>{selectedEntry.isPublished ? "Published entry" : "Keep private"}</Button></div></div></div> : <div className="space-y-4"><Badge tone="muted">Path entry settings</Badge><h3 className="font-display text-2xl tracking-tight text-sand-50">Select an entry to edit it.</h3><p className="text-sm leading-7 text-sand-200/80">Start with the roles and moments that explain how you got here.</p></div>}</div></div></aside>
        </div>
      )}
    </div>
  );
}
