import { describe, expect, it } from "vitest";
import {
  buildUniqueSectionSlug,
  groupPageBlocks,
  sortPageSections,
  type PageBlock,
  type PageSection,
} from "../page-builder";

function makeSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: "section-about",
    profile_id: "profile-1",
    title: "About",
    slug: "about",
    position: 0,
    is_visible: true,
    is_collapsed_in_editor: false,
    created_at: "2026-07-17T00:00:00.000Z",
    updated_at: "2026-07-17T00:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

function makeBlock(overrides: Partial<PageBlock> = {}): PageBlock {
  return {
    id: "block-about",
    profile_id: "profile-1",
    section_id: "section-about",
    block_type: "text_section",
    title: "About",
    position: 0,
    is_visible: true,
    config: { body: "Hello world", format: "plain" },
    created_at: "2026-07-17T00:00:00.000Z",
    updated_at: "2026-07-17T00:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

describe("sortPageSections", () => {
  it("sorts sections by position", () => {
    const sections = [
      makeSection({ id: "section-work", title: "Work", slug: "work", position: 2 }),
      makeSection({ id: "section-about", title: "About", slug: "about", position: 0 }),
    ];

    const ordered = sortPageSections(sections);

    expect(ordered.map((section) => section.slug)).toEqual(["about", "work"]);
  });
});

describe("groupPageBlocks", () => {
  it("groups blocks by section and keeps unassigned blocks last", () => {
    const sections = [
      makeSection({ id: "section-work", title: "Work", slug: "work", position: 1 }),
      makeSection({ id: "section-about", title: "About", slug: "about", position: 0 }),
    ];

    const blocks = [
      makeBlock({
        id: "work-2",
        section_id: "section-work",
        title: "Work Two",
        position: 2,
      }),
      makeBlock({
        id: "about-1",
        section_id: "section-about",
        title: "About One",
        position: 1,
      }),
      makeBlock({
        id: "about-0",
        section_id: "section-about",
        title: "About Zero",
        position: 0,
      }),
      makeBlock({
        id: "loose-0",
        section_id: null,
        title: "Loose",
        position: 0,
      }),
    ];

    const groups = groupPageBlocks(sections, blocks);

    expect(groups.map((group) => group.section?.slug ?? "ungrouped")).toEqual([
      "about",
      "work",
      "ungrouped",
    ]);
    expect(groups[0].blocks.map((block) => block.id)).toEqual([
      "about-0",
      "about-1",
    ]);
    expect(groups[1].blocks.map((block) => block.id)).toEqual(["work-2"]);
    expect(groups[2].blocks.map((block) => block.id)).toEqual(["loose-0"]);
  });
});

describe("buildUniqueSectionSlug", () => {
  it("avoids duplicate slugs and respects the database length limit", () => {
    const slug = buildUniqueSectionSlug("About", ["about", "about-2"]);

    expect(slug).toBe("about-3");

    const longSlug = buildUniqueSectionSlug(
      "123 Custom Section With A Very Long Name",
      []
    );

    expect(longSlug).toMatch(/^[a-z]/);
    expect(longSlug.length).toBeLessThanOrEqual(40);
  });
});
