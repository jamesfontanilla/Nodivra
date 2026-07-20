import {
  DEMO_HANDLE,
  DEMO_USER_ID,
  type AuditLogEntry,
  type ProfileBlockDraft,
  type ProfileDraft,
  type ProfileLinkDraft,
  type ProfileProjectDraft,
  type ProfileRepositoryDraft,
  type ProfileStackCategoryDraft,
  type ProfileStackItemDraft,
  type ProfilePathEntryDraft,
  type ProfileNoteDraft,
  type NoteLinkDraft,
  type ProfileTalkDraft,
  type TalkLinkDraft,
  type ProfileSnipDraft,
  type SnipLinkDraft,
  type PathHighlightDraft,
  type PathTechnologyDraft,
  type PathLinkDraft,
  type RepositoryLinkDraft,
  type StackLinkDraft,
  type StackProjectDraft,
  type ProjectLinkDraft,
  type ProfileSectionDraft,
  type WorkspaceSnapshot,
} from "@/types/nodivra";
import { buildPublicProfileSnapshot } from "@/lib/snapshot";
import { getInitials } from "@/lib/validation";

function now() {
  return new Date().toISOString();
}

function createDemoProfile(): ProfileDraft {
  const timestamp = now();

  return {
    id: DEMO_USER_ID,
    ownerId: DEMO_USER_ID,
    handle: DEMO_HANDLE,
    displayName: "Nodivra Studio",
    headline: "Developer pages that feel calm, sharp, and earned.",
    bio: "A fresh Nodivra workspace for developers who want a public page that reads like proof of work instead of a generic profile card.",
    locationText: "Austin, TX",
    timezone: "America/Chicago",
    avatarInitials: getInitials("Nodivra Studio", DEMO_HANDLE),
    avatarUrl: "",
    primaryCtaLabel: "Open the workbench",
    primaryCtaUrl: "https://example.com/workbench",
    availabilityStatus: "available",
    isPublished: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createDemoLinks(profileId: string): ProfileLinkDraft[] {
  const timestamp = now();
  return [
    {
      id: "2b1a05d7-2b8d-4a18-a1fd-4a00d3e1cb10",
      profileId,
      title: "Selected work",
      url: "https://example.com/work",
      iconLabel: "01",
      visibility: "public",
      isEnabled: true,
      position: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "7a2a7f69-1a90-4a07-8fd1-2f14a2f8e2f1",
      profileId,
      title: "Short bio",
      url: "https://example.com/bio",
      iconLabel: "02",
      visibility: "social",
      isEnabled: true,
      position: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "fd5d77bf-c7ae-437c-bcea-91770a727bb9",
      profileId,
      title: "Contact",
      url: "https://example.com/contact",
      iconLabel: "03",
      visibility: "social",
      isEnabled: true,
      position: 2,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createDemoSections(profileId: string): ProfileSectionDraft[] {
  const timestamp = now();
  return [
    {
      id: "0b8f8ad4-1aa1-4c20-9a01-000000000001",
      profileId,
      title: "About",
      slug: "about",
      position: 0,
      isVisible: true,
      isCollapsed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "0b8f8ad4-1aa1-4c20-9a01-000000000002",
      profileId,
      title: "Selected work",
      slug: "selected-work",
      position: 1,
      isVisible: true,
      isCollapsed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "0b8f8ad4-1aa1-4c20-9a01-000000000003",
      profileId,
      title: "Elsewhere",
      slug: "elsewhere",
      position: 2,
      isVisible: true,
      isCollapsed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createDemoBlocks(
  profileId: string,
  sections: ProfileSectionDraft[],
): ProfileBlockDraft[] {
  const timestamp = now();
  const aboutId = sections[0]!.id;
  const workId = sections[1]!.id;
  const elsewhereId = sections[2]!.id;

  return [
    {
      id: "7e5a1d12-9d10-42d7-a001-000000000001",
      profileId,
      sectionId: aboutId,
      type: "text_section",
      title: "A little context",
      visibility: "public",
      position: 0,
      configuration: {
        body: "I shape product systems, developer tools, and public surfaces where clarity is part of the craft.",
        align: "left",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "7e5a1d12-9d10-42d7-a001-000000000002",
      profileId,
      sectionId: aboutId,
      type: "availability_card",
      title: "Availability",
      visibility: "public",
      position: 1,
      configuration: {
        status: "available",
        detail: "Open to thoughtful product and platform work this quarter.",
        timezone: "America/Chicago",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "7e5a1d12-9d10-42d7-a001-000000000003",
      profileId,
      sectionId: workId,
      type: "project_highlight",
      title: "Signal / proof of work",
      visibility: "public",
      position: 0,
      configuration: {
        projectName: "Signal",
        summary: "A calm operating surface for teams shipping complex developer products.",
        role: "Product design and systems",
        technologies: ["Next.js", "TypeScript", "Supabase"],
        url: "https://example.com/signal",
        projectId: "4c0f8f13-0c2b-4b0e-9001-000000000001",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "7e5a1d12-9d10-42d7-a001-000000000004",
      profileId,
      sectionId: workId,
      type: "image_card",
      title: "The workbench",
      visibility: "public",
      position: 1,
      configuration: {
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
        altText: "Laptop showing a dark developer workspace",
        caption: "Interfaces should make the next good decision easier.",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "7e5a1d12-9d10-42d7-a001-000000000005",
      profileId,
      sectionId: workId,
      type: "divider",
      title: "Work divider",
      visibility: "public",
      position: 2,
      configuration: {
        style: "line",
        label: "More soon",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "7e5a1d12-9d10-42d7-a001-000000000009",
      profileId,
      sectionId: workId,
      type: "link_button",
      title: "Open the workbench",
      visibility: "public",
      position: 3,
      configuration: {
        label: "See the full workbench",
        url: "https://example.com/workbench",
        detail: "example.com",
        iconLabel: "GO",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "7e5a1d12-9d10-42d7-a001-000000000006",
      profileId,
      sectionId: elsewhereId,
      type: "social_link",
      title: "Find me elsewhere",
      visibility: "public",
      position: 0,
      configuration: {
        network: "Mastodon",
        label: "@nodivra",
        url: "https://example.com/social",
        iconLabel: "M",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "7e5a1d12-9d10-42d7-a001-000000000007",
      profileId,
      sectionId: elsewhereId,
      type: "external_resource",
      title: "A useful resource",
      visibility: "public",
      position: 1,
      configuration: {
        resourceType: "article",
        url: "https://example.com/reading",
        description: "A manually curated link with no embedded third-party content.",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "7e5a1d12-9d10-42d7-a001-000000000008",
      profileId,
      sectionId: elsewhereId,
      type: "cta_card",
      title: "Start a conversation",
      visibility: "public",
      position: 2,
      configuration: {
        body: "Have a product surface that needs more clarity? Let’s compare notes.",
        ctaLabel: "Say hello",
        ctaUrl: "https://example.com/contact",
        accent: "moss",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createDemoProjects(profileId: string): ProfileProjectDraft[] {
  const timestamp = now();
  const createLink = (
    id: string,
    projectId: string,
    kind: ProjectLinkDraft["kind"],
    label: string,
    url: string,
    position: number,
  ): ProjectLinkDraft => ({
    id,
    projectId,
    kind,
    label,
    url,
    position,
    isEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return [
    {
      id: "4c0f8f13-0c2b-4b0e-9001-000000000001",
      profileId,
      slug: "signal",
      projectName: "Signal",
      shortSummary: "A calm operating surface for teams shipping complex developer products.",
      caseStudyMarkdown: "## The brief\n\nSignal gave a platform team a clearer way to move from an incoming request to an owned, observable decision.\n\n## What changed\n\nI shaped the information architecture, interaction model, and visual language around one principle: make the next good decision obvious.\n\n- Reframed the work queue around intent\n- Reduced noisy status states\n- Created reusable patterns for handoffs",
      role: "Product design and systems",
      technologies: ["Next.js", "TypeScript", "Supabase"],
      projectType: "product",
      startDate: "2025-02-01",
      endDate: "2025-08-01",
      status: "shipped",
      coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
      lessonsLearned: "Complex tools become easier to trust when their system status is visible without becoming the main event.",
      tags: ["platform", "systems", "product design"],
      isFeatured: true,
      isPublished: true,
      position: 0,
      links: [
        createLink("5c0f8f13-0c2b-4b0e-9001-000000000001", "4c0f8f13-0c2b-4b0e-9001-000000000001", "live", "Read the project", "https://example.com/signal", 0),
        createLink("5c0f8f13-0c2b-4b0e-9001-000000000002", "4c0f8f13-0c2b-4b0e-9001-000000000001", "repository", "Repository", "https://github.com/example/signal", 1),
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "4c0f8f13-0c2b-4b0e-9001-000000000002",
      profileId,
      slug: "quiet-hours",
      projectName: "Quiet Hours",
      shortSummary: "A small experiment in making team availability feel humane and legible.",
      caseStudyMarkdown: "## The question\n\nWhat if availability was a shared context instead of another notification?\n\nI explored a lightweight pattern for communicating focus time, timezone, and response expectations without adding another dashboard.",
      role: "Independent experiment",
      technologies: ["React", "CSS", "Accessibility"],
      projectType: "experiment",
      startDate: "2024-10-01",
      endDate: "2024-12-01",
      status: "shipped",
      coverImageUrl: "",
      lessonsLearned: "Small pieces of context can remove more anxiety than another layer of status reporting.",
      tags: ["experiment", "accessibility"],
      isFeatured: true,
      isPublished: true,
      position: 1,
      links: [
        createLink("5c0f8f13-0c2b-4b0e-9001-000000000003", "4c0f8f13-0c2b-4b0e-9001-000000000002", "demo", "Open the demo", "https://example.com/quiet-hours", 0),
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "4c0f8f13-0c2b-4b0e-9001-000000000003",
      profileId,
      slug: "field-notes",
      projectName: "Field Notes",
      shortSummary: "A writing surface for turning observations into reusable product principles.",
      caseStudyMarkdown: "## The idea\n\nField Notes is a living archive of small product observations, organized around the decisions they unlock.\n\nIt is intentionally unfinished and remains a work in progress.",
      role: "Writing system",
      technologies: ["Markdown", "Information architecture"],
      projectType: "open_source",
      startDate: "2026-01-01",
      endDate: "",
      status: "in_progress",
      coverImageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
      lessonsLearned: "A useful archive needs a point of view, not just a search box.",
      tags: ["writing", "open source"],
      isFeatured: false,
      isPublished: true,
      position: 2,
      links: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createDemoRepositories(profileId: string): ProfileRepositoryDraft[] {
  const timestamp = now();
  const createLink = (
    id: string,
    repositoryId: string,
    kind: RepositoryLinkDraft["kind"],
    label: string,
    projectId: string,
    url: string,
    position: number,
  ): RepositoryLinkDraft => ({
    id,
    profileId,
    repositoryId,
    kind,
    projectId,
    label,
    url,
    position,
    isEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return [
    {
      id: "8c0f8f13-0c2b-4b0e-9001-000000000001",
      profileId,
      repositoryName: "nodivra/ui",
      providerLabel: "GitHub",
      repositoryUrl: "https://github.com/example/nodivra-ui",
      description: "The reusable surface language behind calm, bounded developer pages.",
      language: "TypeScript",
      framework: "Next.js",
      topics: ["design-systems", "nextjs", "accessibility"],
      starsText: "128",
      forksText: "18",
      activityLabel: "Updated weekly",
      status: "active",
      isStatsVisible: true,
      isFeatured: true,
      isPublished: true,
      position: 0,
      links: [
        createLink("9c0f8f13-0c2b-4b0e-9001-000000000001", "8c0f8f13-0c2b-4b0e-9001-000000000001", "project", "Related project", "4c0f8f13-0c2b-4b0e-9001-000000000001", "", 0),
        createLink("9c0f8f13-0c2b-4b0e-9001-000000000002", "8c0f8f13-0c2b-4b0e-9001-000000000001", "stack", "Next.js", "", "https://nextjs.org/docs", 1),
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "8c0f8f13-0c2b-4b0e-9001-000000000002",
      profileId,
      repositoryName: "quiet-hours",
      providerLabel: "Codeberg",
      repositoryUrl: "https://codeberg.org/example/quiet-hours",
      description: "A small availability experiment that makes focus time easier to understand.",
      language: "React",
      framework: "Vite",
      topics: ["availability", "accessibility", "experiments"],
      starsText: "",
      forksText: "",
      activityLabel: "Archived experiment",
      status: "archived",
      isStatsVisible: false,
      isFeatured: true,
      isPublished: true,
      position: 1,
      links: [
        createLink("9c0f8f13-0c2b-4b0e-9001-000000000003", "8c0f8f13-0c2b-4b0e-9001-000000000002", "project", "Quiet Hours case study", "4c0f8f13-0c2b-4b0e-9001-000000000002", "", 0),
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "8c0f8f13-0c2b-4b0e-9001-000000000003",
      profileId,
      repositoryName: "field-notes",
      providerLabel: "GitHub",
      repositoryUrl: "https://github.com/example/field-notes",
      description: "A living archive of product observations, principles, and the decisions they unlock.",
      language: "Markdown",
      framework: "",
      topics: ["writing", "product-thinking"],
      starsText: "42",
      forksText: "4",
      activityLabel: "Updated monthly",
      status: "maintenance",
      isStatsVisible: true,
      isFeatured: false,
      isPublished: true,
      position: 2,
      links: [
        createLink("9c0f8f13-0c2b-4b0e-9001-000000000004", "8c0f8f13-0c2b-4b0e-9001-000000000003", "stack", "Markdown", "", "https://www.markdownguide.org/", 0),
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createDemoStackCategories(profileId: string): ProfileStackCategoryDraft[] {
  const timestamp = now();
  const categories = [
    ["ac0f8f13-0c2b-4b0e-9001-000000000001", "languages", "Languages"],
    ["ac0f8f13-0c2b-4b0e-9001-000000000002", "frontend", "Frontend"],
    ["ac0f8f13-0c2b-4b0e-9001-000000000003", "backend", "Backend"],
    ["ac0f8f13-0c2b-4b0e-9001-000000000004", "databases", "Databases"],
    ["ac0f8f13-0c2b-4b0e-9001-000000000005", "cloud", "Cloud"],
    ["ac0f8f13-0c2b-4b0e-9001-000000000006", "testing", "Testing"],
    ["ac0f8f13-0c2b-4b0e-9001-000000000007", "tooling", "Tooling"],
    ["ac0f8f13-0c2b-4b0e-9001-000000000008", "design", "Design"],
    ["ac0f8f13-0c2b-4b0e-9001-000000000009", "mobile", "Mobile"],
    ["ac0f8f13-0c2b-4b0e-9001-000000000010", "other", "Other"],
  ] as const;
  return categories.map(([id, key, name], position) => ({
    id,
    profileId,
    key,
    name,
    slug: key,
    isBuiltIn: true,
    position,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}

function createDemoStackItems(profileId: string): ProfileStackItemDraft[] {
  const timestamp = now();
  const createProject = (id: string, stackItemId: string, projectId: string, position: number): StackProjectDraft => ({
    id,
    profileId,
    stackItemId,
    projectId,
    position,
    isEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  const createLink = (id: string, stackItemId: string, kind: StackLinkDraft["kind"], label: string, url: string, position: number): StackLinkDraft => ({
    id,
    profileId,
    stackItemId,
    kind,
    label,
    url,
    position,
    isEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return [
    {
      id: "bc0f8f13-0c2b-4b0e-9001-000000000001",
      profileId,
      categoryId: "ac0f8f13-0c2b-4b0e-9001-000000000001",
      technologyName: "TypeScript",
      proficiencyLabel: "Production-ready",
      yearsText: "6 years",
      confidenceLabel: "High confidence",
      learningStatus: "used_daily",
      shortDescription: "The type layer I reach for when a product needs to stay legible as it grows.",
      iconIdentifier: "code",
      isFeatured: true,
      isPublished: true,
      position: 0,
      projects: [createProject("cc0f8f13-0c2b-4b0e-9001-000000000001", "bc0f8f13-0c2b-4b0e-9001-000000000001", "4c0f8f13-0c2b-4b0e-9001-000000000001", 0)],
      links: [createLink("dc0f8f13-0c2b-4b0e-9001-000000000001", "bc0f8f13-0c2b-4b0e-9001-000000000001", "documentation", "TypeScript handbook", "https://www.typescriptlang.org/docs/", 0)],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "bc0f8f13-0c2b-4b0e-9001-000000000002",
      profileId,
      categoryId: "ac0f8f13-0c2b-4b0e-9001-000000000002",
      technologyName: "Next.js",
      proficiencyLabel: "Comfortable",
      yearsText: "4 years",
      confidenceLabel: "High confidence",
      learningStatus: "used_daily",
      shortDescription: "A dependable way to make public surfaces fast, composable, and close to the data.",
      iconIdentifier: "terminal",
      isFeatured: true,
      isPublished: true,
      position: 1,
      projects: [createProject("cc0f8f13-0c2b-4b0e-9001-000000000002", "bc0f8f13-0c2b-4b0e-9001-000000000002", "4c0f8f13-0c2b-4b0e-9001-000000000001", 0)],
      links: [createLink("dc0f8f13-0c2b-4b0e-9001-000000000002", "bc0f8f13-0c2b-4b0e-9001-000000000002", "documentation", "Next.js docs", "https://nextjs.org/docs", 0)],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "bc0f8f13-0c2b-4b0e-9001-000000000003",
      profileId,
      categoryId: "ac0f8f13-0c2b-4b0e-9001-000000000004",
      technologyName: "Postgres",
      proficiencyLabel: "Comfortable",
      yearsText: "5 years",
      confidenceLabel: "Steady",
      learningStatus: "comfortable",
      shortDescription: "The quiet foundation for products that need clear ownership, constraints, and history.",
      iconIdentifier: "database",
      isFeatured: true,
      isPublished: true,
      position: 2,
      projects: [createProject("cc0f8f13-0c2b-4b0e-9001-000000000003", "bc0f8f13-0c2b-4b0e-9001-000000000003", "4c0f8f13-0c2b-4b0e-9001-000000000001", 0)],
      links: [createLink("dc0f8f13-0c2b-4b0e-9001-000000000003", "bc0f8f13-0c2b-4b0e-9001-000000000003", "tool", "Supabase docs", "https://supabase.com/docs", 0)],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "bc0f8f13-0c2b-4b0e-9001-000000000004",
      profileId,
      categoryId: "ac0f8f13-0c2b-4b0e-9001-000000000006",
      technologyName: "Playwright",
      proficiencyLabel: "Growing",
      yearsText: "1 year",
      confidenceLabel: "Learning in public",
      learningStatus: "learning",
      shortDescription: "A practical testing layer for checking the moments users actually depend on.",
      iconIdentifier: "shield",
      isFeatured: false,
      isPublished: true,
      position: 3,
      projects: [createProject("cc0f8f13-0c2b-4b0e-9001-000000000004", "bc0f8f13-0c2b-4b0e-9001-000000000004", "4c0f8f13-0c2b-4b0e-9001-000000000002", 0)],
      links: [createLink("dc0f8f13-0c2b-4b0e-9001-000000000004", "bc0f8f13-0c2b-4b0e-9001-000000000004", "documentation", "Playwright docs", "https://playwright.dev/docs/intro", 0)],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "bc0f8f13-0c2b-4b0e-9001-000000000005",
      profileId,
      categoryId: "ac0f8f13-0c2b-4b0e-9001-000000000008",
      technologyName: "Figma",
      proficiencyLabel: "Comfortable",
      yearsText: "7 years",
      confidenceLabel: "High confidence",
      learningStatus: "comfortable",
      shortDescription: "Where I make structure visible before it becomes an interface.",
      iconIdentifier: "palette",
      isFeatured: true,
      isPublished: true,
      position: 4,
      projects: [createProject("cc0f8f13-0c2b-4b0e-9001-000000000005", "bc0f8f13-0c2b-4b0e-9001-000000000005", "4c0f8f13-0c2b-4b0e-9001-000000000002", 0)],
      links: [createLink("dc0f8f13-0c2b-4b0e-9001-000000000005", "bc0f8f13-0c2b-4b0e-9001-000000000005", "tool", "Figma", "https://www.figma.com/", 0)],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createDemoPathEntries(profileId: string): ProfilePathEntryDraft[] {
  const timestamp = now();
  const highlight = (id: string, entryId: string, content: string, position: number): PathHighlightDraft => ({
    id,
    profileId,
    entryId,
    content,
    position,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  const technology = (id: string, entryId: string, name: string, position: number): PathTechnologyDraft => ({
    id,
    profileId,
    entryId,
    technology: name,
    position,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  const link = (id: string, entryId: string, kind: PathLinkDraft["kind"], label: string, projectId: string, url: string, position: number): PathLinkDraft => ({
    id,
    profileId,
    entryId,
    kind,
    projectId,
    label,
    url,
    position,
    isEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return [
    {
      id: "ec0f8f13-0c2b-4b0e-9001-000000000001",
      profileId,
      entryType: "work",
      title: "Product systems designer",
      organization: "Nodivra Studio",
      locationText: "Austin, TX",
      startDate: "2024-02-01",
      endDate: "",
      isCurrent: true,
      dateVisibility: "exact",
      summary: "I shape calm product systems for teams working through complex decisions, from first principle to polished surface.",
      highlights: [
        highlight("fc0f8f13-0c2b-4b0e-9001-000000000001", "ec0f8f13-0c2b-4b0e-9001-000000000001", "Built a reusable page and module language for developer-first identities.", 0),
        highlight("fc0f8f13-0c2b-4b0e-9001-000000000002", "ec0f8f13-0c2b-4b0e-9001-000000000001", "Turned dense product status into a sequence of understandable next decisions.", 1),
      ],
      technologies: [
        technology("gc0f8f13-0c2b-4b0e-9001-000000000001", "ec0f8f13-0c2b-4b0e-9001-000000000001", "Next.js", 0),
        technology("gc0f8f13-0c2b-4b0e-9001-000000000002", "ec0f8f13-0c2b-4b0e-9001-000000000001", "TypeScript", 1),
        technology("gc0f8f13-0c2b-4b0e-9001-000000000003", "ec0f8f13-0c2b-4b0e-9001-000000000001", "Supabase", 2),
      ],
      links: [
        link("hc0f8f13-0c2b-4b0e-9001-000000000001", "ec0f8f13-0c2b-4b0e-9001-000000000001", "project", "Signal case study", "4c0f8f13-0c2b-4b0e-9001-000000000001", "", 0),
        link("hc0f8f13-0c2b-4b0e-9001-000000000002", "ec0f8f13-0c2b-4b0e-9001-000000000001", "website", "Studio notes", "", "https://example.com/notes", 1),
      ],
      isPublished: true,
      position: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "ec0f8f13-0c2b-4b0e-9001-000000000002",
      profileId,
      entryType: "freelance",
      title: "Independent product designer",
      organization: "Selected client work",
      locationText: "Remote",
      startDate: "2021-06-01",
      endDate: "2024-01-01",
      isCurrent: false,
      dateVisibility: "year_only",
      summary: "Partnered with small teams to turn early product questions into usable systems, prototypes, and shipped interfaces.",
      highlights: [
        highlight("fc0f8f13-0c2b-4b0e-9001-000000000003", "ec0f8f13-0c2b-4b0e-9001-000000000002", "Moved projects from fuzzy brief to testable interaction model without adding process theatre.", 0),
        highlight("fc0f8f13-0c2b-4b0e-9001-000000000004", "ec0f8f13-0c2b-4b0e-9001-000000000002", "Created durable handoff patterns for teams without dedicated design operations.", 1),
      ],
      technologies: [
        technology("gc0f8f13-0c2b-4b0e-9001-000000000004", "ec0f8f13-0c2b-4b0e-9001-000000000002", "Figma", 0),
        technology("gc0f8f13-0c2b-4b0e-9001-000000000005", "ec0f8f13-0c2b-4b0e-9001-000000000002", "React", 1),
        technology("gc0f8f13-0c2b-4b0e-9001-000000000006", "ec0f8f13-0c2b-4b0e-9001-000000000002", "Accessibility", 2),
      ],
      links: [
        link("hc0f8f13-0c2b-4b0e-9001-000000000003", "ec0f8f13-0c2b-4b0e-9001-000000000002", "project", "Quiet Hours case study", "4c0f8f13-0c2b-4b0e-9001-000000000002", "", 0),
      ],
      isPublished: true,
      position: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "ec0f8f13-0c2b-4b0e-9001-000000000003",
      profileId,
      entryType: "education",
      title: "Human-computer interaction",
      organization: "Independent study",
      locationText: "Online",
      startDate: "2016-08-01",
      endDate: "2020-05-01",
      isCurrent: false,
      dateVisibility: "year_only",
      summary: "A foundation in research, systems thinking, and the craft of making complex tools feel more legible.",
      highlights: [
        highlight("fc0f8f13-0c2b-4b0e-9001-000000000005", "ec0f8f13-0c2b-4b0e-9001-000000000003", "Studied how language, structure, and feedback shape trust in interfaces.", 0),
      ],
      technologies: [
        technology("gc0f8f13-0c2b-4b0e-9001-000000000007", "ec0f8f13-0c2b-4b0e-9001-000000000003", "Research", 0),
        technology("gc0f8f13-0c2b-4b0e-9001-000000000008", "ec0f8f13-0c2b-4b0e-9001-000000000003", "Writing", 1),
      ],
      links: [],
      isPublished: true,
      position: 2,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createDemoNotes(profileId: string): ProfileNoteDraft[] {
  const timestamp = now();
  const link = (id: string, noteId: string, kind: NoteLinkDraft["kind"], label: string, projectId: string, url: string, position: number): NoteLinkDraft => ({
    id,
    profileId,
    noteId,
    kind,
    projectId,
    label,
    url,
    position,
    isEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return [
    {
      id: "ac0f8f13-0c2b-4b0e-9001-000000000001",
      profileId,
      title: "The quiet power of a smaller surface",
      slug: "the-quiet-power-of-a-smaller-surface",
      excerpt: "A short field note on why fewer choices can make a developer profile more useful, memorable, and honest.",
      bodyMarkdown: "## The premise\n\nA profile does not need to prove everything at once. It needs to make the right next question easy to ask.\n\n- Show the work\n- Name the choices\n- Leave room for curiosity\n\n> Clarity is a form of hospitality.",
      coverImageUrl: "",
      tags: ["design", "systems", "writing"],
      publishedAt: "2026-07-12",
      readingTimeText: "4 min read",
      canonicalUrl: "",
      isPublished: true,
      isFeatured: true,
      position: 0,
      links: [link("bc0f8f13-0c2b-4b0e-9001-000000000001", "ac0f8f13-0c2b-4b0e-9001-000000000001", "project", "Read the Signal case study", "4c0f8f13-0c2b-4b0e-9001-000000000001", "", 0)],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "ac0f8f13-0c2b-4b0e-9001-000000000002",
      profileId,
      title: "Notes from a manual data model",
      slug: "notes-from-a-manual-data-model",
      excerpt: "What changes when a portfolio treats its content as a small, deliberate product instead of a pile of fields.",
      bodyMarkdown: "## Start with the nouns\n\nProjects, notes, links, and timelines are not just UI concerns. They are the vocabulary of the person behind the profile.\n\nThe useful constraint is not automation. It is giving each piece a clear home and a safe way to travel.",
      coverImageUrl: "",
      tags: ["architecture", "supabase", "product"],
      publishedAt: "2026-07-05",
      readingTimeText: "3 min read",
      canonicalUrl: "",
      isPublished: true,
      isFeatured: false,
      position: 1,
      links: [link("bc0f8f13-0c2b-4b0e-9001-000000000002", "ac0f8f13-0c2b-4b0e-9001-000000000002", "website", "Supabase documentation", "", "https://supabase.com/docs", 0)],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "ac0f8f13-0c2b-4b0e-9001-000000000003",
      profileId,
      title: "A draft about the next useful question",
      slug: "a-draft-about-the-next-useful-question",
      excerpt: "A private draft that demonstrates the difference between writing and publishing.",
      bodyMarkdown: "This is still being shaped.",
      coverImageUrl: "",
      tags: ["draft"],
      publishedAt: "",
      readingTimeText: "2 min read",
      canonicalUrl: "",
      isPublished: false,
      isFeatured: false,
      position: 2,
      links: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createDemoTalks(profileId: string): ProfileTalkDraft[] {
  const timestamp = now();
  const link = (id: string, talkId: string, kind: TalkLinkDraft["kind"], label: string, projectId: string, stackItemId: string, noteId: string, url: string, position: number): TalkLinkDraft => ({
    id,
    profileId,
    talkId,
    kind,
    projectId,
    stackItemId,
    noteId,
    label,
    url,
    position,
    isEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return [
    {
      id: "cc0f8f13-0c2b-4b0e-9001-000000000001",
      profileId,
      title: "Designing for the next useful question",
      slug: "designing-for-the-next-useful-question",
      eventName: "Frontend Futures 2026",
      eventDate: "2026-06-18",
      locationText: "Manila / online",
      format: "conference",
      role: "Speaker",
      summary: "A practical talk about turning a developer profile into a calm, searchable surface for proof of work.",
      slidesUrl: "https://example.com/talks/useful-question/slides",
      recordingUrl: "https://example.com/talks/useful-question/recording",
      eventUrl: "https://example.com/events/frontend-futures-2026",
      coverImageUrl: "",
      tags: ["design systems", "developer experience", "portfolio"],
      isPublished: true,
      isFeatured: true,
      position: 0,
      links: [
        link("dc0f8f13-0c2b-4b0e-9001-000000000001", "cc0f8f13-0c2b-4b0e-9001-000000000001", "project", "Signal case study", "4c0f8f13-0c2b-4b0e-9001-000000000001", "", "", "", 0),
        link("dc0f8f13-0c2b-4b0e-9001-000000000002", "cc0f8f13-0c2b-4b0e-9001-000000000001", "note", "Read the field note", "", "", "ac0f8f13-0c2b-4b0e-9001-000000000001", "", 1),
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "cc0f8f13-0c2b-4b0e-9001-000000000002",
      profileId,
      title: "The craft behind the public page",
      slug: "the-craft-behind-the-public-page",
      eventName: "The Product Surface Podcast",
      eventDate: "2026-04-09",
      locationText: "Remote recording",
      format: "podcast",
      role: "Guest",
      summary: "A conversation about designing small systems that give creative work enough structure to travel well.",
      slidesUrl: "",
      recordingUrl: "https://example.com/podcast/public-page",
      eventUrl: "https://example.com/podcast",
      coverImageUrl: "",
      tags: ["product", "systems", "writing"],
      isPublished: true,
      isFeatured: false,
      position: 1,
      links: [link("dc0f8f13-0c2b-4b0e-9001-000000000003", "cc0f8f13-0c2b-4b0e-9001-000000000002", "website", "Podcast episode", "", "", "", "https://example.com/podcast/public-page", 0)],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "cc0f8f13-0c2b-4b0e-9001-000000000003",
      profileId,
      title: "A workshop on small systems",
      slug: "a-workshop-on-small-systems",
      eventName: "Private workshop draft",
      eventDate: "2026-09-14",
      locationText: "To be announced",
      format: "workshop",
      role: "Facilitator",
      summary: "A private outline for a hands-on session about giving content a durable home without making the system feel heavy.",
      slidesUrl: "",
      recordingUrl: "",
      eventUrl: "",
      coverImageUrl: "",
      tags: ["draft", "workshop"],
      isPublished: false,
      isFeatured: false,
      position: 2,
      links: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createDemoSnips(profileId: string): ProfileSnipDraft[] {
  const timestamp = now();
  const link = (id: string, snipId: string, kind: SnipLinkDraft["kind"], label: string, projectId: string, url: string, position: number): SnipLinkDraft => ({
    id,
    profileId,
    snipId,
    kind,
    projectId,
    label,
    url,
    position,
    isEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return [
    {
      id: "ee0f8f13-0c2b-4b0e-9001-000000000001",
      profileId,
      title: "A small slug helper",
      slug: "a-small-slug-helper",
      description: "A deliberately small utility for turning a human label into a stable route segment.",
      code: `export function slugify(value: string) {
  return value.trim().toLowerCase().replace(/\\s+/g, "-");
}`,
      language: "typescript",
      visibility: "public",
      tags: ["typescript", "utilities", "web"],
      sourceUrl: "https://example.com/snips/slug-helper",
      isPublished: true,
      isFeatured: true,
      position: 0,
      links: [link("ef0f8f13-0c2b-4b0e-9001-000000000001", "ee0f8f13-0c2b-4b0e-9001-000000000001", "project", "Signal case study", "4c0f8f13-0c2b-4b0e-9001-000000000001", "", 0)],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "ee0f8f13-0c2b-4b0e-9001-000000000002",
      profileId,
      title: "A readable query boundary",
      slug: "a-readable-query-boundary",
      description: "A compact SQL shape for keeping public archive reads bounded and explicit.",
      code: `select id, title, slug
from public.snippets
where profile_id = $1
  and is_published = true
  and deleted_at is null
order by position asc
limit 8;`,
      language: "sql",
      visibility: "public",
      tags: ["sql", "supabase", "performance"],
      sourceUrl: "",
      isPublished: true,
      isFeatured: false,
      position: 1,
      links: [link("ef0f8f13-0c2b-4b0e-9001-000000000002", "ee0f8f13-0c2b-4b0e-9001-000000000002", "resource", "Supabase docs", "", "https://supabase.com/docs", 0)],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "ee0f8f13-0c2b-4b0e-9001-000000000003",
      profileId,
      title: "A private parsing experiment",
      slug: "a-private-parsing-experiment",
      description: "A draft reference for a future parser experiment.",
      code: `def parse_label(value):
    return value.strip().lower()`,
      language: "python",
      visibility: "private",
      tags: ["python", "draft"],
      sourceUrl: "",
      isPublished: false,
      isFeatured: false,
      position: 2,
      links: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createAuditLogs(profileId: string): AuditLogEntry[] {
  const timestamp = now();
  return [
    {
      id: "3a2a6f3d-10a6-44f2-b3f0-5f0edee24c5d",
      profileId,
      actorId: DEMO_USER_ID,
      action: "profile_published",
      entityType: "profile",
      entityId: profileId,
      summary: "Demo workspace published",
      metadata: {
        source: "seed",
      },
      createdAt: timestamp,
    },
  ];
}

function createDemoStore(): WorkspaceSnapshot {
  const profile = createDemoProfile();
  const links = createDemoLinks(profile.id);
  const sections = createDemoSections(profile.id);
  const blocks = createDemoBlocks(profile.id, sections);
  const projects = createDemoProjects(profile.id);
  const repositories = createDemoRepositories(profile.id);
  const stackCategories = createDemoStackCategories(profile.id);
  const stackItems = createDemoStackItems(profile.id);
  const pathEntries = createDemoPathEntries(profile.id);
  const notes = createDemoNotes(profile.id);
  const talks = createDemoTalks(profile.id);
  const snippets = createDemoSnips(profile.id);
  return {
    profile,
    links,
    sections,
    blocks,
    projects,
    repositories,
    stackCategories,
    stackItems,
    pathEntries,
    notes,
    talks,
    snippets,
    published: buildPublicProfileSnapshot(
      profile,
      links,
      profile.updatedAt,
      sections,
      blocks,
      projects,
      repositories,
      stackCategories,
      stackItems,
      pathEntries,
      notes,
      talks,
      snippets,
    ),
    auditLogs: createAuditLogs(profile.id),
    mode: "demo",
  };
}

const globalKey = "__nodivra_demo_store__";

function getGlobalStore() {
  const globalObject = globalThis as typeof globalThis & {
    [globalKey]?: ReturnType<typeof createDemoStore>;
  };

  if (!globalObject[globalKey]) {
    globalObject[globalKey] = createDemoStore();
  }

  return globalObject[globalKey]!;
}

export function getDemoStore() {
  return getGlobalStore();
}

export function cloneDemoStore() {
  return structuredClone(getGlobalStore());
}

export function getDemoWorkspaceSnapshot(): WorkspaceSnapshot {
  const store = getGlobalStore();
  return {
    profile: structuredClone(store.profile),
    links: structuredClone(store.links),
    sections: structuredClone(store.sections),
    blocks: structuredClone(store.blocks),
    projects: structuredClone(store.projects),
    repositories: structuredClone(store.repositories),
    stackCategories: structuredClone(store.stackCategories),
    stackItems: structuredClone(store.stackItems),
    pathEntries: structuredClone(store.pathEntries),
    notes: structuredClone(store.notes),
    talks: structuredClone(store.talks),
    snippets: structuredClone(store.snippets),
    published: structuredClone(store.published),
    auditLogs: structuredClone(store.auditLogs),
    mode: "demo",
  };
}
