import {
  type ProfileDraft,
  type ProfileBlockDraft,
  type ProfileLinkDraft,
  type ProfileSectionDraft,
  type PublicBlockSnapshot,
  type PublicLinkSnapshot,
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
): PublicProfileSnapshot {
  const publishedSections = toPublicSections(sections);
  const publishedBlocks = toPublicBlocks(blocks, publishedSections);

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
    publishedAt,
    isPublished: true,
  };
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
