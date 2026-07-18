export const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";
export const DEMO_HANDLE = "nodivra";

export const RESERVED_HANDLES = [
  "admin",
  "api",
  "assets",
  "login",
  "settings",
  "signup",
  "support",
  "u",
] as const;

export const AVAILABILITY_STATUSES = [
  "available",
  "busy",
  "away",
  "offline",
] as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const LINK_VISIBILITIES = ["public", "social", "hidden"] as const;
export type LinkVisibility = (typeof LINK_VISIBILITIES)[number];

export interface ProfileDraft {
  id: string;
  ownerId: string;
  handle: string;
  displayName: string;
  headline: string;
  bio: string;
  locationText: string;
  timezone: string;
  avatarInitials: string;
  avatarUrl: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  availabilityStatus: AvailabilityStatus;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileLinkDraft {
  id: string;
  profileId: string;
  title: string;
  url: string;
  iconLabel: string;
  visibility: LinkVisibility;
  isEnabled: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicLinkSnapshot {
  id: string;
  title: string;
  url: string;
  iconLabel: string;
  visibility: LinkVisibility;
  isEnabled: boolean;
  position: number;
}

export interface PublicProfileSnapshot {
  profileId: string;
  handle: string;
  displayName: string;
  headline: string;
  bio: string;
  locationText: string;
  timezone: string;
  avatarInitials: string;
  avatarUrl: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  availabilityStatus: AvailabilityStatus;
  publishedLinks: PublicLinkSnapshot[];
  publishedAt: string;
  isPublished: boolean;
}

export interface AuditLogEntry {
  id: string;
  profileId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface WorkspaceSnapshot {
  profile: ProfileDraft;
  links: ProfileLinkDraft[];
  published: PublicProfileSnapshot | null;
  auditLogs: AuditLogEntry[];
  mode: "demo" | "authenticated" | "anonymous";
}

export interface ViewerContext {
  mode: "demo" | "authenticated" | "anonymous";
  userId: string | null;
}
