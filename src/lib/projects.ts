import type { Database } from "@/lib/supabase/database.types";

export const PROJECT_STATUSES = [
  "draft",
  "in_progress",
  "shipped",
  "archived",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_TYPES = [
  "web_app",
  "mobile_app",
  "library",
  "tool",
  "design_system",
  "open_source",
  "experiment",
  "other",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_LINK_KINDS = ["live", "repository", "demo"] as const;

export type ProjectLinkKind = (typeof PROJECT_LINK_KINDS)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  in_progress: "In progress",
  shipped: "Shipped",
  archived: "Archived",
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  web_app: "Web app",
  mobile_app: "Mobile app",
  library: "Library",
  tool: "Tool",
  design_system: "Design system",
  open_source: "Open source",
  experiment: "Experiment",
  other: "Other",
};

export const PROJECT_LINK_KIND_LABELS: Record<ProjectLinkKind, string> = {
  live: "Live",
  repository: "Repository",
  demo: "Demo",
};

export const MAX_FEATURED_PROJECTS = 3;

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectTechnology =
  Database["public"]["Tables"]["project_technologies"]["Row"];
export type ProjectTag = Database["public"]["Tables"]["project_tags"]["Row"];
export type ProjectLink = Database["public"]["Tables"]["project_links"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface ProjectDetail {
  project: Project;
  technologies: ProjectTechnology[];
  tags: ProjectTag[];
  links: ProjectLink[];
}

export interface ProjectVisibilityProfile {
  is_published: boolean;
  deleted_at: string | null;
}

export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    if (a.created_at !== b.created_at) {
      return a.created_at.localeCompare(b.created_at);
    }
    return a.id.localeCompare(b.id);
  });
}

export function sortProjectTechnologies(
  technologies: ProjectTechnology[]
): ProjectTechnology[] {
  return [...technologies].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    if (a.created_at !== b.created_at) {
      return a.created_at.localeCompare(b.created_at);
    }
    return a.id.localeCompare(b.id);
  });
}

export function sortProjectTags(tags: ProjectTag[]): ProjectTag[] {
  return [...tags].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    if (a.created_at !== b.created_at) {
      return a.created_at.localeCompare(b.created_at);
    }
    return a.id.localeCompare(b.id);
  });
}

export function sortProjectLinks(links: ProjectLink[]): ProjectLink[] {
  return [...links].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    if (a.created_at !== b.created_at) {
      return a.created_at.localeCompare(b.created_at);
    }
    return a.id.localeCompare(b.id);
  });
}

export function slugifyProjectTitle(title: string): string {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const prefixed = normalized.match(/^[a-z]/)
    ? normalized
    : `project-${normalized}`;

  const safeSlug = prefixed.replace(/-+$/g, "");
  return safeSlug.length > 0 ? safeSlug.slice(0, 60) : "project";
}

export function buildUniqueProjectSlug(
  title: string,
  existingSlugs: string[]
): string {
  const normalizedExisting = new Set(
    existingSlugs.map((slug) => slug.toLowerCase())
  );
  const base = slugifyProjectTitle(title);
  let suffix = 2;
  let candidate = base;

  while (normalizedExisting.has(candidate.toLowerCase())) {
    const suffixText = `-${suffix}`;
    const maxBaseLength = Math.max(1, 60 - suffixText.length);
    candidate = `${base.slice(0, maxBaseLength).replace(/-+$/g, "")}${suffixText}`;
    suffix += 1;
  }

  return candidate;
}

export function getNextProjectPosition(projects: Project[]): number {
  if (projects.length === 0) return 0;
  return Math.max(...projects.map((project) => project.position)) + 1;
}

export function isProjectOwnedByProfile(
  project: Project,
  profileId: string | null | undefined
): boolean {
  return Boolean(profileId && project.profile_id === profileId);
}

export function isProjectPublic(
  project: Project,
  profile: ProjectVisibilityProfile | null | undefined
): boolean {
  return Boolean(
    profile &&
      profile.is_published &&
      !profile.deleted_at &&
      !project.deleted_at &&
      project.is_visible &&
      project.is_published
  );
}

export function filterPublicProjects(
  projects: Project[],
  profile: ProjectVisibilityProfile | null | undefined
): Project[] {
  return sortProjects(projects).filter((project) =>
    isProjectPublic(project, profile)
  );
}

export function groupProjectDetails(
  projects: Project[],
  technologies: ProjectTechnology[] = [],
  tags: ProjectTag[] = [],
  links: ProjectLink[] = []
): ProjectDetail[] {
  const technologiesByProject = new Map<string, ProjectTechnology[]>();
  const tagsByProject = new Map<string, ProjectTag[]>();
  const linksByProject = new Map<string, ProjectLink[]>();

  for (const technology of technologies) {
    const current = technologiesByProject.get(technology.project_id) ?? [];
    current.push(technology);
    technologiesByProject.set(technology.project_id, current);
  }

  for (const tag of tags) {
    const current = tagsByProject.get(tag.project_id) ?? [];
    current.push(tag);
    tagsByProject.set(tag.project_id, current);
  }

  for (const link of links) {
    const current = linksByProject.get(link.project_id) ?? [];
    current.push(link);
    linksByProject.set(link.project_id, current);
  }

  return sortProjects(projects).map((project) => ({
    project,
    technologies: sortProjectTechnologies(
      technologiesByProject.get(project.id) ?? []
    ),
    tags: sortProjectTags(tagsByProject.get(project.id) ?? []),
    links: sortProjectLinks(linksByProject.get(project.id) ?? []),
  }));
}

export function sortProjectDetails(details: ProjectDetail[]): ProjectDetail[] {
  return [...details].sort((a, b) => {
    if (a.project.position !== b.project.position) {
      return a.project.position - b.project.position;
    }
    if (a.project.created_at !== b.project.created_at) {
      return a.project.created_at.localeCompare(b.project.created_at);
    }
    return a.project.id.localeCompare(b.project.id);
  });
}

export function getProjectLink(
  links: ProjectLink[],
  kind: ProjectLinkKind
): ProjectLink | undefined {
  return links.find((link) => link.kind === kind && !link.deleted_at);
}

function formatProjectDate(dateValue: string | null | undefined): string {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatProjectDateRange(project: Project): string {
  const start = formatProjectDate(project.start_date);
  const end = formatProjectDate(project.end_date);

  if (start && end) {
    return `${start} - ${end}`;
  }
  if (start) {
    return `${start} - Present`;
  }
  if (end) {
    return `Until ${end}`;
  }
  return "Date not set";
}
