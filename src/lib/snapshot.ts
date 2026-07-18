import {
  type ProfileDraft,
  type ProfileLinkDraft,
  type PublicLinkSnapshot,
  type PublicProfileSnapshot,
} from "@/types/nodivra";

type SortableLink = {
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
): PublicProfileSnapshot {
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
    publishedAt,
    isPublished: true,
  };
}

export function splitVisibleLinks(links: PublicLinkSnapshot[]) {
  const primary = links.filter((link) => link.visibility === "public");
  const social = links.filter((link) => link.visibility === "social");
  return { primary, social };
}
