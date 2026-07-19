import { randomUUID } from "node:crypto";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { getDemoStore, getDemoWorkspaceSnapshot } from "@/lib/fallback-data";
import {
  buildPublicProfileSnapshot,
  sortBlocks,
  sortLinks,
  sortProjects,
  sortRepositories,
  sortSections,
} from "@/lib/snapshot";
import {
  getInitials,
  isReservedHandle,
  profileBlockDraftSchema,
  profileDraftSchema,
  projectDraftSchema,
  repositoryDraftSchema,
  publicProfileSnapshotSchema,
  toFieldErrors,
  workspaceDraftSchema,
  type ProfileBlockDraftInput,
  type ProfileLinkDraftInput,
  type ProfileDraftInput,
  type ProfileProjectDraftInput,
  type ProfileRepositoryDraftInput,
  type ProfileSectionDraftInput,
  type WorkspaceDraftInput,
} from "@/lib/validation";
import {
  DEMO_HANDLE,
  DEMO_USER_ID,
  type AuditLogEntry,
  type AvailabilityStatus,
  type BlockConfiguration,
  type BlockType,
  type BlockVisibility,
  type ProfileBlockDraft,
  type ProfileProjectDraft,
  type ProfileRepositoryDraft,
  type ProjectLinkDraft,
  type ProjectLinkKind,
  type ProjectStatus,
  type ProjectType,
  type RepositoryLinkDraft,
  type RepositoryLinkKind,
  type RepositoryStatus,
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

export function createBlankWorkspace(
  mode: ViewerContext["mode"],
  ownerId: string,
): WorkspaceSnapshot {
  return {
    profile: createBlankProfile(ownerId),
    links: [],
    sections: [createStarterSection(ownerId)],
    blocks: [],
    projects: [],
    repositories: [],
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
  const [linksResult, sectionsResult, blocksResult, projectsResult, projectTechnologiesResult, projectLinksResult, projectTagsResult, repositoriesResult, repositoryTopicsResult, repositoryLanguagesResult, repositoryLinksResult, publicResult, auditResult] = await Promise.all([
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
  const published = publicResult.data ? publicRowToSnapshot(publicResult.data) : null;
  const auditLogs = (auditResult.data ?? []).map(auditRowToEntry);

  return {
    profile: profileRowToDraft(profileRow),
    links,
    sections,
    blocks,
    projects,
    repositories,
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
  store.profile = nextProfile;
  store.links = nextLinks.map(linkRowToDraft);
  store.sections = nextSections;
  store.blocks = nextBlocks;
  store.projects = nextProjects;
  store.repositories = nextRepositories;
  store.published = publish
    ? buildPublicProfileSnapshot(
        nextProfile,
        store.links,
        nextProfile.updatedAt,
        store.sections,
        store.blocks,
        store.projects,
        store.repositories,
      )
    : store.published;
  store.auditLogs = [
    createAuditRow(
      nextProfile.id,
      nextProfile.ownerId,
      publish ? "profile_published" : "profile_saved",
      publish
        ? `Published ${store.links.length} links, ${store.blocks.length} blocks, ${store.projects.length} projects, and ${store.repositories.length} repositories`
        : `Saved ${store.links.length} links, ${store.blocks.length} blocks, ${store.projects.length} projects, and ${store.repositories.length} repositories`,
      {
        published: publish,
        linkCount: store.links.length,
        blockCount: store.blocks.length,
        sectionCount: store.sections.length,
        projectCount: store.projects.length,
        repositoryCount: store.repositories.length,
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

  const [{ data: existingSectionsMany }, { data: existingBlocksMany }, { data: existingProjectsMany }, { data: existingProjectLinksMany }, { data: existingRepositoriesMany }, { data: existingRepositoryLinksMany }] = await Promise.all([
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
      ? `Published ${nextLinks.length} links, ${nextBlocks.length} blocks, ${nextProjects.length} projects, and ${nextRepositories.length} repositories`
      : `Saved ${nextLinks.length} links, ${nextBlocks.length} blocks, ${nextProjects.length} projects, and ${nextRepositories.length} repositories`,
    {
      published: publish,
      linkCount: nextLinks.length,
      blockCount: nextBlocks.length,
      sectionCount: nextSections.length,
      projectCount: nextProjects.length,
      repositoryCount: nextRepositories.length,
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
