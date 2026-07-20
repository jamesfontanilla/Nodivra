"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, LinkIcon, PlusIcon, SparkIcon, TrashIcon } from "@/components/icons";
import { draftToPublicSnip, SnipDetailPreview, snipLanguageLabel } from "@/components/snip-detail";
import { cn } from "@/lib/classnames";
import {
  SNIP_LANGUAGES,
  SNIP_LINK_KINDS,
  type ProfileProjectDraft,
  type ProfileSnipDraft,
  type SnipLanguage,
  type SnipLinkDraft,
  type SnipLinkKind,
  type SnipVisibility,
} from "@/types/nodivra";
import { Badge, Button, EmptyState, FieldShell, Input, Panel, Select, Textarea } from "@/components/ui";

const MAX_FEATURED_SNIPS = 3;

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `00000000-0000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function slugify(value: string, fallback: string) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function createSnip(profileId: string, position: number): ProfileSnipDraft {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    title: "A Snip in progress",
    slug: `snip-${position + 1}`,
    description: "A short explanation of what this reference does and when it is useful.",
    code: "export function usefulReference() {\n  return true;\n}",
    language: "typescript",
    visibility: "public",
    tags: ["reference"],
    sourceUrl: "",
    isPublished: false,
    isFeatured: false,
    position,
    links: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function SnipsEditor({
  profileId,
  snippets,
  projects,
  onChange,
  fieldErrors,
}: {
  profileId: string;
  snippets: ProfileSnipDraft[];
  projects: ProfileProjectDraft[];
  onChange: (snippets: ProfileSnipDraft[]) => void;
  fieldErrors: Record<string, string>;
}) {
  const [selectedSnipId, setSelectedSnipId] = useState<string | null>(snippets[0]?.id ?? null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedSnip = snippets.find((snip) => snip.id === selectedSnipId) ?? null;
  const selectedIndex = selectedSnip ? snippets.findIndex((snip) => snip.id === selectedSnip.id) : -1;

  function update(nextSnips: ProfileSnipDraft[]) {
    onChange(nextSnips.map((snip, position) => ({ ...snip, position })));
  }

  function addSnip() {
    const snip = createSnip(profileId, snippets.length);
    setSelectedSnipId(snip.id);
    setMessage(null);
    update([...snippets, snip]);
  }

  function patchSnip<K extends keyof ProfileSnipDraft>(id: string, key: K, value: ProfileSnipDraft[K]) {
    update(snippets.map((snip) => (snip.id === id ? { ...snip, [key]: value, updatedAt: timestamp() } : snip)));
  }

  function patchText(
    id: string,
    key: keyof Pick<ProfileSnipDraft, "title" | "slug" | "description" | "code" | "sourceUrl">,
    value: string,
  ) {
    patchSnip(id, key, key === "slug" ? slugify(value, "snip") : value);
  }

  function patchTags(id: string, value: string) {
    patchSnip(id, "tags", value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 8));
  }

  function setVisibility(snip: ProfileSnipDraft, visibility: SnipVisibility) {
    update(snippets.map((candidate) => candidate.id === snip.id ? {
      ...candidate,
      visibility,
      isFeatured: visibility === "public" ? candidate.isFeatured : false,
      updatedAt: timestamp(),
    } : candidate));
  }

  function setPublished(snip: ProfileSnipDraft, isPublished: boolean) {
    update(snippets.map((candidate) => candidate.id === snip.id ? {
      ...candidate,
      isPublished,
      isFeatured: isPublished ? candidate.isFeatured : false,
      updatedAt: timestamp(),
    } : candidate));
  }

  function toggleFeatured(snip: ProfileSnipDraft) {
    if (!snip.isPublished || snip.visibility !== "public") {
      setMessage("Publish a public Snip before featuring it.");
      return;
    }
    if (!snip.isFeatured && snippets.filter((candidate) => candidate.isFeatured).length >= MAX_FEATURED_SNIPS) {
      setMessage(`Choose ${MAX_FEATURED_SNIPS} featured Snips or fewer.`);
      return;
    }
    setMessage(null);
    patchSnip(snip.id, "isFeatured", !snip.isFeatured);
  }

  function addLink(snip: ProfileSnipDraft, kind: SnipLinkKind) {
    if (snip.links.length >= 4) {
      setMessage("A Snip can have four links or fewer.");
      return;
    }
    const project = kind === "project"
      ? projects.find((candidate) => !snip.links.some((link) => link.projectId === candidate.id))
      : null;
    if (kind === "project" && !project) {
      setMessage(projects.length === 0 ? "Add a Project before linking it here." : "This Snip already links to every Project.");
      return;
    }
    const now = timestamp();
    const link: SnipLinkDraft = {
      id: createId(),
      profileId,
      snipId: snip.id,
      kind,
      projectId: project?.id ?? "",
      label: kind === "project" ? "Related project" : "Resource",
      url: kind === "resource" ? "https://example.com" : "",
      position: snip.links.length,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    };
    patchSnip(snip.id, "links", [...snip.links, link]);
  }

  function patchLink(
    snipId: string,
    linkId: string,
    key: keyof Pick<SnipLinkDraft, "projectId" | "label" | "url" | "isEnabled">,
    value: string | boolean,
  ) {
    const snip = snippets.find((candidate) => candidate.id === snipId);
    if (!snip) return;
    patchSnip(snipId, "links", snip.links.map((link) => link.id === linkId ? {
      ...link,
      [key]: value,
      updatedAt: timestamp(),
    } as SnipLinkDraft : link));
  }

  function removeLink(snipId: string, linkId: string) {
    const snip = snippets.find((candidate) => candidate.id === snipId);
    if (!snip) return;
    patchSnip(snipId, "links", snip.links.filter((link) => link.id !== linkId).map((link, position) => ({ ...link, position })));
  }

  function moveSnip(id: string, direction: "up" | "down") {
    const index = snippets.findIndex((snip) => snip.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= snippets.length) return;
    const next = [...snippets];
    const [selected] = next.splice(index, 1);
    next.splice(target, 0, selected!);
    update(next);
  }

  function removeSnip(id: string) {
    setSelectedSnipId((current) => current === id ? null : current);
    update(snippets.filter((snip) => snip.id !== id));
  }

  return (
    <div className="space-y-6">
      <Panel tone="dark">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge tone="accent">Nodivra Snips</Badge>
            <h2 className="font-display text-3xl tracking-tight text-sand-50 sm:text-4xl">Keep the small pieces useful.</h2>
            <p className="max-w-2xl text-sm leading-7 text-sand-200/80">Publish compact code references with enough context to be understood. Snips are always rendered as inert text; Nodivra never runs or stores submitted code as an executable asset.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={showPreview ? "primary" : "secondary"} onClick={() => setShowPreview((value) => !value)}>{showPreview ? "Hide preview" : "Preview Snip"}</Button>
            <Button type="button" variant="secondary" onClick={addSnip} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>New Snip</Button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 ring-1 ring-white/10">
          <SparkIcon className="h-4 w-4 text-sand-200/75" />
          <span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Draft sync</span>
          <span className="text-sm text-sand-200/75">Private until saved or deliberately published.</span>
          <Badge tone={message ? "danger" : "muted"}>{message ?? "Ready to save"}</Badge>
        </div>
        {fieldErrors.snippets ? <p className="mt-4 rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-300/30">{fieldErrors.snippets}</p> : null}
      </Panel>

      {showPreview && selectedSnip ? <SnipDetailPreview snip={draftToPublicSnip(selectedSnip)} /> : null}

      {snippets.length === 0 ? (
        <EmptyState
          title="Start your reference shelf"
          description="Add a short code reference when the pattern is useful enough to explain and safe enough to share."
          action={<Button type="button" variant="secondary" onClick={addSnip} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add your first Snip</Button>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="space-y-4">
            {snippets.map((snip, index) => (
              <article key={snip.id} className={cn("rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[background-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]", selectedSnipId === snip.id && "bg-sand-100/10")}>
                <div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-950"><SparkIcon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={snip.isPublished ? "success" : "muted"}>{snip.isPublished ? "Published" : "Draft"}</Badge>
                        {snip.visibility === "private" ? <Badge tone="danger">Private</Badge> : null}
                        {snip.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
                        <Badge tone="muted">{snipLanguageLabel(snip.language)}</Badge>
                      </div>
                      <div>
                        <h3 className="font-display text-2xl tracking-tight text-sand-50">{snip.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-sand-200/75">{snip.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                    <Button type="button" variant={selectedSnipId === snip.id ? "primary" : "secondary"} onClick={() => setSelectedSnipId(snip.id)}>{selectedSnipId === snip.id ? "Editing" : "Edit Snip"}</Button>
                    <Button type="button" variant="ghost" onClick={() => moveSnip(snip.id, "up")} disabled={index === 0} trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}>Up</Button>
                    <Button type="button" variant="ghost" onClick={() => moveSnip(snip.id, "down")} disabled={index === snippets.length - 1} trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}>Down</Button>
                    <Button type="button" variant="ghost" onClick={() => toggleFeatured(snip)}>{snip.isFeatured ? "Unfeature" : "Feature"}</Button>
                    <Button type="button" variant="ghost" onClick={() => setPublished(snip, !snip.isPublished)}>{snip.isPublished ? "Unpublish" : "Publish"}</Button>
                    <Button type="button" variant="danger" onClick={() => removeSnip(snip.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10">
              <div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
                {selectedSnip ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sand-300/70">Snip settings</p>
                      <h3 className="mt-2 font-display text-2xl tracking-tight text-sand-50">{selectedSnip.title}</h3>
                      <p className="mt-2 text-xs leading-6 text-sand-300/70">Make the title and description carry the explanation. The code should stay focused on one useful reference.</p>
                    </div>

                    <div className="space-y-5 border-t border-white/10 pt-5">
                      <FieldShell label="Title" error={fieldErrors[`snippets.${selectedIndex}.title`]}>
                        <Input value={selectedSnip.title} onChange={(event) => patchText(selectedSnip.id, "title", event.target.value)} />
                      </FieldShell>
                      <FieldShell label="Slug" hint="Used in the public Snip URL." error={fieldErrors[`snippets.${selectedIndex}.slug`]}>
                        <Input value={selectedSnip.slug} onChange={(event) => patchText(selectedSnip.id, "slug", event.target.value)} />
                      </FieldShell>
                      <FieldShell label="Description" hint="280 characters or fewer." error={fieldErrors[`snippets.${selectedIndex}.description`]}>
                        <Textarea value={selectedSnip.description} onChange={(event) => patchText(selectedSnip.id, "description", event.target.value)} />
                      </FieldShell>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <FieldShell label="Language" hint="A label only; it never changes execution because Snips are never executed.">
                          <Select value={selectedSnip.language} onChange={(event) => patchSnip(selectedSnip.id, "language", event.target.value as SnipLanguage)}>
                            {SNIP_LANGUAGES.map((language) => <option key={language} value={language}>{snipLanguageLabel(language)}</option>)}
                          </Select>
                        </FieldShell>
                        <FieldShell label="Visibility" hint="Private Snips stay out of every public route.">
                          <Select value={selectedSnip.visibility} onChange={(event) => setVisibility(selectedSnip, event.target.value as SnipVisibility)}>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </Select>
                        </FieldShell>
                      </div>
                      <FieldShell label="Tags" hint="Comma-separated, up to eight.">
                        <Input value={selectedSnip.tags.join(", ")} onChange={(event) => patchTags(selectedSnip.id, event.target.value)} />
                      </FieldShell>
                      <FieldShell label="Source URL" hint="Optional outbound reference. http or https only." error={fieldErrors[`snippets.${selectedIndex}.sourceUrl`]}>
                        <Input value={selectedSnip.sourceUrl} onChange={(event) => patchText(selectedSnip.id, "sourceUrl", event.target.value)} placeholder="https://..." />
                      </FieldShell>
                      <FieldShell label="Code" hint="Rendered as escaped, inert text. 24,000 characters or fewer." error={fieldErrors[`snippets.${selectedIndex}.code`]}>
                        <Textarea value={selectedSnip.code} onChange={(event) => patchText(selectedSnip.id, "code", event.target.value)} className="min-h-[260px] font-mono text-xs leading-6" spellCheck={false} />
                      </FieldShell>

                      <div className="space-y-3 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Related context</p>
                            <p className="mt-1 text-xs text-sand-300/60">Connect a published Project or a safe external resource.</p>
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                            {SNIP_LINK_KINDS.map((kind) => <Button key={kind} type="button" variant="ghost" onClick={() => addLink(selectedSnip, kind)}><LinkIcon className="mr-1 h-3.5 w-3.5" />{kind}</Button>)}
                          </div>
                        </div>
                        {selectedSnip.links.map((link, linkIndex) => (
                          <div key={link.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-3">
                            <div className="flex items-center justify-between gap-3"><Badge tone="muted">{link.kind}</Badge><Button type="button" variant="ghost" onClick={() => removeLink(selectedSnip.id, link.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Remove</Button></div>
                            {link.kind === "project" ? <FieldShell label="Project" error={fieldErrors[`snippets.${selectedIndex}.links.${linkIndex}.projectId`]}><Select value={link.projectId} onChange={(event) => patchLink(selectedSnip.id, link.id, "projectId", event.target.value)}><option value="">Choose a Project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}</Select></FieldShell> : <><FieldShell label="Label" error={fieldErrors[`snippets.${selectedIndex}.links.${linkIndex}.label`]}><Input value={link.label} onChange={(event) => patchLink(selectedSnip.id, link.id, "label", event.target.value)} /></FieldShell><FieldShell label="URL" hint="http or https only." error={fieldErrors[`snippets.${selectedIndex}.links.${linkIndex}.url`]}><Input value={link.url} onChange={(event) => patchLink(selectedSnip.id, link.id, "url", event.target.value)} /></FieldShell></>}
                            <label className="flex items-center gap-2 text-xs text-sand-200/75"><input type="checkbox" checked={link.isEnabled} onChange={(event) => patchLink(selectedSnip.id, link.id, "isEnabled", event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent text-sand-100 focus:ring-sand-200/20" />Show this link publicly</label>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant={selectedSnip.isFeatured ? "primary" : "secondary"} onClick={() => toggleFeatured(selectedSnip)}>{selectedSnip.isFeatured ? "Featured Snip" : "Mark featured"}</Button>
                        <Button type="button" variant={selectedSnip.isPublished ? "primary" : "secondary"} onClick={() => setPublished(selectedSnip, !selectedSnip.isPublished)}>{selectedSnip.isPublished ? "Published Snip" : "Keep private"}</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4"><Badge tone="muted">Snip settings</Badge><h3 className="font-display text-2xl tracking-tight text-sand-50">Select a Snip to edit it.</h3><p className="text-sm leading-7 text-sand-200/80">Keep each reference small enough to scan and specific enough to trust.</p></div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
