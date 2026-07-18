import { describe, expect, it } from "vitest";
import { buildPublicProfileSnapshot, splitVisibleLinks } from "@/lib/snapshot";

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
});
