"use client";

import { useState } from "react";
import { PublicBlocks } from "@/components/public-blocks";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  GripIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { sortBlocks, toPublicBlocks, toPublicSections } from "@/lib/snapshot";
import type {
  AvailabilityCardConfiguration,
  BlockConfiguration,
  BlockType,
  CtaCardConfiguration,
  DividerConfiguration,
  ExternalResourceConfiguration,
  ImageCardConfiguration,
  LinkButtonConfiguration,
  ProfileBlockDraft,
  ProfileSectionDraft,
  ProjectHighlightConfiguration,
  SocialLinkConfiguration,
  TextSectionConfiguration,
} from "@/types/nodivra";
import {
  Badge,
  Button,
  EmptyState,
  FieldShell,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

const BLOCK_TYPE_OPTIONS: Array<{ value: BlockType; label: string; note: string }> = [
  { value: "link_button", label: "Link button", note: "A focused external action." },
  { value: "social_link", label: "Social link", note: "A compact network presence." },
  { value: "project_highlight", label: "Project highlight", note: "A case-study style proof point." },
  { value: "text_section", label: "Text section", note: "A short editorial statement." },
  { value: "image_card", label: "Image card", note: "One safe image with alt text." },
  { value: "divider", label: "Divider", note: "A visual pause between pieces." },
  { value: "cta_card", label: "Call to action", note: "A considered next step." },
  { value: "availability_card", label: "Availability", note: "A current working signal." },
  { value: "external_resource", label: "External resource", note: "A safe, embed-free reference." },
];

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const suffix = Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12);
  return `00000000-0000-4000-8000-${suffix}`;
}

function timestamp() {
  return new Date().toISOString();
}

function slugify(value: string, fallback: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function createSection(profileId: string, position: number): ProfileSectionDraft {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    title: "New section",
    slug: `section-${position + 1}`,
    position,
    isVisible: true,
    isCollapsed: false,
    createdAt: now,
    updatedAt: now,
  };
}

