import {
  type ProfileDraft,
  type ProfileBlockDraft,
  type ProfileLinkDraft,
  type ProfileProjectDraft,
  type ProfileRepositoryDraft,
  type ProfileStackCategoryDraft,
  type ProfileStackItemDraft,
  type ProfileSectionDraft,
  type PublicBlockSnapshot,
  type PublicLinkSnapshot,
  type PublicProjectSnapshot,
  type PublicRepositorySnapshot,
  type PublicStackCategorySnapshot,
  type PublicStackItemSnapshot,
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

type SortableRepository = {
  id: string;
  position: number;
  createdAt?: string;
};

type SortableStackCategory = {
  id: string;
  position: number;
  createdAt?: string;
};

type SortableStackItem = {
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

export function sortRepositories<T extends SortableRepository>(repositories: T[]) {
  return [...repositories].sort((left, right) => {
    if (left.position !== right.position) {
      return left.position - right.position;
    }
    if (left.createdAt && right.createdAt && left.createdAt !== right.createdAt) {
      return left.createdAt.localeCompare(right.createdAt);
    }
    return left.id.localeCompare(right.id);
  });
}

export function sortStackCategories<T extends SortableStackCategory>(categories: T[]) {
  return [...categories].sort((left, right) => {
    if (left.position !== right.position) return left.position - right.position;
    if (left.createdAt && right.createdAt && left.createdAt !== right.createdAt) return left.createdAt.localeCompare(right.createdAt);
    return left.id.localeCompare(right.id);
  });
}

export function sortStackItems<T extends SortableStackItem>(items: T[]) {
  return [...items].sort((left, right) => {
    if (left.position !== right.position) return left.position - right.position;
    if (left.createdAt && right.createdAt && left.createdAt !== right.createdAt) return left.createdAt.localeCompare(right.createdAt);
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
  repositories: ProfileRepositoryDraft[] = [],
  stackCategories: ProfileStackCategoryDraft[] = [],
  stackItems: ProfileStackItemDraft[] = [],
): PublicProfileSnapshot {
  const publishedSections = toPublicSections(sections);
  const publishedBlocks = toPublicBlocks(blocks, publishedSections);
  const publishedProjects = toPublicProjects(projects);
  const publishedRepositories = toPublicRepositories(repositories);
  const publishedStackCategories = toPublicStackCategories(stackCategories, stackItems);
  const publishedStackItems = toPublicStackItems(stackItems, stackCategories, publishedProjects);

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
    publishedRepositories,
    publishedStackCategories,
    publishedStackItems,
    publishedAt,
    isPublished: true,
  };
}

export function toPublicStackCategories(
  categories: ProfileStackCategoryDraft[],
  items: ProfileStackItemDraft[],
) {
  const publishedCategoryIds = new Set(
    sortStackItems(items).filter((item) => item.isPublished).map((item) => item.categoryId),
  );
  return sortStackCategories(categories)
    .filter((category) => publishedCategoryIds.has(category.id))
    .map<PublicStackCategorySnapshot>((category) => ({
      id: category.id,
      key: category.key,
      name: category.name,
      slug: category.slug,
      position: category.position,
    }));
}

export function toPublicStackItems(
  items: ProfileStackItemDraft[],
  categories: ProfileStackCategoryDraft[],
  projects: PublicProjectSnapshot[],
) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const publishedProjectIds = new Set(projects.map((project) => project.id));
  return sortStackItems(items)
    .filter((item) => item.isPublished && categoryById.has(item.categoryId))
    .map<PublicStackItemSnapshot>((item) => {
      const category = categoryById.get(item.categoryId)!;
      return {
        id: item.id,
        categoryId: item.categoryId,
        categoryName: category.name,
        categorySlug: category.slug,
        technologyName: item.technologyName,
        proficiencyLabel: item.proficiencyLabel,
        yearsText: item.yearsText,
        confidenceLabel: item.confidenceLabel,
        learningStatus: item.learningStatus,
        shortDescription: item.shortDescription,
        iconIdentifier: item.iconIdentifier,
        isFeatured: item.isFeatured,
        position: item.position,
        projects: item.projects
          .filter((link) => link.isEnabled && publishedProjectIds.has(link.projectId))
          .sort((left, right) => left.position - right.position)
          .map((link) => ({
            id: link.id,
            projectId: link.projectId,
            position: link.position,
            isEnabled: link.isEnabled,
          })),
        links: item.links
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
      };
    });
}

export function toPublicRepositories(repositories: ProfileRepositoryDraft[]) {
  return sortRepositories(repositories)
    .filter((repository) => repository.isPublished)
    .map<PublicRepositorySnapshot>((repository) => ({
      id: repository.id,
      repositoryName: repository.repositoryName,
      providerLabel: repository.providerLabel,
      repositoryUrl: repository.repositoryUrl,
      description: repository.description,
      language: repository.language,
      framework: repository.framework,
      topics: repository.topics,
      starsText: repository.starsText,
      forksText: repository.forksText,
      activityLabel: repository.activityLabel,
      status: repository.status,
      isStatsVisible: repository.isStatsVisible,
      isFeatured: repository.isFeatured,
      position: repository.position,
      links: repository.links
        .filter((link) => link.isEnabled)
        .sort((left, right) => left.position - right.position)
        .map((link) => ({
          id: link.id,
          kind: link.kind,
          projectId: link.projectId,
          label: link.label,
          url: link.url,
          position: link.position,
          isEnabled: link.isEnabled,
        })),
    }));
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
