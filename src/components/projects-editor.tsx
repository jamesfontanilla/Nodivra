"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GlobeIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { ProjectDetailPreview, draftToPublicProject } from "@/components/project-detail";
import { cn } from "@/lib/classnames";
import {
  PROJECT_LINK_KINDS,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type ProfileProjectDraft,
  type ProjectLinkKind,
  type ProjectStatus,
  type ProjectType,
} from "@/types/nodivra";
import { Badge, Button, EmptyState, FieldShell, Input, Panel, Select, Textarea } from "@/components/ui";

const MAX_FEATURED_PROJECTS = 3;

const projectTypeLabels: Record<ProjectType, string> = {
  product: "Product",
  open_source: "Open source",
  client: "Client work",
  experiment: "Experiment",
  talk: "Talk or workshop",
  other: "Other",
};

const projectStatusLabels: Record<ProjectStatus, string> = {
  idea: "Idea",
  in_progress: "In progress",
  shipped: "Shipped",
  archived: "Archived",
};

const projectLinkLabels: Record<ProjectLinkKind, string> = {
  live: "Live URL",
  repository: "Repository URL",
  demo: "Demo URL",
};

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `00000000-0000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function slugify(value: string, fallback: string) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function createProject(profileId: string, position: number): ProfileProjectDraft {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    slug: `project-${position + 1}`,
    projectName: "A project worth remembering",
    shortSummary: "A clear, short summary of what changed and why it mattered.",
    caseStudyMarkdown: "## The brief\n\nDescribe the problem, the constraints, and the opportunity.\n\n## What changed\n\nExplain the decisions, the work, and the result.",
    role: "Your role",
    technologies: ["TypeScript"],
    projectType: "product",
    startDate: "",
    endDate: "",
    status: "in_progress",
    coverImageUrl: "",
    lessonsLearned: "",
    tags: ["case study"],
    isFeatured: false,
    isPublished: false,
    position,
    links: [],
    createdAt: now,
    updatedAt: now,
  };
}

function linkFor(project: ProfileProjectDraft, kind: ProjectLinkKind) {
  return project.links.find((link) => link.kind === kind);
}

export function ProjectsEditor({
  profileId,
  projects,
  onChange,
  fieldErrors,
}: {
  profileId: string;
  projects: ProfileProjectDraft[];
  onChange: (projects: ProfileProjectDraft[]) => void;
  fieldErrors: Record<string, string>;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id ?? null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;

  function updateProjects(nextProjects: ProfileProjectDraft[]) {
    onChange(nextProjects.map((project, position) => ({ ...project, position })));
  }

  function addProject() {
    const project = createProject(profileId, projects.length);
    setSelectedProjectId(project.id);
    setMessage(null);
    updateProjects([...projects, project]);
  }

  function patchProject<K extends keyof ProfileProjectDraft>(id: string, key: K, value: ProfileProjectDraft[K]) {
    updateProjects(projects.map((project) => project.id === id ? { ...project, [key]: value, updatedAt: timestamp() } : project));
  }

  function patchText(id: string, key: keyof Pick<ProfileProjectDraft, "projectName" | "slug" | "shortSummary" | "caseStudyMarkdown" | "role" | "startDate" | "endDate" | "coverImageUrl" | "lessonsLearned">, value: string) {
    patchProject(id, key, key === "slug" ? slugify(value, "project") : value);
  }

  function patchList(id: string, key: "technologies" | "tags", value: string) {
    patchProject(id, key, value.split(",").map((item) => item.trim()).filter(Boolean));
  }

  function patchProjectLink(projectId: string, kind: ProjectLinkKind, url: string) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    const existing = linkFor(project, kind);
    let links = project.links;
    if (!url.trim()) {
      links = links.filter((link) => link.kind !== kind).map((link, position) => ({ ...link, position }));
    } else if (existing) {
      links = links.map((link) => link.kind === kind ? { ...link, url, updatedAt: timestamp() } : link);
    } else {
      const now = timestamp();
      links = [...links, {
        id: createId(),
        projectId,
        kind,
        label: projectLinkLabels[kind],
        url,
        position: links.length,
        isEnabled: true,
        createdAt: now,
        updatedAt: now,
      }];
    }
    patchProject(projectId, "links", links);
  }

  function moveProject(id: string, direction: "up" | "down") {
    const index = projects.findIndex((project) => project.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= projects.length) return;
    const next = [...projects];
    const [selected] = next.splice(index, 1);
    next.splice(target, 0, selected!);
    updateProjects(next);
  }

  function toggleFeatured(project: ProfileProjectDraft) {
    if (!project.isFeatured && projects.filter((item) => item.isFeatured).length >= MAX_FEATURED_PROJECTS) {
      setMessage(`Choose ${MAX_FEATURED_PROJECTS} featured projects or fewer.`);
      return;
    }
    setMessage(null);
    patchProject(project.id, "isFeatured", !project.isFeatured);
  }

  function removeProject(id: string) {
    setSelectedProjectId((current) => current === id ? null : current);
    updateProjects(projects.filter((project) => project.id !== id));
  }

  return (
    <div className="space-y-5">
      <Panel tone="dark">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge tone="accent">Nodivra Projects</Badge>
            <h2 className="font-display text-3xl tracking-tight text-sand-50 sm:text-4xl">Turn the work into a case study.</h2>
            <p className="max-w-2xl text-sm leading-7 text-sand-200/80">Capture the decisions, constraints, and lessons behind the work. Projects stay private until you choose to publish them.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={showPreview ? "primary" : "secondary"} onClick={() => setShowPreview((value) => !value)}>{showPreview ? "Hide detail preview" : "Preview project"}</Button>
            <Button type="button" variant="secondary" onClick={addProject} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add project</Button>
          </div>
        </div>
        {fieldErrors.projects ? <p className="mt-5 rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-300/30">{fieldErrors.projects}</p> : null}
        {message ? <p className="mt-5 rounded-2xl bg-sand-100/10 px-4 py-3 text-sm text-sand-100 ring-1 ring-sand-200/20">{message}</p> : null}
      </Panel>

      {showPreview && selectedProject ? (
        <ProjectDetailPreview project={draftToPublicProject(selectedProject)} preview />
      ) : null}

      {projects.length === 0 ? (
        <EmptyState title="Start your project archive" description="Add a project to capture the work behind the link. Keep the first case study short, specific, and honest." action={<Button type="button" variant="secondary" onClick={addProject} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add your first project</Button>} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="space-y-4">
            {projects.map((project, index) => (
              <article key={project.id} className={cn("rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[background-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]", selectedProjectId === project.id && "bg-sand-100/10")}>
                <div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-[10px] font-semibold tracking-[0.18em] text-ink-950">{String(index + 1).padStart(2, "0")}</div>
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={project.isPublished ? "success" : "muted"}>{project.isPublished ? "Published" : "Draft"}</Badge>
                          {project.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
                          <Badge tone="muted">{projectStatusLabels[project.status]}</Badge>
                        </div>
                        <div>
                          <h3 className="font-display text-2xl tracking-tight text-sand-50">{project.projectName}</h3>
                          <p className="mt-2 text-sm leading-7 text-sand-200/75">{project.shortSummary}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                      <Button type="button" variant={selectedProjectId === project.id ? "primary" : "secondary"} onClick={() => setSelectedProjectId(project.id)}>{selectedProjectId === project.id ? "Editing" : "Edit project"}</Button>
                      <Button type="button" variant="ghost" onClick={() => moveProject(project.id, "up")} disabled={index === 0} trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}>Up</Button>
                      <Button type="button" variant="ghost" onClick={() => moveProject(project.id, "down")} disabled={index === projects.length - 1} trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}>Down</Button>
                      <Button type="button" variant="ghost" onClick={() => toggleFeatured(project)}>{project.isFeatured ? "Unfeature" : "Feature"}</Button>
                      <Button type="button" variant="ghost" onClick={() => patchProject(project.id, "isPublished", !project.isPublished)}>{project.isPublished ? "Unpublish" : "Publish"}</Button>
                      <Button type="button" variant="danger" onClick={() => removeProject(project.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10">
              <div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
                {selectedProject ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sand-300/70">Project settings</p>
                      <h3 className="mt-2 font-display text-2xl tracking-tight text-sand-50">{selectedProject.projectName}</h3>
                      <p className="mt-2 text-xs leading-6 text-sand-300/70">Manual case studies stay portable, safe, and independent from repository APIs.</p>
                    </div>
                    <div className="space-y-5 border-t border-white/10 pt-5">
                      <FieldShell label="Project name" hint="1 to 72 characters."><Input value={selectedProject.projectName} onChange={(event) => patchText(selectedProject.id, "projectName", event.target.value)} /></FieldShell>
                      <FieldShell label="Slug" hint="Used in the public project URL."><Input value={selectedProject.slug} onChange={(event) => patchText(selectedProject.id, "slug", event.target.value)} /></FieldShell>
                      <FieldShell label="Short summary" hint="240 characters or fewer."><Textarea value={selectedProject.shortSummary} onChange={(event) => patchText(selectedProject.id, "shortSummary", event.target.value)} /></FieldShell>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <FieldShell label="Project type"><Select value={selectedProject.projectType} onChange={(event) => patchProject(selectedProject.id, "projectType", event.target.value as ProjectType)}>{PROJECT_TYPES.map((type) => <option key={type} value={type}>{projectTypeLabels[type]}</option>)}</Select></FieldShell>
                        <FieldShell label="Status"><Select value={selectedProject.status} onChange={(event) => patchProject(selectedProject.id, "status", event.target.value as ProjectStatus)}>{PROJECT_STATUSES.map((status) => <option key={status} value={status}>{projectStatusLabels[status]}</option>)}</Select></FieldShell>
                      </div>
                      <FieldShell label="Role" hint="Optional contribution label."><Input value={selectedProject.role} onChange={(event) => patchText(selectedProject.id, "role", event.target.value)} /></FieldShell>
                      <FieldShell label="Technologies" hint="Comma-separated, up to eight."><Input value={selectedProject.technologies.join(", ")} onChange={(event) => patchList(selectedProject.id, "technologies", event.target.value)} /></FieldShell>
                      <FieldShell label="Tags" hint="Comma-separated, up to eight."><Input value={selectedProject.tags.join(", ")} onChange={(event) => patchList(selectedProject.id, "tags", event.target.value)} /></FieldShell>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <FieldShell label="Start date"><Input type="date" value={selectedProject.startDate} onChange={(event) => patchText(selectedProject.id, "startDate", event.target.value)} /></FieldShell>
                        <FieldShell label="End date" hint="Leave empty for ongoing work."><Input type="date" value={selectedProject.endDate} onChange={(event) => patchText(selectedProject.id, "endDate", event.target.value)} /></FieldShell>
                      </div>
                      <FieldShell label="Cover image URL" hint="Optional, small https image."><Input value={selectedProject.coverImageUrl} onChange={(event) => patchText(selectedProject.id, "coverImageUrl", event.target.value)} /></FieldShell>
                      <div className="space-y-4 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10">
                        <div className="flex items-center gap-2"><GlobeIcon className="h-4 w-4 text-sand-200/70" /><p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Project links</p></div>
                        {PROJECT_LINK_KINDS.map((kind) => <FieldShell key={kind} label={projectLinkLabels[kind]}><Input value={linkFor(selectedProject, kind)?.url ?? ""} placeholder="https://" onChange={(event) => patchProjectLink(selectedProject.id, kind, event.target.value)} /></FieldShell>)}
                      </div>
                      <FieldShell label="Detailed case study" hint="Markdown, 12,000 characters or fewer."><Textarea className="min-h-[220px]" value={selectedProject.caseStudyMarkdown} onChange={(event) => patchText(selectedProject.id, "caseStudyMarkdown", event.target.value)} /></FieldShell>
                      <FieldShell label="Lessons learned" hint="1,800 characters or fewer."><Textarea value={selectedProject.lessonsLearned} onChange={(event) => patchText(selectedProject.id, "lessonsLearned", event.target.value)} /></FieldShell>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant={selectedProject.isFeatured ? "primary" : "secondary"} onClick={() => toggleFeatured(selectedProject)}>{selectedProject.isFeatured ? "Featured project" : "Mark featured"}</Button>
                        <Button type="button" variant={selectedProject.isPublished ? "primary" : "secondary"} onClick={() => patchProject(selectedProject.id, "isPublished", !selectedProject.isPublished)}>{selectedProject.isPublished ? "Published" : "Keep private"}</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4"><Badge tone="muted">Project settings</Badge><h3 className="font-display text-2xl tracking-tight text-sand-50">Select a project to edit it.</h3><p className="text-sm leading-7 text-sand-200/80">Keep the list focused and use the detail preview to check the final reading experience.</p></div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
