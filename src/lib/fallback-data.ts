import {
  DEMO_HANDLE,
  DEMO_USER_ID,
  type AuditLogEntry,
  type ProfileDraft,
  type ProfileLinkDraft,
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
  return {
    profile,
    links,
    published: buildPublicProfileSnapshot(profile, links, profile.updatedAt),
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
    published: structuredClone(store.published),
    auditLogs: structuredClone(store.auditLogs),
    mode: "demo",
  };
}
