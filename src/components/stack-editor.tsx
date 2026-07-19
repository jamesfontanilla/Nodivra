"use client";

import { useState } from "react";
import { ArrowUpRightIcon, ChevronDownIcon, ChevronUpIcon, LinkIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { draftToPublicProject } from "@/components/project-detail";
import { StackDetailPreview, draftToPublicStackItem, iconGlyphs, learningLabels } from "@/components/stack-detail";
import { cn } from "@/lib/classnames";
import {
  STACK_ICON_IDENTIFIERS,
  STACK_LEARNING_STATUSES,
  STACK_LINK_KINDS,
  type ProfileProjectDraft,
  type ProfileStackCategoryDraft,
  type ProfileStackItemDraft,
  type StackIconIdentifier,
  type StackLearningStatus,
  type StackLinkDraft,
  type StackLinkKind,
} from "@/types/nodivra";
import { Badge, Button, EmptyState, FieldShell, Input, Panel, Select, Textarea } from "@/components/ui";

const MAX_FEATURED_STACK_ITEMS = 6;

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

function createCategory(profileId: string, position: number): ProfileStackCategoryDraft {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    key: "custom",
    name: "Custom category",
    slug: `custom-category-${position + 1}`,
    isBuiltIn: false,
    position,
    createdAt: now,
    updatedAt: now,
  };
}

function createItem(profileId: string, categoryId: string, position: number): ProfileStackItemDraft {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    categoryId,
    technologyName: "A technology worth naming",
    proficiencyLabel: "Comfortable",
    yearsText: "",
    confidenceLabel: "Self-described",
    learningStatus: "comfortable",
    shortDescription: "Explain where this fits into your work and what you reach for it to do.",
    iconIdentifier: "code",
    isFeatured: false,
    isPublished: false,
    position,
    projects: [],
    links: [],
    createdAt: now,
    updatedAt: now,
  };
}

function fieldError(fieldErrors: Record<string, string>, itemIndex: number, field: string) {
  return fieldErrors[`stackItems.${itemIndex}.${field}`];
}

