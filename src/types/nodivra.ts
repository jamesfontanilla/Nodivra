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
  "note_highlight",
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
  projectId?: string;
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

export interface NoteHighlightConfiguration {
  noteId: string;
  title: string;
  excerpt: string;
  url: string;
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
  | ExternalResourceConfiguration
  | NoteHighlightConfiguration;

export const PROJECT_TYPES = [
  "product",
  "open_source",
  "client",
  "experiment",
  "talk",
  "other",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_STATUSES = [
  "idea",
  "in_progress",
  "shipped",
  "archived",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_LINK_KINDS = ["live", "repository", "demo"] as const;
export type ProjectLinkKind = (typeof PROJECT_LINK_KINDS)[number];

export interface ProjectLinkDraft {
  id: string;
  projectId: string;
  kind: ProjectLinkKind;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileProjectDraft {
  id: string;
  profileId: string;
  slug: string;
  projectName: string;
  shortSummary: string;
  caseStudyMarkdown: string;
  role: string;
  technologies: string[];
  projectType: ProjectType;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  coverImageUrl: string;
  lessonsLearned: string;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  position: number;
  links: ProjectLinkDraft[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicProjectSnapshot {
  id: string;
  slug: string;
  projectName: string;
  shortSummary: string;
  caseStudyMarkdown: string;
  role: string;
  technologies: string[];
  projectType: ProjectType;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  coverImageUrl: string;
  lessonsLearned: string;
  tags: string[];
  isFeatured: boolean;
  position: number;
  links: Array<Pick<ProjectLinkDraft, "id" | "kind" | "label" | "url" | "position" | "isEnabled">>;
}

export const REPOSITORY_STATUSES = [
  "active",
  "maintenance",
  "paused",
  "archived",
] as const;

export type RepositoryStatus = (typeof REPOSITORY_STATUSES)[number];

export const REPOSITORY_LINK_KINDS = ["project", "stack"] as const;
export type RepositoryLinkKind = (typeof REPOSITORY_LINK_KINDS)[number];

export interface RepositoryLinkDraft {
  id: string;
  profileId: string;
  repositoryId: string;
  kind: RepositoryLinkKind;
  projectId: string;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileRepositoryDraft {
  id: string;
  profileId: string;
  repositoryName: string;
  providerLabel: string;
  repositoryUrl: string;
  description: string;
  language: string;
  framework: string;
  topics: string[];
  starsText: string;
  forksText: string;
  activityLabel: string;
  status: RepositoryStatus;
  isStatsVisible: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  position: number;
  links: RepositoryLinkDraft[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicRepositoryLinkSnapshot {
  id: string;
  kind: RepositoryLinkKind;
  projectId: string;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
}

export interface PublicRepositorySnapshot {
  id: string;
  repositoryName: string;
  providerLabel: string;
  repositoryUrl: string;
  description: string;
  language: string;
  framework: string;
  topics: string[];
  starsText: string;
  forksText: string;
  activityLabel: string;
  status: RepositoryStatus;
  isStatsVisible: boolean;
  isFeatured: boolean;
  position: number;
  links: PublicRepositoryLinkSnapshot[];
}

export const STACK_CATEGORY_KEYS = [
  "languages",
  "frontend",
  "backend",
  "databases",
  "cloud",
  "testing",
  "tooling",
  "design",
  "mobile",
  "other",
] as const;

export type BuiltInStackCategoryKey = (typeof STACK_CATEGORY_KEYS)[number];
export type StackCategoryKey = BuiltInStackCategoryKey | "custom";

export const STACK_ICON_IDENTIFIERS = [
  "code",
  "database",
  "cloud",
  "terminal",
  "palette",
  "mobile",
  "tool",
  "spark",
  "book",
  "shield",
] as const;

export type StackIconIdentifier = (typeof STACK_ICON_IDENTIFIERS)[number];

export const STACK_LEARNING_STATUSES = [
  "used_daily",
  "comfortable",
  "learning",
  "exploring",
] as const;

export type StackLearningStatus = (typeof STACK_LEARNING_STATUSES)[number];

export const STACK_LINK_KINDS = ["documentation", "resource", "tool"] as const;
export type StackLinkKind = (typeof STACK_LINK_KINDS)[number];

export interface ProfileStackCategoryDraft {
  id: string;
  profileId: string;
  key: StackCategoryKey;
  name: string;
  slug: string;
  isBuiltIn: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface StackProjectDraft {
  id: string;
  profileId: string;
  stackItemId: string;
  projectId: string;
  position: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StackLinkDraft {
  id: string;
  profileId: string;
  stackItemId: string;
  kind: StackLinkKind;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStackItemDraft {
  id: string;
  profileId: string;
  categoryId: string;
  technologyName: string;
  proficiencyLabel: string;
  yearsText: string;
  confidenceLabel: string;
  learningStatus: StackLearningStatus;
  shortDescription: string;
  iconIdentifier: StackIconIdentifier;
  isFeatured: boolean;
  isPublished: boolean;
  position: number;
  projects: StackProjectDraft[];
  links: StackLinkDraft[];
  createdAt: string;
  updatedAt: string;
}

export const PATH_ENTRY_TYPES = [
  "work",
  "freelance",
  "internship",
  "education",
  "certification",
  "volunteer",
  "career_milestone",
] as const;

export type PathEntryType = (typeof PATH_ENTRY_TYPES)[number];

export const PATH_DATE_VISIBILITIES = ["exact", "year_only"] as const;
export type PathDateVisibility = (typeof PATH_DATE_VISIBILITIES)[number];

export const PATH_LINK_KINDS = ["project", "website", "certificate", "resource"] as const;
export type PathLinkKind = (typeof PATH_LINK_KINDS)[number];

export interface PathHighlightDraft {
  id: string;
  profileId: string;
  entryId: string;
  content: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface PathTechnologyDraft {
  id: string;
  profileId: string;
  entryId: string;
  technology: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface PathLinkDraft {
  id: string;
  profileId: string;
  entryId: string;
  kind: PathLinkKind;
  projectId: string;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilePathEntryDraft {
  id: string;
  profileId: string;
  entryType: PathEntryType;
  title: string;
  organization: string;
  locationText: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  dateVisibility: PathDateVisibility;
  summary: string;
  highlights: PathHighlightDraft[];
  technologies: PathTechnologyDraft[];
  links: PathLinkDraft[];
  isPublished: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicPathHighlightSnapshot {
  id: string;
  content: string;
  position: number;
}

export interface PublicPathTechnologySnapshot {
  id: string;
  technology: string;
  position: number;
}

export interface PublicPathLinkSnapshot {
  id: string;
  kind: PathLinkKind;
  projectId: string;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
}

export interface PublicPathEntrySnapshot {
  id: string;
  entryType: PathEntryType;
  title: string;
  organization: string;
  locationText: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  dateVisibility: PathDateVisibility;
  summary: string;
  highlights: PublicPathHighlightSnapshot[];
  technologies: PublicPathTechnologySnapshot[];
  links: PublicPathLinkSnapshot[];
  position: number;
}

export const NOTE_LINK_KINDS = ["project", "website", "repository", "resource"] as const;
export type NoteLinkKind = (typeof NOTE_LINK_KINDS)[number];

export const TALK_FORMATS = ["conference", "workshop", "podcast", "panel", "meetup", "livestream"] as const;
export type TalkFormat = (typeof TALK_FORMATS)[number];

export const TALK_LINK_KINDS = ["project", "stack", "note", "website", "resource"] as const;
export type TalkLinkKind = (typeof TALK_LINK_KINDS)[number];

export interface NoteLinkDraft {
  id: string;
  profileId: string;
  noteId: string;
  kind: NoteLinkKind;
  projectId: string;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileNoteDraft {
  id: string;
  profileId: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  coverImageUrl: string;
  tags: string[];
  publishedAt: string;
  readingTimeText: string;
  canonicalUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  position: number;
  links: NoteLinkDraft[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicNoteLinkSnapshot {
  id: string;
  kind: NoteLinkKind;
  projectId: string;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
}

export interface PublicNoteSnapshot {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  coverImageUrl: string;
  tags: string[];
  publishedAt: string;
  readingTimeText: string;
  canonicalUrl: string;
  isFeatured: boolean;
  position: number;
  links: PublicNoteLinkSnapshot[];
}

export interface TalkLinkDraft {
  id: string;
  profileId: string;
  talkId: string;
  kind: TalkLinkKind;
  projectId: string;
  stackItemId: string;
  noteId: string;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileTalkDraft {
  id: string;
  profileId: string;
  title: string;
  slug: string;
  eventName: string;
  eventDate: string;
  locationText: string;
  format: TalkFormat;
  role: string;
  summary: string;
  slidesUrl: string;
  recordingUrl: string;
  eventUrl: string;
  coverImageUrl: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  position: number;
  links: TalkLinkDraft[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicTalkLinkSnapshot {
  id: string;
  kind: TalkLinkKind;
  projectId: string;
  stackItemId: string;
  noteId: string;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
}

export interface PublicTalkSnapshot {
  id: string;
  title: string;
  slug: string;
  eventName: string;
  eventDate: string;
  locationText: string;
  format: TalkFormat;
  role: string;
  summary: string;
  slidesUrl: string;
  recordingUrl: string;
  eventUrl: string;
  coverImageUrl: string;
  tags: string[];
  isFeatured: boolean;
  position: number;
  links: PublicTalkLinkSnapshot[];
}

export interface PublicStackCategorySnapshot {
  id: string;
  key: StackCategoryKey;
  name: string;
  slug: string;
  position: number;
}

export interface PublicStackProjectSnapshot {
  id: string;
  projectId: string;
  position: number;
  isEnabled: boolean;
}

export interface PublicStackLinkSnapshot {
  id: string;
  kind: StackLinkKind;
  label: string;
  url: string;
  position: number;
  isEnabled: boolean;
}

export interface PublicStackItemSnapshot {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  technologyName: string;
  proficiencyLabel: string;
  yearsText: string;
  confidenceLabel: string;
  learningStatus: StackLearningStatus;
  shortDescription: string;
  iconIdentifier: StackIconIdentifier;
  isFeatured: boolean;
  position: number;
  projects: PublicStackProjectSnapshot[];
  links: PublicStackLinkSnapshot[];
}

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
  publishedProjects: PublicProjectSnapshot[];
  publishedRepositories: PublicRepositorySnapshot[];
  publishedStackCategories: PublicStackCategorySnapshot[];
  publishedStackItems: PublicStackItemSnapshot[];
  publishedPathEntries: PublicPathEntrySnapshot[];
  publishedNotes: PublicNoteSnapshot[];
  publishedTalks: PublicTalkSnapshot[];
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
  projects: ProfileProjectDraft[];
  repositories: ProfileRepositoryDraft[];
  stackCategories: ProfileStackCategoryDraft[];
  stackItems: ProfileStackItemDraft[];
  pathEntries: ProfilePathEntryDraft[];
  notes: ProfileNoteDraft[];
  talks: ProfileTalkDraft[];
  published: PublicProfileSnapshot | null;
  auditLogs: AuditLogEntry[];
  mode: "demo" | "authenticated" | "anonymous";
}

export interface ViewerContext {
  mode: "demo" | "authenticated" | "anonymous";
  userId: string | null;
}
