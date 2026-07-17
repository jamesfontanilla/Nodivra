import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadProjectCollection } from "@/lib/project-loaders";
import { ProjectCard } from "@/components/public/project-renderers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toRoute } from "@/lib/routes";

interface PageProps {
  params: { handle: string };
  searchParams?: { page?: string; q?: string };
}

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function buildBaseUrl(handle: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}/u/${handle}/projects`;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, headline, handle, bio")
    .eq("handle", params.handle.toLowerCase())
    .eq("is_published", true)
    .is("deleted_at", null)
    .single();

  if (!profile) {
    return { title: "Projects Not Found - Nodivra" };
  }

  const query = searchParams?.q?.trim();
  const title = `${profile.display_name} Projects - Nodivra`;
  const description = query
    ? `Search results for ${query} in ${profile.display_name}'s project case studies.`
    : profile.headline ||
      profile.bio ||
      `${profile.display_name}'s curated project case studies`;
  const canonical = new URL(buildBaseUrl(profile.handle));
  if (searchParams?.page) {
    canonical.searchParams.set("page", searchParams.page);
  }
  if (query) {
    canonical.searchParams.set("q", query);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical.toString(),
      siteName: "Nodivra",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: canonical.toString(),
    },
  };
}

export default async function PublicProjectsPage({
  params,
  searchParams,
}: PageProps) {
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

  const page = parsePage(searchParams?.page);
  const pageSize = 6;
  const search = searchParams?.q?.trim() || null;
  const { projects, totalCount } = await loadProjectCollection(
    supabase,
    profile.id,
    {
      publicOnly: true,
      search,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      count: true,
    }
  );

  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / pageSize));
  const baseUrl = `/u/${profile.handle}/projects`;
  const visibleProjects = projects;

  return (
    <main className="relative min-h-[100dvh] overflow-hidden px-4 py-20 md:px-6">
      <div className="absolute top-[-20%] left-[-15%] h-[540px] w-[540px] rounded-full bg-violet-500/8 blur-[140px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[480px] w-[480px] rounded-full bg-cyan-400/8 blur-[120px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link
              href={toRoute(`/u/${profile.handle}`)}
              className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              &lt;- Back to profile
            </Link>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 ring-1 ring-black/5 dark:ring-white/10">
                {profile.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                    {profile.avatar_initials ||
                      profile.display_name
                        .split(" ")
                        .map((name: string) => name[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                  Projects
                </span>
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                    {profile.display_name}&apos;s projects
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                    A curated collection of shipped work, experiments, and case
                    studies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={toRoute(`/u/${profile.handle}`)}>Public profile</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={toRoute(baseUrl)}>Clear filters</Link>
            </Button>
          </div>
        </div>

        <div className="bezel-outer">
          <div className="bezel-inner space-y-4 p-5 md:p-6">
            <form method="get" className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
              <div className="space-y-2">
                <label htmlFor="projects-search" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Search case studies
                </label>
                <input
                  id="projects-search"
                  name="q"
                  defaultValue={search ?? ""}
                  placeholder="Search by title, tech, tag, or lesson..."
                  className="flex h-11 w-full rounded-xl ring-1 ring-black/8 dark:ring-white/8 bg-white/60 dark:bg-white/4 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                />
              </div>
              <input type="hidden" name="page" value="1" />
              <Button type="submit" className="rounded-full">
                Search
              </Button>
              {search && (
                <Button asChild variant="ghost" className="rounded-full">
                  <Link href={toRoute(baseUrl)}>Reset</Link>
                </Button>
              )}
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <p>
                {totalCount ?? 0} project{(totalCount ?? 0) === 1 ? "" : "s"}
                {search ? ` matching "${search}"` : ""}
              </p>
              <p>
                Page {page} of {totalPages}
              </p>
            </div>
          </div>
        </div>

        {visibleProjects.length === 0 ? (
          <div className="bezel-outer">
            <div className="bezel-inner space-y-4 p-10 text-center">
              <h2 className="text-lg font-semibold tracking-tight">
                No projects found
              </h2>
              <p className="text-sm text-muted-foreground">
                Try a different search or come back after publishing a project.
              </p>
              <Button asChild variant="outline" className="rounded-full">
                <Link href={toRoute(baseUrl)}>Clear search</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              {visibleProjects.map((detail) => (
                <ProjectCard
                  key={detail.project.id}
                  detail={detail}
                  handle={profile.handle}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <PaginationLink
                  href={`${baseUrl}?${new URLSearchParams({
                    ...(search ? { q: search } : {}),
                    page: String(Math.max(1, page - 1)),
                  }).toString()}`}
                  disabled={page <= 1}
                  label="Previous"
                />
                {Array.from({ length: totalPages }).map((_, index) => {
                  const nextPage = index + 1;
                  const href = `${baseUrl}?${new URLSearchParams({
                    ...(search ? { q: search } : {}),
                    page: String(nextPage),
                  }).toString()}`;
                  return (
                    <PaginationLink
                      key={nextPage}
                      href={href}
                      active={page === nextPage}
                      label={String(nextPage)}
                    />
                  );
                })}
                <PaginationLink
                  href={`${baseUrl}?${new URLSearchParams({
                    ...(search ? { q: search } : {}),
                    page: String(Math.min(totalPages, page + 1)),
                  }).toString()}`}
                  disabled={page >= totalPages}
                  label="Next"
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function PaginationLink({
  href,
  label,
  active = false,
  disabled = false,
}: {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  const className = cn(
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-foreground/5 text-muted-foreground hover:bg-foreground/8 hover:text-foreground dark:bg-white/5 dark:hover:bg-white/10",
    disabled && "pointer-events-none opacity-40"
  );

  return (
    <Link href={toRoute(href)} className={className} aria-disabled={disabled}>
      {label}
    </Link>
  );
}
