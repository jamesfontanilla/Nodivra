import type { Database } from "@/lib/supabase/database.types";

export type PageSection = Database["public"]["Tables"]["page_sections"]["Row"];
export type PageBlock = Database["public"]["Tables"]["page_blocks"]["Row"];

export interface PageSectionGroup {
  section: PageSection | null;
  blocks: PageBlock[];
  key: string;
  isUngrouped: boolean;
}

export function sortPageSections(sections: PageSection[]): PageSection[] {
  return [...sections].sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    if (a.created_at !== b.created_at) {
      return a.created_at.localeCompare(b.created_at);
    }
    return a.id.localeCompare(b.id);
  });
}

export function sortPageBlocks(blocks: PageBlock[]): PageBlock[] {
  return [...blocks].sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    if (a.created_at !== b.created_at) {
      return a.created_at.localeCompare(b.created_at);
    }
    return a.id.localeCompare(b.id);
  });
}

export function slugifySectionTitle(title: string): string {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const prefixed = normalized.match(/^[a-z]/)
    ? normalized
    : `section-${normalized}`;

  const safeSlug = prefixed.replace(/-+$/g, "");
  return safeSlug.length > 0 ? safeSlug.slice(0, 40) : "section";
}

export function buildUniqueSectionSlug(
  title: string,
  existingSlugs: string[]
): string {
  const normalizedExisting = new Set(
    existingSlugs.map((slug) => slug.toLowerCase())
  );
  const base = slugifySectionTitle(title);
  let suffix = 2;
  let candidate = base;

  while (normalizedExisting.has(candidate.toLowerCase())) {
    const suffixText = `-${suffix}`;
    const maxBaseLength = Math.max(1, 40 - suffixText.length);
    candidate = `${base.slice(0, maxBaseLength).replace(/-+$/g, "")}${suffixText}`;
    suffix += 1;
  }

  return candidate;
}

export function getNextSectionPosition(sections: PageSection[]): number {
  if (sections.length === 0) return 0;
  return (
    Math.max(...sections.map((section) => section.position)) + 1
  );
}

export function getNextBlockPosition(blocks: PageBlock[]): number {
  if (blocks.length === 0) return 0;
  return Math.max(...blocks.map((block) => block.position)) + 1;
}

export function groupPageBlocks(
  sections: PageSection[],
  blocks: PageBlock[]
): PageSectionGroup[] {
  const orderedSections = sortPageSections(sections);
  const orderedBlocks = sortPageBlocks(blocks);

  if (orderedSections.length === 0) {
    return [
      {
        section: null,
        blocks: orderedBlocks,
        key: "ungrouped",
        isUngrouped: true,
      },
    ];
  }

  const visibleSectionIds = new Set(orderedSections.map((section) => section.id));
  const groupedBlocks = new Map<string, PageBlock[]>();
  const ungroupedBlocks: PageBlock[] = [];

  for (const block of orderedBlocks) {
    if (block.section_id && visibleSectionIds.has(block.section_id)) {
      const current = groupedBlocks.get(block.section_id) ?? [];
      current.push(block);
      groupedBlocks.set(block.section_id, current);
    } else {
      ungroupedBlocks.push(block);
    }
  }

  const groups: PageSectionGroup[] = orderedSections.map((section) => ({
    section,
    blocks: sortPageBlocks(groupedBlocks.get(section.id) ?? []),
    key: section.id,
    isUngrouped: false,
  }));

  if (ungroupedBlocks.length > 0) {
    groups.push({
      section: null,
      blocks: sortPageBlocks(ungroupedBlocks),
      key: "ungrouped",
      isUngrouped: true,
    });
  }

  return groups;
}
