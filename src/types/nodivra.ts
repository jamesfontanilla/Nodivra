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

export const BLOCK_TYPES = [
  "link_button",
  "social_link",
  "project_highlight",
  "text_section",
  "image_card",
  "divider",
  "cta_card",
  "availability_card",
  "external_resource",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const BLOCK_VISIBILITIES = ["public", "hidden"] as const;
export type BlockVisibility = (typeof BLOCK_VISIBILITIES)[number];

export type TextAlignment = "left" | "center";
export type DividerStyle = "line" | "space";
export type CtaAccent = "sand" | "moss" | "ink";
export type ResourceType = "article" | "video" | "document" | "tool" | "other";

export interface LinkButtonConfiguration {
  label: string;
  url: string;
  detail: string;
  iconLabel: string;
}

export interface SocialLinkConfiguration {
  network: string;
  label: string;
  url: string;
  iconLabel: string;
}

export interface ProjectHighlightConfiguration {
  projectName: string;
  summary: string;
  role: string;
  technologies: string[];
  url: string;
}

export interface TextSectionConfiguration {
  body: string;
  align: TextAlignment;
}

export interface ImageCardConfiguration {
  imageUrl: string;
  altText: string;
  caption: string;
}

export interface DividerConfiguration {
  style: DividerStyle;
  label: string;
}

export interface CtaCardConfiguration {
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  accent: CtaAccent;
}

export interface AvailabilityCardConfiguration {
  status: AvailabilityStatus;
  detail: string;
  timezone: string;
}

export interface ExternalResourceConfiguration {
  resourceType: ResourceType;
  url: string;
  description: string;
}

export type BlockConfiguration =
  | LinkButtonConfiguration
  | SocialLinkConfiguration
  | ProjectHighlightConfiguration
  | TextSectionConfiguration
  | ImageCardConfiguration
  | DividerConfiguration
  | CtaCardConfiguration
  | AvailabilityCardConfiguration
  | ExternalResourceConfiguration;

export interface ProfileSectionDraft {
  id: string;
  profileId: string;
  title: string;
  slug: string;
  position: number;
  isVisible: boolean;
  isCollapsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileBlockDraft {
  id: string;
  profileId: string;
  sectionId: string;
  type: BlockType;
  title: string;
  visibility: BlockVisibility;
  position: number;
  configuration: BlockConfiguration;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSectionSnapshot {
  id: string;
  title: string;
  slug: string;
  position: number;
}

export interface PublicBlockSnapshot {
  id: string;
  sectionId: string;
  type: BlockType;
  title: string;
  visibility: BlockVisibility;
  position: number;
  configuration: BlockConfiguration;
}

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
  publishedSections: PublicSectionSnapshot[];
  publishedBlocks: PublicBlockSnapshot[];
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
  sections: ProfileSectionDraft[];
  blocks: ProfileBlockDraft[];
  published: PublicProfileSnapshot | null;
  auditLogs: AuditLogEntry[];
  mode: "demo" | "authenticated" | "anonymous";
}

export interface ViewerContext {
  mode: "demo" | "authenticated" | "anonymous";
  userId: string | null;
}