function defaultConfiguration(type: BlockType): BlockConfiguration {
  switch (type) {
    case "link_button":
      return { label: "Explore the link", url: "https://example.com", detail: "example.com", iconLabel: "" } satisfies LinkButtonConfiguration;
    case "social_link":
      return { network: "Network", label: "Your handle", url: "https://example.com", iconLabel: "" } satisfies SocialLinkConfiguration;
    case "project_highlight":
      return { projectName: "A project worth showing", summary: "A concise summary of the result, your role, and the reason it mattered.", role: "Your role", technologies: ["TypeScript"], url: "https://example.com" } satisfies ProjectHighlightConfiguration;
    case "text_section":
      return { body: "Add a short, considered statement about your work.", align: "left" } satisfies TextSectionConfiguration;
    case "image_card":
      return { imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80", altText: "Describe the image for people using a screen reader", caption: "Optional image caption." } satisfies ImageCardConfiguration;
    case "divider":
      return { style: "line", label: "" } satisfies DividerConfiguration;
    case "cta_card":
      return { body: "Invite the right person to take the next step.", ctaLabel: "Continue", ctaUrl: "https://example.com", accent: "sand" } satisfies CtaCardConfiguration;
    case "availability_card":
      return { status: "available", detail: "Share the working context you want people to know.", timezone: "UTC" } satisfies AvailabilityCardConfiguration;
    case "external_resource":
      return { resourceType: "article", url: "https://example.com", description: "Explain why this resource is worth opening." } satisfies ExternalResourceConfiguration;
  }
}

function createBlock(profileId: string, sectionId: string, type: BlockType, position: number): ProfileBlockDraft {
  const now = timestamp();
  const option = BLOCK_TYPE_OPTIONS.find((candidate) => candidate.value === type);
  return {
    id: createId(),
    profileId,
    sectionId,
    type,
    title: option?.label ?? "New block",
    visibility: "public",
    position,
    configuration: defaultConfiguration(type),
    createdAt: now,
    updatedAt: now,
  };
}

function blockLabel(type: BlockType) {
  return BLOCK_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

function BlockConfigurationFields({
  block,
  onChange,
}: {
  block: ProfileBlockDraft;
  onChange: (key: string, value: unknown) => void;
}) {
  const config = block.configuration;
  switch (block.type) {
    case "link_button": {
      const value = config as LinkButtonConfiguration;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="Button label" hint="1 to 48 characters."><Input value={value.label} onChange={(event) => onChange("label", event.target.value)} /></FieldShell>
          <FieldShell label="URL" hint="http or https only."><Input value={value.url} onChange={(event) => onChange("url", event.target.value)} /></FieldShell>
          <FieldShell label="Detail" hint="Optional supporting text."><Input value={value.detail} onChange={(event) => onChange("detail", event.target.value)} /></FieldShell>
          <FieldShell label="Icon label" hint="Optional short code."><Input value={value.iconLabel} maxLength={8} onChange={(event) => onChange("iconLabel", event.target.value)} /></FieldShell>
        </div>
      );
    }
    case "social_link": {
      const value = config as SocialLinkConfiguration;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="Network" hint="Mastodon, Dribbble, etc."><Input value={value.network} onChange={(event) => onChange("network", event.target.value)} /></FieldShell>
          <FieldShell label="Label" hint="Your public handle or name."><Input value={value.label} onChange={(event) => onChange("label", event.target.value)} /></FieldShell>
          <FieldShell label="URL" hint="http or https only."><Input value={value.url} onChange={(event) => onChange("url", event.target.value)} /></FieldShell>
          <FieldShell label="Icon label" hint="Optional short code."><Input value={value.iconLabel} maxLength={8} onChange={(event) => onChange("iconLabel", event.target.value)} /></FieldShell>
        </div>
      );
    }
    case "project_highlight": {
      const value = config as ProjectHighlightConfiguration;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="Project name" hint="The headline of the proof point."><Input value={value.projectName} onChange={(event) => onChange("projectName", event.target.value)} /></FieldShell>
          <FieldShell label="Role" hint="Optional role or contribution."><Input value={value.role} onChange={(event) => onChange("role", event.target.value)} /></FieldShell>
          <FieldShell label="Case study URL" hint="Optional http or https URL."><Input value={value.url} onChange={(event) => onChange("url", event.target.value)} /></FieldShell>
          <FieldShell label="Technologies" hint="Comma-separated, up to six."><Input value={value.technologies.join(", ")} onChange={(event) => onChange("technologies", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></FieldShell>
          <div className="md:col-span-2"><FieldShell label="Summary" hint="220 characters or fewer."><Textarea value={value.summary} onChange={(event) => onChange("summary", event.target.value)} /></FieldShell></div>
        </div>
      );
    }
    case "text_section": {
      const value = config as TextSectionConfiguration;
      return (
        <div className="space-y-4">
          <FieldShell label="Body" hint="1,200 characters or fewer."><Textarea value={value.body} onChange={(event) => onChange("body", event.target.value)} /></FieldShell>
          <FieldShell label="Alignment" hint="Keep editorial copy easy to scan."><Select value={value.align} onChange={(event) => onChange("align", event.target.value)}><option value="left">Left</option><option value="center">Center</option></Select></FieldShell>
        </div>
      );
    }
    case "image_card": {
      const value = config as ImageCardConfiguration;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="Image URL" hint="Remote image, http or https only."><Input value={value.imageUrl} onChange={(event) => onChange("imageUrl", event.target.value)} /></FieldShell>
          <FieldShell label="Alt text" hint="Required for accessibility."><Input value={value.altText} onChange={(event) => onChange("altText", event.target.value)} /></FieldShell>
          <div className="md:col-span-2"><FieldShell label="Caption" hint="Optional, 160 characters or fewer."><Input value={value.caption} onChange={(event) => onChange("caption", event.target.value)} /></FieldShell></div>
        </div>
      );
    }
    case "divider": {
      const value = config as DividerConfiguration;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="Style" hint="Line or breathing space."><Select value={value.style} onChange={(event) => onChange("style", event.target.value)}><option value="line">Line</option><option value="space">Space</option></Select></FieldShell>
          <FieldShell label="Label" hint="Optional marker."><Input value={value.label} onChange={(event) => onChange("label", event.target.value)} /></FieldShell>
        </div>
      );
    }
    case "cta_card": {
      const value = config as CtaCardConfiguration;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="CTA label" hint="The button text."><Input value={value.ctaLabel} onChange={(event) => onChange("ctaLabel", event.target.value)} /></FieldShell>
          <FieldShell label="CTA URL" hint="http or https only."><Input value={value.ctaUrl} onChange={(event) => onChange("ctaUrl", event.target.value)} /></FieldShell>
          <FieldShell label="Accent" hint="Choose the block mood."><Select value={value.accent} onChange={(event) => onChange("accent", event.target.value)}><option value="sand">Sand</option><option value="moss">Moss</option><option value="ink">Ink</option></Select></FieldShell>
          <div className="md:col-span-2"><FieldShell label="Body" hint="240 characters or fewer."><Textarea value={value.body} onChange={(event) => onChange("body", event.target.value)} /></FieldShell></div>
        </div>
      );
    }
    case "availability_card": {
      const value = config as AvailabilityCardConfiguration;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="Status" hint="Shown with a clear state."><Select value={value.status} onChange={(event) => onChange("status", event.target.value)}><option value="available">Available</option><option value="busy">Heads down</option><option value="away">Away</option><option value="offline">Offline</option></Select></FieldShell>
          <FieldShell label="Timezone" hint="Short timezone label."><Input value={value.timezone} onChange={(event) => onChange("timezone", event.target.value)} /></FieldShell>
          <div className="md:col-span-2"><FieldShell label="Detail" hint="160 characters or fewer."><Textarea value={value.detail} onChange={(event) => onChange("detail", event.target.value)} /></FieldShell></div>
        </div>
      );
    }
    case "external_resource": {
      const value = config as ExternalResourceConfiguration;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldShell label="Resource type" hint="No embeds, just a safe link."><Select value={value.resourceType} onChange={(event) => onChange("resourceType", event.target.value)}><option value="article">Article</option><option value="video">Video</option><option value="document">Document</option><option value="tool">Tool</option><option value="other">Other</option></Select></FieldShell>
          <FieldShell label="URL" hint="http or https only."><Input value={value.url} onChange={(event) => onChange("url", event.target.value)} /></FieldShell>
          <div className="md:col-span-2"><FieldShell label="Description" hint="220 characters or fewer."><Textarea value={value.description} onChange={(event) => onChange("description", event.target.value)} /></FieldShell></div>
        </div>
      );
    }
  }
}

