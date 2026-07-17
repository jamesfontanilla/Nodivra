import { redirect } from "next/navigation";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { LinksManager } from "@/components/dashboard/links-manager";
import type { Database } from "@/lib/supabase/database.types";

type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"];

export const metadata = {
  title: "Manage Links - Nodivra",
};

export default async function LinksPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Links</h1>
        <p className="text-muted-foreground">
          Manage the links on your public page
        </p>
      </div>
      <LinksManager
        profileId={profile.id}
        links={(links ?? []) as ProfileLink[]}
      />
    </div>
  );
}
