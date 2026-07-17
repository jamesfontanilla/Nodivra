import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadProjectDetailBySlug } from "@/lib/project-loaders";
import { ProjectDetailView } from "@/components/public/project-renderers";

interface PageProps {
  params: { handle: string; slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, handle")
    .eq("handle", params.handle.toLowerCase())
    .eq("is_published", true)
    .is("deleted_at", null)
    .single();

  if (!profile) {
    return { title: "Project Not Found - Nodivra" };
  }

  const project = await loadProjectDetailBySlug(
    supabase,
    profile.id,
    params.slug,
    { publicOnly: true }
  );

  if (!project) {
    return { title: "Project Not Found - Nodivra" };
  }

  const title = `${project.project.title} - ${profile.display_name} - Nodivra`;
  const description = project.project.summary || `${project.project.title} case study`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/u/${profile.handle}/projects/${project.project.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Nodivra",
      type: "article",
      images: project.project.cover_image_url
        ? [
            {
              url: project.project.cover_image_url,
              alt: project.project.cover_image_alt ?? project.project.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: project.project.cover_image_url ? "summary_large_image" : "summary",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function PublicProjectPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle")
    .eq("handle", params.handle.toLowerCase())
    .eq("is_published", true)
    .is("deleted_at", null)
    .single();

  if (!profile) {
    notFound();
    return;
  }

  const detail = await loadProjectDetailBySlug(
    supabase,
    profile.id,
    params.slug,
    { publicOnly: true }
  );

  if (!detail) {
    notFound();
    return;
  }

  return (
    <main className="min-h-[100dvh] px-4 py-20 md:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <ProjectDetailView
          detail={detail}
          backHref={`/u/${profile.handle}/projects`}
        />
      </div>
    </main>
  );
}