export function BlocksEditor({
  profileId,
  sections,
  blocks,
  onChange,
  fieldErrors,
}: {
  profileId: string;
  sections: ProfileSectionDraft[];
  blocks: ProfileBlockDraft[];
  onChange: (sections: ProfileSectionDraft[], blocks: ProfileBlockDraft[]) => void;
  fieldErrors: Record<string, string>;
}) {
  const [newBlockType, setNewBlockType] = useState<BlockType>("link_button");
  const [showPreview, setShowPreview] = useState(false);

  function updateSections(nextSections: ProfileSectionDraft[]) {
    onChange(nextSections.map((section, position) => ({ ...section, position })), blocks);
  }

  function updateBlocks(nextBlocks: ProfileBlockDraft[]) {
    onChange(sections, nextBlocks);
  }

  function addSection() {
    updateSections([...sections, createSection(profileId, sections.length)]);
  }

  function patchSection(id: string, key: keyof ProfileSectionDraft, value: string | boolean) {
    updateSections(sections.map((section) => section.id === id ? { ...section, [key]: key === "slug" ? slugify(String(value), `section-${section.position + 1}`) : value, updatedAt: timestamp() } : section));
  }

  function moveSection(id: string, direction: "up" | "down") {
    const index = sections.findIndex((section) => section.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= sections.length) return;
    const next = [...sections];
    const [selected] = next.splice(index, 1);
    next.splice(target, 0, selected);
    updateSections(next.map((section, position) => ({ ...section, position, updatedAt: timestamp() })));
  }

  function removeSection(id: string) {
    const nextSections = sections
      .filter((section) => section.id !== id)
      .map((section, position) => ({ ...section, position, updatedAt: timestamp() }));
    const remainingBlocks = blocks.filter((block) => block.sectionId !== id);
    const positions = new Map<string, number>();
    const nextBlocks = remainingBlocks.map((block) => {
      const position = positions.get(block.sectionId) ?? 0;
      positions.set(block.sectionId, position + 1);
      return { ...block, position, updatedAt: timestamp() };
    });
    onChange(nextSections, nextBlocks);
  }

  function addBlock(sectionId?: string) {
    let targetSectionId = sectionId;
    let nextSections = sections;
    if (!targetSectionId) {
      targetSectionId = sections[0]?.id;
    }
    if (!targetSectionId) {
      const section = createSection(profileId, 0);
      nextSections = [section];
      targetSectionId = section.id;
    }
    const sectionBlocks = blocks.filter((block) => block.sectionId === targetSectionId);
    const block = createBlock(profileId, targetSectionId, newBlockType, sectionBlocks.length);
    onChange(nextSections, [...blocks, block]);
  }

  function patchBlock(id: string, key: keyof ProfileBlockDraft, value: string) {
    updateBlocks(blocks.map((block) => block.id === id ? { ...block, [key]: value, updatedAt: timestamp() } as ProfileBlockDraft : block));
  }

  function patchConfiguration(id: string, key: string, value: unknown) {
    updateBlocks(blocks.map((block) => block.id === id ? { ...block, configuration: { ...block.configuration, [key]: value } as BlockConfiguration, updatedAt: timestamp() } : block));
  }

  function removeBlock(id: string) {
    const next = blocks.filter((block) => block.id !== id);
    const positions = new Map<string, number>();
    updateBlocks(next.map((block) => {
      const position = positions.get(block.sectionId) ?? 0;
      positions.set(block.sectionId, position + 1);
      return { ...block, position };
    }));
  }

  function duplicateBlock(id: string) {
    const source = blocks.find((block) => block.id === id);
    if (!source) return;
    const copy = { ...source, id: createId(), title: `${source.title} copy`, position: source.position + 1, createdAt: timestamp(), updatedAt: timestamp(), configuration: { ...source.configuration } as BlockConfiguration };
    const next = blocks.flatMap((block) => {
      if (block.sectionId === source.sectionId && block.position > source.position) {
        return [{ ...block, position: block.position + 1 }, block.id === source.id ? copy : null].filter(Boolean) as ProfileBlockDraft[];
      }
      return block.id === source.id ? [block, copy] : [block];
    });
    updateBlocks(next);
  }

  function moveBlock(id: string, direction: "up" | "down") {
    const source = blocks.find((block) => block.id === id);
    if (!source) return;
    const group = sortBlocks(blocks.filter((block) => block.sectionId === source.sectionId));
    const index = group.findIndex((block) => block.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= group.length) return;
    const [selected] = group.splice(index, 1);
    group.splice(target, 0, selected);
    const positions = new Map(group.map((block, position) => [block.id, position]));
    updateBlocks(blocks.map((block) => positions.has(block.id) ? { ...block, position: positions.get(block.id)!, updatedAt: timestamp() } : block));
  }

  const previewSections = toPublicSections(sections);
  const previewBlocks = toPublicBlocks(blocks, previewSections);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10">
        <div className="rounded-[1.625rem] bg-ink-950/88 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge tone="accent">Nodivra Blocks</Badge>
              <h2 className="font-display text-3xl tracking-tight text-sand-50 sm:text-4xl">Compose a page with more range.</h2>
              <p className="max-w-2xl text-sm leading-7 text-sand-200/80">Group proof, context, resources, and next steps into sections. Every block is validated, bounded, and safe to publish.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant={showPreview ? "primary" : "secondary"} onClick={() => setShowPreview((value) => !value)}>
                {showPreview ? "Hide block preview" : "Preview blocks"}
              </Button>
              <Button type="button" variant="secondary" onClick={addSection} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add section</Button>
            </div>
          </div>
          {fieldErrors.blocks ? <p className="mt-4 rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-300/30">{fieldErrors.blocks}</p> : null}
        </div>
      </div>

      {showPreview ? (
        <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10">
          <div className="rounded-[1.625rem] bg-ink-950/88 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-6">
            <div className="mb-3 flex items-center justify-between gap-4"><p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Block preview</p><Badge tone="muted">Draft only</Badge></div>
            {previewSections.length > 0 && previewBlocks.length > 0 ? <PublicBlocks sections={previewSections} blocks={previewBlocks} /> : <EmptyState title="Nothing visible yet" description="Add a section and a public block to see the composition here." />}
          </div>
        </div>
      ) : null}

      {sections.length === 0 ? (
        <EmptyState title="Start with a section" description="Sections keep the page readable. Add one for About, Work, Writing, Contact, or any other part of your story." action={<Button type="button" variant="secondary" onClick={addSection} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add your first section</Button>} />
      ) : null}

      <div className="space-y-4">
        {sections.map((section, sectionIndex) => {
          const sectionBlocks = sortBlocks(blocks.filter((block) => block.sectionId === section.id));
          return (
            <section key={section.id} className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10">
              <div className="rounded-[1.625rem] bg-ink-950/88 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-sand-300/70 ring-1 ring-white/10"><GripIcon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2"><Badge tone="accent">Section {String(sectionIndex + 1).padStart(2, "0")}</Badge><Badge tone={section.isVisible ? "success" : "muted"}>{section.isVisible ? "Visible" : "Hidden"}</Badge><Badge tone="muted">{sectionBlocks.length} blocks</Badge></div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FieldShell label="Section title" hint="Shown publicly."><Input value={section.title} onChange={(event) => patchSection(section.id, "title", event.target.value)} /></FieldShell>
                        <FieldShell label="Slug" hint="Lowercase anchor label."><Input value={section.slug} onChange={(event) => patchSection(section.id, "slug", event.target.value)} /></FieldShell>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    <Button type="button" variant="ghost" onClick={() => patchSection(section.id, "isCollapsed", !section.isCollapsed)} trailingIcon={section.isCollapsed ? <ChevronDownIcon className="h-3.5 w-3.5" /> : <ChevronUpIcon className="h-3.5 w-3.5" />}>{section.isCollapsed ? "Expand" : "Collapse"}</Button>
                    <Button type="button" variant="ghost" onClick={() => patchSection(section.id, "isVisible", !section.isVisible)}>{section.isVisible ? "Hide" : "Show"}</Button>
                    <Button type="button" variant="ghost" onClick={() => moveSection(section.id, "up")} disabled={sectionIndex === 0} trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}>Up</Button>
                    <Button type="button" variant="ghost" onClick={() => moveSection(section.id, "down")} disabled={sectionIndex === sections.length - 1} trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}>Down</Button>
                    <Button type="button" variant="danger" onClick={() => removeSection(section.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button>
                  </div>
                </div>

                {!section.isCollapsed ? (
                  <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                    <div className="flex flex-col gap-3 rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10 sm:flex-row sm:items-end sm:justify-between">
                      <FieldShell label="New block type" hint="Configurations stay type-safe.">
                        <Select value={newBlockType} onChange={(event) => setNewBlockType(event.target.value as BlockType)}>
                          {BLOCK_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </Select>
                      </FieldShell>
                      <Button type="button" variant="secondary" onClick={() => addBlock(section.id)} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add block</Button>
                    </div>

                    {sectionBlocks.length === 0 ? <EmptyState title="No blocks in this section" description="Choose a block type above to add the next layer of your public page." /> : null}
                    <div className="space-y-4">
                      {sectionBlocks.map((block, blockIndex) => (
                        <div key={block.id} className="rounded-[1.5rem] bg-black/10 p-1.5 ring-1 ring-white/10">
                          <div className="rounded-[1.25rem] bg-white/5 p-4 sm:p-5">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-[10px] font-semibold tracking-[0.18em] text-ink-950">{String(blockIndex + 1).padStart(2, "0")}</div>
                                <div className="min-w-0 flex-1 space-y-1"><div className="flex flex-wrap items-center gap-2"><Badge tone="muted">{blockLabel(block.type)}</Badge><Badge tone={block.visibility === "public" ? "success" : "muted"}>{block.visibility === "public" ? "Public" : "Hidden"}</Badge></div><p className="text-xs text-sand-300/70">Typed configuration with safe external links only.</p></div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                                <Button type="button" variant="ghost" onClick={() => moveBlock(block.id, "up")} disabled={blockIndex === 0} trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}>Up</Button>
                                <Button type="button" variant="ghost" onClick={() => moveBlock(block.id, "down")} disabled={blockIndex === sectionBlocks.length - 1} trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}>Down</Button>
                                <Button type="button" variant="ghost" onClick={() => patchBlock(block.id, "visibility", block.visibility === "public" ? "hidden" : "public")}>{block.visibility === "public" ? "Hide" : "Show"}</Button>
                                <Button type="button" variant="ghost" onClick={() => duplicateBlock(block.id)} trailingIcon={<CopyIcon className="h-3.5 w-3.5" />}>Duplicate</Button>
                                <Button type="button" variant="danger" onClick={() => removeBlock(block.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button>
                              </div>
                            </div>
                            <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
                              <FieldShell label="Block title" hint="1 to 80 characters."><Input value={block.title} onChange={(event) => patchBlock(block.id, "title", event.target.value)} /></FieldShell>
                              <BlockConfigurationFields block={block} onChange={(key, value) => patchConfiguration(block.id, key, value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
