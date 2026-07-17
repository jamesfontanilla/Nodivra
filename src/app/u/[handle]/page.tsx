import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadProjectCollection } from "@/lib/project-loaders";
import { PublicProfile } from "@/components/public/public-profile";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"];
type PageSection = Database["public"]["Tables"]["page_sections"]["Row"];
type PageBlock = Database["public"]["Tables"]["page_blocks"]["Row"];

interface PageProps {
  params: { handle: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, headline, bio, handle")
    .eq("handle", params.handle.toLowerCase())
    .eq("is_published", true)
    .is("deleted_at", null)
    .single();

  if (!profile) {
    return { title: "Profile Not Found - Nodivra" };
  }

  const title = `${profile.display_name} - Nodivra`;
  const description =
    profile.headline || profile.bio || `${profile.display_name}'s developer page`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/u/${profile.handle}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Nodivra",
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const supabase = createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", params.handle.toLowerCase())
    .eq("is_published", true)
    .is("deleted_at", null)
    .single();

  if (!profile) {
    notFound();
    return;
  }

  const { data: links } = await supabase
    .from("profile_links")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_visible", true)
    .eq("is_enabled", true)
    .is("deleted_at", null)
    .order("position", { ascending: true })
    .limit(50);

  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_visible", true)
    .is("deleted_at", null)
    .order("position", { ascending: true })
    .limit(20);

  const { data: blocks } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_visible", true)
    .is("deleted_at", null)
    .order("position", { ascending: true })
    .limit(50);

  const { projects } = await loadProjectCollection(supabase, profile.id, {
    publicOnly: true,
    limit: 6,
  });

  return (
    <PublicProfile
      profile={profile as Profile}
      links={(links ?? []) as ProfileLink[]}
      sections={(sections ?? []) as PageSection[]}
      blocks={(blocks ?? []) as PageBlock[]}
      projects={projects}
    />
  );
}
