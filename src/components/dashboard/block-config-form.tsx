"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlockType } from "@/lib/validations/blocks";
import { getProjectLink, type ProjectDetail } from "@/lib/projects";

interface BlockConfigFormProps {
  blockType: BlockType;
  initialConfig: Record<string, unknown>;
  onSave: (config: Record<string, unknown>) => void;
  onCancel: () => void;
  saving: boolean;
  projects?: ProjectDetail[];
}

export function BlockConfigForm({
  blockType,
  initialConfig,
  onSave,
  onCancel,
  saving,
  projects = [],
}: BlockConfigFormProps) {
  const [config, setConfig] = useState<Record<string, unknown>>(initialConfig);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  function set(key: string, value: unknown) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function applyProject(projectId: string) {
    if (!projectId) {
      setConfig((prev) => ({ ...prev, project_id: null }));
      return;
    }

    const selectedProject = projects.find(
      (project) => project.project.id === projectId
    );
    if (!selectedProject) return;

    const liveUrl = getProjectLink(selectedProject.links, "live")?.url ?? null;
    const repoUrl =
      getProjectLink(selectedProject.links, "repository")?.url ?? null;
    const demoUrl = getProjectLink(selectedProject.links, "demo")?.url ?? null;

    setConfig((prev) => ({
      ...prev,
      project_id: projectId,
      name: selectedProject.project.title,
      description: selectedProject.project.summary,
      url: liveUrl ?? demoUrl,
      repo_url: repoUrl,
      technologies: selectedProject.technologies.map((item) => item.name),
      status:
        selectedProject.project.status === "archived"
          ? "archived"
          : selectedProject.project.status === "shipped"
            ? "active"
            : "wip",
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(config);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {blockType === "link_button" && (
        <>
          <Field label="Label" value={config.label as string ?? ""} onChange={(v) => set("label", v)} placeholder="My Website" required />
          <Field label="URL" value={config.url as string ?? ""} onChange={(v) => set("url", v)} placeholder="https://example.com" type="url" required />
          <Field label="Icon (emoji)" value={config.icon as string ?? ""} onChange={(v) => set("icon", v || null)} placeholder="🌐" />
        </>
      )}

      {blockType === "social_link" && (
        <>
          <Field label="Platform" value={config.platform as string ?? ""} onChange={(v) => set("platform", v)} placeholder="GitHub" required />
          <Field label="URL" value={config.url as string ?? ""} onChange={(v) => set("url", v)} placeholder="https://github.com/username" type="url" required />
          <Field label="Username" value={config.username as string ?? ""} onChange={(v) => set("username", v || null)} placeholder="@username" />
        </>
      )}

      {blockType === "project_highlight" && (
        <>
          {projects.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Reference project</Label>
              <select
                value={(config.project_id as string) ?? ""}
                onChange={(event) => applyProject(event.target.value)}
                className="flex h-11 w-full rounded-xl ring-1 ring-black/8 dark:ring-white/8 bg-white/60 dark:bg-white/4 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <option value="">Manual highlight</option>
                {projects.map((project) => (
                  <option key={project.project.id} value={project.project.id}>
                    {project.project.title}
                    {project.project.is_published ? "" : " (draft)"}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Field label="Project Name" value={config.name as string ?? ""} onChange={(v) => set("name", v)} placeholder="My Project" required />
          <Field label="Description" value={config.description as string ?? ""} onChange={(v) => set("description", v || null)} placeholder="A short description" />
          <Field label="Project URL" value={config.url as string ?? ""} onChange={(v) => set("url", v || null)} placeholder="https://project.com" type="url" />
          <Field label="Repo URL" value={config.repo_url as string ?? ""} onChange={(v) => set("repo_url", v || null)} placeholder="https://github.com/..." type="url" />
          <Field label="Technologies (comma-separated)" value={((config.technologies as string[]) ?? []).join(", ")} onChange={(v) => set("technologies", v.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="TypeScript, React, Node.js" />
          <SelectField label="Status" value={config.status as string ?? "active"} onChange={(v) => set("status", v)} options={["active", "wip", "archived"]} />
        </>
      )}

      {blockType === "text_section" && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Body</Label>
            <textarea
              value={config.body as string ?? ""}
              onChange={(e) => set("body", e.target.value)}
              rows={5}
              required
              placeholder="Write your content here..."
              className="flex w-full rounded-xl ring-1 ring-black/8 dark:ring-white/8 bg-white/60 dark:bg-white/4 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] resize-none"
            />
          </div>
          <SelectField label="Format" value={config.format as string ?? "plain"} onChange={(v) => set("format", v)} options={["plain", "markdown"]} />
        </>
      )}

      {blockType === "image_card" && (
        <>
          <Field label="Image URL" value={config.src as string ?? ""} onChange={(v) => set("src", v)} placeholder="https://example.com/image.jpg" type="url" required />
          <Field label="Alt Text" value={config.alt as string ?? ""} onChange={(v) => set("alt", v)} placeholder="Descriptive alt text" />
          <Field label="Caption" value={config.caption as string ?? ""} onChange={(v) => set("caption", v || null)} placeholder="Optional caption" />
          <SelectField label="Aspect Ratio" value={config.aspect_ratio as string ?? "auto"} onChange={(v) => set("aspect_ratio", v)} options={["auto", "16:9", "4:3", "1:1"]} />
        </>
      )}

      {blockType === "divider" && (
        <SelectField label="Style" value={config.style as string ?? "line"} onChange={(v) => set("style", v)} options={["line", "dots", "space"]} />
      )}

      {blockType === "cta_card" && (
        <>
          <Field label="Heading" value={config.heading as string ?? ""} onChange={(v) => set("heading", v)} placeholder="Let's work together" required />
          <Field label="Body" value={config.body as string ?? ""} onChange={(v) => set("body", v || null)} placeholder="A short description" />
          <Field label="Button Label" value={config.button_label as string ?? ""} onChange={(v) => set("button_label", v)} placeholder="Get in touch" required />
          <Field label="Button URL" value={config.button_url as string ?? ""} onChange={(v) => set("button_url", v)} placeholder="https://example.com/contact" type="url" required />
        </>
      )}

      {blockType === "availability_card" && (
        <>
          <SelectField label="Status" value={config.status as string ?? "available"} onChange={(v) => set("status", v)} options={["available", "limited", "unavailable"]} />
          <Field label="Message" value={config.message as string ?? ""} onChange={(v) => set("message", v || null)} placeholder="Open for freelance projects" />
          <Field label="Calendar URL (optional)" value={config.calendar_url as string ?? ""} onChange={(v) => set("calendar_url", v || null)} placeholder="https://cal.com/you" type="url" />
        </>
      )}

      {blockType === "external_resource" && (
        <>
          <Field label="Title" value={config.title as string ?? ""} onChange={(v) => set("title", v)} placeholder="Article title" required />
          <Field label="URL" value={config.url as string ?? ""} onChange={(v) => set("url", v)} placeholder="https://blog.example.com/post" type="url" required />
          <Field label="Description" value={config.description as string ?? ""} onChange={(v) => set("description", v || null)} placeholder="Brief summary" />
          <Field label="Source" value={config.source as string ?? ""} onChange={(v) => set("source", v || null)} placeholder="Blog name" />
        </>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving..." : "Save Block"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Reusable field components
function Field({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-11 w-full rounded-xl ring-1 ring-black/8 dark:ring-white/8 bg-white/60 dark:bg-white/4 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
