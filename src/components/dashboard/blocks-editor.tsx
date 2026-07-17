"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BLOCK_TYPES,
  sectionSchema,
  validateBlockConfig,
  type BlockType,
} from "@/lib/validations/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BlockConfigForm } from "./block-config-form";
import {
  buildUniqueSectionSlug,
  getNextBlockPosition,
  getNextSectionPosition,
  groupPageBlocks,
  type PageBlock,
  type PageSection,
  type PageSectionGroup,
} from "@/lib/page-builder";
import type { ProjectDetail } from "@/lib/projects";

const BLOCK_LABELS: Record<BlockType, string> = {
  link_button: "Link Button",
  social_link: "Social Link",
  project_highlight: "Project",
  text_section: "Text",
  image_card: "Image",
  divider: "Divider",
  cta_card: "CTA Card",
  availability_card: "Availability",
  external_resource: "Resource",
};

const BLOCK_ICONS: Record<BlockType, string> = {
  link_button: "↗",
  social_link: "@",
  project_highlight: "◆",
  text_section: "¶",
  image_card: "◻",
  divider: "—",
  cta_card: "★",
  availability_card: "●",
  external_resource: "⤴",
};

interface BlocksEditorProps {
  profileId: string;
  sections: PageSection[];
  blocks: PageBlock[];
  projects: ProjectDetail[];
}

