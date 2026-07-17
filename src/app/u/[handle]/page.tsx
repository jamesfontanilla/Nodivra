import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PublicProfile } from "@/components/public/public-profile";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"];

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

  return (
    <PublicProfile
      profile={profile as Profile}
      links={(links ?? []) as ProfileLink[]}
    />
  );
}
