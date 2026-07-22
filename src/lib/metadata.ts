import type { Metadata } from "next";
import { getSiteUrl, siteName, siteTagline } from "@/lib/site";
import type { PublicProfileSnapshot } from "@/types/nodivra";
import type { PublicProjectSnapshot } from "@/types/nodivra";
import type { PublicNoteSnapshot } from "@/types/nodivra";
import type { PublicTalkSnapshot } from "@/types/nodivra";
import type { PublicSnipSnapshot } from "@/types/nodivra";
import type { PublicWorkServiceSnapshot } from "@/types/nodivra";

function buildDescription(profile?: PublicProfileSnapshot | null) {
  if (profile?.headline) {
    return profile.headline;
  }

  if (profile?.bio) {
    return profile.bio;
  }

  return siteTagline;
}

export function buildPublicProfileMetadata(
  profile: PublicProfileSnapshot | null,
  handle: string,
): Metadata {
  const title = profile
    ? `${profile.displayName} · ${siteName}`
    : `${handle} · ${siteName}`;
  const description = buildDescription(profile);
  const canonical = new URL(`/u/${handle}`, getSiteUrl()).toString();

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function buildPublicProjectMetadata(
  profile: PublicProfileSnapshot,
  project: PublicProjectSnapshot,
): Metadata {
  const title = `${project.projectName} · ${profile.displayName} · ${siteName}`;
  const description = project.shortSummary || buildDescription(profile);
  const canonical = new URL(`/u/${profile.handle}/projects/${project.slug}`, getSiteUrl()).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "article",
      ...(project.coverImageUrl ? { images: [{ url: project.coverImageUrl, alt: project.projectName }] } : {}),
    },
    twitter: {
      card: project.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(project.coverImageUrl ? { images: [project.coverImageUrl] } : {}),
    },
  };
}

export function buildPublicNoteMetadata(
  profile: PublicProfileSnapshot,
  note: PublicNoteSnapshot,
): Metadata {
  const title = `${note.title} · ${profile.displayName} · ${siteName}`;
  const description = note.excerpt || buildDescription(profile);
  const canonical = note.canonicalUrl || new URL(`/u/${profile.handle}/notes/${note.slug}`, getSiteUrl()).toString();
  const openGraph = {
    title,
    description,
    url: canonical,
    siteName,
    type: "article",
    ...(note.coverImageUrl ? { images: [{ url: note.coverImageUrl, alt: note.title }] } : {}),
    publishedTime: note.publishedAt ? `${note.publishedAt}T00:00:00.000Z` : undefined,
    tags: note.tags,
  };

  return {
    title,
    description,
    alternates: { canonical },
    openGraph,
    twitter: {
      card: note.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(note.coverImageUrl ? { images: [note.coverImageUrl] } : {}),
    },
  };
}

export function buildPublicTalkMetadata(
  profile: PublicProfileSnapshot,
  talk: PublicTalkSnapshot,
): Metadata {
  const title = `${talk.title} · ${profile.displayName} · ${siteName}`;
  const description = talk.summary || buildDescription(profile);
  const canonical = new URL(`/u/${profile.handle}/talks/${talk.slug}`, getSiteUrl()).toString();
  const openGraph = {
    title,
    description,
    url: canonical,
    siteName,
    type: "article" as const,
    ...(talk.coverImageUrl ? { images: [{ url: talk.coverImageUrl, alt: talk.title }] } : {}),
  };

  return {
    title,
    description,
    alternates: { canonical },
    openGraph,
    twitter: {
      card: talk.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(talk.coverImageUrl ? { images: [talk.coverImageUrl] } : {}),
    },
  };
}

export function buildPublicSnipMetadata(
  profile: PublicProfileSnapshot,
  snip: PublicSnipSnapshot,
): Metadata {
  const title = `${snip.title} · ${profile.displayName} · ${siteName}`;
  const description = snip.description || buildDescription(profile);
  const canonical = new URL(`/u/${profile.handle}/snips/${snip.slug}`, getSiteUrl()).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function buildPublicWorkMetadata(
  profile: PublicProfileSnapshot,
  service: PublicWorkServiceSnapshot,
): Metadata {
  const title = `${service.title} Â· ${profile.displayName} Â· ${siteName}`;
  const description = service.description || buildDescription(profile);
  const canonical = new URL(`/u/${profile.handle}/work/${service.slug}`, getSiteUrl()).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
