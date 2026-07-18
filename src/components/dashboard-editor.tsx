"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PublicProfileCard } from "@/components/public-profile-card";
import { PublicBlocks } from "@/components/public-blocks";
import { BlocksEditor } from "@/components/blocks-editor";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  GlobeIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { buildHandleSuggestion, getTimeZoneOptions, workspaceDraftSchema } from "@/lib/validation";
import { buildPublicProfileSnapshot } from "@/lib/snapshot";
import { cn } from "@/lib/classnames";
import type {
  ProfileBlockDraft,
  ProfileLinkDraft,
  ProfileSectionDraft,
  WorkspaceSnapshot,
} from "@/types/nodivra";
import {
  Badge,
  Button,
  Divider,
  EmptyState,
  FieldShell,
  Input,
  Panel,
  Select,
  StatusPill,
  Textarea,
} from "@/components/ui";

type StatusTone = "muted" | "success" | "danger";

type Notice = {
  tone: StatusTone;
  message: string;
} | null;

type EditorTab = "profile" | "blocks";
type PreviewDevice = "desktop" | "mobile";

function createDraftLink(profileId: string, position: number): ProfileLinkDraft {
  const timestamp = new Date().toISOString();
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `link-${timestamp}-${position}`,
    profileId,
    title: "Untitled link",
    url: "https://example.com",
    iconLabel: "",
    visibility: "public",
    isEnabled: false,
    position,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function statusCopy(workspace: WorkspaceSnapshot, isDirty: boolean) {
  if (isDirty) {
    return {
      label: "Unsaved changes",
      tone: "accent" as const,
      note: "Your draft is private. Save or publish when it feels ready.",
    };
  }

  if (workspace.profile.isPublished) {
    return {
      label: "Published live",
      tone: "success" as const,
      note: "The public page is synced to the latest snapshot.",
    };
  }

  return {
    label: "Draft only",
    tone: "muted" as const,
    note: "Draft edits are private until you publish them.",
  };
}

function getFieldError(fieldErrors: Record<string, string>, field: string) {
  return fieldErrors[field];
}

function getLinkError(
  fieldErrors: Record<string, string>,
  index: number,
  field: keyof ProfileLinkDraft,
) {
  return fieldErrors[`links.${index}.${field}`];
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DashboardEditor({
  initialWorkspace,
  demoMode,
}: {
  initialWorkspace: WorkspaceSnapshot;
  demoMode: boolean;
}) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [notice, setNotice] = useState<Notice>(null);
  const [savingAction, setSavingAction] = useState<"save" | "publish" | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<EditorTab>("profile");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [isDirty, setIsDirty] = useState(false);

  const draftCheck = useMemo(
    () => workspaceDraftSchema.safeParse(workspace),
    [workspace],
  );

  const handleSuggestion = buildHandleSuggestion(
    workspace.profile.displayName || workspace.profile.handle || "your-handle",
  );
  const livePreview = buildPublicProfileSnapshot(
    workspace.profile,
    workspace.links,
    workspace.profile.updatedAt,
    workspace.sections,
    workspace.blocks,
  );
  const status = statusCopy(workspace, isDirty);
  const publicUrl = workspace.profile.handle
    ? `/u/${workspace.profile.handle}`
    : null;

  function patchProfile(
    key: keyof WorkspaceSnapshot["profile"],
    value: string | boolean,
  ) {
    setIsDirty(true);
    setWorkspace((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [key]: value,
        isPublished: false,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function patchLink(
    id: string,
    key: keyof ProfileLinkDraft,
    value: string | boolean | number,
  ) {
    setIsDirty(true);
    setWorkspace((current) => ({
      ...current,
      profile: {
        ...current.profile,
        isPublished: false,
        updatedAt: new Date().toISOString(),
      },
      links: current.links.map((link) =>
        link.id === id
          ? {
              ...link,
              [key]: value,
              updatedAt: new Date().toISOString(),
            }
          : link,
      ),
    }));
  }

  function addLink() {
    setIsDirty(true);
    setWorkspace((current) => {
      const nextLink = createDraftLink(
        current.profile.id,
        current.links.length,
      );
      return {
        ...current,
        profile: {
          ...current.profile,
          isPublished: false,
          updatedAt: new Date().toISOString(),
        },
        links: [...current.links, nextLink],
      };
    });
  }

  function patchBlocks(sections: ProfileSectionDraft[], blocks: ProfileBlockDraft[]) {
    setIsDirty(true);
    setWorkspace((current) => ({
      ...current,
      profile: {
        ...current.profile,
        isPublished: false,
        updatedAt: new Date().toISOString(),
      },
      sections,
      blocks,
    }));
  }

  function removeLink(id: string) {
    setIsDirty(true);
    setWorkspace((current) => ({
      ...current,
      profile: {
        ...current.profile,
        isPublished: false,
        updatedAt: new Date().toISOString(),
      },
      links: current.links
        .filter((link) => link.id !== id)
        .map((link, index) => ({ ...link, position: index })),
    }));
  }

  function moveLink(id: string, direction: "up" | "down") {
    setIsDirty(true);
    setWorkspace((current) => {
      const index = current.links.findIndex((link) => link.id === id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || targetIndex < 0 || targetIndex >= current.links.length) {
        return current;
      }

      const nextLinks = [...current.links];
      const [selected] = nextLinks.splice(index, 1);
      nextLinks.splice(targetIndex, 0, selected);

      return {
        ...current,
        profile: {
          ...current.profile,
          isPublished: false,
          updatedAt: new Date().toISOString(),
        },
        links: nextLinks.map((link, position) => ({
          ...link,
          position,
          updatedAt: position === targetIndex ? new Date().toISOString() : link.updatedAt,
        })),
      };
    });
  }

  async function saveWorkspace(action: "save" | "publish") {
    setSavingAction(action);
    setNotice(null);
    setFieldErrors({});

    const response = await fetch("/api/workspace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        workspace,
      }),
    });

    const payload = (await response.json()) as
      | { ok: true; workspace: WorkspaceSnapshot }
      | { ok: false; message: string; fieldErrors?: Record<string, string> };

    if (!response.ok || !payload.ok) {
      setSavingAction(null);
      setNotice({
        tone: "danger",
        message: payload.ok ? "Unable to save workspace." : payload.message,
      });
      setFieldErrors(payload.ok ? {} : payload.fieldErrors ?? {});
      return;
    }

    setWorkspace(payload.workspace);
    setIsDirty(false);
    setSavingAction(null);
    setNotice({
      tone: "success",
      message:
        action === "publish"
          ? "Published the live profile snapshot."
          : "Draft saved without publishing.",
    });
  }

  function revertToPublished() {
    const published = workspace.published;
    if (!published) {
      return;
    }

    const now = new Date().toISOString();
    const existingLinks = new Map(workspace.links.map((link) => [link.id, link]));
    const nextLinks = published.publishedLinks.map((link) => {
      const existing = existingLinks.get(link.id);
      return {
        id: link.id,
        profileId: workspace.profile.id,
        title: link.title,
        url: link.url,
        iconLabel: link.iconLabel,
        visibility: link.visibility,
        isEnabled: true,
        position: link.position,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
    });
    const nextSections = published.publishedSections.map((section) => ({
      id: section.id,
      profileId: workspace.profile.id,
      title: section.title,
      slug: section.slug,
      position: section.position,
      isVisible: true,
      isCollapsed: false,
      createdAt: now,
      updatedAt: now,
    }));
    const nextBlocks = published.publishedBlocks.map((block) => ({
      id: block.id,
      profileId: workspace.profile.id,
      sectionId: block.sectionId,
      type: block.type,
      title: block.title,
      visibility: "public" as const,
      position: block.position,
      configuration: block.configuration,
      createdAt: now,
      updatedAt: now,
    }));

    setWorkspace((current) => ({
      ...current,
      profile: {
        ...current.profile,
        handle: published.handle,
        displayName: published.displayName,
        headline: published.headline,
        bio: published.bio,
        locationText: published.locationText,
        timezone: published.timezone,
        avatarInitials: published.avatarInitials,
        avatarUrl: published.avatarUrl,
        primaryCtaLabel: published.primaryCtaLabel,
        primaryCtaUrl: published.primaryCtaUrl,
        availabilityStatus: published.availabilityStatus,
        isPublished: true,
        updatedAt: now,
      },
      links: nextLinks,
      sections: nextSections,
      blocks: nextBlocks,
    }));
    setIsDirty(false);
    setNotice({ tone: "success", message: "Draft restored to the latest published snapshot." });
    setFieldErrors({});
  }

  async function copyPublicLink() {
    if (!publicUrl) {
      setNotice({
        tone: "danger",
        message: "Add a handle before copying the public link.",
      });
      return;
    }

    const absolute = new URL(publicUrl, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(absolute);
      setNotice({
        tone: "success",
        message: "Copied the public page link.",
      });
    } catch {
      setNotice({
        tone: "danger",
        message: "Clipboard access was blocked by the browser.",
      });
    }
  }

  async function sharePublicLink() {
    if (!publicUrl) {
      setNotice({
        tone: "danger",
        message: "Add a handle before sharing the public link.",
      });
      return;
    }

    const absolute = new URL(publicUrl, window.location.origin).toString();
    if (navigator.share) {
      await navigator.share({
        title: workspace.profile.displayName || "Nodivra profile",
        url: absolute,
      });
      return;
    }

    await copyPublicLink();
  }

  const canSave = draftCheck.success && savingAction === null && isDirty;

  return (
    <div className="space-y-8 pb-24 lg:pb-0">
      <Panel tone="dark" className="overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={demoMode ? "accent" : "muted"}>
                {demoMode ? "Demo mode" : "Connected to Supabase"}
              </Badge>
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-5xl">
                Build the page, then publish the snapshot.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-sand-200/80 sm:text-base">
                Your draft lives privately until you hit publish. The live preview updates as you type, reorder, and switch links on or off.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={copyPublicLink}
              disabled={!publicUrl}
              trailingIcon={<CopyIcon className="h-3.5 w-3.5" />}
            >
              Copy link
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={sharePublicLink}
              disabled={!publicUrl}
              trailingIcon={<ArrowUpRightIcon className="h-3.5 w-3.5" />}
            >
              Share
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canSave}
              onClick={() => void saveWorkspace("save")}
            >
              {savingAction === "save" ? "Saving..." : "Save draft"}
            </Button>
            <Button
              type="button"
              disabled={!canSave}
              onClick={() => void saveWorkspace("publish")}
              trailingIcon={<ArrowUpRightIcon className="h-3.5 w-3.5" />}
            >
              {savingAction === "publish" ? "Publishing..." : "Publish live"}
            </Button>
          </div>
        </div>

        <Divider className="my-6" />

        <div className="flex flex-wrap items-center gap-2 rounded-[1.35rem] bg-white/5 p-1.5 ring-1 ring-white/10" role="tablist" aria-label="Editor views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex-1 rounded-full px-4 py-3 text-left text-sm transition-[transform,background-color,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99] sm:flex-none sm:min-w-[180px]",
              activeTab === "profile" ? "bg-sand-100 text-ink-950" : "text-sand-200/70 hover:bg-white/10 hover:text-sand-50",
            )}
          >
            <span className="block font-medium">Profile</span>
            <span className={cn("mt-1 block text-xs", activeTab === "profile" ? "text-ink-700" : "text-sand-300/60")}>Identity and primary links</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "blocks"}
            onClick={() => setActiveTab("blocks")}
            className={cn(
              "flex-1 rounded-full px-4 py-3 text-left text-sm transition-[transform,background-color,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99] sm:flex-none sm:min-w-[180px]",
              activeTab === "blocks" ? "bg-sand-100 text-ink-950" : "text-sand-200/70 hover:bg-white/10 hover:text-sand-50",
            )}
          >
            <span className="block font-medium">Blocks</span>
            <span className={cn("mt-1 block text-xs", activeTab === "blocks" ? "text-ink-700" : "text-sand-300/60")}>Sections and proof of work</span>
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Handle</p>
            <p className="mt-2 font-mono text-sm text-sand-50">
              {workspace.profile.handle ? `@${workspace.profile.handle}` : "Choose your handle"}
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Public URL</p>
            <p className="mt-2 text-sm text-sand-50">
              {publicUrl ? publicUrl : "The public URL appears after a handle is set."}
            </p>
          </div>
          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Live status</p>
            <p className="mt-2 text-sm text-sand-50">{status.note}</p>
          </div>
        </div>

        {notice ? (
          <div
            className={cn(
              "mt-6 rounded-[1.35rem] border px-4 py-3 text-sm",
              notice.tone === "success"
                ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                : notice.tone === "danger"
                  ? "border-rose-300/30 bg-rose-400/10 text-rose-100"
                  : "border-white/10 bg-white/5 text-sand-100",
            )}
          >
            {notice.message}
          </div>
        ) : null}
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="space-y-6">
          {activeTab === "profile" ? (
            <>
          <Panel tone="dark">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">
                    Profile onboarding
                  </p>
                  <h2 className="mt-2 text-xl font-medium text-sand-50">
                    Make the handle and identity feel deliberate.
                  </h2>
                </div>
                <Badge tone={draftCheck.success ? "success" : "muted"}>
                  {draftCheck.success ? "Ready to save" : "Needs attention"}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldShell
                  label="Handle"
                  hint={`Suggested: @${handleSuggestion}`}
                  error={getFieldError(fieldErrors, "profile.handle")}
                >
                  <Input
                    value={workspace.profile.handle}
                    placeholder="your-handle"
                    onChange={(event) => patchProfile("handle", event.target.value)}
                  />
                </FieldShell>

                <FieldShell
                  label="Display name"
                  hint="This appears first on the public page."
                  error={getFieldError(fieldErrors, "profile.displayName")}
                >
                  <Input
                    value={workspace.profile.displayName}
                    placeholder="Jamie Fontanilla"
                    onChange={(event) => patchProfile("displayName", event.target.value)}
                  />
                </FieldShell>

                <FieldShell
                  label="Headline"
                  hint="A short one-line positioning statement."
                  error={getFieldError(fieldErrors, "profile.headline")}
                >
                  <Input
                    value={workspace.profile.headline}
                    placeholder="Designing developer surfaces that feel intentional."
                    onChange={(event) => patchProfile("headline", event.target.value)}
                  />
                </FieldShell>

                <FieldShell
                  label="Location"
                  hint="Short text only."
                  error={getFieldError(fieldErrors, "profile.locationText")}
                >
                  <Input
                    value={workspace.profile.locationText}
                    placeholder="Austin, TX"
                    onChange={(event) => patchProfile("locationText", event.target.value)}
                  />
                </FieldShell>

                <FieldShell
                  label="Timezone"
                  hint="Used for availability context."
                  error={getFieldError(fieldErrors, "profile.timezone")}
                >
                  <Select
                    value={workspace.profile.timezone}
                    onChange={(event) => patchProfile("timezone", event.target.value)}
                  >
                    {getTimeZoneOptions().map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </Select>
                </FieldShell>

                <FieldShell
                  label="Availability"
                  hint="What should the public page say?"
                  error={getFieldError(fieldErrors, "profile.availabilityStatus")}
                >
                  <Select
                    value={workspace.profile.availabilityStatus}
                    onChange={(event) => patchProfile("availabilityStatus", event.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="away">Away</option>
                    <option value="offline">Offline</option>
                  </Select>
                </FieldShell>

                <FieldShell
                  label="Avatar initials"
                  hint="Up to four characters."
                  error={getFieldError(fieldErrors, "profile.avatarInitials")}
                >
                  <Input
                    value={workspace.profile.avatarInitials}
                    placeholder="JF"
                    maxLength={4}
                    onChange={(event) => patchProfile("avatarInitials", event.target.value)}
                  />
                </FieldShell>

                <FieldShell
                  label="Avatar image URL"
                  hint="Optional https image URL."
                  error={getFieldError(fieldErrors, "profile.avatarUrl")}
                >
                  <Input
                    value={workspace.profile.avatarUrl}
                    placeholder="https://..."
                    onChange={(event) => patchProfile("avatarUrl", event.target.value)}
                  />
                </FieldShell>

                <FieldShell
                  label="Primary CTA label"
                  hint="Optional, but useful for a standout action."
                  error={getFieldError(fieldErrors, "profile.primaryCtaLabel")}
                >
                  <Input
                    value={workspace.profile.primaryCtaLabel}
                    placeholder="Book a call"
                    onChange={(event) => patchProfile("primaryCtaLabel", event.target.value)}
                  />
                </FieldShell>

                <FieldShell
                  label="Primary CTA URL"
                  hint="http or https only."
                  error={getFieldError(fieldErrors, "profile.primaryCtaUrl")}
                >
                  <Input
                    value={workspace.profile.primaryCtaUrl}
                    placeholder="https://cal.com/..."
                    onChange={(event) => patchProfile("primaryCtaUrl", event.target.value)}
                  />
                </FieldShell>
              </div>

              <FieldShell
                label="Short bio"
                hint="Keep it under 240 characters."
                error={getFieldError(fieldErrors, "profile.bio")}
              >
                <Textarea
                  value={workspace.profile.bio}
                  placeholder="A compact bio that explains what you build, what you care about, and who you help."
                  onChange={(event) => patchProfile("bio", event.target.value)}
                />
              </FieldShell>
            </div>
          </Panel>

          <Panel tone="dark">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Links</p>
                  <h2 className="mt-2 text-xl font-medium text-sand-50">
                    Order the links the way you want them to read.
                  </h2>
                </div>
                <Button type="button" variant="secondary" onClick={addLink} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>
                  Add link
                </Button>
              </div>

              {workspace.links.length === 0 ? (
                <EmptyState
                  title="No links yet"
                  description="Add a link card for a project, social profile, writing archive, or contact method. Disabled links stay in the draft until you enable them."
                  action={
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addLink}
                      trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}
                    >
                      Add your first link
                    </Button>
                  }
                />
              ) : null}

              <div className="space-y-4">
                {workspace.links.map((link, index) => (
                  <div
                    key={link.id}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sand-100 text-[11px] font-semibold tracking-[0.24em] text-ink-950 ring-1 ring-sand-200/50">
                          {link.iconLabel || String(index + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-sand-50">Link {index + 1}</p>
                          <p className="text-xs text-sand-200/70">Move, hide, or disable before publishing.</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => moveLink(link.id, "up")}
                          disabled={index === 0}
                          trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}
                        >
                          Up
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => moveLink(link.id, "down")}
                          disabled={index === workspace.links.length - 1}
                          trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}
                        >
                          Down
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => removeLink(link.id)}
                          trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <FieldShell
                        label="Title"
                        hint="Visible on the public page."
                        error={getLinkError(fieldErrors, index, "title")}
                      >
                        <Input
                          value={link.title}
                          onChange={(event) => patchLink(link.id, "title", event.target.value)}
                        />
                      </FieldShell>

                      <FieldShell
                        label="URL"
                        hint="http or https only."
                        error={getLinkError(fieldErrors, index, "url")}
                      >
                        <Input
                          value={link.url}
                          onChange={(event) => patchLink(link.id, "url", event.target.value)}
                        />
                      </FieldShell>

                      <FieldShell
                        label="Icon label"
                        hint="Optional short code."
                        error={getLinkError(fieldErrors, index, "iconLabel")}
                      >
                        <Input
                          value={link.iconLabel}
                          onChange={(event) => patchLink(link.id, "iconLabel", event.target.value)}
                        />
                      </FieldShell>

                      <FieldShell
                        label="Visibility"
                        hint="Primary, social, or hidden."
                        error={getLinkError(fieldErrors, index, "visibility")}
                      >
                        <Select
                          value={link.visibility}
                          onChange={(event) => patchLink(link.id, "visibility", event.target.value)}
                        >
                          <option value="public">Public</option>
                          <option value="social">Social</option>
                          <option value="hidden">Hidden</option>
                        </Select>
                      </FieldShell>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-sand-100">
                        <input
                          type="checkbox"
                          checked={link.isEnabled}
                          onChange={(event) => patchLink(link.id, "isEnabled", event.target.checked)}
                          className="h-4 w-4 rounded border-white/20 bg-transparent text-sand-100 focus:ring-sand-200/20"
                        />
                        Enabled
                      </label>
                      <Badge tone={link.isEnabled ? "success" : "muted"}>
                        {link.isEnabled ? "Shown in preview" : "Hidden until enabled"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel tone="dark">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Audit trail</p>
                  <h2 className="mt-2 text-xl font-medium text-sand-50">
                    Recent actions on this workspace
                  </h2>
                </div>
                <Badge tone="muted">{workspace.auditLogs.length} entries</Badge>
              </div>

              {workspace.auditLogs.length === 0 ? (
                <EmptyState
                  title="No audit entries yet"
                  description="Publishing and saving will create a private record of the change."
                />
              ) : (
                <div className="space-y-3">
                  {workspace.auditLogs.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between gap-4 rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-sand-50">{entry.summary}</p>
                        <p className="text-xs text-sand-200/70">
                          {entry.action} · {entry.entityType}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-xs text-sand-300/70">
                        {formatTimestamp(entry.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>
            </>
          ) : (
            <BlocksEditor
              profileId={workspace.profile.id}
              sections={workspace.sections}
              blocks={workspace.blocks}
              onChange={patchBlocks}
              fieldErrors={fieldErrors}
            />
          )}
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Panel tone="dark">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Live preview</p>
                  <h2 className="mt-2 text-xl font-medium text-sand-50">
                    See the public page as you build it.
                  </h2>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge tone={isDirty ? "accent" : workspace.profile.isPublished ? "success" : "muted"}>
                    {isDirty ? "Draft changes" : workspace.profile.isPublished ? "Live" : "Draft"}
                  </Badge>
                  <div className="flex rounded-full bg-white/5 p-1 ring-1 ring-white/10" role="tablist" aria-label="Preview size">
                    {(["desktop", "mobile"] as const).map((device) => (
                      <button
                        key={device}
                        type="button"
                        role="tab"
                        aria-selected={previewDevice === device}
                        onClick={() => setPreviewDevice(device)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition-[transform,background-color,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                          previewDevice === device ? "bg-white/10 text-sand-50" : "text-sand-300/60 hover:text-sand-100",
                        )}
                      >
                        {device}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={cn(
                "mx-auto transition-[max-width] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                previewDevice === "mobile" ? "max-w-[390px]" : "max-w-none",
              )}>
                <PublicProfileCard profile={livePreview} mode="preview" />
                <PublicBlocks
                  sections={livePreview.publishedSections}
                  blocks={livePreview.publishedBlocks}
                />
              </div>
            </div>
          </Panel>

          <Panel tone="dark">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Publish snapshot</p>
                  <h2 className="mt-2 text-xl font-medium text-sand-50">
                    The live page waits for the publish action.
                  </h2>
                </div>
                <StatusPill tone={workspace.published ? "success" : "muted"}>
                  {workspace.published ? "Snapshot exists" : "Not published yet"}
                </StatusPill>
              </div>

              {workspace.published ? (
                <div className="space-y-4 rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sand-100 text-ink-950 ring-1 ring-sand-200/50">
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-sand-50">Last published</p>
                      <p className="text-xs text-sand-200/70">
                        {formatTimestamp(workspace.published.publishedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">
                        Published links
                      </p>
                      <p className="mt-2 text-lg font-medium text-sand-50">
                        {workspace.published.publishedLinks.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">
                        Handle
                      </p>
                      <p className="mt-2 text-lg font-medium text-sand-50">
                        @{workspace.published.handle}
                      </p>
                    </div>
                  </div>
                  {publicUrl ? (
                    <Link
                      href={publicUrl}
                      className="inline-flex items-center gap-2 text-sm text-sand-100 underline decoration-white/20 underline-offset-4"
                    >
                      Open the live profile
                      <ArrowUpRightIcon className="h-4 w-4" />
                    </Link>
                  ) : null}
                  {isDirty ? (
                    <Button type="button" variant="ghost" onClick={revertToPublished}>
                      Revert to published
                    </Button>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  title="No snapshot yet"
                  description="The public route stays private until the profile and links are published."
                />
              )}
            </div>
          </Panel>

          <Panel tone="dark">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-950 ring-1 ring-sand-200/50">
                <GlobeIcon className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-sand-50">Publish rules</p>
                <ul className="space-y-2 text-sm leading-6 text-sand-200/80">
                  <li>• Unsafe URLs are blocked before saving.</li>
                  <li>• Reserved handles cannot be claimed.</li>
                  <li>• Hidden and disabled links stay out of the live snapshot.</li>
                  <li>• Draft changes never replace the live page until you publish.</li>
                </ul>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-30 flex items-center gap-3 rounded-[1.5rem] bg-ink-950/95 p-2 shadow-halo ring-1 ring-white/15 backdrop-blur-xl lg:hidden">
        <div className="min-w-0 flex-1 px-3">
          <p className="truncate text-xs font-medium text-sand-50">{isDirty ? "Unsaved changes" : "All changes saved"}</p>
          <p className="truncate text-[10px] uppercase tracking-[0.16em] text-sand-300/60">{activeTab === "blocks" ? "Blocks editor" : "Profile editor"}</p>
        </div>
        <Button type="button" variant="secondary" disabled={!canSave} onClick={() => void saveWorkspace("save")}>
          {savingAction === "save" ? "Saving" : "Save"}
        </Button>
        <Button type="button" disabled={!canSave} onClick={() => void saveWorkspace("publish")}>
          {savingAction === "publish" ? "Publishing" : "Publish"}
        </Button>
      </div>
    </div>
  );
}
