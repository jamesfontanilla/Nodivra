import {
  type ProfileDraft,
  type ProfileBlockDraft,
  type ProfileLinkDraft,
  type ProfileProjectDraft,
  type ProfileRepositoryDraft,
  type ProfileStackCategoryDraft,
  type ProfileStackItemDraft,
  type ProfilePathEntryDraft,
  type ProfileNoteDraft,
  type ProfileTalkDraft,
  type ProfileSectionDraft,
  type NoteHighlightConfiguration,
  type PublicBlockSnapshot,
  type PublicLinkSnapshot,
  type PublicProjectSnapshot,
  type PublicRepositorySnapshot,
  type PublicStackCategorySnapshot,
  type PublicStackItemSnapshot,
  type PublicPathEntrySnapshot,
  type PublicNoteSnapshot,
  type PublicTalkSnapshot,
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

type SortablePathEntry = {
  id: string;
  position: number;
  createdAt?: string;
};

type SortableNote = {
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

export function sortPathEntries<T extends SortablePathEntry>(entries: T[]) {
  return [...entries].sort((left, right) => {
    if (left.position !== right.position) return left.position - right.position;
    if (left.createdAt && right.createdAt && left.createdAt !== right.createdAt) return left.createdAt.localeCompare(right.createdAt);
    return left.id.localeCompare(right.id);
  });
}

export function sortNotes<T extends SortableNote>(notes: T[]) {
  return [...notes].sort((left, right) => {
    if (left.position !== right.position) return left.position - right.position;
    if (left.createdAt && right.createdAt && left.createdAt !== right.createdAt) return left.createdAt.localeCompare(right.createdAt);
    return left.id.localeCompare(right.id);
  });
}

export function sortTalks<T extends SortableNote>(talks: T[]) {
  return [...talks].sort((left, right) => {
    if (left.position !== right.position) return left.position - right.position;
    if (left.createdAt && right.createdAt && left.createdAt !== right.createdAt) return right.createdAt.localeCompare(left.createdAt);
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
  pathEntries: ProfilePathEntryDraft[] = [],
  notes: ProfileNoteDraft[] = [],
  talks: ProfileTalkDraft[] = [],
): PublicProfileSnapshot {
  const publishedSections = toPublicSections(sections);
  const publishedProjects = toPublicProjects(projects);
  const publishedRepositories = toPublicRepositories(repositories);
  const publishedStackCategories = toPublicStackCategories(stackCategories, stackItems);
  const publishedStackItems = toPublicStackItems(stackItems, stackCategories, publishedProjects);
  const publishedPathEntries = toPublicPathEntries(pathEntries, publishedProjects);
  const publishedNotes = toPublicNotes(notes, publishedProjects);
  const publishedTalks = toPublicTalks(talks, publishedProjects, publishedStackItems, publishedNotes);
  const publishedBlocks = toPublicBlocks(blocks, publishedSections, publishedNotes);

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
    publishedPathEntries,
    publishedNotes,
    publishedTalks,
    publishedAt,
    isPublished: true,
  };
}

export function toPublicTalks(
  talks: ProfileTalkDraft[],
  projects: PublicProjectSnapshot[],
  stackItems: PublicStackItemSnapshot[],
  notes: PublicNoteSnapshot[],
) {
  const publishedProjectIds = new Set(projects.map((project) => project.id));
  const publishedStackItemIds = new Set(stackItems.map((item) => item.id));
  const publishedNoteIds = new Set(notes.map((note) => note.id));
  return sortTalks(talks)
    .filter((talk) => talk.isPublished)
    .map<PublicTalkSnapshot>((talk) => ({
      id: talk.id,
      title: talk.title,
      slug: talk.slug,
      eventName: talk.eventName,
      eventDate: talk.eventDate,
      locationText: talk.locationText,
      format: talk.format,
      role: talk.role,
      summary: talk.summary,
      slidesUrl: talk.slidesUrl,
      recordingUrl: talk.recordingUrl,
      eventUrl: talk.eventUrl,
      coverImageUrl: talk.coverImageUrl,
      tags: talk.tags,
      isFeatured: talk.isFeatured,
      position: talk.position,
      links: [...talk.links]
        .filter((link) => {
          if (!link.isEnabled) return false;
          if (link.kind === "project") return publishedProjectIds.has(link.projectId);
          if (link.kind === "stack") return publishedStackItemIds.has(link.stackItemId);
          if (link.kind === "note") return publishedNoteIds.has(link.noteId);
          return Boolean(link.url);
        })
        .sort((left, right) => left.position - right.position)
        .map((link) => ({
          id: link.id,
          kind: link.kind,
          projectId: link.projectId,
          stackItemId: link.stackItemId,
          noteId: link.noteId,
          label: link.label,
          url: link.url,
          position: link.position,
          isEnabled: link.isEnabled,
        })),
    }));
}

export function toPublicNotes(
  notes: ProfileNoteDraft[],
  projects: PublicProjectSnapshot[],
) {
  const publishedProjectIds = new Set(projects.map((project) => project.id));
  return sortNotes(notes)
    .filter((note) => note.isPublished)
    .map<PublicNoteSnapshot>((note) => ({
      id: note.id,
      title: note.title,
      slug: note.slug,
      excerpt: note.excerpt,
      bodyMarkdown: note.bodyMarkdown,
      coverImageUrl: note.coverImageUrl,
      tags: note.tags,
      publishedAt: note.publishedAt,
      readingTimeText: note.readingTimeText,
      canonicalUrl: note.canonicalUrl,
      isFeatured: note.isFeatured,
      position: note.position,
      links: [...note.links]
        .filter((link) => link.isEnabled && (link.kind !== "project" || publishedProjectIds.has(link.projectId)))
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

function publicPathDate(value: string, visibility: ProfilePathEntryDraft["dateVisibility"]) {
  return visibility === "year_only" && value ? value.slice(0, 4) : value;
}

export function toPublicPathEntries(
  entries: ProfilePathEntryDraft[],
  projects: PublicProjectSnapshot[],
) {
  const publishedProjectIds = new Set(projects.map((project) => project.id));
  return sortPathEntries(entries)
    .filter((entry) => entry.isPublished)
    .map<PublicPathEntrySnapshot>((entry) => ({
      id: entry.id,
      entryType: entry.entryType,
      title: entry.title,
      organization: entry.organization,
      locationText: entry.locationText,
      startDate: publicPathDate(entry.startDate, entry.dateVisibility),
      endDate: publicPathDate(entry.endDate, entry.dateVisibility),
      isCurrent: entry.isCurrent,
      dateVisibility: entry.dateVisibility,
      summary: entry.summary,
      highlights: [...entry.highlights]
        .sort((left, right) => left.position - right.position)
        .map((highlight) => ({ id: highlight.id, content: highlight.content, position: highlight.position })),
      technologies: [...entry.technologies]
        .sort((left, right) => left.position - right.position)
        .map((technology) => ({ id: technology.id, technology: technology.technology, position: technology.position })),
      links: [...entry.links]
        .filter((link) => link.isEnabled && (link.kind !== "project" || publishedProjectIds.has(link.projectId)))
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
      position: entry.position,
    }));
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
  notes: PublicNoteSnapshot[] = [],
) {
  const visibleSectionIds = new Set(sections.map((section) => section.id));
  const publishedNoteIds = new Set(notes.map((note) => note.id));
  return sortBlocks(blocks)
    .filter((block) => block.visibility === "public" && visibleSectionIds.has(block.sectionId) && (block.type !== "note_highlight" || publishedNoteIds.has((block.configuration as NoteHighlightConfiguration).noteId)))
    .map<PublicBlockSnapshot>((block) => {
      let configuration = block.configuration;
      if (block.type === "note_highlight") {
        const noteConfiguration = block.configuration as NoteHighlightConfiguration;
        const note = notes.find((candidate) => candidate.id === noteConfiguration.noteId);
        if (note) {
          configuration = {
            ...block.configuration,
            title: note.title,
            excerpt: note.excerpt,
            url: note.canonicalUrl,
          };
        }
      }
      return {
        id: block.id,
        sectionId: block.sectionId,
        type: block.type,
        title: block.title,
        visibility: block.visibility,
        position: block.position,
        configuration,
      };
    });
}

export function splitVisibleLinks(links: PublicLinkSnapshot[]) {
  const primary = links.filter((link) => link.visibility === "public");
  const social = links.filter((link) => link.visibility === "social");
  return { primary, social };
}
