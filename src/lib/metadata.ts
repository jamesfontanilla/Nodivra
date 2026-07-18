import type { Metadata } from "next";
import { getSiteUrl, siteName, siteTagline } from "@/lib/site";
import type { PublicProfileSnapshot } from "@/types/nodivra";

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
