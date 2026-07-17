import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  groupProjectDetails,
  type Project,
  type ProjectDetail,
  type ProjectLink,
  type ProjectTag,
  type ProjectTechnology,
} from "@/lib/projects";

interface ProjectCollectionOptions {
  publicOnly?: boolean;
  featuredOnly?: boolean;
  search?: string | null;
  limit?: number;
  offset?: number;
  count?: boolean;
}

function applyProjectFilters(
  query: ReturnType<SupabaseClient<Database>["from"]>,
  profileId: string,
  options: ProjectCollectionOptions
) {
  let nextQuery = query
    .select("*", options.count ? { count: "exact" } : undefined)
    .eq("profile_id", profileId)
    .is("deleted_at", null)
    .order("is_featured", { ascending: false })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (options.publicOnly) {
    nextQuery = nextQuery.eq("is_visible", true).eq("is_published", true);
  }

  if (options.featuredOnly) {
    nextQuery = nextQuery.eq("is_featured", true);
  }

  if (options.search && options.search.trim()) {
    nextQuery = nextQuery.ilike("search_text", `%${options.search.trim()}%`);
  }

  if (typeof options.offset === "number" && typeof options.limit === "number") {
    nextQuery = nextQuery.range(
      options.offset,
      options.offset + options.limit - 1
    );
  } else if (typeof options.limit === "number") {
    nextQuery = nextQuery.limit(options.limit);
  }

  return nextQuery;
}

export async function loadProjectCollection(
  supabase: SupabaseClient<Database>,
  profileId: string,
  options: ProjectCollectionOptions = {}
): Promise<{ projects: ProjectDetail[]; totalCount: number | null }> {
  const { data: projectData, error, count } = await applyProjectFilters(
    supabase.from("projects"),
    profileId,
    options
  );

  if (error) {
    throw new Error(error.message);
  }

  const projectRows = (projectData ?? []) as Project[];
  if (projectRows.length === 0) {
    return {
      projects: [],
      totalCount: count ?? 0,
    };
  }

  const projectIds = projectRows.map((project) => project.id);
  const publicOnly = options.publicOnly === true;

  const [technologiesResult, tagsResult, linksResult] = await Promise.all([
    supabase
      .from("project_technologies")
      .select("*")
      .in("project_id", projectIds)
      .is("deleted_at", null)
      .order("position", { ascending: true }),
    supabase
      .from("project_tags")
      .select("*")
      .in("project_id", projectIds)
      .is("deleted_at", null)
      .order("position", { ascending: true }),
    supabase
      .from("project_links")
      .select("*")
      .in("project_id", projectIds)
      .is("deleted_at", null)
      .order("position", { ascending: true }),
  ]);

  if (technologiesResult.error) {
    throw new Error(technologiesResult.error.message);
  }
  if (tagsResult.error) {
    throw new Error(tagsResult.error.message);
  }
  if (linksResult.error) {
    throw new Error(linksResult.error.message);
  }

  const technologies = (technologiesResult.data ?? []) as ProjectTechnology[];
  const tags = (tagsResult.data ?? []) as ProjectTag[];
  const linksData = (linksResult.data ?? []) as ProjectLink[];
  const links = publicOnly
    ? linksData.filter((link) => link.is_visible)
    : linksData;

  return {
    projects: groupProjectDetails(
      projectRows,
      technologies,
      tags,
      links
    ),
    totalCount: count ?? null,
  };
}

export async function loadProjectDetailBySlug(
  supabase: SupabaseClient<Database>,
  profileId: string,
  slug: string,
  options: { publicOnly?: boolean } = {}
): Promise<ProjectDetail | null> {
  let query = supabase
    .from("projects")
    .select("*")
    .eq("profile_id", profileId)
    .eq("slug", slug)
    .is("deleted_at", null);

  if (options.publicOnly) {
    query = query.eq("is_visible", true).eq("is_published", true);
  }

  const { data: projectData, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const project = projectData as Project | null;

  if (!project) {
    return null;
  }

  const [technologiesResult, tagsResult, linksResult] = await Promise.all([
    supabase
      .from("project_technologies")
      .select("*")
      .eq("project_id", project.id)
      .is("deleted_at", null)
      .order("position", { ascending: true }),
    supabase
      .from("project_tags")
      .select("*")
      .eq("project_id", project.id)
      .is("deleted_at", null)
      .order("position", { ascending: true }),
    supabase
      .from("project_links")
      .select("*")
      .eq("project_id", project.id)
      .is("deleted_at", null)
      .order("position", { ascending: true }),
  ]);

  if (technologiesResult.error) {
    throw new Error(technologiesResult.error.message);
  }
  if (tagsResult.error) {
    throw new Error(tagsResult.error.message);
  }
  if (linksResult.error) {
    throw new Error(linksResult.error.message);
  }

  const technologies = (technologiesResult.data ?? []) as ProjectTechnology[];
  const tags = (tagsResult.data ?? []) as ProjectTag[];
  const linksData = (linksResult.data ?? []) as ProjectLink[];

  const projectDetail = groupProjectDetails(
    [project],
    technologies,
    tags,
    options.publicOnly ? linksData.filter((link) => link.is_visible) : linksData
  )[0];

  return projectDetail ?? null;
}
