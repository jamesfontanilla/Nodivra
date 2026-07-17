import { redirect } from "next/navigation";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { ProfilePreview } from "@/components/dashboard/profile-preview";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"];

export const metadata = {
  title: "Dashboard - Nodivra",
};

export default async function DashboardPage() {
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
  }

  const { data: links } = await supabase
    .from("profile_links")
    .select("*")
    .eq("profile_id", profile.id)
    .is("deleted_at", null)
    .order("position", { ascending: true })
    .limit(50);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Your Page</h1>
          <p className="text-muted-foreground">
            Edit your public developer profile
          </p>
        </div>
        <ProfileEditor
          profile={profile as Profile}
          links={(links ?? []) as ProfileLink[]}
        />
      </div>
      <div className="hidden lg:block">
        <div className="sticky top-8">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <ProfilePreview
            profile={profile as Profile}
            links={(links ?? []) as ProfileLink[]}
          />
        </div>
      </div>
    </div>
  );
}
