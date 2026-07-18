import { describe, expect, it } from "vitest";
import {
  buildHandleSuggestion,
  getInitials,
  isSafeHttpUrl,
  normalizeHandle,
  profileDraftSchema,
  workspaceDraftSchema,
} from "@/lib/validation";

describe("validation helpers", () => {
  it("normalizes handles and suggestions", () => {
    expect(normalizeHandle("@Jamie-Doe/")).toBe("jamie-doe");
    expect(buildHandleSuggestion("Jamie Doe!!")).toBe("jamiedoe");
    expect(getInitials("Jamie Fontanilla", "nodivra")).toBe("JF");
  });

  it("accepts only safe http urls", () => {
    expect(isSafeHttpUrl("https://example.com")).toBe(true);
    expect(isSafeHttpUrl("http://example.com/work")).toBe(true);
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects reserved handles and mismatched CTA fields", () => {
    const reserved = profileDraftSchema.safeParse({
      handle: "admin",
      displayName: "Admin",
      headline: "",
      bio: "",
      locationText: "",
      timezone: "UTC",
      avatarInitials: "",
      avatarUrl: "",
      primaryCtaLabel: "",
      primaryCtaUrl: "",
      availabilityStatus: "available",
      isPublished: false,
    });

    expect(reserved.success).toBe(false);

    const mismatched = profileDraftSchema.safeParse({
      handle: "jamie-fontanilla",
      displayName: "Jamie Fontanilla",
      headline: "",
      bio: "",
      locationText: "",
      timezone: "UTC",
      avatarInitials: "",
      avatarUrl: "",
      primaryCtaLabel: "Book a call",
      primaryCtaUrl: "",
      availabilityStatus: "available",
      isPublished: false,
    });

    expect(mismatched.success).toBe(false);
  });

  it("validates a whole workspace draft", () => {
    const workspace = workspaceDraftSchema.safeParse({
      profile: {
        handle: "jamie-fontanilla",
        displayName: "Jamie Fontanilla",
        headline: "Designing polished developer surfaces.",
        bio: "",
        locationText: "Austin, TX",
        timezone: "America/Chicago",
        avatarInitials: "JF",
        avatarUrl: "",
        primaryCtaLabel: "Book a call",
        primaryCtaUrl: "https://example.com/book",
        availabilityStatus: "available",
        isPublished: false,
      },
      links: [
        {
          id: "2b1a05d7-2b8d-4a18-a1fd-4a00d3e1cb10",
          profileId: "11111111-1111-1111-1111-111111111111",
          title: "Selected work",
          url: "https://example.com/work",
          iconLabel: "01",
          visibility: "public",
          isEnabled: true,
          position: 0,
          createdAt: "2026-07-18T00:00:00.000Z",
          updatedAt: "2026-07-18T00:00:00.000Z",
        },
      ],
    });

    expect(workspace.success).toBe(true);
  });
});
