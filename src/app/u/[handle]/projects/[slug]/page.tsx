import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailPreview } from "@/components/project-detail";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui";
import { buildPublicProjectMetadata } from "@/lib/metadata";
import { getPublicProject } from "@/lib/workspace";
import { siteName } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}): Promise<Metadata> {
  const { handle, slug } = await params;
  const result = await getPublicProject(handle, slug);
  return result
    ? buildPublicProjectMetadata(result.profile, result.project)
    : { title: `${slug} · ${siteName}` };
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}) {
  const { handle, slug } = await params;
  const result = await getPublicProject(handle, slug);
  if (!result) {
    notFound();
  }

  const { profile, project } = result ?? notFound();
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge tone="accent">{siteName}</Badge>
          <Badge tone="muted">{profile.displayName} / {handle}</Badge>
        </div>
        <ProjectDetailPreview project={project} profileHandle={profile.handle} />
      </Reveal>
    </main>
  );
}
