import {
  DEMO_HANDLE,
  DEMO_USER_ID,
  type AuditLogEntry,
  type ProfileBlockDraft,
  type ProfileDraft,
  type ProfileLinkDraft,
  type ProfileProjectDraft,
  type ProfileRepositoryDraft,
  type RepositoryLinkDraft,
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
  return {
    profile,
    links,
    sections,
    blocks,
    projects,
    repositories,
    published: buildPublicProfileSnapshot(
      profile,
      links,
      profile.updatedAt,
      sections,
      blocks,
      projects,
      repositories,
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
    published: structuredClone(store.published),
    auditLogs: structuredClone(store.auditLogs),
    mode: "demo",
  };
}