export function StackEditor({
  profileId,
  categories,
  items,
  projects,
  onChange,
  fieldErrors,
}: {
  profileId: string;
  categories: ProfileStackCategoryDraft[];
  items: ProfileStackItemDraft[];
  projects: ProfileProjectDraft[];
  onChange: (categories: ProfileStackCategoryDraft[], items: ProfileStackItemDraft[]) => void;
  fieldErrors: Record<string, string>;
}) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(items[0]?.id ?? null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
  const selectedIndex = selectedItem ? items.findIndex((item) => item.id === selectedItem.id) : -1;

  function update(nextCategories: ProfileStackCategoryDraft[], nextItems: ProfileStackItemDraft[]) {
    onChange(
      nextCategories.map((category, position) => ({ ...category, position })),
      nextItems.map((item, position) => ({ ...item, position })),
    );
  }

  function addCategory() {
    const category = createCategory(profileId, categories.length);
    setSelectedCategoryId(category.id);
    setMessage(null);
    update([...categories, category], items);
  }

  function patchCategory(id: string, value: string) {
    update(categories.map((category) => category.id === id ? { ...category, name: value, slug: slugify(value, "custom-category"), updatedAt: timestamp() } : category), items);
  }

  function removeCategory(category: ProfileStackCategoryDraft) {
    if (category.isBuiltIn) return;
    if (items.some((item) => item.categoryId === category.id)) {
      setMessage("Move the technologies out of this category before deleting it.");
      return;
    }
    const nextCategories = categories.filter((candidate) => candidate.id !== category.id);
    setSelectedCategoryId(nextCategories[0]?.id ?? "");
    setMessage(null);
    update(nextCategories, items);
  }

  function addItem() {
    const categoryId = selectedCategoryId || categories[0]?.id;
    if (!categoryId) {
      setMessage("Create a category before adding a technology.");
      return;
    }
    const item = createItem(profileId, categoryId, items.length);
    setSelectedItemId(item.id);
    setMessage(null);
    update(categories, [...items, item]);
  }

  function patchItem<K extends keyof ProfileStackItemDraft>(id: string, key: K, value: ProfileStackItemDraft[K]) {
    update(categories, items.map((item) => item.id === id ? { ...item, [key]: value, updatedAt: timestamp() } : item));
  }

  function patchText(id: string, key: keyof Pick<ProfileStackItemDraft, "technologyName" | "proficiencyLabel" | "yearsText" | "confidenceLabel" | "shortDescription">, value: string) {
    patchItem(id, key, value);
  }

  function moveItem(id: string, direction: "up" | "down") {
    const index = items.findIndex((item) => item.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= items.length) return;
    const next = [...items];
    const [selected] = next.splice(index, 1);
    next.splice(target, 0, selected!);
    update(categories, next);
  }

  function toggleFeatured(item: ProfileStackItemDraft) {
    if (!item.isFeatured && items.filter((candidate) => candidate.isFeatured).length >= MAX_FEATURED_STACK_ITEMS) {
      setMessage(`Choose ${MAX_FEATURED_STACK_ITEMS} featured technologies or fewer.`);
      return;
    }
    setMessage(null);
    patchItem(item.id, "isFeatured", !item.isFeatured);
  }

  function removeItem(id: string) {
    setSelectedItemId((current) => current === id ? null : current);
    update(categories, items.filter((item) => item.id !== id));
  }

  function addProject(item: ProfileStackItemDraft) {
    if (item.projects.length >= 8) {
      setMessage("A technology can link to eight projects or fewer.");
      return;
    }
    const project = projects.find((candidate) => !item.projects.some((link) => link.projectId === candidate.id));
    if (!project) {
      setMessage(projects.length === 0 ? "Add a Project before linking it here." : "This technology already links to every project.");
      return;
    }
    const now = timestamp();
    patchItem(item.id, "projects", [...item.projects, {
      id: createId(),
      profileId,
      stackItemId: item.id,
      projectId: project.id,
      position: item.projects.length,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    }]);
  }

  function addLink(item: ProfileStackItemDraft, kind: StackLinkKind) {
    if (item.links.length >= 4) {
      setMessage("A technology can have four external links or fewer.");
      return;
    }
    const now = timestamp();
    patchItem(item.id, "links", [...item.links, {
      id: createId(),
      profileId,
      stackItemId: item.id,
      kind,
      label: kind === "documentation" ? "Documentation" : kind === "tool" ? "Tool" : "Related resource",
      url: "https://",
      position: item.links.length,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    }]);
  }

  function removeProject(itemId: string, projectId: string) {
    const item = items.find((candidate) => candidate.id === itemId);
    if (!item) return;
    patchItem(itemId, "projects", item.projects.filter((project) => project.projectId !== projectId).map((project, position) => ({ ...project, position })));
  }

  function patchLink<K extends "kind" | "label" | "url" | "isEnabled">(itemId: string, linkId: string, key: K, value: StackLinkDraft[K]) {
    const item = items.find((candidate) => candidate.id === itemId);
    if (!item) return;
    patchItem(itemId, "links", item.links.map((link) => link.id === linkId ? { ...link, [key]: value, updatedAt: timestamp() } : link));
  }

  function removeLink(itemId: string, linkId: string) {
    const item = items.find((candidate) => candidate.id === itemId);
    if (!item) return;
    patchItem(itemId, "links", item.links.filter((link) => link.id !== linkId).map((link, position) => ({ ...link, position })));
  }

  const previewProjects = projects.filter((project) => project.isPublished).map(draftToPublicProject);

  return (
    <div className="space-y-6">
      <Panel tone="dark">
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <Badge tone="accent">Nodivra Stack</Badge>
              <h2 className="font-display text-3xl tracking-tight text-sand-50 sm:text-4xl">Name the tools behind your decisions.</h2>
              <p className="max-w-2xl text-sm leading-7 text-sand-200/80">Use honest labels like Used Daily or Learning. Nodivra stores your description, not a calculated skill score.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={showPreview ? "primary" : "secondary"} onClick={() => setShowPreview((value) => !value)}>{showPreview ? "Hide preview" : "Preview item"}</Button>
              <Button type="button" variant="secondary" onClick={addItem} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add technology</Button>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Categories</p><p className="mt-1 text-xs leading-5 text-sand-300/65">Built-ins keep browsing predictable. Custom categories are text-only and local.</p></div><Button type="button" variant="ghost" onClick={addCategory} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add custom category</Button></div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => <button key={category.id} type="button" onClick={() => setSelectedCategoryId(category.id)} className={cn("rounded-full px-4 py-2 text-xs transition-[transform,background-color,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]", selectedCategoryId === category.id ? "bg-sand-100 text-ink-950" : "bg-black/10 text-sand-200/80 ring-1 ring-white/10 hover:bg-white/10 hover:text-sand-50")}>{category.name}</button>)}
            </div>
            {categories.filter((category) => !category.isBuiltIn).length > 0 ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{categories.filter((category) => !category.isBuiltIn).map((category) => <div key={category.id} className="flex items-center gap-2"><Input aria-label={`Custom category ${category.name}`} value={category.name} onChange={(event) => patchCategory(category.id, event.target.value)} /><Button type="button" variant="danger" onClick={() => removeCategory(category)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button></div>)}</div> : null}
          </div>
          {fieldErrors.stackCategories ? <p className="rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-300/30">{fieldErrors.stackCategories}</p> : null}
          {fieldErrors.stackItems ? <p className="rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-300/30">{fieldErrors.stackItems}</p> : null}
          {message ? <p className="rounded-2xl bg-sand-100/10 px-4 py-3 text-sm text-sand-100 ring-1 ring-sand-200/20">{message}</p> : null}
        </div>
      </Panel>

      {showPreview && selectedItem ? <StackDetailPreview item={draftToPublicStackItem(selectedItem, categories)} projects={previewProjects} /> : null}

      {items.length === 0 ? <EmptyState title="Start your working stack" description="Add the technologies, tools, and platforms that clarify how you make the work. You can keep each item private until the story feels ready." action={<Button type="button" variant="secondary" onClick={addItem} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add your first technology</Button>} /> : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="space-y-4">
            {items.map((item, index) => {
              const category = categories.find((candidate) => candidate.id === item.categoryId);
              return <article key={item.id} className={cn("rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[background-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]", selectedItemId === item.id && "bg-sand-100/10")}><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6"><div className="flex flex-col gap-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand-100 font-mono text-[10px] font-semibold tracking-[0.16em] text-ink-950">{iconGlyphs[item.iconIdentifier]}</div><div className="min-w-0 flex-1 space-y-3"><div className="flex flex-wrap items-center gap-2"><Badge tone={item.isPublished ? "success" : "muted"}>{item.isPublished ? "Published" : "Draft"}</Badge>{item.isFeatured ? <Badge tone="accent">Featured</Badge> : null}<Badge tone="muted">{category?.name ?? "Uncategorized"}</Badge></div><div><h3 className="font-display text-2xl tracking-tight text-sand-50">{item.technologyName}</h3><p className="mt-2 text-sm leading-7 text-sand-200/75">{item.shortDescription}</p></div></div></div><div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4"><Button type="button" variant={selectedItemId === item.id ? "primary" : "secondary"} onClick={() => setSelectedItemId(item.id)}>{selectedItemId === item.id ? "Editing" : "Edit technology"}</Button><Button type="button" variant="ghost" onClick={() => moveItem(item.id, "up")} disabled={index === 0} trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}>Up</Button><Button type="button" variant="ghost" onClick={() => moveItem(item.id, "down")} disabled={index === items.length - 1} trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}>Down</Button><Button type="button" variant="ghost" onClick={() => toggleFeatured(item)}>{item.isFeatured ? "Unfeature" : "Feature"}</Button><Button type="button" variant="ghost" onClick={() => patchItem(item.id, "isPublished", !item.isPublished)}>{item.isPublished ? "Unpublish" : "Publish"}</Button><Button type="button" variant="danger" onClick={() => removeItem(item.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button></div></div></div></article>;
            })}
          </div>

          <aside className="lg:sticky lg:top-6"><div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">{selectedItem ? <div className="space-y-5"><div><p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sand-300/70">Technology settings</p><h3 className="mt-2 font-display text-2xl tracking-tight text-sand-50">{selectedItem.technologyName}</h3><p className="mt-2 text-xs leading-6 text-sand-300/70">Keep confidence self-described. The public card should explain the role this tool plays, not rank it.</p></div><div className="space-y-5 border-t border-white/10 pt-5"><FieldShell label="Technology name" hint="1 to 72 characters." error={fieldError(fieldErrors, selectedIndex, "technologyName")}><Input value={selectedItem.technologyName} onChange={(event) => patchText(selectedItem.id, "technologyName", event.target.value)} /></FieldShell><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Category" error={fieldError(fieldErrors, selectedIndex, "categoryId")}><Select value={selectedItem.categoryId} onChange={(event) => patchItem(selectedItem.id, "categoryId", event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></FieldShell><FieldShell label="Learning status" hint="A simple, honest label." error={fieldError(fieldErrors, selectedIndex, "learningStatus")}><Select value={selectedItem.learningStatus} onChange={(event) => patchItem(selectedItem.id, "learningStatus", event.target.value as StackLearningStatus)}>{STACK_LEARNING_STATUSES.map((status) => <option key={status} value={status}>{learningLabels[status]}</option>)}</Select></FieldShell></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Icon identifier" hint="Controlled local glyph only." error={fieldError(fieldErrors, selectedIndex, "iconIdentifier")}><Select value={selectedItem.iconIdentifier} onChange={(event) => patchItem(selectedItem.id, "iconIdentifier", event.target.value as StackIconIdentifier)}>{STACK_ICON_IDENTIFIERS.map((identifier) => <option key={identifier} value={identifier}>{identifier} · {iconGlyphs[identifier]}</option>)}</Select></FieldShell><FieldShell label="Proficiency label" hint="Manual wording, not a score." error={fieldError(fieldErrors, selectedIndex, "proficiencyLabel")}><Input value={selectedItem.proficiencyLabel} placeholder="Comfortable" onChange={(event) => patchText(selectedItem.id, "proficiencyLabel", event.target.value)} /></FieldShell></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Years text" hint="Example: 4 years." error={fieldError(fieldErrors, selectedIndex, "yearsText")}><Input value={selectedItem.yearsText} placeholder="4 years" onChange={(event) => patchText(selectedItem.id, "yearsText", event.target.value)} /></FieldShell><FieldShell label="Confidence label" hint="Example: High confidence." error={fieldError(fieldErrors, selectedIndex, "confidenceLabel")}><Input value={selectedItem.confidenceLabel} placeholder="High confidence" onChange={(event) => patchText(selectedItem.id, "confidenceLabel", event.target.value)} /></FieldShell></div><FieldShell label="Short description" hint="180 characters or fewer." error={fieldError(fieldErrors, selectedIndex, "shortDescription")}><Textarea value={selectedItem.shortDescription} onChange={(event) => patchText(selectedItem.id, "shortDescription", event.target.value)} /></FieldShell><div className="flex flex-wrap gap-2"><Button type="button" variant={selectedItem.isFeatured ? "primary" : "secondary"} onClick={() => toggleFeatured(selectedItem)}>{selectedItem.isFeatured ? "Featured technology" : "Mark featured"}</Button><Button type="button" variant={selectedItem.isPublished ? "primary" : "secondary"} onClick={() => patchItem(selectedItem.id, "isPublished", !selectedItem.isPublished)}>{selectedItem.isPublished ? "Published" : "Keep private"}</Button></div>

<div className="space-y-4 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-sand-200/70" /><p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Project links</p></div><Button type="button" variant="ghost" onClick={() => addProject(selectedItem)} disabled={projects.length === 0 || selectedItem.projects.length >= 8}>Add project</Button></div>{selectedItem.projects.length === 0 ? <p className="text-xs leading-5 text-sand-300/65">Connect this technology to published case studies where it appears.</p> : null}{selectedItem.projects.map((project) => <div key={project.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 p-3"><p className="min-w-0 flex-1 truncate text-sm text-sand-50">{projects.find((candidate) => candidate.id === project.projectId)?.projectName ?? "Missing project"}</p><Button type="button" variant="ghost" onClick={() => removeProject(selectedItem.id, project.projectId)}>{project.isEnabled ? "Remove" : "Enable"}</Button></div>)}</div>

<div className="space-y-4 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ArrowUpRightIcon className="h-4 w-4 text-sand-200/70" /><p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Stack links</p></div><div className="flex gap-2">{STACK_LINK_KINDS.map((kind) => <Button key={kind} type="button" variant="ghost" onClick={() => addLink(selectedItem, kind)}>{kind}</Button>)}</div></div>{selectedItem.links.map((link, linkIndex) => <div key={link.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-3"><div className="flex items-center justify-between gap-3"><Badge tone="muted">{link.kind}</Badge><Button type="button" variant="ghost" onClick={() => removeLink(selectedItem.id, link.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Remove</Button></div><FieldShell label="Link label" error={fieldErrors[`stackItems.${selectedIndex}.links.${linkIndex}.label`]}><Input value={link.label} onChange={(event) => patchLink(selectedItem.id, link.id, "label", event.target.value)} /></FieldShell><FieldShell label="Link URL" hint="http or https only." error={fieldErrors[`stackItems.${selectedIndex}.links.${linkIndex}.url`]}><Input value={link.url} placeholder="https://..." onChange={(event) => patchLink(selectedItem.id, link.id, "url", event.target.value)} /></FieldShell></div>)}</div>
                  </div></div> : <div className="space-y-4"><Badge tone="muted">Technology settings</Badge><h3 className="font-display text-2xl tracking-tight text-sand-50">Select a technology to edit it.</h3><p className="text-sm leading-7 text-sand-200/80">Start with the tools that best explain how you make the work.</p></div>}</div></div></aside>
        </div>
      )}
    </div>
  );
}
