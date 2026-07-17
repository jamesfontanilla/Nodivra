import { redirect } from "next/navigation";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { PublicProfile } from "@/components/public/public-profile";
import { loadProjectCollection } from "@/lib/project-loaders";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"];
type PageSection = Database["public"]["Tables"]["page_sections"]["Row"];
type PageBlock = Database["public"]["Tables"]["page_blocks"]["Row"];

export const metadata = {
  title: "Preview - Nodivra",
};

export default async function PreviewPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!profile) {
    redirect("/dashboard/onboarding");
    return; // TypeScript control flow
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

  const { projects } = await loadProjectCollection(supabase, profile.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Preview</h1>
          <p className="text-sm text-muted-foreground">
            This is how your page looks to visitors
            {!profile.is_published && " (currently unpublished)"}
          </p>
        </div>
        {!profile.is_published && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            Draft
          </span>
        )}
      </div>
      <div className="border rounded-lg overflow-hidden bg-background">
        <PublicProfile
          profile={profile as Profile}
          links={(links ?? []) as ProfileLink[]}
          sections={(sections ?? []) as PageSection[]}
          blocks={(blocks ?? []) as PageBlock[]}
          projects={projects}
        />
      </div>
    </div>
  );
}
