import { describe, expect, it } from "vitest";
import {
  buildHandleSuggestion,
  getInitials,
  isSafeHttpUrl,
  normalizeHandle,
  projectDraftSchema,
  profileBlockDraftSchema,
  profileDraftSchema,
  repositoryDraftSchema,
  pathEntryDraftSchema,
  stackItemDraftSchema,
  workspaceDraftSchema,
} from "@/lib/validation";

describe("validation helpers", () => {
  const profileId = "11111111-1111-1111-1111-111111111111";

  function projectDraft(id: string, position: number, isFeatured = false) {
    return {
      id,
      profileId,
      slug: `project-${position}`,
      projectName: `Project ${position}`,
      shortSummary: "A concise project summary.",
      caseStudyMarkdown: "## Brief\n\nA bounded case study.",
      role: "Product engineer",
      technologies: ["TypeScript", "Postgres"],
      projectType: "product",
      startDate: "2026-01-01",
      endDate: "",
      status: "shipped",
      coverImageUrl: "",
      lessonsLearned: "Keep the scope clear.",
      tags: ["web"],
      isFeatured,
      isPublished: false,
      position,
      links: [],
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    };
  }

  function repositoryDraft(id: string, position: number, url = `https://github.com/example/repo-${position}`) {
    return {
      id,
      profileId,
      repositoryName: `repo-${position}`,
      providerLabel: "GitHub",
      repositoryUrl: url,
      description: "A manually curated repository description.",
      language: "TypeScript",
      framework: "Next.js",
      topics: ["web", "systems"],
      starsText: "12",
      forksText: "3",
      activityLabel: "Updated monthly",
      status: "active",
      isStatsVisible: true,
      isFeatured: false,
      isPublished: false,
      position,
      links: [],
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    };
  }

  function stackCategory(id: string, key: "languages" | "custom", name: string, isBuiltIn = key !== "custom") {
    return {
      id,
      profileId,
      key,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      isBuiltIn,
      position: 0,
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    };
  }

  function stackItem(id: string, categoryId: string) {
    return {
      id,
      profileId,
      categoryId,
      technologyName: "TypeScript",
      proficiencyLabel: "Comfortable",
      yearsText: "4 years",
      confidenceLabel: "Used in production",
      learningStatus: "comfortable",
      shortDescription: "Typed interfaces for reliable product work.",
      iconIdentifier: "code",
      isFeatured: true,
      isPublished: true,
      position: 0,
      projects: [],
      links: [],
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    };
  }

  function pathEntry(id: string, startDate = "2024-01-01", endDate = "", isCurrent = false) {
    return {
      id,
      profileId,
      entryType: "work",
      title: "Product designer",
      organization: "Nodivra Studio",
      locationText: "Remote",
      startDate,
      endDate,
      isCurrent,
      dateVisibility: "year_only",
      summary: "A bounded summary of the work and the decisions behind it.",
      highlights: [],
      technologies: [],
      links: [],
      isPublished: false,
      position: 0,
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    };
  }

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

  it("keeps project case studies bounded and links safe", () => {
    const valid = projectDraftSchema.safeParse(projectDraft("22222222-2222-4222-8222-222222222222", 0));
    const unsafeUrl = projectDraftSchema.safeParse({
      ...projectDraft("33333333-3333-4333-8333-333333333333", 1),
      coverImageUrl: "javascript:alert(1)",
    });
    const invalidDates = projectDraftSchema.safeParse({
      ...projectDraft("44444444-4444-4444-8444-444444444444", 2),
      startDate: "2026-06-01",
      endDate: "2026-05-01",
    });
    const duplicateLinkKinds = projectDraftSchema.safeParse({
      ...projectDraft("55555555-5555-4555-8555-555555555555", 3),
      links: [
        {
          id: "66666666-6666-4666-8666-666666666666",
          projectId: "55555555-5555-4555-8555-555555555555",
          kind: "live",
          label: "Live URL",
          url: "https://example.com/live",
          position: 0,
          isEnabled: true,
          createdAt: "2026-07-18T00:00:00.000Z",
          updatedAt: "2026-07-18T00:00:00.000Z",
        },
        {
          id: "77777777-7777-4777-8777-777777777777",
          projectId: "55555555-5555-4555-8555-555555555555",
          kind: "live",
          label: "Another live URL",
          url: "https://example.com/another",
          position: 1,
          isEnabled: true,
          createdAt: "2026-07-18T00:00:00.000Z",
          updatedAt: "2026-07-18T00:00:00.000Z",
        },
      ],
    });

    expect(valid.success).toBe(true);
    expect(unsafeUrl.success).toBe(false);
    expect(invalidDates.success).toBe(false);
    expect(duplicateLinkKinds.success).toBe(false);
  });

  it("limits featured projects and keeps projects profile-scoped", () => {
    const profile = {
      id: profileId,
      handle: "jamie-fontanilla",
      displayName: "Jamie Fontanilla",
      headline: "",
      bio: "",
      locationText: "",
      timezone: "UTC",
      avatarInitials: "JF",
      avatarUrl: "",
      primaryCtaLabel: "",
      primaryCtaUrl: "",
      availabilityStatus: "available",
      isPublished: false,
    };
    const workspace = workspaceDraftSchema.safeParse({
      profile,
      links: [],
      projects: [
        projectDraft("88888888-8888-4888-8888-888888888888", 0, true),
        projectDraft("99999999-9999-4999-8999-999999999999", 1, true),
        projectDraft("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", 2, true),
        projectDraft("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", 3, true),
      ],
    });

    expect(workspace.success).toBe(false);

    const foreignProject = {
      ...projectDraft("cccccccc-cccc-4ccc-8ccc-cccccccccccc", 0),
      profileId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    };
    const ownership = workspaceDraftSchema.safeParse({
      profile,
      links: [],
      projects: [foreignProject],
    });

    expect(ownership.success).toBe(false);
  });

  it("validates manual repositories and prevents unsafe duplicate records", () => {
    const valid = repositoryDraftSchema.safeParse(repositoryDraft("eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", 0));
    const unsafeUrl = repositoryDraftSchema.safeParse({
      ...repositoryDraft("ffffffff-ffff-4fff-8fff-ffffffffffff", 1),
      repositoryUrl: "javascript:alert(1)",
    });
    const invalidStackLink = repositoryDraftSchema.safeParse({
      ...repositoryDraft("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab", 2),
      links: [{
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc",
        profileId,
        repositoryId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab",
        kind: "stack",
        projectId: "",
        label: "Unsafe stack",
        url: "javascript:alert(1)",
        position: 0,
        isEnabled: true,
        createdAt: "2026-07-18T00:00:00.000Z",
        updatedAt: "2026-07-18T00:00:00.000Z",
      }],
    });
    const duplicateUrls = workspaceDraftSchema.safeParse({
      profile: {
        id: profileId,
        handle: "jamie-fontanilla",
        displayName: "Jamie Fontanilla",
        headline: "",
        bio: "",
        locationText: "",
        timezone: "UTC",
        avatarInitials: "JF",
        avatarUrl: "",
        primaryCtaLabel: "",
        primaryCtaUrl: "",
        availabilityStatus: "available",
        isPublished: false,
      },
      links: [],
      repositories: [
        repositoryDraft("cccccccc-cccc-4ccc-8ccc-cccccccccccd", 0, "https://github.com/example/shared"),
        repositoryDraft("dddddddd-dddd-4ddd-8ddd-ddddddddddde", 1, "HTTPS://GITHUB.COM/example/shared"),
      ],
    });

    expect(valid.success).toBe(true);
    expect(unsafeUrl.success).toBe(false);
    expect(invalidStackLink.success).toBe(false);
    expect(duplicateUrls.success).toBe(false);
  });

  it("validates Path dates, current roles, and entry ownership", () => {
    const valid = pathEntryDraftSchema.safeParse(pathEntry("eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeef", "2021-04-01", "", true));
    const invalidDate = pathEntryDraftSchema.safeParse(pathEntry("ffffffff-ffff-4fff-8fff-ffffffffffff", "2024-02-30"));
    const currentWithEnd = pathEntryDraftSchema.safeParse(pathEntry("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab", "2024-01-01", "2025-01-01", true));
    const foreignEntry = workspaceDraftSchema.safeParse({
      profile: {
        id: profileId,
        handle: "jamie-fontanilla",
        displayName: "Jamie Fontanilla",
        headline: "",
        bio: "",
        locationText: "",
        timezone: "UTC",
        avatarInitials: "JF",
        avatarUrl: "",
        primaryCtaLabel: "",
        primaryCtaUrl: "",
        availabilityStatus: "available",
        isPublished: false,
      },
      links: [],
      pathEntries: [{ ...pathEntry("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc"), profileId: "cccccccc-cccc-4ccc-8ccc-cccccccccccd" }],
    });

    expect(valid.success).toBe(true);
    expect(invalidDate.success).toBe(false);
    expect(currentWithEnd.success).toBe(false);
    expect(foreignEntry.success).toBe(false);
  });

  it("validates controlled Stack categories, icons, ownership, and project links", () => {
    const category = stackCategory("11111111-1111-4111-8111-111111111112", "languages", "Languages");
    const item = stackItem("22222222-2222-4222-8222-222222222223", category.id);
    const valid = workspaceDraftSchema.safeParse({
      profile: {
        id: profileId,
        handle: "jamie-fontanilla",
        displayName: "Jamie Fontanilla",
        headline: "",
        bio: "",
        locationText: "",
        timezone: "UTC",
        avatarInitials: "JF",
        avatarUrl: "",
        primaryCtaLabel: "",
        primaryCtaUrl: "",
        availabilityStatus: "available",
        isPublished: false,
      },
      links: [],
      projects: [projectDraft("33333333-3333-4333-8333-333333333334", 0)],
      stackCategories: [category],
      stackItems: [{
        ...item,
        projects: [{
          id: "44444444-4444-4444-8444-444444444445",
          profileId,
          stackItemId: item.id,
          projectId: "33333333-3333-4333-8333-333333333334",
          position: 0,
          isEnabled: true,
          createdAt: "2026-07-18T00:00:00.000Z",
          updatedAt: "2026-07-18T00:00:00.000Z",
        }],
      }],
    });
    const unsafeIcon = stackItemDraftSchema.safeParse({ ...item, iconIdentifier: "external-logo" });
    const foreignCategory = workspaceDraftSchema.safeParse({
      profile: {
        id: profileId,
        handle: "jamie-fontanilla",
        displayName: "Jamie Fontanilla",
        headline: "",
        bio: "",
        locationText: "",
        timezone: "UTC",
        avatarInitials: "JF",
        avatarUrl: "",
        primaryCtaLabel: "",
        primaryCtaUrl: "",
        availabilityStatus: "available",
        isPublished: false,
      },
      links: [],
      stackCategories: [{ ...category, profileId: "55555555-5555-4555-8555-555555555556" }],
      stackItems: [],
    });

    expect(valid.success).toBe(true);
    expect(unsafeIcon.success).toBe(false);
    expect(foreignCategory.success).toBe(false);
  });

  it("rejects unsafe or untyped block configurations", () => {
    const unsafeImage = profileBlockDraftSchema.safeParse({
      id: "77777777-7777-4777-8777-777777777777",
      profileId: "11111111-1111-1111-1111-111111111111",
      sectionId: "88888888-8888-4888-8888-888888888888",
      type: "image_card",
      title: "Unsafe image",
      visibility: "public",
      position: 0,
      configuration: {
        imageUrl: "javascript:alert(1)",
        altText: "Image",
        caption: "",
      },
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    });

    const arbitraryMarkup = profileBlockDraftSchema.safeParse({
      id: "99999999-9999-4999-8999-999999999999",
      profileId: "11111111-1111-1111-1111-111111111111",
      sectionId: "88888888-8888-4888-8888-888888888888",
      type: "text_section",
      title: "Markup",
      visibility: "public",
      position: 0,
      configuration: {
        body: "Text only",
        align: "left",
        html: "<script>alert(1)</script>",
      },
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    });

    expect(unsafeImage.success).toBe(false);
    expect(arbitraryMarkup.success).toBe(false);
  });

  it("requires blocks to belong to a declared profile section", () => {
    const workspace = workspaceDraftSchema.safeParse({
      profile: {
        handle: "jamie-fontanilla",
        displayName: "Jamie Fontanilla",
        headline: "",
        bio: "",
        locationText: "",
        timezone: "UTC",
        avatarInitials: "JF",
        avatarUrl: "",
        primaryCtaLabel: "",
        primaryCtaUrl: "",
        availabilityStatus: "available",
        isPublished: false,
      },
      links: [],
      sections: [],
      blocks: [{
        id: "77777777-7777-4777-8777-777777777777",
        profileId: "11111111-1111-1111-1111-111111111111",
        sectionId: "88888888-8888-4888-8888-888888888888",
        type: "divider",
        title: "Missing section",
        visibility: "public",
        position: 0,
        configuration: { style: "line", label: "" },
        createdAt: "2026-07-18T00:00:00.000Z",
        updatedAt: "2026-07-18T00:00:00.000Z",
      }],
    });

    expect(workspace.success).toBe(false);
  });
});
