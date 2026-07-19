import { describe, expect, it } from "vitest";
import {
  buildPublicProfileSnapshot,
  splitVisibleLinks,
} from "@/lib/snapshot";
import type { ProfileProjectDraft, ProfileRepositoryDraft, ProfileStackCategoryDraft, ProfileStackItemDraft } from "@/types/nodivra";

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

  it("publishes only selected projects in stable order", () => {
    const profile = {
      id: "11111111-1111-1111-1111-111111111111",
      ownerId: "11111111-1111-1111-1111-111111111111",
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
      availabilityStatus: "available" as const,
      isPublished: false,
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    };
    const projects: ProfileProjectDraft[] = [
      {
        id: "22222222-2222-4222-8222-222222222222",
        profileId: profile.id,
        slug: "second-project",
        projectName: "Second project",
        shortSummary: "Second summary",
        caseStudyMarkdown: "## Second",
        role: "Engineer",
        technologies: ["TypeScript"],
        projectType: "product",
        startDate: "",
        endDate: "",
        status: "shipped",
        coverImageUrl: "",
        lessonsLearned: "",
        tags: [],
        isFeatured: false,
        isPublished: true,
        position: 1,
        links: [],
        createdAt: "2026-07-18T00:00:02.000Z",
        updatedAt: "2026-07-18T00:00:02.000Z",
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        profileId: profile.id,
        slug: "private-project",
        projectName: "Private project",
        shortSummary: "Private summary",
        caseStudyMarkdown: "## Private",
        role: "Engineer",
        technologies: [],
        projectType: "experiment",
        startDate: "",
        endDate: "",
        status: "in_progress",
        coverImageUrl: "",
        lessonsLearned: "",
        tags: [],
        isFeatured: false,
        isPublished: false,
        position: 0,
        links: [],
        createdAt: "2026-07-18T00:00:01.000Z",
        updatedAt: "2026-07-18T00:00:01.000Z",
      },
    ];

    const snapshot = buildPublicProfileSnapshot(profile, [], profile.updatedAt, [], [], projects);

    expect(snapshot.publishedProjects.map((project) => project.projectName)).toEqual(["Second project"]);
  });

  it("publishes only selected repositories in stable order", () => {
    const profile = {
      id: "11111111-1111-1111-1111-111111111111",
      ownerId: "11111111-1111-1111-1111-111111111111",
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
      availabilityStatus: "available" as const,
      isPublished: false,
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    };
    const repository = (id: string, name: string, position: number, isPublished: boolean): ProfileRepositoryDraft => ({
      id,
      profileId: profile.id,
      repositoryName: name,
      providerLabel: "GitHub",
      repositoryUrl: `https://github.com/example/${name}`,
      description: "A manual repository description.",
      language: "TypeScript",
      framework: "Next.js",
      topics: ["systems"],
      starsText: "12",
      forksText: "2",
      activityLabel: "Updated monthly",
      status: "active",
      isStatsVisible: true,
      isFeatured: false,
      isPublished,
      position,
      links: [],
      createdAt: `2026-07-18T00:00:0${position}.000Z`,
      updatedAt: `2026-07-18T00:00:0${position}.000Z`,
    });
    const snapshot = buildPublicProfileSnapshot(profile, [], profile.updatedAt, [], [], [], [
      repository("77777777-7777-4777-8777-777777777777", "second-repo", 1, true),
      repository("88888888-8888-4888-8888-888888888888", "private-repo", 0, false),
    ]);

    expect(snapshot.publishedRepositories.map((item) => item.repositoryName)).toEqual(["second-repo"]);
  });

  it("publishes selected Stack items with only public project links", () => {
    const profile = {
      id: "11111111-1111-1111-1111-111111111111",
      ownerId: "11111111-1111-1111-1111-111111111111",
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
      availabilityStatus: "available" as const,
      isPublished: false,
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    };
    const category: ProfileStackCategoryDraft = {
      id: "22222222-2222-4222-8222-222222222222",
      profileId: profile.id,
      key: "languages",
      name: "Languages",
      slug: "languages",
      isBuiltIn: true,
      position: 0,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    const publishedProject: ProfileProjectDraft = {
      id: "33333333-3333-4333-8333-333333333333",
      profileId: profile.id,
      slug: "signal",
      projectName: "Signal",
      shortSummary: "Published project",
      caseStudyMarkdown: "## Signal",
      role: "Engineer",
      technologies: ["TypeScript"],
      projectType: "product",
      startDate: "",
      endDate: "",
      status: "shipped",
      coverImageUrl: "",
      lessonsLearned: "",
      tags: [],
      isFeatured: false,
      isPublished: true,
      position: 0,
      links: [],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    const item: ProfileStackItemDraft = {
      id: "44444444-4444-4444-8444-444444444444",
      profileId: profile.id,
      categoryId: category.id,
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
      projects: [{
        id: "55555555-5555-4555-8555-555555555555",
        profileId: profile.id,
        stackItemId: "44444444-4444-4444-8444-444444444444",
        projectId: publishedProject.id,
        position: 0,
        isEnabled: true,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }],
      links: [{
        id: "66666666-6666-4666-8666-666666666666",
        profileId: profile.id,
        stackItemId: "44444444-4444-4444-8444-444444444444",
        kind: "documentation",
        label: "Docs",
        url: "https://www.typescriptlang.org/docs/",
        position: 0,
        isEnabled: true,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    const privateItem = { ...item, id: "77777777-7777-4777-8777-777777777777", isPublished: false, position: 1 };
    const snapshot = buildPublicProfileSnapshot(profile, [], profile.updatedAt, [], [], [publishedProject], [], [category], [item, privateItem]);

    expect(snapshot.publishedStackCategories.map((entry) => entry.name)).toEqual(["Languages"]);
    expect(snapshot.publishedStackItems).toHaveLength(1);
    expect(snapshot.publishedStackItems[0]?.projects.map((entry) => entry.projectId)).toEqual([publishedProject.id]);
    expect(snapshot.publishedStackItems[0]?.links[0]?.url).toBe("https://www.typescriptlang.org/docs/");
  });
});
