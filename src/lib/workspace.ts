import { randomUUID } from "node:crypto";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { getDemoStore, getDemoWorkspaceSnapshot } from "@/lib/fallback-data";
import {
  buildPublicProfileSnapshot,
  sortBlocks,
  sortLinks,
  sortProjects,
  sortRepositories,
  sortStackCategories,
  sortStackItems,
  sortPathEntries,
  sortNotes,
  sortTalks,
  sortSections,
} from "@/lib/snapshot";
import {
  getInitials,
  isReservedHandle,
  profileBlockDraftSchema,
  profileDraftSchema,
  projectDraftSchema,
  repositoryDraftSchema,
  stackItemDraftSchema,
  pathEntryDraftSchema,
  noteDraftSchema,
  talkDraftSchema,
  publicProfileSnapshotSchema,
  toFieldErrors,
  workspaceDraftSchema,
  type ProfileBlockDraftInput,
  type ProfileLinkDraftInput,
  type ProfileDraftInput,
  type ProfileProjectDraftInput,
  type ProfileRepositoryDraftInput,
  type ProfileStackCategoryDraftInput,
  type ProfileStackItemDraftInput,
  type ProfilePathEntryDraftInput,
  type ProfileNoteDraftInput,
  type ProfileTalkDraftInput,
  type ProfileSectionDraftInput,
  type WorkspaceDraftInput,
} from "@/lib/validation";
import {
  DEMO_HANDLE,
  DEMO_USER_ID,
  STACK_CATEGORY_KEYS,
  type AuditLogEntry,
  type AvailabilityStatus,
  type BlockConfiguration,
  type BlockType,
  type BlockVisibility,
  type ProfileBlockDraft,
  type ProfileProjectDraft,
  type ProfileRepositoryDraft,
  type ProfileStackCategoryDraft,
  type ProfileStackItemDraft,
  type ProfilePathEntryDraft,
  type PathHighlightDraft,
  type PathTechnologyDraft,
  type PathLinkDraft,
  type PathEntryType,
  type PathDateVisibility,
  type PathLinkKind,
  type ProfileNoteDraft,
  type NoteLinkDraft,
  type NoteLinkKind,
  type ProfileTalkDraft,
  type TalkLinkDraft,
  type TalkLinkKind,
  type TalkFormat,
  type ProjectLinkDraft,
  type ProjectLinkKind,
  type ProjectStatus,
  type ProjectType,
  type RepositoryLinkDraft,
  type RepositoryLinkKind,
  type RepositoryStatus,
  type StackCategoryKey,
  type StackIconIdentifier,
  type StackLearningStatus,
  type StackLinkDraft,
  type StackLinkKind,
  type StackProjectDraft,
  type LinkVisibility,
  type ProfileDraft,
  type ProfileLinkDraft,
  type ProfileSectionDraft,
  type PublicProfileSnapshot,
  type ViewerContext,
  type WorkspaceSnapshot,
} from "@/types/nodivra";