export function BlocksEditor({
  profileId,
  sections,
  blocks,
  projects,
}: BlocksEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [creatingType, setCreatingType] = useState<BlockType | null>(null);
  const [pendingSectionId, setPendingSectionId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [blockTitle, setBlockTitle] = useState("");
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    setCollapsedSectionIds(
      new Set(
        sections
          .filter((section) => section.is_collapsed_in_editor)
          .map((section) => section.id)
      )
    );
  }, [sections]);

  const sectionGroups = useMemo(
    () => groupPageBlocks(sections, blocks),
    [sections, blocks]
  );

  const sectionOptions = useMemo(
    () => [
      { value: "", label: "Unassigned" },
      ...sections.map((section) => ({
        value: section.id,
        label: section.is_visible ? section.title : `${section.title} (hidden)`,
      })),
    ],
    [sections]
  );

  function getBlocksForSection(sectionId: string | null) {
    const group = sectionGroups.find(
      (item) => (item.section?.id ?? null) === sectionId
    );
    return group?.blocks ?? [];
  }

  function closeBlockDraft() {
    setEditingId(null);
    setCreatingType(null);
    setPendingSectionId(null);
    setSelectedSectionId(null);
    setBlockTitle("");
    setShowTypeSelector(false);
  }

  function startBlockCreation(sectionId: string | null) {
    setPendingSectionId(sectionId);
    setSelectedSectionId(sectionId ?? sections[0]?.id ?? null);
    setBlockTitle("");
    setEditingId(null);
    setShowSectionForm(false);
    setCreatingType(null);
    setShowTypeSelector(true);
  }

  function startBlockEdit(block: PageBlock) {
    setEditingId(block.id);
    setSelectedSectionId(block.section_id);
    setBlockTitle(
      block.title || BLOCK_LABELS[block.block_type as BlockType] || ""
    );
    setCreatingType(null);
    setPendingSectionId(null);
    setShowSectionForm(false);
    setShowTypeSelector(false);
  }

  async function handleCreateSection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = sectionTitle.trim();
    if (!title) {
      toast({
        title: "Validation error",
        description: "Section title is required",
        variant: "destructive",
      });
      return;
    }

    setSectionSaving(true);

    const slug = buildUniqueSectionSlug(
      title,
      sections.map((section) => section.slug)
    );
    const validation = sectionSchema.safeParse({
      title,
      slug,
      is_visible: true,
    });

    if (!validation.success) {
      toast({
        title: "Validation error",
        description: validation.error.errors[0]?.message,
        variant: "destructive",
      });
      setSectionSaving(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("page_sections").insert({
      profile_id: profileId,
      title: validation.data.title,
      slug: validation.data.slug,
      position: getNextSectionPosition(sections),
      is_visible: true,
      is_collapsed_in_editor: false,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Section added" });
      setSectionTitle("");
      setShowSectionForm(false);
      router.refresh();
    }

    setSectionSaving(false);
  }

  async function handleCreateBlock(config: Record<string, unknown>) {
    if (!creatingType) return;
    const title = blockTitle.trim() || BLOCK_LABELS[creatingType];
    const targetSectionId = selectedSectionId || null;
    const targetBlocks = getBlocksForSection(targetSectionId);

    setSaving(true);

    const validation = validateBlockConfig(creatingType, config);
    if (!validation.success) {
      toast({
        title: "Validation error",
        description: validation.error,
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("page_blocks").insert({
      profile_id: profileId,
      section_id: targetSectionId,
      block_type: creatingType,
      title,
      position: getNextBlockPosition(targetBlocks),
      is_visible: true,
      config: validation.data as Record<string, unknown>,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${BLOCK_LABELS[creatingType]} added` });
      closeBlockDraft();
      router.refresh();
    }

    setSaving(false);
  }

  async function handleSaveEdit(config: Record<string, unknown>, block: PageBlock) {
    const blockType = block.block_type as BlockType;
    const title = blockTitle.trim() || block.title || BLOCK_LABELS[blockType];
    const targetSectionId = selectedSectionId || null;
    const sectionChanged = targetSectionId !== (block.section_id ?? null);
    const targetBlocks = getBlocksForSection(targetSectionId);

    setSaving(true);

    const validation = validateBlockConfig(blockType, config);
    if (!validation.success) {
      toast({
        title: "Validation error",
        description: validation.error,
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("page_blocks")
      .update({
        title,
        section_id: targetSectionId,
        position: sectionChanged
          ? getNextBlockPosition(targetBlocks)
          : block.position,
        config: validation.data as Record<string, unknown>,
      })
      .eq("id", block.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Block saved" });
      closeBlockDraft();
      router.refresh();
    }

    setSaving(false);
  }

  async function handleDelete(blockId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("page_blocks")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", blockId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Block deleted" });
      closeBlockDraft();
      router.refresh();
    }
  }

  async function handleDuplicate(block: PageBlock) {
    const supabase = createClient();
    const targetBlocks = getBlocksForSection(block.section_id ?? null);
    const { error } = await supabase.from("page_blocks").insert({
      profile_id: profileId,
      section_id: block.section_id,
      block_type: block.block_type,
      title: block.title || BLOCK_LABELS[block.block_type as BlockType],
      position: getNextBlockPosition(targetBlocks),
      is_visible: block.is_visible,
      config: block.config as Record<string, unknown>,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Block duplicated" });
      router.refresh();
    }
  }

  async function handleToggleVisibility(blockId: string, current: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("page_blocks")
      .update({ is_visible: !current })
      .eq("id", blockId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    router.refresh();
  }

  async function handleToggleSectionVisibility(section: PageSection) {
    const supabase = createClient();
    const { error } = await supabase
      .from("page_sections")
      .update({ is_visible: !section.is_visible })
      .eq("id", section.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    router.refresh();
  }

  async function handleToggleSectionCollapse(section: PageSection) {
    const nextValue = !collapsedSectionIds.has(section.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("page_sections")
      .update({ is_collapsed_in_editor: nextValue })
      .eq("id", section.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCollapsedSectionIds((current) => {
      const next = new Set(current);
      if (nextValue) {
        next.add(section.id);
      } else {
        next.delete(section.id);
      }
      return next;
    });
    router.refresh();
  }

  async function handleMoveUp(blocksInGroup: PageBlock[], index: number) {
    if (index <= 0) return;
    await swapBlocks(blocksInGroup[index - 1], blocksInGroup[index]);
  }

  async function handleMoveDown(blocksInGroup: PageBlock[], index: number) {
    if (index >= blocksInGroup.length - 1) return;
    await swapBlocks(blocksInGroup[index], blocksInGroup[index + 1]);
  }

  async function swapBlocks(blockA: PageBlock, blockB: PageBlock) {
    const supabase = createClient();
    await Promise.all([
      supabase.from("page_blocks").update({ position: blockB.position }).eq("id", blockA.id),
      supabase.from("page_blocks").update({ position: blockA.position }).eq("id", blockB.id),
    ]);
    router.refresh();
  }

  function renderBlockEditor(block: PageBlock) {
    const activeBlockType = block.block_type as BlockType;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground">
              Edit {BLOCK_LABELS[activeBlockType] ?? block.block_type}
            </span>
            <p className="text-xs text-muted-foreground">
              Change the block title, section, or content.
            </p>
          </div>
          <button
            onClick={closeBlockDraft}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-500"
          >
            Cancel
          </button>
        </div>

        <BlockDraftFields
          blockTitle={blockTitle}
          setBlockTitle={setBlockTitle}
          sections={sectionOptions}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          blockType={activeBlockType}
          initialConfig={block.config as Record<string, unknown>}
          projects={projects}
          onSave={(config) => handleSaveEdit(config, block)}
          onCancel={closeBlockDraft}
          saving={saving}
        />
      </div>
    );
  }

  function renderNewBlockForm() {
    if (!creatingType) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground">
              New {BLOCK_LABELS[creatingType]}
            </span>
            <p className="text-xs text-muted-foreground">
              Choose where this block lives and then define the safe JSON config.
            </p>
          </div>
          <button
            onClick={closeBlockDraft}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-500"
          >
            Cancel
          </button>
        </div>

        <BlockDraftFields
          blockTitle={blockTitle}
          setBlockTitle={setBlockTitle}
          sections={sectionOptions}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          blockType={creatingType}
          initialConfig={{}}
          projects={projects}
          onSave={handleCreateBlock}
          onCancel={closeBlockDraft}
          saving={saving}
        />
      </div>
    );
  }

  function renderSectionGroup(group: PageSectionGroup, index: number) {
    const section = group.section;
    const isCollapsed = section ? collapsedSectionIds.has(section.id) : false;

    return (
      <div
        key={group.key}
        className="bezel-outer animate-fade-up"
        style={{
          animationDelay: `${index * 50}ms`,
          animationFillMode: "forwards",
        }}
      >
        <div className="bezel-inner p-5 md:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-primary">
                  {section ? section.title : "Unassigned"}
                </span>
                {section && (
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-medium",
                      section.is_visible
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-foreground/5 text-muted-foreground dark:bg-white/5"
                    )}
                  >
                    {section.is_visible ? "Visible" : "Hidden"}
                  </span>
                )}
              </div>
              {section ? (
                <p className="text-sm text-muted-foreground">
                  Slug: <span className="text-foreground/75">/{section.slug}</span>
                  {" · "}
                  {group.blocks.length} block{group.blocks.length === 1 ? "" : "s"}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Blocks that are not assigned to a section yet.
                </p>
              )}
            </div>

            {section ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSectionCollapse(section)}
                  className="rounded-full px-3 py-1 text-xs text-muted-foreground ring-1 ring-black/5 dark:ring-white/8 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground hover:bg-foreground/5 dark:hover:bg-white/5"
                >
                  {isCollapsed ? "Expand" : "Collapse"}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Show</span>
                  <Switch
                    checked={section.is_visible}
                    onCheckedChange={() => handleToggleSectionVisibility(section)}
                    aria-label={`Toggle visibility for ${section.title}`}
                  />
                </div>
              </div>
            ) : (
              <Button
                onClick={() => startBlockCreation(null)}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                Add block here
              </Button>
            )}
          </div>

          {section && (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-foreground/[0.02] px-4 py-3 dark:bg-white/[0.02]">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Section actions
                </p>
                <p className="text-sm text-muted-foreground">
                  Add blocks directly into this group.
                </p>
              </div>
              <Button
                onClick={() => startBlockCreation(section.id)}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                Add block here
              </Button>
            </div>
          )}

          {section && isCollapsed ? (
            <div className="rounded-2xl ring-1 ring-black/5 dark:ring-white/8 bg-foreground/[0.02] dark:bg-white/[0.02] px-4 py-5">
              <p className="text-sm text-muted-foreground">
                This section is collapsed in the editor. Expand it to reorder or
                edit the blocks inside.
              </p>
            </div>
          ) : (
            <>
              {group.blocks.length === 0 ? (
                <div className="rounded-2xl ring-1 ring-black/5 dark:ring-white/8 bg-foreground/[0.02] dark:bg-white/[0.02] px-4 py-5">
                  <p className="text-sm text-muted-foreground">
                    {section
                      ? "No blocks in this section yet."
                      : "Drop loose blocks here until you group them into a section."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {group.blocks.map((block, blockIndex) => (
                    <div
                      key={block.id}
                      className="rounded-2xl ring-1 ring-black/5 dark:ring-white/8 bg-background/80 dark:bg-white/[0.02] p-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-primary/20"
                    >
                      {editingId === block.id ? (
                        renderBlockEditor(block)
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleMoveUp(group.blocks, blockIndex)}
                              disabled={blockIndex === 0}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                              aria-label="Move up"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-current stroke-[1.5]"
                              >
                                <path d="M18 15l-6-6-6 6" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleMoveDown(group.blocks, blockIndex)}
                              disabled={blockIndex === group.blocks.length - 1}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                              aria-label="Move down"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-current stroke-[1.5]"
                              >
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                          </div>
                          <button
                            className="flex flex-1 min-w-0 cursor-pointer text-left"
                            onClick={() => startBlockEdit(block)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                startBlockEdit(block);
                              }
                            }}
                            aria-label={`Edit ${block.title || BLOCK_LABELS[block.block_type as BlockType]}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg opacity-60">
                                {BLOCK_ICONS[block.block_type as BlockType] ?? "□"}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {block.title || BLOCK_LABELS[block.block_type as BlockType]}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {BLOCK_LABELS[block.block_type as BlockType]}
                                  {block.section_id && section ? ` · /${section.slug}` : ""}
                                </p>
                              </div>
                            </div>
                          </button>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={block.is_visible}
                              onCheckedChange={() =>
                                handleToggleVisibility(block.id, block.is_visible)
                              }
                              aria-label="Toggle visibility"
                            />
                            <button
                              onClick={() => handleDuplicate(block)}
                              className="p-1.5 text-muted-foreground hover:text-foreground transition-all duration-500"
                              aria-label="Duplicate"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-current stroke-[1.5]"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                              </svg>
                            </button>
                            <button
                              onClick={() => startBlockEdit(block)}
                              className="p-1.5 text-muted-foreground hover:text-foreground transition-all duration-500"
                              aria-label="Edit"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-current stroke-[1.5]"
                              >
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(block.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive transition-all duration-500"
                              aria-label="Delete"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-current stroke-[1.5]"
                              >
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bezel-outer">
        <div className="bezel-inner space-y-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-primary">
                Page sections
              </span>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Organize your blocks
                </h2>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Group content into About, Work, Writing, Contact, or any custom
                  sections you need. Collapsing a section only affects the editor.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => startBlockCreation(sections[0]?.id ?? null)}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                Add block
              </Button>
              <Button
                onClick={() => setShowSectionForm((current) => !current)}
                size="sm"
                className="rounded-full"
              >
                Add section
              </Button>
            </div>
          </div>

          {showSectionForm && (
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div className="space-y-2">
                  <Label htmlFor="section_title" className="text-xs">
                    Section title
                  </Label>
                  <Input
                    id="section_title"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="About, Work, Writing..."
                    maxLength={80}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={sectionSaving}>
                    {sectionSaving ? "Saving..." : "Create section"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowSectionForm(false);
                      setSectionTitle("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {creatingType && (
        <div className="bezel-outer animate-fade-up">
          <div className="bezel-inner p-6 space-y-4">{renderNewBlockForm()}</div>
        </div>
      )}

      {sectionGroups.length === 1 &&
      sectionGroups[0].isUngrouped &&
      sectionGroups[0].blocks.length === 0 ? (
        <div className="bezel-outer">
          <div className="bezel-inner p-10 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              No blocks yet. Start with a section, then add blocks inside it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={() => setShowSectionForm(true)} className="rounded-full">
                Add your first section
              </Button>
              <Button
                variant="outline"
                onClick={() => startBlockCreation(null)}
                className="rounded-full"
              >
                Add a block first
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sectionGroups.map((group, index) => renderSectionGroup(group, index))}
        </div>
      )}

      {showTypeSelector && !creatingType && !editingId && (
        <div className="bezel-outer animate-fade-up">
          <div className="bezel-inner p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground">
                Choose block type
              </span>
              <button
                onClick={closeBlockDraft}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-500"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BLOCK_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setCreatingType(type);
                    setSelectedSectionId(pendingSectionId ?? sections[0]?.id ?? null);
                    setBlockTitle(BLOCK_LABELS[type]);
                    setShowTypeSelector(false);
                  }}
                  className={cn(
                    "group flex flex-col items-center gap-2 rounded-xl p-4 ring-1 ring-black/5 dark:ring-white/6",
                    "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    "hover:ring-primary/30 hover:bg-primary/5 active:scale-[0.97]"
                  )}
                >
                  <span className="text-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                    {BLOCK_ICONS[type]}
                  </span>
                  <span className="text-[11px] font-medium">{BLOCK_LABELS[type]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BlockDraftFieldsProps {
  blockType: BlockType;
  blockTitle: string;
  setBlockTitle: (_value: string) => void;
  sections: Array<{ value: string; label: string }>;
  selectedSectionId: string | null;
  setSelectedSectionId: (_value: string | null) => void;
  initialConfig: Record<string, unknown>;
  projects: ProjectDetail[];
  onSave: (_config: Record<string, unknown>) => void;
  onCancel: () => void;
  saving: boolean;
}

function BlockDraftFields({
  blockType,
  blockTitle,
  setBlockTitle,
  sections,
  selectedSectionId,
  setSelectedSectionId,
  initialConfig,
  projects,
  onSave,
  onCancel,
  saving,
}: BlockDraftFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Block title</Label>
        <Input
          value={blockTitle}
          onChange={(e) => setBlockTitle(e.target.value)}
          placeholder="Block title"
          maxLength={120}
          required
        />
      </div>

      <SectionSelect
        sections={sections}
        value={selectedSectionId}
        onChange={setSelectedSectionId}
      />

      <BlockConfigForm
        blockType={blockType}
        initialConfig={initialConfig}
        projects={projects}
        onSave={onSave}
        onCancel={onCancel}
        saving={saving}
      />
    </div>
  );
}

interface SectionSelectProps {
  sections: Array<{ value: string; label: string }>;
  value: string | null;
  onChange: (_value: string | null) => void;
}

function SectionSelect({ sections, value, onChange }: SectionSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">Section</Label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="flex h-11 w-full rounded-xl ring-1 ring-black/8 dark:ring-white/8 bg-white/60 dark:bg-white/4 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
      >
        {sections.map((section) => (
          <option key={section.value} value={section.value}>
            {section.label}
          </option>
        ))}
      </select>
    </div>
  );
}
