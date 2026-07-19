import {
  type ProfileDraft,
  type ProfileBlockDraft,
  type ProfileLinkDraft,
  type ProfileProjectDraft,
  type ProfileSectionDraft,
  type PublicBlockSnapshot,
  type PublicLinkSnapshot,
  type PublicProjectSnapshot,
  type PublicProfileSnapshot,
  type PublicSectionSnapshot,
} from "@/types/nodivra";

type SortableLink = {
  id: string;
  position: number;
  createdAt?: string;
};

type SortableSection = {
  id: string;
  position: number;
  createdAt?: string;
};

type SortableBlock = {
  id: string;
  position: number;
  createdAt?: string;
};

type SortableProject = {
  id: string;
  position: number;
  createdAt?: string;
};

export function sortLinks<T extends SortableLink>(links: T[]) {
  return [...links].sort((left, right) => {
    if (left.position !== right.position) {
      return left.position - right.position;
    }

    if (left.createdAt && right.createdAt && left.createdAt !== right.createdAt) {
      return left.createdAt.localeCompare(right.createdAt);
    }

    return left.id.localeCompare(right.id);
  });
}

export function sortSections<T extends SortableSection>(sections: T[]) {
  return [...sections].sort((left, right) => {
    if (left.position !== right.position) {
      return left.position - right.position;
    }

    if (left.createdAt && right.createdAt && left.createdAt !== right.createdAt) {
      return left.createdAt.localeCompare(right.createdAt);
    }

    return left.id.localeCompare(right.id);
  });
}

export function sortBlocks<T extends SortableBlock>(blocks: T[]) {
  return [...blocks].sort((left, right) => {
    if (left.position !== right.position) {
      return left.position - right.position;
    }

    if (left.createdAt && right.createdAt && left.createdAt !== right.createdAt) {
      return left.createdAt.localeCompare(right.createdAt);
    }

    return left.id.localeCompare(right.id);
  });
}

export function sortProjects<T extends SortableProject>(projects: T[]) {
  return [...projects].sort((left, right) => {
    if (left.position !== right.position) {
      return left.position - right.position;
    }
    if (left.createdAt && right.createdAt && left.createdAt !== right.createdAt) {
      return left.createdAt.localeCompare(right.createdAt);
    }
    return left.id.localeCompare(right.id);
  });
}

export function toPublicLinks(links: ProfileLinkDraft[]) {
  return sortLinks(links)
    .filter((link) => link.isEnabled && link.visibility !== "hidden")
    .map<PublicLinkSnapshot>((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      iconLabel: link.iconLabel,
      visibility: link.visibility,
      isEnabled: link.isEnabled,
      position: link.position,
    }));
}

export function buildPublicProfileSnapshot(
  profile: ProfileDraft,
  links: ProfileLinkDraft[],
  publishedAt = profile.updatedAt,
  sections: ProfileSectionDraft[] = [],
  blocks: ProfileBlockDraft[] = [],
  projects: ProfileProjectDraft[] = [],
): PublicProfileSnapshot {
  const publishedSections = toPublicSections(sections);
  const publishedBlocks = toPublicBlocks(blocks, publishedSections);
  const publishedProjects = toPublicProjects(projects);

  return {
    profileId: profile.id,
    handle: profile.handle,
    displayName: profile.displayName,
    headline: profile.headline,
    bio: profile.bio,
    locationText: profile.locationText,
    timezone: profile.timezone,
    avatarInitials: profile.avatarInitials,
    avatarUrl: profile.avatarUrl,
    primaryCtaLabel: profile.primaryCtaLabel,
    primaryCtaUrl: profile.primaryCtaUrl,
    availabilityStatus: profile.availabilityStatus,
    publishedLinks: toPublicLinks(links),
    publishedSections,
    publishedBlocks,
    publishedProjects,
    publishedAt,
    isPublished: true,
  };
}

export function toPublicProjects(projects: ProfileProjectDraft[]) {
  return sortProjects(projects)
    .filter((project) => project.isPublished)
    .map<PublicProjectSnapshot>((project) => ({
      id: project.id,
      slug: project.slug,
      projectName: project.projectName,
      shortSummary: project.shortSummary,
      caseStudyMarkdown: project.caseStudyMarkdown,
      role: project.role,
      technologies: project.technologies,
      projectType: project.projectType,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      coverImageUrl: project.coverImageUrl,
      lessonsLearned: project.lessonsLearned,
      tags: project.tags,
      isFeatured: project.isFeatured,
      position: project.position,
      links: project.links
        .filter((link) => link.isEnabled)
        .sort((left, right) => left.position - right.position)
        .map((link) => ({
          id: link.id,
          kind: link.kind,
          label: link.label,
          url: link.url,
          position: link.position,
          isEnabled: link.isEnabled,
        })),
    }));
}

export function toPublicSections(sections: ProfileSectionDraft[]) {
  return sortSections(sections)
    .filter((section) => section.isVisible)
    .map<PublicSectionSnapshot>((section) => ({
      id: section.id,
      title: section.title,
      slug: section.slug,
      position: section.position,
    }));
}

export function toPublicBlocks(
  blocks: ProfileBlockDraft[],
  sections: PublicSectionSnapshot[],
) {
  const visibleSectionIds = new Set(sections.map((section) => section.id));
  return sortBlocks(blocks)
    .filter((block) => block.visibility === "public" && visibleSectionIds.has(block.sectionId))
    .map<PublicBlockSnapshot>((block) => ({
      id: block.id,
      sectionId: block.sectionId,
      type: block.type,
      title: block.title,
      visibility: block.visibility,
      position: block.position,
      configuration: block.configuration,
    }));
}

export function splitVisibleLinks(links: PublicLinkSnapshot[]) {
  const primary = links.filter((link) => link.visibility === "public");
  const social = links.filter((link) => link.visibility === "social");
  return { primary, social };
}
