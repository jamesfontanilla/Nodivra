import { redirect } from "next/navigation";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { BlocksEditor } from "@/components/dashboard/blocks-editor";

export const metadata = {
  title: "Page Blocks - Nodivra",
};

export default async function BlocksPage() {
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
    return;
  }

  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("profile_id", profile.id)
    .is("deleted_at", null)
    .order("position", { ascending: true })
    .limit(20);

  const { data: blocks } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("profile_id", profile.id)
    .is("deleted_at", null)
    .order("position", { ascending: true })
    .limit(100);

  return (
    <div className="max-w-3xl space-y-10">
      <div className="space-y-2">
        <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary">
          Page Builder
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Blocks</h1>
        <p className="text-sm text-muted-foreground">
          Build your page with flexible content blocks
        </p>
      </div>
      <BlocksEditor
        profileId={profile.id}
        sections={sections ?? []}
        blocks={blocks ?? []}
      />
    </div>
  );
}
