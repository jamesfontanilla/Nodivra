"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  buildUniqueProjectSlug,
  getNextProjectPosition,
  getProjectLink,
  MAX_FEATURED_PROJECTS,
  PROJECT_LINK_KIND_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
  sortProjectDetails,
  type ProjectDetail,
  type ProjectLink,
  type ProjectLinkKind,
} from "@/lib/projects";
import { projectFormSchema } from "@/lib/validations";
import { ProjectDetailView } from "@/components/public/project-renderers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Copy,
  Trash2,
  Save,
  X,
} from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectEditorFormProps {
  profileId: string;
  profileHandle: string;
  project: ProjectDetail | null;
  projects: ProjectDetail[];
  onSaved: () => void;
  onCancel: () => void;
}

export function ProjectEditorForm({
  profileId,
  profileHandle,
  project,
  projects,
  onSaved,
  onCancel,
}: ProjectEditorFormProps) {
  const router = useRouter();
  const orderedProjects = useMemo(() => sortProjectDetails(projects), [projects]);
  const currentProjectId = project?.project.id ?? null;
  const existingSlugs = useMemo(
    () =>
      orderedProjects
        .filter((item) => item.project.id !== currentProjectId)
        .map((item) => item.project.slug),
    [currentProjectId, orderedProjects]
  );
  const featuredCount = useMemo(
    () => orderedProjects.filter((item) => item.project.is_featured).length,
    [orderedProjects]
  );

  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [caseStudyMd, setCaseStudyMd] = useState("");
  const [role, setRole] = useState("");
  const [projectType, setProjectType] =
    useState<(typeof PROJECT_TYPES)[number]>("other");
  const [status, setStatus] = useState<Project["status"]>("draft");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [coverImageCaption, setCoverImageCaption] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [tags, setTags] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    setTitle(project?.project.title ?? "");
    setSlug(project?.project.slug ?? "");
    setSummary(project?.project.summary ?? "");
    setCaseStudyMd(project?.project.case_study_md ?? "");
    setRole(project?.project.role ?? "");
    setProjectType(project?.project.project_type ?? "other");
    setStatus(project?.project.status ?? "draft");
    setStartDate(project?.project.start_date ?? "");
    setEndDate(project?.project.end_date ?? "");
    setCoverImageUrl(project?.project.cover_image_url ?? "");
    setCoverImageAlt(project?.project.cover_image_alt ?? "");
    setCoverImageCaption(project?.project.cover_image_caption ?? "");
    setLessonsLearned(project?.project.lessons_learned ?? "");
    setTechnologies(project?.technologies.map((item) => item.name).join(", ") ?? "");
    setTags(project?.tags.map((item) => item.name).join(", ") ?? "");
    setLiveUrl(getProjectLink(project?.links ?? [], "live")?.url ?? "");
    setRepositoryUrl(getProjectLink(project?.links ?? [], "repository")?.url ?? "");
    setDemoUrl(getProjectLink(project?.links ?? [], "demo")?.url ?? "");
    setIsFeatured(project?.project.is_featured ?? false);
    setIsVisible(project?.project.is_visible ?? true);
    setIsPublished(project?.project.is_published ?? false);
  }, [project]);

  const previewDetail = useMemo<ProjectDetail>(() => {
    const resolvedSlug = slug.trim() || buildUniqueProjectSlug(title || "Project", existingSlugs);
    const projectRow: Project = {
      id: project?.project.id ?? "preview-project",
      profile_id: profileId,
      title: title.trim() || "Untitled project",
      slug: resolvedSlug,
      summary: summary.trim() || "Short summary goes here.",
      case_study_md: caseStudyMd.trim() || "Write a detailed case study here.",
      role: role.trim(),
      project_type: projectType,
      status,
      start_date: startDate || null,
      end_date: endDate || null,
      cover_image_url: coverImageUrl || null,
      cover_image_alt: coverImageAlt || null,
      cover_image_caption: coverImageCaption || null,
      lessons_learned: lessonsLearned || null,
      search_text: "",
      position: project?.project.position ?? getNextProjectPosition(orderedProjects.map((item) => item.project)),
      is_featured: isFeatured,
      is_visible: isVisible,
      is_published: isPublished,
      created_at: project?.project.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    const technologyRows = technologies
      .split(",")
      .map((item, index) => item.trim())
      .filter(Boolean)
      .map((name, index) => ({
        id: `preview-tech-${index}`,
        project_id: projectRow.id,
        name,
        position: index,
        created_at: projectRow.created_at,
        updated_at: projectRow.updated_at,
        deleted_at: null,
      }));

    const tagRows = tags
      .split(",")
      .map((item, index) => item.trim())
      .filter(Boolean)
      .map((name, index) => ({
        id: `preview-tag-${index}`,
        project_id: projectRow.id,
        name,
        position: index,
        created_at: projectRow.created_at,
        updated_at: projectRow.updated_at,
        deleted_at: null,
      }));

    const linkRows: ProjectLink[] = [
      liveUrl.trim() && {
        id: "preview-link-live",
        project_id: projectRow.id,
        kind: "live",
        url: liveUrl.trim(),
        position: 0,
        is_visible: true,
        created_at: projectRow.created_at,
        updated_at: projectRow.updated_at,
        deleted_at: null,
      },
      repositoryUrl.trim() && {
        id: "preview-link-repository",
        project_id: projectRow.id,
        kind: "repository",
        url: repositoryUrl.trim(),
        position: 1,
        is_visible: true,
        created_at: projectRow.created_at,
        updated_at: projectRow.updated_at,
        deleted_at: null,
      },
      demoUrl.trim() && {
        id: "preview-link-demo",
        project_id: projectRow.id,
        kind: "demo",
        url: demoUrl.trim(),
        position: 2,
        is_visible: true,
        created_at: projectRow.created_at,
        updated_at: projectRow.updated_at,
        deleted_at: null,
      },
    ].filter(Boolean) as ProjectLink[];

    return {
      project: projectRow,
      technologies: technologyRows,
      tags: tagRows,
      links: linkRows,
    };
  }, [
    caseStudyMd,
    coverImageAlt,
    coverImageCaption,
    coverImageUrl,
    demoUrl,
    endDate,
    existingSlugs,
    isFeatured,
    isPublished,
    isVisible,
    liveUrl,
    lessonsLearned,
    orderedProjects,
    profileId,
    project,
    projectType,
    repositoryUrl,
    role,
    slug,
    startDate,
    status,
    summary,
    tags,
    technologies,
    title,
  ]);

  async function saveProject(duplicate = false) {
    const resolvedTitle = duplicate
      ? `${title.trim() || "Project"} Copy`
      : title.trim();
    const resolvedSlug = slug.trim() || buildUniqueProjectSlug(resolvedTitle, existingSlugs);
    const parsedLinks = [
      { kind: "live" as const, url: liveUrl.trim() },
      { kind: "repository" as const, url: repositoryUrl.trim() },
      { kind: "demo" as const, url: demoUrl.trim() },
    ].filter((link) => link.url.length > 0);

    const payload = {
      title: resolvedTitle,
      slug: resolvedSlug,
      summary: summary.trim(),
      case_study_md: caseStudyMd.trim(),
      role: role.trim() || null,
      project_type: projectType,
      status,
      start_date: startDate || null,
      end_date: endDate || null,
      cover_image_url: coverImageUrl.trim() || null,
      cover_image_alt: coverImageAlt.trim() || null,
      cover_image_caption: coverImageCaption.trim() || null,
      lessons_learned: lessonsLearned.trim() || null,
      is_featured: isFeatured,
      is_visible: isVisible,
      is_published: isPublished,
      technologies: technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      links: parsedLinks,
    };

    const validation = projectFormSchema.safeParse(payload);
    if (!validation.success) {
      toast({
        title: "Validation error",
        description: validation.error.errors[0]?.message,
        variant: "destructive",
      });
      return;
    }

    const createsFeaturedProject =
      isFeatured && (duplicate || !project?.project.is_featured);
    const featuredLimitReached =
      createsFeaturedProject && featuredCount >= MAX_FEATURED_PROJECTS;
    if (featuredLimitReached) {
      toast({
        title: "Featured limit reached",
        description: `Only ${MAX_FEATURED_PROJECTS} projects can be featured at once.`,
        variant: "destructive",
      });
      return;
    }

    setSaving(!duplicate);
    setDuplicating(duplicate);

    const supabase = createClient();
    const now = new Date().toISOString();

    try {
      let projectId = project?.project.id ?? null;

      if (duplicate || !projectId) {
        const insertPayload = {
          profile_id: profileId,
          title: validation.data.title,
          slug: validation.data.slug,
          summary: validation.data.summary,
          case_study_md: validation.data.case_study_md,
          role: validation.data.role ?? "",
          project_type: validation.data.project_type,
          status: validation.data.status,
          start_date: validation.data.start_date ?? null,
          end_date: validation.data.end_date ?? null,
          cover_image_url: validation.data.cover_image_url ?? null,
          cover_image_alt: validation.data.cover_image_alt ?? null,
          cover_image_caption: validation.data.cover_image_caption ?? null,
          lessons_learned: validation.data.lessons_learned ?? null,
          position: getNextProjectPosition(orderedProjects.map((item) => item.project)),
          is_featured: validation.data.is_featured,
          is_visible: validation.data.is_visible,
          is_published: validation.data.is_published,
        };

        const { data, error } = await supabase
          .from("projects")
          .insert(insertPayload)
          .select("id")
          .single();

        if (error) {
          throw new Error(error.message);
        }

        projectId = data.id;
      } else {
        const { error } = await supabase
          .from("projects")
          .update({
            title: validation.data.title,
            slug: validation.data.slug,
            summary: validation.data.summary,
            case_study_md: validation.data.case_study_md,
            role: validation.data.role ?? "",
            project_type: validation.data.project_type,
            status: validation.data.status,
            start_date: validation.data.start_date ?? null,
            end_date: validation.data.end_date ?? null,
            cover_image_url: validation.data.cover_image_url ?? null,
            cover_image_alt: validation.data.cover_image_alt ?? null,
            cover_image_caption: validation.data.cover_image_caption ?? null,
            lessons_learned: validation.data.lessons_learned ?? null,
            is_featured: validation.data.is_featured,
            is_visible: validation.data.is_visible,
            is_published: validation.data.is_published,
            updated_at: now,
          })
          .eq("id", projectId);

        if (error) {
          throw new Error(error.message);
        }
      }

      if (!projectId) {
        throw new Error("Project ID was not created");
      }

      await Promise.all([
        supabase
          .from("project_technologies")
          .update({ deleted_at: now })
          .eq("project_id", projectId)
          .is("deleted_at", null),
        supabase
          .from("project_tags")
          .update({ deleted_at: now })
          .eq("project_id", projectId)
          .is("deleted_at", null),
        supabase
          .from("project_links")
          .update({ deleted_at: now })
          .eq("project_id", projectId)
          .is("deleted_at", null),
      ]);

      const technologyRows = validation.data.technologies.map((name, index) => ({
        project_id: projectId as string,
        name,
        position: index,
      }));
      const tagRows = validation.data.tags.map((name, index) => ({
        project_id: projectId as string,
        name,
        position: index,
      }));
      const linkRows = validation.data.links.map((link, index) => ({
        project_id: projectId as string,
        kind: link.kind,
        url: link.url as string,
        position: index,
        is_visible: true,
      }));

      if (technologyRows.length > 0) {
        const { error } = await supabase.from("project_technologies").insert(technologyRows);
        if (error) throw new Error(error.message);
      }

      if (tagRows.length > 0) {
        const { error } = await supabase.from("project_tags").insert(tagRows);
        if (error) throw new Error(error.message);
      }

      if (linkRows.length > 0) {
        const { error } = await supabase.from("project_links").insert(linkRows);
        if (error) throw new Error(error.message);
      }

      toast({
        title: duplicate ? "Project duplicated" : project ? "Project saved" : "Project created",
        description: `${validation.data.title} is ready to publish.`,
      });
      onSaved();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast({
        title: duplicate ? "Error duplicating project" : "Error saving project",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setDuplicating(false);
    }
  }

  async function handleDelete() {
    if (!project) return;
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Delete "${project.project.title}"? This will hide it from the public page.`
      );
      if (!confirmed) return;
    }

    setDeleting(true);
    const supabase = createClient();
    const now = new Date().toISOString();

    try {
      await Promise.all([
        supabase
          .from("projects")
          .update({ deleted_at: now })
          .eq("id", project.project.id),
        supabase
          .from("project_technologies")
          .update({ deleted_at: now })
          .eq("project_id", project.project.id)
          .is("deleted_at", null),
        supabase
          .from("project_tags")
          .update({ deleted_at: now })
          .eq("project_id", project.project.id)
          .is("deleted_at", null),
        supabase
          .from("project_links")
          .update({ deleted_at: now })
          .eq("project_id", project.project.id)
          .is("deleted_at", null),
      ]);

      toast({
        title: "Project deleted",
        description: `${project.project.title} has been archived.`,
      });
      onCancel();
      router.refresh();
    } catch (error) {
      toast({
        title: "Error deleting project",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  const publicHref = project
    ? `/u/${profileHandle}/projects/${project.project.slug}`
    : undefined;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="bezel-outer">
        <div className="bezel-inner space-y-6 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-primary">
                {project ? "Edit project" : "New project"}
              </span>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  {project ? project.project.title : "Create a project"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage the case study details, links, visibility, and featured
                  status.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Featured {featuredCount}/{MAX_FEATURED_PROJECTS}
              </span>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </div>

          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              void saveProject(false);
            }}
          >
            <section className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project_title">Project name</Label>
                <Input
                  id="project_title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Nodivra Studio"
                  maxLength={120}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_160px]">
                <div className="space-y-2">
                  <Label htmlFor="project_slug">Slug</Label>
                  <Input
                    id="project_slug"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value.toLowerCase())}
                    placeholder="nodivra-studio"
                    maxLength={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_type">Type</Label>
                  <select
                    id="project_type"
                    value={projectType}
                    onChange={(event) =>
                      setProjectType(event.target.value as (typeof PROJECT_TYPES)[number])
                    }
                    className="flex h-11 w-full rounded-xl ring-1 ring-black/8 dark:ring-white/8 bg-white/60 dark:bg-white/4 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  >
                    {PROJECT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {PROJECT_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_summary">Short summary</Label>
                <Textarea
                  id="project_summary"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  rows={3}
                  maxLength={280}
                  placeholder="A one-sentence case-study summary."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_case_study">Case study markdown</Label>
                <Textarea
                  id="project_case_study"
                  value={caseStudyMd}
                  onChange={(event) => setCaseStudyMd(event.target.value)}
                  rows={12}
                  maxLength={12000}
                  placeholder="# Problem\nDescribe the problem, approach, and outcome."
                  className="min-h-[260px]"
                  required
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project_role">Role</Label>
                <Input
                  id="project_role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="Product design and engineering"
                  maxLength={120}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project_status">Status</Label>
                  <select
                    id="project_status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as Project["status"])
                    }
                    className="flex h-11 w-full rounded-xl ring-1 ring-black/8 dark:ring-white/8 bg-white/60 dark:bg-white/4 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  >
                    {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_dates">Timeline</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="project_start"
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                    <Input
                      id="project_end"
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="project_cover_url">Cover image URL</Label>
                  <Input
                    id="project_cover_url"
                    value={coverImageUrl}
                    onChange={(event) => setCoverImageUrl(event.target.value)}
                    placeholder="https://example.com/project-cover.jpg"
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_cover_alt">Cover alt text</Label>
                  <Input
                    id="project_cover_alt"
                    value={coverImageAlt}
                    onChange={(event) => setCoverImageAlt(event.target.value)}
                    placeholder="Preview of the product"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_cover_caption">Cover caption</Label>
                <Input
                  id="project_cover_caption"
                  value={coverImageCaption}
                  onChange={(event) => setCoverImageCaption(event.target.value)}
                  placeholder="Optional caption below the image"
                  maxLength={240}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_lessons">Lessons learned</Label>
                <Textarea
                  id="project_lessons"
                  value={lessonsLearned}
                  onChange={(event) => setLessonsLearned(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="What changed after the project shipped?"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project_techs">Technologies</Label>
                  <Textarea
                    id="project_techs"
                    value={technologies}
                    onChange={(event) => setTechnologies(event.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="TypeScript, Next.js, Supabase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_tags">Tags</Label>
                  <Textarea
                    id="project_tags"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Portfolio, tooling, case study"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["live", liveUrl, setLiveUrl],
                  ["repository", repositoryUrl, setRepositoryUrl],
                  ["demo", demoUrl, setDemoUrl],
                ].map(([kind, value, setter]) => (
                  <div key={kind as string} className="space-y-2">
                    <Label htmlFor={`project_${kind}`}>{PROJECT_LINK_KIND_LABELS[kind as ProjectLinkKind]}</Label>
                    <Input
                      id={`project_${kind}`}
                      type="url"
                      value={value as string}
                      onChange={(event) => (setter as (value: string) => void)(event.target.value)}
                      placeholder={`https://example.com/${kind}`}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {[
                {
                  id: "project_featured",
                  label: "Featured",
                  value: isFeatured,
                  onChange: setIsFeatured,
                },
                {
                  id: "project_visible",
                  label: "Visible",
                  value: isVisible,
                  onChange: setIsVisible,
                },
                {
                  id: "project_published",
                  label: "Published",
                  value: isPublished,
                  onChange: setIsPublished,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-foreground/[0.02] px-4 py-3 dark:bg-white/[0.02]"
                >
                  <div className="space-y-1">
                    <Label htmlFor={item.id} className="text-sm">
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {item.label === "Featured"
                        ? "Highlights this project in the public projects strip."
                        : item.label === "Visible"
                          ? "Hidden projects stay private even when published."
                          : "Published projects can appear publicly."}
                    </p>
                  </div>
                  <Switch
                    id={item.id}
                    checked={item.value}
                    onCheckedChange={item.onChange}
                  />
                </div>
              ))}
            </section>

            <section className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={saving || duplicating || deleting}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : project ? "Save project" : "Create project"}
              </Button>

              {project && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving || duplicating || deleting}
                    onClick={() => void saveProject(true)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {duplicating ? "Duplicating..." : "Duplicate"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={saving || duplicating || deleting}
                    onClick={() => void handleDelete()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={saving || duplicating || deleting}
              >
                Cancel
              </Button>
            </section>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bezel-outer">
          <div className="bezel-inner p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Live preview
                </p>
                <p className="text-sm text-muted-foreground">
                  How this project will look on the public page.
                </p>
              </div>
              <span className="rounded-full bg-foreground/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {project ? "Editing" : "New"}
              </span>
            </div>
            <ProjectDetailView
              detail={previewDetail}
              previewLabel="Draft preview"
              publicHref={project ? publicHref : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
