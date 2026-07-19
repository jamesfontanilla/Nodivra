"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, LinkIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { RepositoryDetailPreview, draftToPublicRepository } from "@/components/repository-detail";
import { draftToPublicProject } from "@/components/project-detail";
import { cn } from "@/lib/classnames";
import {
  REPOSITORY_STATUSES,
  type ProfileProjectDraft,
  type ProfileRepositoryDraft,
  type RepositoryLinkKind,
  type RepositoryStatus,
} from "@/types/nodivra";
import { Badge, Button, EmptyState, FieldShell, Input, Panel, Select, Textarea } from "@/components/ui";

const MAX_FEATURED_REPOSITORIES = 3;

const statusLabels: Record<RepositoryStatus, string> = {
  active: "Active",
  maintenance: "Maintenance",
  paused: "Paused",
  archived: "Archived",
};

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `00000000-0000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function createRepository(profileId: string, position: number): ProfileRepositoryDraft {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    repositoryName: "a repository worth showing",
    providerLabel: "GitHub",
    repositoryUrl: "https://github.com/your-handle/repository",
    description: "A short explanation of what this repository is for and why it matters.",
    language: "TypeScript",
    framework: "Next.js",
    topics: ["developer tools"],
    starsText: "",
    forksText: "",
    activityLabel: "",
    status: "active",
    isStatsVisible: false,
    isFeatured: false,
    isPublished: false,
    position,
    links: [],
    createdAt: now,
    updatedAt: now,
  };
}

function createRepositoryLink(
  profileId: string,
  repositoryId: string,
  kind: RepositoryLinkKind,
  projectId = "",
  position = 0,
) {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    repositoryId,
    kind,
    projectId,
    label: kind === "project" ? "Related project" : "Stack item",
    url: kind === "project" ? "" : "https://",
    position,
    isEnabled: true,
    createdAt: now,
    updatedAt: now,
  };
}

function errorFor(fieldErrors: Record<string, string>, repositoryIndex: number, field: string) {
  return fieldErrors[`repositories.${repositoryIndex}.${field}`];
}

export function RepositoriesEditor({
  profileId,
  repositories,
  projects,
  onChange,
  fieldErrors,
}: {
  profileId: string;
  repositories: ProfileRepositoryDraft[];
  projects: ProfileProjectDraft[];
  onChange: (repositories: ProfileRepositoryDraft[]) => void;
  fieldErrors: Record<string, string>;
}) {
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | null>(repositories[0]?.id ?? null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedRepository = repositories.find((repository) => repository.id === selectedRepositoryId) ?? null;
  const selectedIndex = selectedRepository ? repositories.findIndex((repository) => repository.id === selectedRepository.id) : -1;

  function updateRepositories(nextRepositories: ProfileRepositoryDraft[]) {
    onChange(nextRepositories.map((repository, position) => ({ ...repository, position })));
  }

  function addRepository() {
    const repository = createRepository(profileId, repositories.length);
    setSelectedRepositoryId(repository.id);
    setMessage(null);
    updateRepositories([...repositories, repository]);
  }

  function patchRepository<K extends keyof ProfileRepositoryDraft>(id: string, key: K, value: ProfileRepositoryDraft[K]) {
    updateRepositories(repositories.map((repository) => repository.id === id ? { ...repository, [key]: value, updatedAt: timestamp() } : repository));
  }

  function patchText(id: string, key: keyof Pick<ProfileRepositoryDraft, "repositoryName" | "providerLabel" | "repositoryUrl" | "description" | "language" | "framework" | "starsText" | "forksText" | "activityLabel">, value: string) {
    patchRepository(id, key, value);
  }

  function patchTopics(id: string, value: string) {
    patchRepository(id, "topics", value.split(",").map((topic) => topic.trim()).filter(Boolean));
  }

  function moveRepository(id: string, direction: "up" | "down") {
    const index = repositories.findIndex((repository) => repository.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= repositories.length) return;
    const next = [...repositories];
    const [selected] = next.splice(index, 1);
    next.splice(target, 0, selected!);
    updateRepositories(next);
  }

  function toggleFeatured(repository: ProfileRepositoryDraft) {
    if (!repository.isFeatured && repositories.filter((item) => item.isFeatured).length >= MAX_FEATURED_REPOSITORIES) {
      setMessage(`Choose ${MAX_FEATURED_REPOSITORIES} featured repositories or fewer.`);
      return;
    }
    setMessage(null);
    patchRepository(repository.id, "isFeatured", !repository.isFeatured);
  }

  function removeRepository(id: string) {
    setSelectedRepositoryId((current) => current === id ? null : current);
    updateRepositories(repositories.filter((repository) => repository.id !== id));
  }

  function addLink(repository: ProfileRepositoryDraft, kind: RepositoryLinkKind) {
    const projectId = kind === "project" ? projects[0]?.id ?? "" : "";
    const link = createRepositoryLink(profileId, repository.id, kind, projectId, repository.links.length);
    patchRepository(repository.id, "links", [...repository.links, link]);
  }

  function patchLink(repositoryId: string, linkId: string, key: "projectId" | "label" | "url" | "isEnabled", value: string | boolean) {
    const repository = repositories.find((item) => item.id === repositoryId);
    if (!repository) return;
    patchRepository(repositoryId, "links", repository.links.map((link) => link.id === linkId ? { ...link, [key]: value, updatedAt: timestamp() } : link));
  }

  function removeLink(repositoryId: string, linkId: string) {
    const repository = repositories.find((item) => item.id === repositoryId);
    if (!repository) return;
    patchRepository(repositoryId, "links", repository.links.filter((link) => link.id !== linkId).map((link, position) => ({ ...link, position })));
  }

  return (
    <div className="space-y-6">
      <Panel tone="dark">
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <Badge tone="accent">Nodivra Repos</Badge>
              <h2 className="font-display text-3xl tracking-tight text-sand-50 sm:text-4xl">Show the code, keep the context.</h2>
              <p className="max-w-2xl text-sm leading-7 text-sand-200/80">Curate repositories manually. Nodivra never scrapes providers, claims live stats, or syncs external APIs.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={showPreview ? "primary" : "secondary"} onClick={() => setShowPreview((value) => !value)}>{showPreview ? "Hide preview" : "Preview repo"}</Button>
              <Button type="button" variant="secondary" onClick={addRepository} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add repository</Button>
            </div>
          </div>
          {fieldErrors.repositories ? <p className="rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-300/30">{fieldErrors.repositories}</p> : null}
          {message ? <p className="rounded-2xl bg-sand-100/10 px-4 py-3 text-sm text-sand-100 ring-1 ring-sand-200/20">{message}</p> : null}
        </div>
      </Panel>

      {showPreview && selectedRepository ? <RepositoryDetailPreview repository={draftToPublicRepository(selectedRepository)} projects={projects.map(draftToPublicProject)} /> : null}

      {repositories.length === 0 ? (
        <EmptyState title="Start your repository archive" description="Add the repositories that best show how you think and build. Keep the description useful and the stats clearly manual." action={<Button type="button" variant="secondary" onClick={addRepository} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add your first repository</Button>} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="space-y-4">
            {repositories.map((repository, index) => (
              <article key={repository.id} className={cn("rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[background-color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]", selectedRepositoryId === repository.id && "bg-sand-100/10")}>
                <div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-[10px] font-semibold tracking-[0.18em] text-ink-950">{String(index + 1).padStart(2, "0")}</div>
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={repository.isPublished ? "success" : "muted"}>{repository.isPublished ? "Published" : "Draft"}</Badge>
                          {repository.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
                          <Badge tone="muted">{statusLabels[repository.status]}</Badge>
                        </div>
                        <div>
                          <h3 className="font-display text-2xl tracking-tight text-sand-50">{repository.repositoryName}</h3>
                          <p className="mt-2 text-sm leading-7 text-sand-200/75">{repository.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                      <Button type="button" variant={selectedRepositoryId === repository.id ? "primary" : "secondary"} onClick={() => setSelectedRepositoryId(repository.id)}>{selectedRepositoryId === repository.id ? "Editing" : "Edit repository"}</Button>
                      <Button type="button" variant="ghost" onClick={() => moveRepository(repository.id, "up")} disabled={index === 0} trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}>Up</Button>
                      <Button type="button" variant="ghost" onClick={() => moveRepository(repository.id, "down")} disabled={index === repositories.length - 1} trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}>Down</Button>
                      <Button type="button" variant="ghost" onClick={() => toggleFeatured(repository)}>{repository.isFeatured ? "Unfeature" : "Feature"}</Button>
                      <Button type="button" variant="ghost" onClick={() => patchRepository(repository.id, "isPublished", !repository.isPublished)}>{repository.isPublished ? "Unpublish" : "Publish"}</Button>
                      <Button type="button" variant="danger" onClick={() => removeRepository(repository.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10">
              <div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
                {selectedRepository ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sand-300/70">Repository settings</p>
                      <h3 className="mt-2 font-display text-2xl tracking-tight text-sand-50">{selectedRepository.repositoryName}</h3>
                      <p className="mt-2 text-xs leading-6 text-sand-300/70">Manual repository records stay stable and transparent. Use the preview to check the public reading order.</p>
                    </div>
                    <div className="space-y-5 border-t border-white/10 pt-5">
                      <FieldShell label="Repository name" hint="1 to 72 characters." error={errorFor(fieldErrors, selectedIndex, "repositoryName")}><Input value={selectedRepository.repositoryName} onChange={(event) => patchText(selectedRepository.id, "repositoryName", event.target.value)} /></FieldShell>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Provider" hint="A label only, not an integration." error={errorFor(fieldErrors, selectedIndex, "providerLabel")}><Input value={selectedRepository.providerLabel} onChange={(event) => patchText(selectedRepository.id, "providerLabel", event.target.value)} /></FieldShell><FieldShell label="Status" error={errorFor(fieldErrors, selectedIndex, "status")}><Select value={selectedRepository.status} onChange={(event) => patchRepository(selectedRepository.id, "status", event.target.value as RepositoryStatus)}>{REPOSITORY_STATUSES.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</Select></FieldShell></div>
                      <FieldShell label="Repository URL" hint="http or https only. Nodivra does not fetch it." error={errorFor(fieldErrors, selectedIndex, "repositoryUrl")}><Input value={selectedRepository.repositoryUrl} placeholder="https://github.com/..." onChange={(event) => patchText(selectedRepository.id, "repositoryUrl", event.target.value)} /></FieldShell>
                      <FieldShell label="Description" hint="280 characters or fewer." error={errorFor(fieldErrors, selectedIndex, "description")}><Textarea value={selectedRepository.description} onChange={(event) => patchText(selectedRepository.id, "description", event.target.value)} /></FieldShell>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Language" error={errorFor(fieldErrors, selectedIndex, "language")}><Input value={selectedRepository.language} placeholder="TypeScript" onChange={(event) => patchText(selectedRepository.id, "language", event.target.value)} /></FieldShell><FieldShell label="Framework" error={errorFor(fieldErrors, selectedIndex, "framework")}><Input value={selectedRepository.framework} placeholder="Next.js" onChange={(event) => patchText(selectedRepository.id, "framework", event.target.value)} /></FieldShell></div>
                      <FieldShell label="Topics" hint="Comma-separated, up to eight." error={errorFor(fieldErrors, selectedIndex, "topics")}><Input value={selectedRepository.topics.join(", ")} onChange={(event) => patchTopics(selectedRepository.id, event.target.value)} /></FieldShell>
                      <div className="space-y-4 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Manual stats</p><p className="mt-1 text-xs leading-5 text-sand-300/65">Only show values you entered yourself.</p></div><Button type="button" variant={selectedRepository.isStatsVisible ? "primary" : "secondary"} onClick={() => patchRepository(selectedRepository.id, "isStatsVisible", !selectedRepository.isStatsVisible)}>{selectedRepository.isStatsVisible ? "Visible" : "Hidden"}</Button></div>{selectedRepository.isStatsVisible ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Stars text" error={errorFor(fieldErrors, selectedIndex, "starsText")}><Input value={selectedRepository.starsText} placeholder="128" onChange={(event) => patchText(selectedRepository.id, "starsText", event.target.value)} /></FieldShell><FieldShell label="Forks text" error={errorFor(fieldErrors, selectedIndex, "forksText")}><Input value={selectedRepository.forksText} placeholder="18" onChange={(event) => patchText(selectedRepository.id, "forksText", event.target.value)} /></FieldShell><FieldShell label="Activity label" error={errorFor(fieldErrors, selectedIndex, "activityLabel")}><Input value={selectedRepository.activityLabel} placeholder="Updated weekly" onChange={(event) => patchText(selectedRepository.id, "activityLabel", event.target.value)} /></FieldShell></div> : null}</div>
                      <div className="flex flex-wrap gap-2"><Button type="button" variant={selectedRepository.isFeatured ? "primary" : "secondary"} onClick={() => toggleFeatured(selectedRepository)}>{selectedRepository.isFeatured ? "Featured repository" : "Mark featured"}</Button><Button type="button" variant={selectedRepository.isPublished ? "primary" : "secondary"} onClick={() => patchRepository(selectedRepository.id, "isPublished", !selectedRepository.isPublished)}>{selectedRepository.isPublished ? "Published" : "Keep private"}</Button></div>

                      <div className="space-y-4 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10">
                        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-sand-200/70" /><p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Related links</p></div><div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => addLink(selectedRepository, "project")} disabled={projects.length === 0}>Project</Button><Button type="button" variant="ghost" onClick={() => addLink(selectedRepository, "stack")}>Stack</Button></div></div>
                        {selectedRepository.links.length === 0 ? <p className="text-xs leading-5 text-sand-300/65">Connect this repository to a published Project or a manual Stack item.</p> : null}
                        {selectedRepository.links.map((link, linkIndex) => <div key={link.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-3"><div className="flex items-center justify-between gap-3"><Badge tone="muted">{link.kind === "project" ? "Project" : "Stack"}</Badge><Button type="button" variant="ghost" onClick={() => removeLink(selectedRepository.id, link.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Remove</Button></div>{link.kind === "project" ? <FieldShell label="Project" error={fieldErrors[`repositories.${selectedIndex}.links.${linkIndex}.projectId`]}><Select value={link.projectId} onChange={(event) => patchLink(selectedRepository.id, link.id, "projectId", event.target.value)}><option value="">Choose a project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}</Select></FieldShell> : <><FieldShell label="Stack label" error={fieldErrors[`repositories.${selectedIndex}.links.${linkIndex}.label`]}><Input value={link.label} onChange={(event) => patchLink(selectedRepository.id, link.id, "label", event.target.value)} /></FieldShell><FieldShell label="Stack URL" hint="http or https only." error={fieldErrors[`repositories.${selectedIndex}.links.${linkIndex}.url`]}><Input value={link.url} placeholder="https://..." onChange={(event) => patchLink(selectedRepository.id, link.id, "url", event.target.value)} /></FieldShell></>}</div>)}
                      </div>
                    </div>
                  </div>
                ) : <div className="space-y-4"><Badge tone="muted">Repository settings</Badge><h3 className="font-display text-2xl tracking-tight text-sand-50">Select a repository to edit it.</h3><p className="text-sm leading-7 text-sand-200/80">Keep the archive focused and use manual context to make each link worth opening.</p></div>}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
