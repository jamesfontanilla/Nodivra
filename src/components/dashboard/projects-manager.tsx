"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  MAX_FEATURED_PROJECTS,
  sortProjectDetails,
  type ProjectDetail,
} from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Plus,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { ProjectEditorForm } from "./project-editor-form";

interface ProjectsManagerProps {
  profileId: string;
  profileHandle: string;
  projects: ProjectDetail[];
}

export function ProjectsManager({
  profileId,
  profileHandle,
  projects,
}: ProjectsManagerProps) {
  const router = useRouter();
  const orderedProjects = useMemo(() => sortProjectDetails(projects), [projects]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    orderedProjects[0]?.project.id ?? null
  );
  const [creatingNew, setCreatingNew] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const selectedProject =
    creatingNew || !selectedProjectId
      ? null
      : orderedProjects.find((item) => item.project.id === selectedProjectId) ?? null;

  function startNewProject() {
    setCreatingNew(true);
    setSelectedProjectId(null);
  }

  function selectProject(projectId: string) {
    setCreatingNew(false);
    setSelectedProjectId(projectId);
  }

  async function updateProject(projectId: string, values: Record<string, unknown>) {
    const supabase = createClient();
    const { error } = await supabase.from("projects").update(values).eq("id", projectId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    router.refresh();
    return true;
  }

  async function swapProjects(firstIndex: number, secondIndex: number) {
    const first = orderedProjects[firstIndex];
    const second = orderedProjects[secondIndex];
    if (!first || !second) return;

    setSavingOrder(true);
    const now = new Date().toISOString();
    const supabase = createClient();

    const [firstResult, secondResult] = await Promise.all([
      supabase
        .from("projects")
        .update({ position: second.project.position, updated_at: now })
        .eq("id", first.project.id),
      supabase
        .from("projects")
        .update({ position: first.project.position, updated_at: now })
        .eq("id", second.project.id),
    ]);
    const error = firstResult.error ?? secondResult.error;

    if (error) {
      toast({
        title: "Error reordering projects",
        description: error.message,
        variant: "destructive",
      });
    } else {
      router.refresh();
    }

    setSavingOrder(false);
  }

  async function toggleProjectField(
    projectId: string,
    field: "is_visible" | "is_published" | "is_featured",
    currentValue: boolean
  ) {
    const nextValue = !currentValue;
    const project = orderedProjects.find((item) => item.project.id === projectId);

    if (!project) return;

    if (field === "is_featured" && nextValue) {
      const featuredCount = orderedProjects.filter(
        (item) => item.project.is_featured && item.project.id !== projectId
      ).length;
      if (featuredCount >= MAX_FEATURED_PROJECTS) {
        toast({
          title: "Featured limit reached",
          description: `Only ${MAX_FEATURED_PROJECTS} projects can be featured at once.`,
          variant: "destructive",
        });
        return;
      }
    }

    await updateProject(projectId, {
      [field]: nextValue,
      updated_at: new Date().toISOString(),
    });
  }

  async function deleteProject(projectId: string) {
    const project = orderedProjects.find((item) => item.project.id === projectId);
    if (!project) return;

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Archive "${project.project.title}"? This hides it from the public page.`
      );
      if (!confirmed) return;
    }

    const now = new Date().toISOString();
    const supabase = createClient();
    const [projectResult, technologiesResult, tagsResult, linksResult] = await Promise.all([
      supabase.from("projects").update({ deleted_at: now }).eq("id", projectId),
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

    const error =
      projectResult.error ??
      technologiesResult.error ??
      tagsResult.error ??
      linksResult.error;

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Project archived",
      description: project.project.title,
    });
    if (selectedProjectId === projectId) {
      setSelectedProjectId(orderedProjects.find((item) => item.project.id !== projectId)?.project.id ?? null);
      setCreatingNew(false);
    }
    router.refresh();
  }

  const featuredCount = orderedProjects.filter(
    (item) => item.project.is_featured && !item.project.deleted_at
  ).length;

  return (
    <div className="space-y-6">
      <div className="bezel-outer">
        <div className="bezel-inner space-y-5 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                Project builder
              </span>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Curate your case studies
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Build detailed project pages, reorder them, and decide which
                  ones deserve a featured spot.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Featured {featuredCount}/3
              </span>
              <Button onClick={startNewProject} className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                New project
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="space-y-4">
          {orderedProjects.length === 0 ? (
            <Card>
              <CardContent className="space-y-4 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">No projects yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first case study to populate the public projects section.
                  </p>
                </div>
                <Button onClick={startNewProject} className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create project
                </Button>
              </CardContent>
            </Card>
          ) : (
            orderedProjects.map((detail, index) => {
              const project = detail.project;
              const isSelected = selectedProjectId === project.id && !creatingNew;
              return (
                <div
                  key={project.id}
                  className={cn(
                    "bezel-outer transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    isSelected && "ring-2 ring-primary/20"
                  )}
                >
                  <div className="bezel-inner space-y-4 p-4">
                    <button
                      type="button"
                      onClick={() => selectProject(project.id)}
                      className="flex w-full items-start justify-between gap-3 text-left"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-foreground/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            #{index + 1}
                          </span>
                          {project.is_featured && (
                            <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                              Featured
                            </span>
                          )}
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]",
                              project.is_published
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            )}
                          >
                            {project.is_published ? "Published" : "Draft"}
                          </span>
                        </div>
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {project.title}
                        </h3>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {project.summary}
                        </p>
                      </div>
                      <Pencil className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center justify-between rounded-2xl bg-foreground/[0.02] px-3 py-2 text-xs dark:bg-white/[0.02]">
                      <span className="text-muted-foreground">Visible</span>
                        <Switch
                          checked={project.is_visible}
                          onCheckedChange={() =>
                            void toggleProjectField(project.id, "is_visible", project.is_visible)
                          }
                          aria-label={`Toggle visibility for ${project.title}`}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-foreground/[0.02] px-3 py-2 text-xs dark:bg-white/[0.02]">
                        <span className="text-muted-foreground">Published</span>
                        <Switch
                          checked={project.is_published}
                          onCheckedChange={() =>
                            void toggleProjectField(project.id, "is_published", project.is_published)
                          }
                          aria-label={`Toggle publish for ${project.title}`}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-foreground/[0.02] px-3 py-2 text-xs dark:bg-white/[0.02] sm:col-span-2">
                        <span className="text-muted-foreground">Featured</span>
                        <Switch
                          checked={project.is_featured}
                          onCheckedChange={() =>
                            void toggleProjectField(project.id, "is_featured", project.is_featured)
                          }
                          aria-label={`Toggle featured for ${project.title}`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void swapProjects(index, index - 1)}
                        disabled={index === 0 || savingOrder}
                        className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => void swapProjects(index, index + 1)}
                        disabled={index === orderedProjects.length - 1 || savingOrder}
                        className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => selectProject(project.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteProject(project.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1.5 text-xs text-red-700 transition-colors hover:bg-red-500/15 dark:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          {creatingNew || selectedProject ? (
          <ProjectEditorForm
              profileId={profileId}
              profileHandle={profileHandle}
              project={selectedProject}
              projects={orderedProjects}
              onSaved={() => {
                setCreatingNew(false);
                setSelectedProjectId(null);
              }}
              onCancel={() => {
                setCreatingNew(false);
                setSelectedProjectId(null);
              }}
            />
          ) : (
            <div className="bezel-outer">
              <div className="bezel-inner p-8 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold tracking-tight">
                    Select a project to edit
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose an existing case study or create a new one to start
                    filling in the details.
                  </p>
                </div>
                <Button onClick={startNewProject} className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New project
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