type ProfilesRow = {
  id: string;
  owner_id: string;
  handle: string;
  display_name: string;
  headline: string;
  bio: string;
  location_text: string;
  timezone: string;
  avatar_initials: string;
  avatar_url: string | null;
  primary_cta_label: string;
  primary_cta_url: string | null;
  availability_status: AvailabilityStatus;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProfileLinksRow = {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon_label: string;
  visibility: LinkVisibility;
  is_enabled: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProfileSectionsRow = {
  id: string;
  profile_id: string;
  title: string;
  slug: string;
  position: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProfileBlocksRow = {
  id: string;
  profile_id: string;
  section_id: string;
  type: BlockType;
  title: string;
  visibility: BlockVisibility;
  position: number;
  configuration: BlockConfiguration;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProjectsRow = {
  id: string;
  profile_id: string;
  slug: string;
  project_name: string;
  short_summary: string;
  case_study_markdown: string;
  role: string;
  project_type: ProjectType;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  cover_image_url: string | null;
  lessons_learned: string;
  is_featured: boolean;
  is_published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type RepositoriesRow = {
  id: string;
  profile_id: string;
  repository_name: string;
  provider_label: string;
  repository_url: string;
  description: string;
  language: string;
  framework: string;
  stars_text: string;
  forks_text: string;
  activity_label: string;
  status: RepositoryStatus;
  is_stats_visible: boolean;
  is_featured: boolean;
  is_published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProjectTechnologiesRow = {
  id: string;
  profile_id: string;
  project_id: string;
  technology: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type ProjectTagsRow = {
  id: string;
  profile_id: string;
  project_id: string;
  tag: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type ProjectLinksRow = {
  id: string;
  profile_id: string;
  project_id: string;
  kind: ProjectLinkKind;
  label: string;
  url: string;
  position: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type RepositoryTopicsRow = {
  id: string;
  profile_id: string;
  repository_id: string;
  topic: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type RepositoryLanguagesRow = {
  id: string;
  profile_id: string;
  repository_id: string;
  language: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type RepositoryLinksRow = {
  id: string;
  profile_id: string;
  repository_id: string;
  kind: RepositoryLinkKind;
  project_id: string | null;
  label: string;
  url: string;
  position: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type StackCategoriesRow = {
  id: string;
  profile_id: string;
  key: StackCategoryKey;
  name: string;
  slug: string;
  is_built_in: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type StackItemsRow = {
  id: string;
  profile_id: string;
  category_id: string;
  technology_name: string;
  proficiency_label: string;
  years_text: string;
  confidence_label: string;
  learning_status: StackLearningStatus;
  short_description: string;
  icon_identifier: StackIconIdentifier;
  is_featured: boolean;
  is_published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type StackProjectsRow = {
  id: string;
  profile_id: string;
  stack_item_id: string;
  project_id: string;
  position: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type StackLinksRow = {
  id: string;
  profile_id: string;
  stack_item_id: string;
  kind: StackLinkKind;
  label: string;
  url: string;
  position: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type TimelineEntriesRow = {
  id: string;
  profile_id: string;
  entry_type: PathEntryType;
  title: string;
  organization: string;
  location_text: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  date_visibility: PathDateVisibility;
  summary: string;
  is_published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type TimelineHighlightsRow = {
  id: string;
  profile_id: string;
  entry_id: string;
  content: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type TimelineTechnologiesRow = {
  id: string;
  profile_id: string;
  entry_id: string;
  technology: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type TimelineLinksRow = {
  id: string;
  profile_id: string;
  entry_id: string;
  kind: PathLinkKind;
  project_id: string | null;
  label: string;
  url: string;
  position: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type NotesRow = {
  id: string;
  profile_id: string;
  title: string;
  slug: string;
  excerpt: string;
  body_markdown: string;
  cover_image_url: string | null;
  published_at: string | null;
  reading_time_text: string;
  canonical_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type NoteTagsRow = {
  id: string;
  profile_id: string;
  note_id: string;
  tag: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type NoteLinksRow = {
  id: string;
  profile_id: string;
  note_id: string;
  kind: NoteLinkKind;
  project_id: string | null;
  label: string;
  url: string;
  position: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type TalksRow = {
  id: string;
  profile_id: string;
  title: string;
  slug: string;
  event_name: string;
  event_date: string;
  location_text: string;
  format: TalkFormat;
  role: string;
  summary: string;
  slides_url: string | null;
  recording_url: string | null;
  event_url: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type TalkTagsRow = {
  id: string;
  profile_id: string;
  talk_id: string;
  tag: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type TalkLinksRow = {
  id: string;
  profile_id: string;
  talk_id: string;
  kind: TalkLinkKind;
  project_id: string | null;
  stack_item_id: string | null;
  note_id: string | null;
  label: string;
  url: string;
  position: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type PublicProfileSettingsRow = {
  id: string;
  profile_id: string;
  handle: string;
  display_name: string;
  headline: string;
  bio: string;
  location_text: string;
  timezone: string;
  avatar_initials: string;
  avatar_url: string | null;
  primary_cta_label: string;
  primary_cta_url: string | null;
  availability_status: AvailabilityStatus;
  published_links: unknown;
  published_sections: unknown;
  published_blocks: unknown;
  published_projects: unknown;
  published_repositories: unknown;
  published_stack_categories: unknown;
  published_stack_items: unknown;
  published_path_entries: unknown;
  published_notes: unknown;
  published_talks: unknown;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

type AuditLogsRow = {
  id: string;
  profile_id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type LinkTimingSource = {
  id: string;
  createdAt?: string;
  created_at?: string;
};

export type WorkspaceMutationResult =
  | { ok: true; workspace: WorkspaceSnapshot }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

function nowIso() {
  return new Date().toISOString();
}

function createBlankProfile(ownerId: string): ProfileDraft {
  const timestamp = nowIso();
  return {
    id: randomUUID(),
    ownerId,
    handle: "",
    displayName: "",
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
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createStarterSection(profileId: string): ProfileSectionDraft {
  const timestamp = nowIso();
  return {
    id: randomUUID(),
    profileId,
    title: "About",
    slug: "about",
    position: 0,
    isVisible: true,
    isCollapsed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function stackCategoryName(key: string) {
  return key.replace(/(^|-)([a-z])/g, (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
}

function createStarterStackCategories(profileId: string): ProfileStackCategoryDraft[] {
  const timestamp = nowIso();
  return STACK_CATEGORY_KEYS.map((key, position) => ({
    id: randomUUID(),
    profileId,
    key,
    name: stackCategoryName(key),
    slug: key,
    isBuiltIn: true,
    position,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}

export function createBlankWorkspace(
  mode: ViewerContext["mode"],
  ownerId: string,
): WorkspaceSnapshot {
  const profile = createBlankProfile(ownerId);
  return {
    profile,
    links: [],
    sections: [createStarterSection(profile.id)],
    blocks: [],
    projects: [],
    repositories: [],
    stackCategories: createStarterStackCategories(profile.id),
    stackItems: [],
    pathEntries: [],
    notes: [],
    talks: [],
    published: null,
    auditLogs: [],
    mode,
  };
}

function profileRowToDraft(row: ProfilesRow): ProfileDraft {
  return {
    id: row.id,
    ownerId: row.owner_id,
    handle: row.handle,
    displayName: row.display_name,
    headline: row.headline,
    bio: row.bio,
    locationText: row.location_text,
    timezone: row.timezone,
    avatarInitials: row.avatar_initials,
    avatarUrl: row.avatar_url ?? "",
    primaryCtaLabel: row.primary_cta_label,
    primaryCtaUrl: row.primary_cta_url ?? "",
    availabilityStatus: row.availability_status,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function linkRowToDraft(row: ProfileLinksRow): ProfileLinkDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    url: row.url,
    iconLabel: row.icon_label,
    visibility: row.visibility,
    isEnabled: row.is_enabled,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sectionRowToDraft(row: ProfileSectionsRow): ProfileSectionDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    slug: row.slug,
    position: row.position,
    isVisible: row.is_visible,
    isCollapsed: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function blockRowToDraft(row: ProfileBlocksRow): ProfileBlockDraft | null {
  const parsed = profileBlockDraftSchema.safeParse({
    id: row.id,
    profileId: row.profile_id,
    sectionId: row.section_id,
    type: row.type,
    title: row.title,
    visibility: row.visibility,
    position: row.position,
    configuration: row.configuration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  return parsed.success ? parsed.data : null;
}

function projectLinkRowToDraft(row: ProjectLinksRow): ProjectLinkDraft {
  return {
    id: row.id,
    projectId: row.project_id,
    kind: row.kind,
    label: row.label,
    url: row.url,
    position: row.position,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function projectRowToDraft(
  row: ProjectsRow,
  technologies: ProjectTechnologiesRow[],
  links: ProjectLinksRow[],
  tags: ProjectTagsRow[],
): ProfileProjectDraft | null {
  const candidate = {
    id: row.id,
    profileId: row.profile_id,
    slug: row.slug,
    projectName: row.project_name,
    shortSummary: row.short_summary,
    caseStudyMarkdown: row.case_study_markdown,
    role: row.role,
    technologies: [...technologies]
      .sort((left, right) => left.position - right.position)
      .map((technology) => technology.technology),
    projectType: row.project_type,
    startDate: row.start_date ?? "",
    endDate: row.end_date ?? "",
    status: row.status,
    coverImageUrl: row.cover_image_url ?? "",
    lessonsLearned: row.lessons_learned,
    tags: [...tags]
      .sort((left, right) => left.position - right.position)
      .map((tag) => tag.tag),
    isFeatured: row.is_featured,
    isPublished: row.is_published,
    position: row.position,
    links: links
      .sort((left, right) => left.position - right.position)
      .map(projectLinkRowToDraft),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const parsed = projectDraftSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function repositoryLinkRowToDraft(row: RepositoryLinksRow): RepositoryLinkDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    repositoryId: row.repository_id,
    kind: row.kind,
    projectId: row.project_id ?? "",
    label: row.label,
    url: row.url,
    position: row.position,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function repositoryRowToDraft(
  row: RepositoriesRow,
  topics: RepositoryTopicsRow[],
  languages: RepositoryLanguagesRow[],
  links: RepositoryLinksRow[],
): ProfileRepositoryDraft | null {
  const sortedLanguages = [...languages].sort((left, right) => left.position - right.position);
  const candidate = {
    id: row.id,
    profileId: row.profile_id,
    repositoryName: row.repository_name,
    providerLabel: row.provider_label,
    repositoryUrl: row.repository_url,
    description: row.description,
    language: sortedLanguages[0]?.language ?? row.language,
    framework: row.framework,
    topics: [...topics]
      .sort((left, right) => left.position - right.position)
      .map((topic) => topic.topic),
    starsText: row.stars_text,
    forksText: row.forks_text,
    activityLabel: row.activity_label,
    status: row.status,
    isStatsVisible: row.is_stats_visible,
    isFeatured: row.is_featured,
    isPublished: row.is_published,
    position: row.position,
    links: [...links]
      .sort((left, right) => left.position - right.position)
      .map(repositoryLinkRowToDraft),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const parsed = repositoryDraftSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function stackCategoryRowToDraft(row: StackCategoriesRow): ProfileStackCategoryDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    key: row.key,
    name: row.name,
    slug: row.slug,
    isBuiltIn: row.is_built_in,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function stackProjectRowToDraft(row: StackProjectsRow): StackProjectDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    stackItemId: row.stack_item_id,
    projectId: row.project_id,
    position: row.position,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function stackLinkRowToDraft(row: StackLinksRow): StackLinkDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    stackItemId: row.stack_item_id,
    kind: row.kind,
    label: row.label,
    url: row.url,
    position: row.position,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function stackItemRowToDraft(
  row: StackItemsRow,
  projects: StackProjectsRow[],
  links: StackLinksRow[],
): ProfileStackItemDraft | null {
  const candidate = {
    id: row.id,
    profileId: row.profile_id,
    categoryId: row.category_id,
    technologyName: row.technology_name,
    proficiencyLabel: row.proficiency_label,
    yearsText: row.years_text,
    confidenceLabel: row.confidence_label,
    learningStatus: row.learning_status,
    shortDescription: row.short_description,
    iconIdentifier: row.icon_identifier,
    isFeatured: row.is_featured,
    isPublished: row.is_published,
    position: row.position,
    projects: [...projects].sort((left, right) => left.position - right.position).map(stackProjectRowToDraft),
    links: [...links].sort((left, right) => left.position - right.position).map(stackLinkRowToDraft),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  const parsed = stackItemDraftSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function timelineHighlightRowToDraft(row: TimelineHighlightsRow): PathHighlightDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    entryId: row.entry_id,
    content: row.content,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function timelineTechnologyRowToDraft(row: TimelineTechnologiesRow): PathTechnologyDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    entryId: row.entry_id,
    technology: row.technology,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function timelineLinkRowToDraft(row: TimelineLinksRow): PathLinkDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    entryId: row.entry_id,
    kind: row.kind,
    projectId: row.project_id ?? "",
    label: row.label,
    url: row.url,
    position: row.position,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function timelineEntryRowToDraft(
  row: TimelineEntriesRow,
  highlights: TimelineHighlightsRow[],
  technologies: TimelineTechnologiesRow[],
  links: TimelineLinksRow[],
): ProfilePathEntryDraft | null {
  const candidate = {
    id: row.id,
    profileId: row.profile_id,
    entryType: row.entry_type,
    title: row.title,
    organization: row.organization,
    locationText: row.location_text,
    startDate: row.start_date,
    endDate: row.end_date ?? "",
    isCurrent: row.is_current,
    dateVisibility: row.date_visibility,
    summary: row.summary,
    highlights: [...highlights].sort((left, right) => left.position - right.position).map(timelineHighlightRowToDraft),
    technologies: [...technologies].sort((left, right) => left.position - right.position).map(timelineTechnologyRowToDraft),
    links: [...links].sort((left, right) => left.position - right.position).map(timelineLinkRowToDraft),
    isPublished: row.is_published,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  const parsed = pathEntryDraftSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function noteTagRowToTag(row: NoteTagsRow) {
  return { tag: row.tag, position: row.position };
}

function noteLinkRowToDraft(row: NoteLinksRow): NoteLinkDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    noteId: row.note_id,
    kind: row.kind,
    projectId: row.project_id ?? "",
    label: row.label,
    url: row.url,
    position: row.position,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function noteRowToDraft(
  row: NotesRow,
  tags: NoteTagsRow[],
  links: NoteLinksRow[],
): ProfileNoteDraft | null {
  const candidate = {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    bodyMarkdown: row.body_markdown,
    coverImageUrl: row.cover_image_url ?? "",
    tags: [...tags].sort((left, right) => left.position - right.position).map(noteTagRowToTag).map((tag) => tag.tag),
    publishedAt: row.published_at ?? "",
    readingTimeText: row.reading_time_text,
    canonicalUrl: row.canonical_url ?? "",
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    position: row.position,
    links: [...links].sort((left, right) => left.position - right.position).map(noteLinkRowToDraft),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  const parsed = noteDraftSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function talkTagRowToTag(row: TalkTagsRow) {
  return { tag: row.tag, position: row.position };
}

function talkLinkRowToDraft(row: TalkLinksRow): TalkLinkDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    talkId: row.talk_id,
    kind: row.kind,
    projectId: row.project_id ?? "",
    stackItemId: row.stack_item_id ?? "",
    noteId: row.note_id ?? "",
    label: row.label,
    url: row.url,
    position: row.position,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function talkRowToDraft(
  row: TalksRow,
  tags: TalkTagsRow[],
  links: TalkLinksRow[],
): ProfileTalkDraft | null {
  const candidate = {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    slug: row.slug,
    eventName: row.event_name,
    eventDate: row.event_date,
    locationText: row.location_text,
    format: row.format,
    role: row.role,
    summary: row.summary,
    slidesUrl: row.slides_url ?? "",
    recordingUrl: row.recording_url ?? "",
    eventUrl: row.event_url ?? "",
    coverImageUrl: row.cover_image_url ?? "",
    tags: [...tags].sort((left, right) => left.position - right.position).map(talkTagRowToTag).map((tag) => tag.tag),
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    position: row.position,
    links: [...links].sort((left, right) => left.position - right.position).map(talkLinkRowToDraft),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  const parsed = talkDraftSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function normalizeProjectDrafts(
  profileId: string,
  projects: ProfileProjectDraftInput[],
  existingProjects: ProfileProjectDraft[] = [],
) {
  const timestamp = nowIso();
  const existingById = new Map(existingProjects.map((project) => [project.id, project]));
  return sortProjects(projects).map<ProfileProjectDraft>((project, position) => {
    const existing = existingById.get(project.id);
    return {
      ...project,
      profileId,
      position,
      links: project.links.map((link, linkPosition) => ({
        ...link,
        projectId: project.id,
        position: linkPosition,
        createdAt: existing?.links.find((item) => item.id === link.id)?.createdAt ?? link.createdAt ?? timestamp,
        updatedAt: timestamp,
      })),
      createdAt: existing?.createdAt ?? project.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
  });
}

function normalizeRepositoryDrafts(
  profileId: string,
  repositories: ProfileRepositoryDraftInput[],
  existingRepositories: ProfileRepositoryDraft[] = [],
) {
  const timestamp = nowIso();
  const existingById = new Map(existingRepositories.map((repository) => [repository.id, repository]));
  return sortRepositories(repositories).map<ProfileRepositoryDraft>((repository, position) => {
    const existing = existingById.get(repository.id);
    return {
      ...repository,
      profileId,
      position,
      links: repository.links.map((link, linkPosition) => ({
        ...link,
        profileId,
        repositoryId: repository.id,
        position: linkPosition,
        createdAt: existing?.links.find((item) => item.id === link.id)?.createdAt ?? link.createdAt ?? timestamp,
        updatedAt: timestamp,
      })),
      createdAt: existing?.createdAt ?? repository.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
  });
}

function normalizeStackCategories(
  profileId: string,
  categories: ProfileStackCategoryDraftInput[],
  existingCategories: ProfileStackCategoryDraft[] = [],
) {
  const timestamp = nowIso();
  const existingById = new Map(existingCategories.map((category) => [category.id, category]));
  return sortStackCategories(categories).map<ProfileStackCategoryDraft>((category, position) => {
    const existing = existingById.get(category.id);
    return {
      ...category,
      profileId,
      position,
      createdAt: existing?.createdAt ?? category.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
  });
}

function normalizeStackItems(
  profileId: string,
  items: ProfileStackItemDraftInput[],
  existingItems: ProfileStackItemDraft[] = [],
) {
  const timestamp = nowIso();
  const existingById = new Map(existingItems.map((item) => [item.id, item]));
  return sortStackItems(items).map<ProfileStackItemDraft>((item, position) => {
    const existing = existingById.get(item.id);
    return {
      ...item,
      profileId,
      position,
      projects: item.projects.map((project, projectPosition) => ({
        ...project,
        profileId,
        stackItemId: item.id,
        position: projectPosition,
        createdAt: existing?.projects.find((link) => link.id === project.id)?.createdAt ?? project.createdAt ?? timestamp,
        updatedAt: timestamp,
      })),
      links: item.links.map((link, linkPosition) => ({
        ...link,
        profileId,
        stackItemId: item.id,
        position: linkPosition,
        createdAt: existing?.links.find((existingLink) => existingLink.id === link.id)?.createdAt ?? link.createdAt ?? timestamp,
        updatedAt: timestamp,
      })),
      createdAt: existing?.createdAt ?? item.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
  });
}

function normalizePathEntries(
  profileId: string,
  entries: ProfilePathEntryDraftInput[],
  existingEntries: ProfilePathEntryDraft[] = [],
) {
  const timestamp = nowIso();
  const existingById = new Map(existingEntries.map((entry) => [entry.id, entry]));
  return sortPathEntries(entries).map<ProfilePathEntryDraft>((entry, position) => {
    const existing = existingById.get(entry.id);
    return {
      ...entry,
      profileId,
      position,
      highlights: entry.highlights.map((highlight, highlightPosition) => ({
        ...highlight,
        profileId,
        entryId: entry.id,
        position: highlightPosition,
        createdAt: existing?.highlights.find((item) => item.id === highlight.id)?.createdAt ?? highlight.createdAt ?? timestamp,
        updatedAt: timestamp,
      })),
      technologies: entry.technologies.map((technology, technologyPosition) => ({
        ...technology,
        profileId,
        entryId: entry.id,
        position: technologyPosition,
        createdAt: existing?.technologies.find((item) => item.id === technology.id)?.createdAt ?? technology.createdAt ?? timestamp,
        updatedAt: timestamp,
      })),
      links: entry.links.map((link, linkPosition) => ({
        ...link,
        profileId,
        entryId: entry.id,
        position: linkPosition,
        createdAt: existing?.links.find((item) => item.id === link.id)?.createdAt ?? link.createdAt ?? timestamp,
        updatedAt: timestamp,
      })),
      createdAt: existing?.createdAt ?? entry.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
  });
}

function normalizeNotes(
  profileId: string,
  notes: ProfileNoteDraftInput[],
  existingNotes: ProfileNoteDraft[] = [],
) {
  const timestamp = nowIso();
  const existingById = new Map(existingNotes.map((note) => [note.id, note]));
  return sortNotes(notes).map<ProfileNoteDraft>((note, position) => {
    const existing = existingById.get(note.id);
    return {
      ...note,
      profileId,
      position,
      tags: note.tags.map((tag) => tag.trim()).filter(Boolean),
      links: note.links.map((link, linkPosition) => ({
        ...link,
        profileId,
        noteId: note.id,
        position: linkPosition,
        createdAt: existing?.links.find((item) => item.id === link.id)?.createdAt ?? link.createdAt ?? timestamp,
        updatedAt: timestamp,
      })),
      createdAt: existing?.createdAt ?? note.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
  });
}

function normalizeTalks(
  profileId: string,
  talks: ProfileTalkDraftInput[],
  existingTalks: ProfileTalkDraft[] = [],
) {
  const timestamp = nowIso();
  const existingById = new Map(existingTalks.map((talk) => [talk.id, talk]));
  return sortTalks(talks).map<ProfileTalkDraft>((talk, position) => {
    const existing = existingById.get(talk.id);
    return {
      ...talk,
      profileId,
      position,
      tags: talk.tags.map((tag) => tag.trim()).filter(Boolean),
      links: talk.links.map((link, linkPosition) => ({
        ...link,
        profileId,
        talkId: talk.id,
        position: linkPosition,
        createdAt: existing?.links.find((item) => item.id === link.id)?.createdAt ?? link.createdAt ?? timestamp,
        updatedAt: timestamp,
      })),
      createdAt: existing?.createdAt ?? talk.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
  });
}

function auditRowToEntry(row: AuditLogsRow): AuditLogEntry {
  return {
    id: row.id,
    profileId: row.profile_id,
    actorId: row.actor_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

function auditEntryToRow(entry: AuditLogEntry): AuditLogsRow {
  return {
    id: entry.id,
    profile_id: entry.profileId,
    actor_id: entry.actorId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    summary: entry.summary,
    metadata: entry.metadata,
    created_at: entry.createdAt,
  };
}

function publicRowToSnapshot(row: PublicProfileSettingsRow): PublicProfileSnapshot | null {
  const candidate = {
    profileId: row.profile_id,
    handle: row.handle,
    displayName: row.display_name,
    headline: row.headline,
    bio: row.bio,
    locationText: row.location_text,
    timezone: row.timezone,
    avatarInitials: row.avatar_initials,
    avatarUrl: row.avatar_url ?? "",
    primaryCtaLabel: row.primary_cta_label,
    primaryCtaUrl: row.primary_cta_url ?? "",
    availabilityStatus: row.availability_status,
    publishedLinks: Array.isArray(row.published_links) ? row.published_links : [],
    publishedSections: Array.isArray(row.published_sections) ? row.published_sections : [],
    publishedBlocks: Array.isArray(row.published_blocks) ? row.published_blocks : [],
    publishedProjects: Array.isArray(row.published_projects) ? row.published_projects : [],
    publishedRepositories: Array.isArray(row.published_repositories) ? row.published_repositories : [],
    publishedStackCategories: Array.isArray(row.published_stack_categories) ? row.published_stack_categories : [],
    publishedStackItems: Array.isArray(row.published_stack_items) ? row.published_stack_items : [],
    publishedPathEntries: Array.isArray(row.published_path_entries) ? row.published_path_entries : [],
    publishedNotes: Array.isArray(row.published_notes) ? row.published_notes : [],
    publishedTalks: Array.isArray(row.published_talks) ? row.published_talks : [],
    publishedAt: row.published_at ?? row.updated_at,
    isPublished: row.is_published,
  };

  const parsed = publicProfileSnapshotSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function normalizeAvatarInitials(
  displayName: string,
  avatarInitials: string,
  handle: string,
) {
  const value = avatarInitials.trim();
  if (value) {
    return value.slice(0, 4).toUpperCase();
  }

  return getInitials(displayName, handle);
}

function mapProfileInputToRow(
  profileId: string,
  ownerId: string,
  input: ProfileDraftInput,
  existing: ProfilesRow | null,
  publish: boolean,
): ProfilesRow {
  const timestamp = nowIso();
  const handle = input.handle.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const headline = input.headline.trim();
  const bio = input.bio.trim();
  const locationText = input.locationText.trim();
  const timezone = input.timezone.trim() || "UTC";
  const avatarInitials = normalizeAvatarInitials(
    displayName,
    input.avatarInitials,
    handle,
  );
  const avatarUrl = input.avatarUrl.trim();
  const primaryCtaLabel = input.primaryCtaLabel.trim();
  const primaryCtaUrl = input.primaryCtaUrl.trim();

  return {
    id: profileId,
    owner_id: ownerId,
    handle,
    display_name: displayName,
    headline,
    bio,
    location_text: locationText,
    timezone,
    avatar_initials: avatarInitials,
    avatar_url: avatarUrl.length > 0 ? avatarUrl : null,
    primary_cta_label: primaryCtaLabel,
    primary_cta_url: primaryCtaUrl.length > 0 ? primaryCtaUrl : null,
    availability_status: input.availabilityStatus,
    is_published: publish,
    created_at: existing?.created_at ?? timestamp,
    updated_at: timestamp,
    deleted_at: null,
  };
}

function mapLinkInputsToRows(
  profileId: string,
  links: ProfileLinkDraftInput[],
  existingLinks: LinkTimingSource[],
): ProfileLinksRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingLinks.map((link) => [link.id, link]));

  return sortLinks(links).map((link, index) => {
    const existing = existingById.get(link.id);
    return {
      id: link.id,
      profile_id: profileId,
      title: link.title.trim(),
      url: link.url.trim(),
      icon_label: link.iconLabel.trim(),
      visibility: link.visibility,
      is_enabled: link.isEnabled,
      position: index,
      created_at: existing?.created_at ?? existing?.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapSectionInputsToRows(
  profileId: string,
  sections: ProfileSectionDraftInput[],
  existingSections: Array<{ id: string; created_at?: string; createdAt?: string }>,
): ProfileSectionsRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingSections.map((section) => [section.id, section]));

  return sortSections(sections).map((section, index) => {
    const existing = existingById.get(section.id);
    return {
      id: section.id,
      profile_id: profileId,
      title: section.title.trim(),
      slug: section.slug.trim().toLowerCase(),
      position: index,
      is_visible: section.isVisible,
      created_at: existing?.created_at ?? existing?.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapBlockInputsToRows(
  profileId: string,
  blocks: ProfileBlockDraftInput[],
  existingBlocks: Array<{ id: string; created_at?: string; createdAt?: string }>,
): ProfileBlocksRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingBlocks.map((block) => [block.id, block]));

  return sortBlocks(blocks).map((block, index) => {
    const existing = existingById.get(block.id);
    return {
      id: block.id,
      profile_id: profileId,
      section_id: block.sectionId,
      type: block.type,
      title: block.title.trim(),
      visibility: block.visibility,
      position: index,
      configuration: block.configuration,
      created_at: existing?.created_at ?? existing?.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapProjectInputsToRows(
  profileId: string,
  projects: ProfileProjectDraftInput[],
  existingProjects: Array<{ id: string; created_at?: string; createdAt?: string }>,
): ProjectsRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingProjects.map((project) => [project.id, project]));

  return sortProjects(projects).map((project, position) => {
    const existing = existingById.get(project.id);
    return {
      id: project.id,
      profile_id: profileId,
      slug: project.slug.trim().toLowerCase(),
      project_name: project.projectName.trim(),
      short_summary: project.shortSummary.trim(),
      case_study_markdown: project.caseStudyMarkdown.trim(),
      role: project.role.trim(),
      project_type: project.projectType,
      start_date: project.startDate || null,
      end_date: project.endDate || null,
      status: project.status,
      cover_image_url: project.coverImageUrl.trim() || null,
      lessons_learned: project.lessonsLearned.trim(),
      is_featured: project.isFeatured,
      is_published: project.isPublished,
      position,
      created_at: existing?.created_at ?? existing?.createdAt ?? project.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapProjectTechnologiesToRows(
  profileId: string,
  projects: ProfileProjectDraftInput[],
): ProjectTechnologiesRow[] {
  const timestamp = nowIso();
  return projects.flatMap((project) => project.technologies.map((technology, position) => ({
    id: randomUUID(),
    profile_id: profileId,
    project_id: project.id,
    technology: technology.trim(),
    position,
    created_at: timestamp,
    updated_at: timestamp,
  })));
}

function mapProjectTagsToRows(
  profileId: string,
  projects: ProfileProjectDraftInput[],
): ProjectTagsRow[] {
  const timestamp = nowIso();
  return projects.flatMap((project) => project.tags.map((tag, position) => ({
    id: randomUUID(),
    profile_id: profileId,
    project_id: project.id,
    tag: tag.trim(),
    position,
    created_at: timestamp,
    updated_at: timestamp,
  })));
}

function mapProjectLinksToRows(
  profileId: string,
  projects: ProfileProjectDraftInput[],
  existingLinks: Array<{ id: string; created_at?: string; createdAt?: string }>,
): ProjectLinksRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingLinks.map((link) => [link.id, link]));
  return projects.flatMap((project) => project.links.map((link, position) => {
    const existing = existingById.get(link.id);
    return {
      id: link.id,
      profile_id: profileId,
      project_id: project.id,
      kind: link.kind,
      label: link.label.trim(),
      url: link.url.trim(),
      position,
      is_enabled: link.isEnabled,
      created_at: existing?.created_at ?? existing?.createdAt ?? link.createdAt ?? timestamp,
      updated_at: timestamp,
    };
  }));
}

function mapRepositoryInputsToRows(
  profileId: string,
  repositories: ProfileRepositoryDraftInput[],
  existingRepositories: Array<{ id: string; created_at?: string; createdAt?: string }>,
): RepositoriesRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingRepositories.map((repository) => [repository.id, repository]));
  return sortRepositories(repositories).map((repository, position) => {
    const existing = existingById.get(repository.id);
    return {
      id: repository.id,
      profile_id: profileId,
      repository_name: repository.repositoryName.trim(),
      provider_label: repository.providerLabel.trim(),
      repository_url: repository.repositoryUrl.trim(),
      description: repository.description.trim(),
      language: repository.language.trim(),
      framework: repository.framework.trim(),
      stars_text: repository.starsText.trim(),
      forks_text: repository.forksText.trim(),
      activity_label: repository.activityLabel.trim(),
      status: repository.status,
      is_stats_visible: repository.isStatsVisible,
      is_featured: repository.isFeatured,
      is_published: repository.isPublished,
      position,
      created_at: existing?.created_at ?? existing?.createdAt ?? repository.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapRepositoryTopicsToRows(
  profileId: string,
  repositories: ProfileRepositoryDraftInput[],
): RepositoryTopicsRow[] {
  const timestamp = nowIso();
  return repositories.flatMap((repository) => repository.topics.map((topic, position) => ({
    id: randomUUID(),
    profile_id: profileId,
    repository_id: repository.id,
    topic: topic.trim(),
    position,
    created_at: timestamp,
    updated_at: timestamp,
  })));
}

function mapRepositoryLanguagesToRows(
  profileId: string,
  repositories: ProfileRepositoryDraftInput[],
): RepositoryLanguagesRow[] {
  const timestamp = nowIso();
  return repositories.flatMap((repository) => repository.language.trim() ? [{
    id: randomUUID(),
    profile_id: profileId,
    repository_id: repository.id,
    language: repository.language.trim(),
    position: 0,
    created_at: timestamp,
    updated_at: timestamp,
  }] : []);
}

function mapRepositoryLinksToRows(
  profileId: string,
  repositories: ProfileRepositoryDraftInput[],
  existingLinks: Array<{ id: string; created_at?: string; createdAt?: string }>,
): RepositoryLinksRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingLinks.map((link) => [link.id, link]));
  return repositories.flatMap((repository) => repository.links.map((link, position) => {
    const existing = existingById.get(link.id);
    return {
      id: link.id,
      profile_id: profileId,
      repository_id: repository.id,
      kind: link.kind,
      project_id: link.projectId || null,
      label: link.label.trim(),
      url: link.url.trim(),
      position,
      is_enabled: link.isEnabled,
      created_at: existing?.created_at ?? existing?.createdAt ?? link.createdAt ?? timestamp,
      updated_at: timestamp,
    };
  }));
}

function mapStackCategoryInputsToRows(
  profileId: string,
  categories: ProfileStackCategoryDraftInput[],
  existingCategories: Array<{ id: string; created_at?: string; createdAt?: string }>,
): StackCategoriesRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingCategories.map((category) => [category.id, category]));
  return sortStackCategories(categories).map((category, position) => {
    const existing = existingById.get(category.id);
    return {
      id: category.id,
      profile_id: profileId,
      key: category.key,
      name: category.name.trim(),
      slug: category.slug.trim().toLowerCase(),
      is_built_in: category.isBuiltIn,
      position,
      created_at: existing?.created_at ?? existing?.createdAt ?? category.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapStackItemInputsToRows(
  profileId: string,
  items: ProfileStackItemDraftInput[],
  existingItems: Array<{ id: string; created_at?: string; createdAt?: string }>,
): StackItemsRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingItems.map((item) => [item.id, item]));
  return sortStackItems(items).map((item, position) => {
    const existing = existingById.get(item.id);
    return {
      id: item.id,
      profile_id: profileId,
      category_id: item.categoryId,
      technology_name: item.technologyName.trim(),
      proficiency_label: item.proficiencyLabel.trim(),
      years_text: item.yearsText.trim(),
      confidence_label: item.confidenceLabel.trim(),
      learning_status: item.learningStatus,
      short_description: item.shortDescription.trim(),
      icon_identifier: item.iconIdentifier,
      is_featured: item.isFeatured,
      is_published: item.isPublished,
      position,
      created_at: existing?.created_at ?? existing?.createdAt ?? item.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapStackProjectsToRows(profileId: string, items: ProfileStackItemDraftInput[]): StackProjectsRow[] {
  const timestamp = nowIso();
  return items.flatMap((item) => item.projects.map((project, position) => ({
    id: project.id,
    profile_id: profileId,
    stack_item_id: item.id,
    project_id: project.projectId,
    position,
    is_enabled: project.isEnabled,
    created_at: project.createdAt ?? timestamp,
    updated_at: timestamp,
  })));
}

function mapStackLinksToRows(profileId: string, items: ProfileStackItemDraftInput[]): StackLinksRow[] {
  const timestamp = nowIso();
  return items.flatMap((item) => item.links.map((link, position) => ({
    id: link.id,
    profile_id: profileId,
    stack_item_id: item.id,
    kind: link.kind,
    label: link.label.trim(),
    url: link.url.trim(),
    position,
    is_enabled: link.isEnabled,
    created_at: link.createdAt ?? timestamp,
    updated_at: timestamp,
  })));
}

function mapTimelineEntryInputsToRows(
  profileId: string,
  entries: ProfilePathEntryDraftInput[],
  existingEntries: Array<{ id: string; created_at?: string; createdAt?: string }>,
): TimelineEntriesRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingEntries.map((entry) => [entry.id, entry]));
  return sortPathEntries(entries).map((entry, position) => {
    const existing = existingById.get(entry.id);
    return {
      id: entry.id,
      profile_id: profileId,
      entry_type: entry.entryType,
      title: entry.title.trim(),
      organization: entry.organization.trim(),
      location_text: entry.locationText.trim(),
      start_date: entry.startDate,
      end_date: entry.endDate || null,
      is_current: entry.isCurrent,
      date_visibility: entry.dateVisibility,
      summary: entry.summary.trim(),
      is_published: entry.isPublished,
      position,
      created_at: existing?.created_at ?? existing?.createdAt ?? entry.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapTimelineHighlightsToRows(profileId: string, entries: ProfilePathEntryDraftInput[]): TimelineHighlightsRow[] {
  const timestamp = nowIso();
  return entries.flatMap((entry) => entry.highlights.map((highlight, position) => ({
    id: highlight.id,
    profile_id: profileId,
    entry_id: entry.id,
    content: highlight.content.trim(),
    position,
    created_at: highlight.createdAt ?? timestamp,
    updated_at: timestamp,
  })));
}

function mapTimelineTechnologiesToRows(profileId: string, entries: ProfilePathEntryDraftInput[]): TimelineTechnologiesRow[] {
  const timestamp = nowIso();
  return entries.flatMap((entry) => entry.technologies.map((technology, position) => ({
    id: technology.id,
    profile_id: profileId,
    entry_id: entry.id,
    technology: technology.technology.trim(),
    position,
    created_at: technology.createdAt ?? timestamp,
    updated_at: timestamp,
  })));
}

function mapTimelineLinksToRows(profileId: string, entries: ProfilePathEntryDraftInput[]): TimelineLinksRow[] {
  const timestamp = nowIso();
  return entries.flatMap((entry) => entry.links.map((link, position) => ({
    id: link.id,
    profile_id: profileId,
    entry_id: entry.id,
    kind: link.kind,
    project_id: link.projectId || null,
    label: link.label.trim(),
    url: link.url.trim(),
    position,
    is_enabled: link.isEnabled,
    created_at: link.createdAt ?? timestamp,
    updated_at: timestamp,
  })));
}

function mapNoteInputsToRows(
  profileId: string,
  notes: ProfileNoteDraftInput[],
  existingNotes: Array<{ id: string; created_at?: string; createdAt?: string }>,
): NotesRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingNotes.map((note) => [note.id, note]));
  return sortNotes(notes).map((note, position) => {
    const existing = existingById.get(note.id);
    return {
      id: note.id,
      profile_id: profileId,
      title: note.title.trim(),
      slug: note.slug.trim().toLowerCase(),
      excerpt: note.excerpt.trim(),
      body_markdown: note.bodyMarkdown.trim(),
      cover_image_url: note.coverImageUrl.trim() || null,
      published_at: note.publishedAt || null,
      reading_time_text: note.readingTimeText.trim(),
      canonical_url: note.canonicalUrl.trim() || null,
      is_published: note.isPublished,
      is_featured: note.isFeatured,
      position,
      created_at: existing?.created_at ?? existing?.createdAt ?? note.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapNoteTagsToRows(profileId: string, notes: ProfileNoteDraftInput[]): NoteTagsRow[] {
  const timestamp = nowIso();
  return notes.flatMap((note) => note.tags.map((tag, position) => ({
    id: randomUUID(),
    profile_id: profileId,
    note_id: note.id,
    tag: tag.trim(),
    position,
    created_at: timestamp,
    updated_at: timestamp,
  })));
}

function mapNoteLinksToRows(profileId: string, notes: ProfileNoteDraftInput[]): NoteLinksRow[] {
  const timestamp = nowIso();
  return notes.flatMap((note) => note.links.map((link, position) => ({
    id: link.id,
    profile_id: profileId,
    note_id: note.id,
    kind: link.kind,
    project_id: link.projectId || null,
    label: link.label.trim(),
    url: link.url.trim(),
    position,
    is_enabled: link.isEnabled,
    created_at: link.createdAt ?? timestamp,
    updated_at: timestamp,
  })));
}

function mapTalkInputsToRows(
  profileId: string,
  talks: ProfileTalkDraftInput[],
  existingTalks: Array<{ id: string; created_at?: string; createdAt?: string }>,
): TalksRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingTalks.map((talk) => [talk.id, talk]));
  return sortTalks(talks).map((talk, position) => {
    const existing = existingById.get(talk.id);
    return {
      id: talk.id,
      profile_id: profileId,
      title: talk.title.trim(),
      slug: talk.slug.trim().toLowerCase(),
      event_name: talk.eventName.trim(),
      event_date: talk.eventDate,
      location_text: talk.locationText.trim(),
      format: talk.format,
      role: talk.role.trim(),
      summary: talk.summary.trim(),
      slides_url: talk.slidesUrl.trim() || null,
      recording_url: talk.recordingUrl.trim() || null,
      event_url: talk.eventUrl.trim() || null,
      cover_image_url: talk.coverImageUrl.trim() || null,
      is_published: talk.isPublished,
      is_featured: talk.isFeatured,
      position,
      created_at: existing?.created_at ?? existing?.createdAt ?? talk.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapTalkTagsToRows(profileId: string, talks: ProfileTalkDraftInput[]): TalkTagsRow[] {
  const timestamp = nowIso();
  return talks.flatMap((talk) => talk.tags.map((tag, position) => ({
    id: randomUUID(),
    profile_id: profileId,
    talk_id: talk.id,
    tag: tag.trim(),
    position,
    created_at: timestamp,
    updated_at: timestamp,
  })));
}

function mapTalkLinksToRows(profileId: string, talks: ProfileTalkDraftInput[]): TalkLinksRow[] {
  const timestamp = nowIso();
  return talks.flatMap((talk) => talk.links.map((link, position) => ({
    id: link.id,
    profile_id: profileId,
    talk_id: talk.id,
    kind: link.kind,
    project_id: link.projectId || null,
    stack_item_id: link.stackItemId || null,
    note_id: link.noteId || null,
    label: link.label.trim(),
    url: link.url.trim(),
    position,
    is_enabled: link.isEnabled,
    created_at: link.createdAt ?? timestamp,
    updated_at: timestamp,
  })));
}

function createAuditRow(
  profileId: string,
  actorId: string,
  action: string,
  summary: string,
  metadata: Record<string, unknown>,
): AuditLogEntry {
  return {
    id: randomUUID(),
    profileId,
    actorId,
    action,
    entityType: "profile",
    entityId: profileId,
    summary,
    metadata,
    createdAt: nowIso(),
  };
}

async function loadSupabaseWorkspace(userId: string): Promise<WorkspaceSnapshot> {
  const client = await createSupabaseServerClient();
  if (!client) {
    return getDemoWorkspaceSnapshot();
  }

  const { data: profileRow } = await client
    .from("profiles")
    .select("*")
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .maybeSingle<ProfilesRow>();

  if (!profileRow) {
    return createBlankWorkspace("authenticated", userId);
  }

  const profileId = profileRow.id;
  const [linksResult, sectionsResult, blocksResult, projectsResult, projectTechnologiesResult, projectLinksResult, projectTagsResult, repositoriesResult, repositoryTopicsResult, repositoryLanguagesResult, repositoryLinksResult, stackCategoriesResult, stackItemsResult, stackProjectsResult, stackLinksResult, pathEntriesResult, pathHighlightsResult, pathTechnologiesResult, pathLinksResult, notesResult, noteTagsResult, noteLinksResult, talksResult, talkTagsResult, talkLinksResult, publicResult, auditResult] = await Promise.all([
    client
      .from("profile_links")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    client
      .from("profile_sections")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(12),
    client
      .from("profile_blocks")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(60),
    client
      .from("projects")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(30),
    client
      .from("project_technologies")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(240),
    client
      .from("project_links")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(90),
    client
      .from("project_tags")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(240),
    client
      .from("repositories")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(30),
    client
      .from("repository_topics")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(240),
    client
      .from("repository_languages")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(30),
    client
      .from("repository_links")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(120),
    client
      .from("stack_categories")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(20),
    client
      .from("stack_items")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(60),
    client
      .from("stack_projects")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(240),
    client
      .from("stack_links")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(240),
    client
      .from("timeline_entries")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(40),
    client
      .from("timeline_highlights")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(320),
    client
      .from("timeline_technologies")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(320),
    client
      .from("timeline_links")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(160),
    client
      .from("notes")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(40),
    client
      .from("note_tags")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(320),
    client
      .from("note_links")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(160),
    client
      .from("talks")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(40),
    client
      .from("talk_tags")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(320),
    client
      .from("talk_links")
      .select("*")
      .eq("profile_id", profileId)
      .order("position", { ascending: true })
      .limit(320),
    client
      .from("public_profile_settings")
      .select("*")
      .eq("profile_id", profileId)
      .is("is_published", true)
      .maybeSingle<PublicProfileSettingsRow>(),
    client
      .from("audit_logs")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const links = (linksResult.data ?? []).map(linkRowToDraft);
  const sections = (sectionsResult.data ?? []).map(sectionRowToDraft);
  const blocks = (blocksResult.data ?? [])
    .map((row) => blockRowToDraft(row as ProfileBlocksRow))
    .filter((block): block is ProfileBlockDraft => block !== null);
  const projectTechnologies = (projectTechnologiesResult.data ?? []) as ProjectTechnologiesRow[];
  const projectLinks = (projectLinksResult.data ?? []) as ProjectLinksRow[];
  const projectTags = (projectTagsResult.data ?? []) as ProjectTagsRow[];
  const projects = (projectsResult.data ?? [])
    .map((row) => {
      const project = row as ProjectsRow;
      return projectRowToDraft(
        project,
        projectTechnologies.filter((item) => item.project_id === project.id),
        projectLinks.filter((item) => item.project_id === project.id),
        projectTags.filter((item) => item.project_id === project.id),
      );
    })
    .filter((project): project is ProfileProjectDraft => project !== null);
  const repositoryTopics = (repositoryTopicsResult.data ?? []) as RepositoryTopicsRow[];
  const repositoryLanguages = (repositoryLanguagesResult.data ?? []) as RepositoryLanguagesRow[];
  const repositoryLinks = (repositoryLinksResult.data ?? []) as RepositoryLinksRow[];
  const repositories = (repositoriesResult.data ?? [])
    .map((row) => {
      const repository = row as RepositoriesRow;
      return repositoryRowToDraft(
        repository,
        repositoryTopics.filter((item) => item.repository_id === repository.id),
        repositoryLanguages.filter((item) => item.repository_id === repository.id),
        repositoryLinks.filter((item) => item.repository_id === repository.id),
      );
    })
    .filter((repository): repository is ProfileRepositoryDraft => repository !== null);
  const stackCategories = (stackCategoriesResult.data ?? [])
    .map((row) => stackCategoryRowToDraft(row as StackCategoriesRow));
  const stackProjects = (stackProjectsResult.data ?? []) as StackProjectsRow[];
  const stackLinks = (stackLinksResult.data ?? []) as StackLinksRow[];
  const stackItems = (stackItemsResult.data ?? [])
    .map((row) => {
      const item = row as StackItemsRow;
      return stackItemRowToDraft(
        item,
        stackProjects.filter((link) => link.stack_item_id === item.id),
        stackLinks.filter((link) => link.stack_item_id === item.id),
      );
    })
    .filter((item): item is ProfileStackItemDraft => item !== null);
  const pathEntriesRows = (pathEntriesResult.data ?? []) as TimelineEntriesRow[];
  const pathHighlights = (pathHighlightsResult.data ?? []) as TimelineHighlightsRow[];
  const pathTechnologies = (pathTechnologiesResult.data ?? []) as TimelineTechnologiesRow[];
  const pathLinks = (pathLinksResult.data ?? []) as TimelineLinksRow[];
  const pathEntries = pathEntriesRows
    .map((row) => timelineEntryRowToDraft(
      row,
      pathHighlights.filter((highlight) => highlight.entry_id === row.id),
      pathTechnologies.filter((technology) => technology.entry_id === row.id),
      pathLinks.filter((link) => link.entry_id === row.id),
    ))
    .filter((entry): entry is ProfilePathEntryDraft => entry !== null);
  const notesRows = (notesResult.data ?? []) as NotesRow[];
  const noteTags = (noteTagsResult.data ?? []) as NoteTagsRow[];
  const noteLinks = (noteLinksResult.data ?? []) as NoteLinksRow[];
  const notes = notesRows
    .map((row) => noteRowToDraft(
      row,
      noteTags.filter((tag) => tag.note_id === row.id),
      noteLinks.filter((link) => link.note_id === row.id),
    ))
    .filter((note): note is ProfileNoteDraft => note !== null);
  const talksRows = (talksResult.data ?? []) as TalksRow[];
  const talkTags = (talkTagsResult.data ?? []) as TalkTagsRow[];
  const talkLinks = (talkLinksResult.data ?? []) as TalkLinksRow[];
  const talks = talksRows
    .map((row) => talkRowToDraft(
      row,
      talkTags.filter((tag) => tag.talk_id === row.id),
      talkLinks.filter((link) => link.talk_id === row.id),
    ))
    .filter((talk): talk is ProfileTalkDraft => talk !== null);
  const published = publicResult.data ? publicRowToSnapshot(publicResult.data) : null;
  const auditLogs = (auditResult.data ?? []).map(auditRowToEntry);

  return {
    profile: profileRowToDraft(profileRow),
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
    published,
    auditLogs,
    mode: "authenticated",
  };
}

export async function getViewerContext(): Promise<ViewerContext> {
  if (!hasSupabaseConfig()) {
    return { mode: "demo", userId: DEMO_USER_ID };
  }

  const client = await createSupabaseServerClient();
  if (!client) {
    return { mode: "demo", userId: DEMO_USER_ID };
  }

  const { data } = await client.auth.getUser();
  if (!data.user) {
    return { mode: "anonymous", userId: null };
  }

  return {
    mode: "authenticated",
    userId: data.user.id,
  };
}

export async function getWorkspaceSnapshot(viewer: ViewerContext): Promise<WorkspaceSnapshot> {
  if (viewer.mode === "demo") {
    return getDemoWorkspaceSnapshot();
  }

  if (viewer.mode === "anonymous" || !viewer.userId) {
    return createBlankWorkspace("anonymous", viewer.userId ?? DEMO_USER_ID);
  }

  return loadSupabaseWorkspace(viewer.userId);
}

export async function getPublicProfile(handle: string): Promise<PublicProfileSnapshot | null> {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!normalizedHandle) {
    return null;
  }

  if (!hasSupabaseConfig()) {
    if (normalizedHandle === DEMO_HANDLE) {
      return getDemoWorkspaceSnapshot().published;
    }

    return null;
  }

  const client = await createSupabaseServerClient();
  if (!client) {
    return null;
  }

  const { data } = await client
    .from("public_profile_settings")
    .select("*")
    .eq("handle", normalizedHandle)
    .is("is_published", true)
    .maybeSingle<PublicProfileSettingsRow>();

  if (!data) {
    return null;
  }

  return publicRowToSnapshot(data);
}

export async function getPublicProject(handle: string, slug: string) {
  const profile = await getPublicProfile(handle);
  if (!profile) {
    return null;
  }

  const project = profile.publishedProjects.find((item) => item.slug === slug.trim().toLowerCase());
  return project ? { profile, project } : null;
}

export async function getPublicNote(handle: string, slug: string) {
  const profile = await getPublicProfile(handle);
  if (!profile) return null;
  const note = profile.publishedNotes.find((item) => item.slug === slug.trim().toLowerCase());
  return note ? { profile, note } : null;
}

export async function getPublicTalk(handle: string, slug: string) {
  const profile = await getPublicProfile(handle);
  if (!profile) return null;
  const talk = profile.publishedTalks.find((item) => item.slug === slug.trim().toLowerCase());
  return talk ? { profile, talk } : null;
}

async function persistDemoWorkspace(
  input: WorkspaceDraftInput,
  publish: boolean,
): Promise<WorkspaceMutationResult> {
  const store = getDemoStore();
  const profileInput = profileDraftSchema.parse(input.profile);
  const nextProfile: ProfileDraft = {
    ...store.profile,
    handle: profileInput.handle.trim().toLowerCase(),
    displayName: profileInput.displayName.trim(),
    headline: profileInput.headline.trim(),
    bio: profileInput.bio.trim(),
    locationText: profileInput.locationText.trim(),
    timezone: profileInput.timezone.trim() || "UTC",
    avatarInitials: normalizeAvatarInitials(
      profileInput.displayName.trim(),
      profileInput.avatarInitials,
      profileInput.handle.trim().toLowerCase(),
    ),
    avatarUrl: profileInput.avatarUrl.trim(),
    primaryCtaLabel: profileInput.primaryCtaLabel.trim(),
    primaryCtaUrl: profileInput.primaryCtaUrl.trim(),
    availabilityStatus: profileInput.availabilityStatus,
    isPublished: publish,
    updatedAt: nowIso(),
  };
  const nextLinks = mapLinkInputsToRows(nextProfile.id, input.links, store.links);
  const nextSections = mapSectionInputsToRows(
    nextProfile.id,
    input.sections,
    store.sections,
  ).map(sectionRowToDraft);
  const nextBlocks = mapBlockInputsToRows(
    nextProfile.id,
    input.blocks,
    store.blocks,
  )
    .map(blockRowToDraft)
    .filter((block): block is ProfileBlockDraft => block !== null);
  const nextProjects = normalizeProjectDrafts(
    nextProfile.id,
    input.projects,
    store.projects,
  );
  const nextRepositories = normalizeRepositoryDrafts(
    nextProfile.id,
    input.repositories,
    store.repositories,
  );
  const nextStackCategories = normalizeStackCategories(
    nextProfile.id,
    input.stackCategories,
    store.stackCategories,
  );
  const nextStackItems = normalizeStackItems(
    nextProfile.id,
    input.stackItems,
    store.stackItems,
  );
  const nextPathEntries = normalizePathEntries(
    nextProfile.id,
    input.pathEntries,
    store.pathEntries,
  );
  const nextNotes = normalizeNotes(
    nextProfile.id,
    input.notes,
    store.notes,
  );
  const nextTalks = normalizeTalks(
    nextProfile.id,
    input.talks,
    store.talks,
  );
  store.profile = nextProfile;
  store.links = nextLinks.map(linkRowToDraft);
  store.sections = nextSections;
  store.blocks = nextBlocks;
  store.projects = nextProjects;
  store.repositories = nextRepositories;
  store.stackCategories = nextStackCategories;
  store.stackItems = nextStackItems;
  store.pathEntries = nextPathEntries;
  store.notes = nextNotes;
  store.talks = nextTalks;
  store.published = publish
    ? buildPublicProfileSnapshot(
        nextProfile,
        store.links,
        nextProfile.updatedAt,
        store.sections,
        store.blocks,
        store.projects,
        store.repositories,
        store.stackCategories,
        store.stackItems,
        store.pathEntries,
        store.notes,
        store.talks,
      )
    : store.published;
  store.auditLogs = [
    createAuditRow(
      nextProfile.id,
      nextProfile.ownerId,
      publish ? "profile_published" : "profile_saved",
      publish
        ? `Published ${store.links.length} links, ${store.blocks.length} blocks, ${store.projects.length} projects, ${store.repositories.length} repositories, ${store.stackItems.length} stack items, ${store.pathEntries.length} Path entries, ${store.notes.length} Notes, and ${store.talks.length} Talks`
        : `Saved ${store.links.length} links, ${store.blocks.length} blocks, ${store.projects.length} projects, ${store.repositories.length} repositories, ${store.stackItems.length} stack items, ${store.pathEntries.length} Path entries, ${store.notes.length} Notes, and ${store.talks.length} Talks`,
      {
        published: publish,
        linkCount: store.links.length,
        blockCount: store.blocks.length,
        sectionCount: store.sections.length,
        projectCount: store.projects.length,
        repositoryCount: store.repositories.length,
        stackCategoryCount: store.stackCategories.length,
        stackItemCount: store.stackItems.length,
        pathEntryCount: store.pathEntries.length,
        noteCount: store.notes.length,
        talkCount: store.talks.length,
      },
    ),
    ...store.auditLogs,
  ].slice(0, 8);

  return {
    ok: true,
    workspace: getDemoWorkspaceSnapshot(),
  };
}

async function persistSupabaseWorkspace(
  viewer: ViewerContext,
  input: WorkspaceDraftInput,
  publish: boolean,
): Promise<WorkspaceMutationResult> {
  if (!viewer.userId) {
    return {
      ok: false,
      message: "Sign in to edit your workspace.",
      fieldErrors: {},
    };
  }

  const client = await createSupabaseServerClient();
  if (!client) {
    return {
      ok: false,
      message: "Supabase is not configured.",
      fieldErrors: {},
    };
  }

  const profileInput = profileDraftSchema.parse(input.profile);
  const normalizedHandle = profileInput.handle.trim().toLowerCase();

  if (isReservedHandle(normalizedHandle) && normalizedHandle !== DEMO_HANDLE) {
    return {
      ok: false,
      message: "Choose a different handle.",
      fieldErrors: {
        handle: "That handle is reserved.",
      },
    };
  }

  const { data: existingProfile } = await client
    .from("profiles")
    .select("*")
    .eq("owner_id", viewer.userId)
    .is("deleted_at", null)
    .maybeSingle<ProfilesRow>();

  const profileId = existingProfile?.id ?? randomUUID();
  const { data: conflictingProfile } = await client
    .from("profiles")
    .select("id")
    .eq("handle", normalizedHandle)
    .neq("id", profileId)
    .maybeSingle();

  if (conflictingProfile) {
    return {
      ok: false,
      message: "That handle is already taken.",
      fieldErrors: {
        handle: "That handle is already taken.",
      },
    };
  }

  const profileRow = mapProfileInputToRow(
    profileId,
    viewer.userId,
    profileInput,
    existingProfile ?? null,
    publish,
  );

  const { error: profileUpsertError } = await client.from("profiles").upsert(profileRow);
  if (profileUpsertError) {
    return {
      ok: false,
      message: profileUpsertError.message,
      fieldErrors: profileUpsertError.message.toLowerCase().includes("handle")
        ? { handle: profileUpsertError.message }
        : {},
    };
  }

  const { data: existingLinksMany } = await client
    .from("profile_links")
    .select("*")
    .eq("profile_id", profileId)
    .is("deleted_at", null);

  const nextLinks = mapLinkInputsToRows(
    profileId,
    input.links,
    (existingLinksMany ?? []) as ProfileLinksRow[],
  );

  const { error: linkUpsertError } = await client.from("profile_links").upsert(nextLinks);
  if (linkUpsertError) {
    return {
      ok: false,
      message: linkUpsertError.message,
      fieldErrors: {},
    };
  }

  const staleIds = (existingLinksMany ?? [])
    .map((link) => link.id)
    .filter((id) => !nextLinks.some((link) => link.id === id));

  if (staleIds.length > 0) {
    const { error: deleteError } = await client
      .from("profile_links")
      .delete()
      .eq("profile_id", profileId)
      .in("id", staleIds);

    if (deleteError) {
      return {
        ok: false,
        message: deleteError.message,
        fieldErrors: {},
      };
    }
  }

  const [{ data: existingSectionsMany }, { data: existingBlocksMany }, { data: existingProjectsMany }, { data: existingProjectLinksMany }, { data: existingRepositoriesMany }, { data: existingRepositoryLinksMany }, { data: existingStackCategoriesMany }, { data: existingStackItemsMany }, { data: existingPathEntriesMany }, { data: existingNotesMany }, { data: existingTalksMany }] = await Promise.all([
    client
      .from("profile_sections")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
    client
      .from("profile_blocks")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
    client
      .from("projects")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
    client
      .from("project_links")
      .select("id, created_at")
      .eq("profile_id", profileId),
    client
      .from("repositories")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
    client
      .from("repository_links")
      .select("id, created_at")
      .eq("profile_id", profileId),
    client
      .from("stack_categories")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
    client
      .from("stack_items")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
    client
      .from("timeline_entries")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
    client
      .from("notes")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
    client
      .from("talks")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
  ]);

  const nextSections = mapSectionInputsToRows(
    profileId,
    input.sections,
    (existingSectionsMany ?? []) as ProfileSectionsRow[],
  );
  const { error: sectionUpsertError } = await client
    .from("profile_sections")
    .upsert(nextSections);

  if (sectionUpsertError) {
    return {
      ok: false,
      message: sectionUpsertError.message,
      fieldErrors: {},
    };
  }

  const nextBlocks = mapBlockInputsToRows(
    profileId,
    input.blocks,
    (existingBlocksMany ?? []) as ProfileBlocksRow[],
  );
  const { error: blockUpsertError } = await client
    .from("profile_blocks")
    .upsert(nextBlocks);

  if (blockUpsertError) {
    return {
      ok: false,
      message: blockUpsertError.message,
      fieldErrors: {},
    };
  }

  const staleBlockIds = (existingBlocksMany ?? [])
    .map((block) => block.id)
    .filter((id) => !nextBlocks.some((block) => block.id === id));

  if (staleBlockIds.length > 0) {
    const { error: deleteError } = await client
      .from("profile_blocks")
      .delete()
      .eq("profile_id", profileId)
      .in("id", staleBlockIds);

    if (deleteError) {
      return {
        ok: false,
        message: deleteError.message,
        fieldErrors: {},
      };
    }
  }

  const staleSectionIds = (existingSectionsMany ?? [])
    .map((section) => section.id)
    .filter((id) => !nextSections.some((section) => section.id === id));

  if (staleSectionIds.length > 0) {
    const { error: deleteError } = await client
      .from("profile_sections")
      .delete()
      .eq("profile_id", profileId)
      .in("id", staleSectionIds);

    if (deleteError) {
      return {
        ok: false,
        message: deleteError.message,
        fieldErrors: {},
      };
    }
  }

  const nextProjects = mapProjectInputsToRows(
    profileId,
    input.projects,
    (existingProjectsMany ?? []) as ProjectsRow[],
  );
  const nextProjectDrafts = normalizeProjectDrafts(profileId, input.projects);
  if (nextProjects.length > 0) {
    const { error: projectUpsertError } = await client.from("projects").upsert(nextProjects);
    if (projectUpsertError) {
      return {
        ok: false,
        message: projectUpsertError.message,
        fieldErrors: {},
      };
    }
  }

  const staleProjectIds = (existingProjectsMany ?? [])
    .map((project) => project.id)
    .filter((id) => !nextProjects.some((project) => project.id === id));

  const childTables = ["project_technologies", "project_tags", "project_links"] as const;
  for (const table of childTables) {
    const { error: childDeleteError } = await client
      .from(table)
      .delete()
      .eq("profile_id", profileId);
    if (childDeleteError) {
      return {
        ok: false,
        message: childDeleteError.message,
        fieldErrors: {},
      };
    }
  }

  const projectTechnologies = mapProjectTechnologiesToRows(profileId, input.projects);
  const projectTags = mapProjectTagsToRows(profileId, input.projects);
  const projectLinks = mapProjectLinksToRows(
    profileId,
    input.projects,
    (existingProjectLinksMany ?? []) as Array<{ id: string; created_at?: string }>,
  );
  if (projectTechnologies.length > 0) {
    const { error } = await client.from("project_technologies").insert(projectTechnologies);
    if (error) {
      return { ok: false, message: error.message, fieldErrors: {} };
    }
  }
  if (projectTags.length > 0) {
    const { error } = await client.from("project_tags").insert(projectTags);
    if (error) {
      return { ok: false, message: error.message, fieldErrors: {} };
    }
  }
  if (projectLinks.length > 0) {
    const { error } = await client.from("project_links").insert(projectLinks);
    if (error) {
      return { ok: false, message: error.message, fieldErrors: {} };
    }
  }
  if (staleProjectIds.length > 0) {
    const { error: projectDeleteError } = await client
      .from("projects")
      .delete()
      .eq("profile_id", profileId)
      .in("id", staleProjectIds);
    if (projectDeleteError) {
      return { ok: false, message: projectDeleteError.message, fieldErrors: {} };
    }
  }

  const nextRepositories = mapRepositoryInputsToRows(
    profileId,
    input.repositories,
    (existingRepositoriesMany ?? []) as RepositoriesRow[],
  );
  const nextRepositoryDrafts = normalizeRepositoryDrafts(profileId, input.repositories);
  if (nextRepositories.length > 0) {
    const { error: repositoryUpsertError } = await client.from("repositories").upsert(nextRepositories);
    if (repositoryUpsertError) {
      return { ok: false, message: repositoryUpsertError.message, fieldErrors: {} };
    }
  }

  const staleRepositoryIds = (existingRepositoriesMany ?? [])
    .map((repository) => repository.id)
    .filter((id) => !nextRepositories.some((repository) => repository.id === id));
  const repositoryChildTables = ["repository_topics", "repository_languages", "repository_links"] as const;
  for (const table of repositoryChildTables) {
    const { error: childDeleteError } = await client
      .from(table)
      .delete()
      .eq("profile_id", profileId);
    if (childDeleteError) {
      return { ok: false, message: childDeleteError.message, fieldErrors: {} };
    }
  }

  const repositoryTopics = mapRepositoryTopicsToRows(profileId, input.repositories);
  const repositoryLanguages = mapRepositoryLanguagesToRows(profileId, input.repositories);
  const repositoryLinks = mapRepositoryLinksToRows(
    profileId,
    input.repositories,
    (existingRepositoryLinksMany ?? []) as Array<{ id: string; created_at?: string }>,
  );
  if (repositoryTopics.length > 0) {
    const { error } = await client.from("repository_topics").insert(repositoryTopics);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  if (repositoryLanguages.length > 0) {
    const { error } = await client.from("repository_languages").insert(repositoryLanguages);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  if (repositoryLinks.length > 0) {
    const { error } = await client.from("repository_links").insert(repositoryLinks);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  if (staleRepositoryIds.length > 0) {
    const { error: repositoryDeleteError } = await client
      .from("repositories")
      .delete()
      .eq("profile_id", profileId)
      .in("id", staleRepositoryIds);
    if (repositoryDeleteError) return { ok: false, message: repositoryDeleteError.message, fieldErrors: {} };
  }

  const nextStackCategories = mapStackCategoryInputsToRows(
    profileId,
    input.stackCategories,
    (existingStackCategoriesMany ?? []) as StackCategoriesRow[],
  );
  const nextStackCategoryDrafts = normalizeStackCategories(profileId, input.stackCategories);
  if (nextStackCategories.length > 0) {
    const { error: stackCategoryUpsertError } = await client.from("stack_categories").upsert(nextStackCategories);
    if (stackCategoryUpsertError) return { ok: false, message: stackCategoryUpsertError.message, fieldErrors: {} };
  }

  const nextStackItems = mapStackItemInputsToRows(
    profileId,
    input.stackItems,
    (existingStackItemsMany ?? []) as StackItemsRow[],
  );
  const nextStackItemDrafts = normalizeStackItems(profileId, input.stackItems);
  if (nextStackItems.length > 0) {
    const { error: stackItemUpsertError } = await client.from("stack_items").upsert(nextStackItems);
    if (stackItemUpsertError) return { ok: false, message: stackItemUpsertError.message, fieldErrors: {} };
  }

  for (const table of ["stack_projects", "stack_links"] as const) {
    const { error: childDeleteError } = await client.from(table).delete().eq("profile_id", profileId);
    if (childDeleteError) return { ok: false, message: childDeleteError.message, fieldErrors: {} };
  }
  const stackProjects = mapStackProjectsToRows(profileId, input.stackItems);
  const stackLinks = mapStackLinksToRows(profileId, input.stackItems);
  if (stackProjects.length > 0) {
    const { error } = await client.from("stack_projects").insert(stackProjects);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  if (stackLinks.length > 0) {
    const { error } = await client.from("stack_links").insert(stackLinks);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }

  const staleStackItemIds = (existingStackItemsMany ?? [])
    .map((item) => item.id)
    .filter((id) => !nextStackItems.some((item) => item.id === id));
  if (staleStackItemIds.length > 0) {
    const { error } = await client.from("stack_items").delete().eq("profile_id", profileId).in("id", staleStackItemIds);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  const staleStackCategoryIds = (existingStackCategoriesMany ?? [])
    .map((category) => category.id)
    .filter((id) => !nextStackCategories.some((category) => category.id === id));
  if (staleStackCategoryIds.length > 0) {
    const { error } = await client.from("stack_categories").delete().eq("profile_id", profileId).in("id", staleStackCategoryIds);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }

  const nextPathEntries = mapTimelineEntryInputsToRows(
    profileId,
    input.pathEntries,
    (existingPathEntriesMany ?? []) as TimelineEntriesRow[],
  );
  const nextPathEntryDrafts = normalizePathEntries(profileId, input.pathEntries);
  if (nextPathEntries.length > 0) {
    const { error: pathEntryUpsertError } = await client.from("timeline_entries").upsert(nextPathEntries);
    if (pathEntryUpsertError) return { ok: false, message: pathEntryUpsertError.message, fieldErrors: {} };
  }

  const pathChildTables = ["timeline_highlights", "timeline_technologies", "timeline_links"] as const;
  for (const table of pathChildTables) {
    const { error: childDeleteError } = await client.from(table).delete().eq("profile_id", profileId);
    if (childDeleteError) return { ok: false, message: childDeleteError.message, fieldErrors: {} };
  }
  const pathHighlights = mapTimelineHighlightsToRows(profileId, input.pathEntries);
  const pathTechnologies = mapTimelineTechnologiesToRows(profileId, input.pathEntries);
  const pathLinks = mapTimelineLinksToRows(profileId, input.pathEntries);
  if (pathHighlights.length > 0) {
    const { error } = await client.from("timeline_highlights").insert(pathHighlights);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  if (pathTechnologies.length > 0) {
    const { error } = await client.from("timeline_technologies").insert(pathTechnologies);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  if (pathLinks.length > 0) {
    const { error } = await client.from("timeline_links").insert(pathLinks);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  const stalePathEntryIds = (existingPathEntriesMany ?? [])
    .map((entry) => entry.id)
    .filter((id) => !nextPathEntries.some((entry) => entry.id === id));
  if (stalePathEntryIds.length > 0) {
    const { error } = await client.from("timeline_entries").delete().eq("profile_id", profileId).in("id", stalePathEntryIds);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }

  const nextNotes = mapNoteInputsToRows(
    profileId,
    input.notes,
    (existingNotesMany ?? []) as NotesRow[],
  );
  const nextNoteDrafts = normalizeNotes(profileId, input.notes);
  if (nextNotes.length > 0) {
    const { error: noteUpsertError } = await client.from("notes").upsert(nextNotes);
    if (noteUpsertError) return { ok: false, message: noteUpsertError.message, fieldErrors: {} };
  }
  for (const table of ["note_tags", "note_links"] as const) {
    const { error: childDeleteError } = await client.from(table).delete().eq("profile_id", profileId);
    if (childDeleteError) return { ok: false, message: childDeleteError.message, fieldErrors: {} };
  }
  const noteTags = mapNoteTagsToRows(profileId, input.notes);
  const noteLinks = mapNoteLinksToRows(profileId, input.notes);
  if (noteTags.length > 0) {
    const { error } = await client.from("note_tags").insert(noteTags);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  if (noteLinks.length > 0) {
    const { error } = await client.from("note_links").insert(noteLinks);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  const staleNoteIds = (existingNotesMany ?? [])
    .map((note) => note.id)
    .filter((id) => !nextNotes.some((note) => note.id === id));
  if (staleNoteIds.length > 0) {
    const { error } = await client.from("notes").delete().eq("profile_id", profileId).in("id", staleNoteIds);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  if (nextNotes.length > 0) {
    const revisions = nextNotes.map((note) => ({
      id: randomUUID(),
      profile_id: profileId,
      note_id: note.id,
      actor_id: viewer.userId,
      title: note.title,
      excerpt: note.excerpt,
      body_markdown: note.body_markdown,
      created_at: nowIso(),
    }));
    const { error: revisionError } = await client.from("note_revisions").insert(revisions);
    if (revisionError) return { ok: false, message: revisionError.message, fieldErrors: {} };
  }

  const nextTalks = mapTalkInputsToRows(
    profileId,
    input.talks,
    (existingTalksMany ?? []) as TalksRow[],
  );
  const nextTalkDrafts = normalizeTalks(profileId, input.talks);
  if (nextTalks.length > 0) {
    const { error: talkUpsertError } = await client.from("talks").upsert(nextTalks);
    if (talkUpsertError) return { ok: false, message: talkUpsertError.message, fieldErrors: {} };
  }
  for (const table of ["talk_tags", "talk_links"] as const) {
    const { error: childDeleteError } = await client.from(table).delete().eq("profile_id", profileId);
    if (childDeleteError) return { ok: false, message: childDeleteError.message, fieldErrors: {} };
  }
  const talkTags = mapTalkTagsToRows(profileId, input.talks);
  const talkLinks = mapTalkLinksToRows(profileId, input.talks);
  if (talkTags.length > 0) {
    const { error } = await client.from("talk_tags").insert(talkTags);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  if (talkLinks.length > 0) {
    const { error } = await client.from("talk_links").insert(talkLinks);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }
  const staleTalkIds = (existingTalksMany ?? [])
    .map((talk) => talk.id)
    .filter((id) => !nextTalks.some((talk) => talk.id === id));
  if (staleTalkIds.length > 0) {
    const { error } = await client.from("talks").delete().eq("profile_id", profileId).in("id", staleTalkIds);
    if (error) return { ok: false, message: error.message, fieldErrors: {} };
  }

  if (publish) {
    const published = buildPublicProfileSnapshot(
      profileRowToDraft(profileRow),
      nextLinks.map(linkRowToDraft),
      nowIso(),
      nextSections.map(sectionRowToDraft),
      nextBlocks
        .map(blockRowToDraft)
        .filter((block): block is ProfileBlockDraft => block !== null),
      nextProjectDrafts,
      nextRepositoryDrafts,
      nextStackCategoryDrafts,
      nextStackItemDrafts,
      nextPathEntryDrafts,
      nextNoteDrafts,
      nextTalkDrafts,
    );
    const publicRow = {
      profile_id: profileId,
      handle: profileRow.handle,
      display_name: profileRow.display_name,
      headline: profileRow.headline,
      bio: profileRow.bio,
      location_text: profileRow.location_text,
      timezone: profileRow.timezone,
      avatar_initials: profileRow.avatar_initials,
      avatar_url: profileRow.avatar_url,
      primary_cta_label: profileRow.primary_cta_label,
      primary_cta_url: profileRow.primary_cta_url,
      availability_status: profileRow.availability_status,
      published_links: published.publishedLinks,
      published_sections: published.publishedSections,
      published_blocks: published.publishedBlocks,
      published_projects: published.publishedProjects,
      published_repositories: published.publishedRepositories,
      published_stack_categories: published.publishedStackCategories,
      published_stack_items: published.publishedStackItems,
      published_path_entries: published.publishedPathEntries,
      published_notes: published.publishedNotes,
      published_talks: published.publishedTalks,
      is_published: true,
      published_at: nowIso(),
      updated_at: nowIso(),
    };

    const { error: publicUpsertError } = await client
      .from("public_profile_settings")
      .upsert(publicRow);

    if (publicUpsertError) {
      return {
        ok: false,
        message: publicUpsertError.message,
        fieldErrors: {},
      };
    }
  }

  const auditRow = createAuditRow(
    profileId,
    viewer.userId,
    publish ? "profile_published" : "profile_saved",
    publish
      ? `Published ${nextLinks.length} links, ${nextBlocks.length} blocks, ${nextProjects.length} projects, ${nextRepositories.length} repositories, ${nextStackItemDrafts.length} stack items, ${nextPathEntryDrafts.length} Path entries, ${nextNoteDrafts.length} Notes, and ${nextTalkDrafts.length} Talks`
      : `Saved ${nextLinks.length} links, ${nextBlocks.length} blocks, ${nextProjects.length} projects, ${nextRepositories.length} repositories, ${nextStackItemDrafts.length} stack items, ${nextPathEntryDrafts.length} Path entries, ${nextNoteDrafts.length} Notes, and ${nextTalkDrafts.length} Talks`,
    {
      published: publish,
      linkCount: nextLinks.length,
      blockCount: nextBlocks.length,
      sectionCount: nextSections.length,
      projectCount: nextProjects.length,
      repositoryCount: nextRepositories.length,
      stackCategoryCount: nextStackCategoryDrafts.length,
      stackItemCount: nextStackItemDrafts.length,
      pathEntryCount: nextPathEntryDrafts.length,
      noteCount: nextNoteDrafts.length,
      talkCount: nextTalkDrafts.length,
      handle: profileRow.handle,
    },
  );
  await client.from("audit_logs").insert(auditEntryToRow(auditRow));

  return {
    ok: true,
    workspace: await loadSupabaseWorkspace(viewer.userId),
  };
}

export async function saveWorkspaceDraft(
  viewer: ViewerContext,
  input: unknown,
): Promise<WorkspaceMutationResult> {
  const parsed = workspaceDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  return viewer.mode === "demo"
    ? persistDemoWorkspace(parsed.data, false)
    : persistSupabaseWorkspace(viewer, parsed.data, false);
}

export async function publishWorkspace(
  viewer: ViewerContext,
  input: unknown,
): Promise<WorkspaceMutationResult> {
  const parsed = workspaceDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  return viewer.mode === "demo"
    ? persistDemoWorkspace(parsed.data, true)
    : persistSupabaseWorkspace(viewer, parsed.data, true);
}
