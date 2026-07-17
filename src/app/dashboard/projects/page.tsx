import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { loadProjectCollection } from "@/lib/project-loaders";
import { ProjectsManager } from "@/components/dashboard/projects-manager";
import { Button } from "@/components/ui/button";
import { toRoute } from "@/lib/routes";

export const metadata = {
  title: "Projects - Nodivra",
};

export default async function ProjectsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!profile) {
    redirect("/dashboard/onboarding");
    return;
  }

  const { projects } = await loadProjectCollection(supabase, profile.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
            Projects
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Case studies</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Curate the projects that tell your story. Keep private drafts hidden,
            publish only what you want public, and choose which ones deserve the
            featured strip on your profile.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={toRoute(`/u/${profile.handle}/projects`)} target="_blank">
              View public list
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/preview">Preview page</Link>
          </Button>
        </div>
      </div>

      <ProjectsManager
        profileId={profile.id}
        profileHandle={profile.handle}
        projects={projects}
      />
    </div>
  );
}
