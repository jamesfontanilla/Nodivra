import { describe, expect, it } from "vitest";
import {
  buildPublicProfileSnapshot,
  splitVisibleLinks,
} from "@/lib/snapshot";

describe("public snapshot helpers", () => {
  it("sorts and filters links before publishing", () => {
    const snapshot = buildPublicProfileSnapshot(
      {
        id: "11111111-1111-1111-1111-111111111111",
        ownerId: "11111111-1111-1111-1111-111111111111",
        handle: "jamie-fontanilla",
        displayName: "Jamie Fontanilla",
        headline: "Designing polished developer surfaces.",
        bio: "Bio",
        locationText: "Austin, TX",
        timezone: "America/Chicago",
        avatarInitials: "JF",
        avatarUrl: "",
        primaryCtaLabel: "Book a call",
        primaryCtaUrl: "https://example.com/book",
        availabilityStatus: "available",
        isPublished: false,
        createdAt: "2026-07-18T00:00:00.000Z",
        updatedAt: "2026-07-18T00:00:00.000Z",
      },
      [
        {
          id: "a",
          profileId: "11111111-1111-1111-1111-111111111111",
          title: "Hidden link",
          url: "https://example.com/hidden",
          iconLabel: "03",
          visibility: "hidden",
          isEnabled: true,
          position: 3,
          createdAt: "2026-07-18T00:00:03.000Z",
          updatedAt: "2026-07-18T00:00:03.000Z",
        },
        {
          id: "b",
          profileId: "11111111-1111-1111-1111-111111111111",
          title: "Social link",
          url: "https://example.com/social",
          iconLabel: "02",
          visibility: "social",
          isEnabled: true,
          position: 2,
          createdAt: "2026-07-18T00:00:02.000Z",
          updatedAt: "2026-07-18T00:00:02.000Z",
        },
        {
          id: "c",
          profileId: "11111111-1111-1111-1111-111111111111",
          title: "Public link",
          url: "https://example.com/public",
          iconLabel: "01",
          visibility: "public",
          isEnabled: true,
          position: 1,
          createdAt: "2026-07-18T00:00:01.000Z",
          updatedAt: "2026-07-18T00:00:01.000Z",
        },
        {
          id: "d",
          profileId: "11111111-1111-1111-1111-111111111111",
          title: "Disabled link",
          url: "https://example.com/disabled",
          iconLabel: "04",
          visibility: "public",
          isEnabled: false,
          position: 0,
          createdAt: "2026-07-18T00:00:00.000Z",
          updatedAt: "2026-07-18T00:00:00.000Z",
        },
      ],
      "2026-07-18T00:05:00.000Z",
    );

    expect(snapshot.publishedLinks).toHaveLength(2);
    expect(snapshot.publishedLinks[0]?.title).toBe("Public link");
    expect(snapshot.publishedLinks[1]?.title).toBe("Social link");

    const split = splitVisibleLinks(snapshot.publishedLinks);
    expect(split.primary).toHaveLength(1);
    expect(split.social).toHaveLength(1);
  });

  it("publishes visible blocks in section and position order", () => {
    const profile = {
      id: "11111111-1111-1111-1111-111111111111",
      ownerId: "11111111-1111-1111-1111-111111111111",
      handle: "jamie-fontanilla",
      displayName: "Jamie Fontanilla",
      headline: "Designing polished developer surfaces.",
      bio: "Bio",
      locationText: "Austin, TX",
      timezone: "America/Chicago",
      avatarInitials: "JF",
      avatarUrl: "",
      primaryCtaLabel: "",
      primaryCtaUrl: "",
      availabilityStatus: "available" as const,
      isPublished: false,
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    };
    const sections = [
      {
        id: "22222222-2222-4222-8222-222222222222",
        profileId: profile.id,
        title: "Work",
        slug: "work",
        position: 1,
        isVisible: true,
        isCollapsed: false,
        createdAt: "2026-07-18T00:00:01.000Z",
        updatedAt: "2026-07-18T00:00:01.000Z",
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        profileId: profile.id,
        title: "Private notes",
        slug: "private-notes",
        position: 0,
        isVisible: false,
        isCollapsed: false,
        createdAt: "2026-07-18T00:00:00.000Z",
        updatedAt: "2026-07-18T00:00:00.000Z",
      },
    ];
    const blocks = [
      {
        id: "44444444-4444-4444-8444-444444444444",
        profileId: profile.id,
        sectionId: sections[0]!.id,
        type: "text_section" as const,
        title: "Second",
        visibility: "public" as const,
        position: 2,
        configuration: { body: "Second block", align: "left" as const },
        createdAt: "2026-07-18T00:00:03.000Z",
        updatedAt: "2026-07-18T00:00:03.000Z",
      },
      {
        id: "55555555-5555-4555-8555-555555555555",
        profileId: profile.id,
        sectionId: sections[0]!.id,
        type: "divider" as const,
        title: "First",
        visibility: "public" as const,
        position: 0,
        configuration: { style: "line" as const, label: "" },
        createdAt: "2026-07-18T00:00:02.000Z",
        updatedAt: "2026-07-18T00:00:02.000Z",
      },
      {
        id: "66666666-6666-4666-8666-666666666666",
        profileId: profile.id,
        sectionId: sections[0]!.id,
        type: "link_button" as const,
        title: "Hidden",
        visibility: "hidden" as const,
        position: 1,
        configuration: { label: "Hidden", url: "https://example.com", detail: "", iconLabel: "" },
        createdAt: "2026-07-18T00:00:04.000Z",
        updatedAt: "2026-07-18T00:00:04.000Z",
      },
    ];

    const snapshot = buildPublicProfileSnapshot(
      profile,
      [],
      profile.updatedAt,
      sections,
      blocks,
    );

    expect(snapshot.publishedSections).toHaveLength(1);
    expect(snapshot.publishedBlocks.map((block) => block.title)).toEqual([
      "First",
      "Second",
    ]);
  });
});
