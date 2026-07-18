import { randomUUID } from "node:crypto";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { getDemoStore, getDemoWorkspaceSnapshot } from "@/lib/fallback-data";
import {
  buildPublicProfileSnapshot,
  sortBlocks,
  sortLinks,
  sortSections,
} from "@/lib/snapshot";
import {
  getInitials,
  isReservedHandle,
  profileBlockDraftSchema,
  profileDraftSchema,
  publicProfileSnapshotSchema,
  toFieldErrors,
  workspaceDraftSchema,
  type ProfileBlockDraftInput,
  type ProfileLinkDraftInput,
  type ProfileDraftInput,
  type ProfileSectionDraftInput,
  type WorkspaceDraftInput,
} from "@/lib/validation";
import {
  DEMO_HANDLE,
  DEMO_USER_ID,
  type AuditLogEntry,
  type AvailabilityStatus,
  type BlockConfiguration,
  type BlockType,
  type BlockVisibility,
  type ProfileBlockDraft,
  type LinkVisibility,
  type ProfileDraft,
  type ProfileLinkDraft,
  type ProfileSectionDraft,
  type PublicProfileSnapshot,
  type ViewerContext,
  type WorkspaceSnapshot,
} from "@/types/nodivra";

type ProfilesRow = {
  id: string;
  owner_id: string;
  handle: string;
  display_name: string;
  headline: string;
  bio: string;
  location_text: string;
  timezone: string;
  avatar_initials: string;
  avatar_url: string | null;
  primary_cta_label: string;
  primary_cta_url: string | null;
  availability_status: AvailabilityStatus;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProfileLinksRow = {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon_label: string;
  visibility: LinkVisibility;
  is_enabled: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProfileSectionsRow = {
  id: string;
  profile_id: string;
  title: string;
  slug: string;
  position: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProfileBlocksRow = {
  id: string;
  profile_id: string;
  section_id: string;
  type: BlockType;
  title: string;
  visibility: BlockVisibility;
  position: number;
  configuration: BlockConfiguration;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type PublicProfileSettingsRow = {
  id: string;
  profile_id: string;
  handle: string;
  display_name: string;
  headline: string;
  bio: string;
  location_text: string;
  timezone: string;
  avatar_initials: string;
  avatar_url: string | null;
  primary_cta_label: string;
  primary_cta_url: string | null;
  availability_status: AvailabilityStatus;
  published_links: unknown;
  published_sections: unknown;
  published_blocks: unknown;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

type AuditLogsRow = {
  id: string;
  profile_id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type LinkTimingSource = {
  id: string;
  createdAt?: string;
  created_at?: string;
};

export type WorkspaceMutationResult =
  | { ok: true; workspace: WorkspaceSnapshot }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

function nowIso() {
  return new Date().toISOString();
}

function createBlankProfile(ownerId: string): ProfileDraft {
  const timestamp = nowIso();
  return {
    id: randomUUID(),
    ownerId,
    handle: "",
    displayName: "",
    headline: "",
    bio: "",
    locationText: "",
    timezone: "UTC",
    avatarInitials: "",
    avatarUrl: "",
    primaryCtaLabel: "",
    primaryCtaUrl: "",
    availabilityStatus: "available",
    isPublished: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createBlankWorkspace(
  mode: ViewerContext["mode"],
  ownerId: string,
): WorkspaceSnapshot {
  return {
    profile: createBlankProfile(ownerId),
    links: [],
    sections: [],
    blocks: [],
    published: null,
    auditLogs: [],
    mode,
  };
}

function profileRowToDraft(row: ProfilesRow): ProfileDraft {
  return {
    id: row.id,
    ownerId: row.owner_id,
    handle: row.handle,
    displayName: row.display_name,
    headline: row.headline,
    bio: row.bio,
    locationText: row.location_text,
    timezone: row.timezone,
    avatarInitials: row.avatar_initials,
    avatarUrl: row.avatar_url ?? "",
    primaryCtaLabel: row.primary_cta_label,
    primaryCtaUrl: row.primary_cta_url ?? "",
    availabilityStatus: row.availability_status,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function linkRowToDraft(row: ProfileLinksRow): ProfileLinkDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    url: row.url,
    iconLabel: row.icon_label,
    visibility: row.visibility,
    isEnabled: row.is_enabled,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sectionRowToDraft(row: ProfileSectionsRow): ProfileSectionDraft {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    slug: row.slug,
    position: row.position,
    isVisible: row.is_visible,
    isCollapsed: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function blockRowToDraft(row: ProfileBlocksRow): ProfileBlockDraft | null {
  const parsed = profileBlockDraftSchema.safeParse({
    id: row.id,
    profileId: row.profile_id,
    sectionId: row.section_id,
    type: row.type,
    title: row.title,
    visibility: row.visibility,
    position: row.position,
    configuration: row.configuration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  return parsed.success ? parsed.data : null;
}

function auditRowToEntry(row: AuditLogsRow): AuditLogEntry {
  return {
    id: row.id,
    profileId: row.profile_id,
    actorId: row.actor_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

function auditEntryToRow(entry: AuditLogEntry): AuditLogsRow {
  return {
    id: entry.id,
    profile_id: entry.profileId,
    actor_id: entry.actorId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    summary: entry.summary,
    metadata: entry.metadata,
    created_at: entry.createdAt,
  };
}

function publicRowToSnapshot(row: PublicProfileSettingsRow): PublicProfileSnapshot | null {
  const candidate = {
    profileId: row.profile_id,
    handle: row.handle,
    displayName: row.display_name,
    headline: row.headline,
    bio: row.bio,
    locationText: row.location_text,
    timezone: row.timezone,
    avatarInitials: row.avatar_initials,
    avatarUrl: row.avatar_url ?? "",
    primaryCtaLabel: row.primary_cta_label,
    primaryCtaUrl: row.primary_cta_url ?? "",
    availabilityStatus: row.availability_status,
    publishedLinks: Array.isArray(row.published_links) ? row.published_links : [],
    publishedSections: Array.isArray(row.published_sections) ? row.published_sections : [],
    publishedBlocks: Array.isArray(row.published_blocks) ? row.published_blocks : [],
    publishedAt: row.published_at ?? row.updated_at,
    isPublished: row.is_published,
  };

  const parsed = publicProfileSnapshotSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

function normalizeAvatarInitials(
  displayName: string,
  avatarInitials: string,
  handle: string,
) {
  const value = avatarInitials.trim();
  if (value) {
    return value.slice(0, 4).toUpperCase();
  }

  return getInitials(displayName, handle);
}

function mapProfileInputToRow(
  profileId: string,
  ownerId: string,
  input: ProfileDraftInput,
  existing: ProfilesRow | null,
  publish: boolean,
): ProfilesRow {
  const timestamp = nowIso();
  const handle = input.handle.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const headline = input.headline.trim();
  const bio = input.bio.trim();
  const locationText = input.locationText.trim();
  const timezone = input.timezone.trim() || "UTC";
  const avatarInitials = normalizeAvatarInitials(
    displayName,
    input.avatarInitials,
    handle,
  );
  const avatarUrl = input.avatarUrl.trim();
  const primaryCtaLabel = input.primaryCtaLabel.trim();
  const primaryCtaUrl = input.primaryCtaUrl.trim();

  return {
    id: profileId,
    owner_id: ownerId,
    handle,
    display_name: displayName,
    headline,
    bio,
    location_text: locationText,
    timezone,
    avatar_initials: avatarInitials,
    avatar_url: avatarUrl.length > 0 ? avatarUrl : null,
    primary_cta_label: primaryCtaLabel,
    primary_cta_url: primaryCtaUrl.length > 0 ? primaryCtaUrl : null,
    availability_status: input.availabilityStatus,
    is_published: publish,
    created_at: existing?.created_at ?? timestamp,
    updated_at: timestamp,
    deleted_at: null,
  };
}

function mapLinkInputsToRows(
  profileId: string,
  links: ProfileLinkDraftInput[],
  existingLinks: LinkTimingSource[],
): ProfileLinksRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingLinks.map((link) => [link.id, link]));

  return sortLinks(links).map((link, index) => {
    const existing = existingById.get(link.id);
    return {
      id: link.id,
      profile_id: profileId,
      title: link.title.trim(),
      url: link.url.trim(),
      icon_label: link.iconLabel.trim(),
      visibility: link.visibility,
      is_enabled: link.isEnabled,
      position: index,
      created_at: existing?.created_at ?? existing?.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapSectionInputsToRows(
  profileId: string,
  sections: ProfileSectionDraftInput[],
  existingSections: Array<{ id: string; created_at?: string; createdAt?: string }>,
): ProfileSectionsRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingSections.map((section) => [section.id, section]));

  return sortSections(sections).map((section, index) => {
    const existing = existingById.get(section.id);
    return {
      id: section.id,
      profile_id: profileId,
      title: section.title.trim(),
      slug: section.slug.trim().toLowerCase(),
      position: index,
      is_visible: section.isVisible,
      created_at: existing?.created_at ?? existing?.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function mapBlockInputsToRows(
  profileId: string,
  blocks: ProfileBlockDraftInput[],
  existingBlocks: Array<{ id: string; created_at?: string; createdAt?: string }>,
): ProfileBlocksRow[] {
  const timestamp = nowIso();
  const existingById = new Map(existingBlocks.map((block) => [block.id, block]));

  return sortBlocks(blocks).map((block, index) => {
    const existing = existingById.get(block.id);
    return {
      id: block.id,
      profile_id: profileId,
      section_id: block.sectionId,
      type: block.type,
      title: block.title.trim(),
      visibility: block.visibility,
      position: index,
      configuration: block.configuration,
      created_at: existing?.created_at ?? existing?.createdAt ?? timestamp,
      updated_at: timestamp,
      deleted_at: null,
    };
  });
}

function createAuditRow(
  profileId: string,
  actorId: string,
  action: string,
  summary: string,
  metadata: Record<string, unknown>,
): AuditLogEntry {
  return {
    id: randomUUID(),
    profileId,
    actorId,
    action,
    entityType: "profile",
    entityId: profileId,
    summary,
    metadata,
    createdAt: nowIso(),
  };
}

async function loadSupabaseWorkspace(userId: string): Promise<WorkspaceSnapshot> {
  const client = await createSupabaseServerClient();
  if (!client) {
    return getDemoWorkspaceSnapshot();
  }

  const { data: profileRow } = await client
    .from("profiles")
    .select("*")
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .maybeSingle<ProfilesRow>();

  if (!profileRow) {
    return createBlankWorkspace("authenticated", userId);
  }

  const profileId = profileRow.id;
  const [linksResult, sectionsResult, blocksResult, publicResult, auditResult] = await Promise.all([
    client
      .from("profile_links")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    client
      .from("profile_sections")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(12),
    client
      .from("profile_blocks")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .limit(60),
    client
      .from("public_profile_settings")
      .select("*")
      .eq("profile_id", profileId)
      .is("is_published", true)
      .maybeSingle<PublicProfileSettingsRow>(),
    client
      .from("audit_logs")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const links = (linksResult.data ?? []).map(linkRowToDraft);
  const sections = (sectionsResult.data ?? []).map(sectionRowToDraft);
  const blocks = (blocksResult.data ?? [])
    .map((row) => blockRowToDraft(row as ProfileBlocksRow))
    .filter((block): block is ProfileBlockDraft => block !== null);
  const published = publicResult.data ? publicRowToSnapshot(publicResult.data) : null;
  const auditLogs = (auditResult.data ?? []).map(auditRowToEntry);

  return {
    profile: profileRowToDraft(profileRow),
    links,
    sections,
    blocks,
    published,
    auditLogs,
    mode: "authenticated",
  };
}

export async function getViewerContext(): Promise<ViewerContext> {
  if (!hasSupabaseConfig()) {
    return { mode: "demo", userId: DEMO_USER_ID };
  }

  const client = await createSupabaseServerClient();
  if (!client) {
    return { mode: "demo", userId: DEMO_USER_ID };
  }

  const { data } = await client.auth.getUser();
  if (!data.user) {
    return { mode: "anonymous", userId: null };
  }

  return {
    mode: "authenticated",
    userId: data.user.id,
  };
}

export async function getWorkspaceSnapshot(viewer: ViewerContext): Promise<WorkspaceSnapshot> {
  if (viewer.mode === "demo") {
    return getDemoWorkspaceSnapshot();
  }

  if (viewer.mode === "anonymous" || !viewer.userId) {
    return createBlankWorkspace("anonymous", viewer.userId ?? DEMO_USER_ID);
  }

  return loadSupabaseWorkspace(viewer.userId);
}

export async function getPublicProfile(handle: string): Promise<PublicProfileSnapshot | null> {
  const normalizedHandle = handle.trim().toLowerCase();
  if (!normalizedHandle) {
    return null;
  }

  if (!hasSupabaseConfig()) {
    if (normalizedHandle === DEMO_HANDLE) {
      return getDemoWorkspaceSnapshot().published;
    }

    return null;
  }

  const client = await createSupabaseServerClient();
  if (!client) {
    return null;
  }

  const { data } = await client
    .from("public_profile_settings")
    .select("*")
    .eq("handle", normalizedHandle)
    .is("is_published", true)
    .maybeSingle<PublicProfileSettingsRow>();

  if (!data) {
    return null;
  }

  return publicRowToSnapshot(data);
}

async function persistDemoWorkspace(
  input: WorkspaceDraftInput,
  publish: boolean,
): Promise<WorkspaceMutationResult> {
  const store = getDemoStore();
  const profileInput = profileDraftSchema.parse(input.profile);
  const nextProfile: ProfileDraft = {
    ...store.profile,
    handle: profileInput.handle.trim().toLowerCase(),
    displayName: profileInput.displayName.trim(),
    headline: profileInput.headline.trim(),
    bio: profileInput.bio.trim(),
    locationText: profileInput.locationText.trim(),
    timezone: profileInput.timezone.trim() || "UTC",
    avatarInitials: normalizeAvatarInitials(
      profileInput.displayName.trim(),
      profileInput.avatarInitials,
      profileInput.handle.trim().toLowerCase(),
    ),
    avatarUrl: profileInput.avatarUrl.trim(),
    primaryCtaLabel: profileInput.primaryCtaLabel.trim(),
    primaryCtaUrl: profileInput.primaryCtaUrl.trim(),
    availabilityStatus: profileInput.availabilityStatus,
    isPublished: publish,
    updatedAt: nowIso(),
  };
  const nextLinks = mapLinkInputsToRows(nextProfile.id, input.links, store.links);
  const nextSections = mapSectionInputsToRows(
    nextProfile.id,
    input.sections,
    store.sections,
  ).map(sectionRowToDraft);
  const nextBlocks = mapBlockInputsToRows(
    nextProfile.id,
    input.blocks,
    store.blocks,
  )
    .map(blockRowToDraft)
    .filter((block): block is ProfileBlockDraft => block !== null);
  store.profile = nextProfile;
  store.links = nextLinks.map(linkRowToDraft);
  store.sections = nextSections;
  store.blocks = nextBlocks;
  store.published = publish
    ? buildPublicProfileSnapshot(
        nextProfile,
        store.links,
        nextProfile.updatedAt,
        store.sections,
        store.blocks,
      )
    : store.published;
  store.auditLogs = [
    createAuditRow(
      nextProfile.id,
      nextProfile.ownerId,
      publish ? "profile_published" : "profile_saved",
      publish
        ? `Published ${store.links.length} links and ${store.blocks.length} blocks`
        : `Saved ${store.links.length} links and ${store.blocks.length} blocks`,
      {
        published: publish,
        linkCount: store.links.length,
        blockCount: store.blocks.length,
        sectionCount: store.sections.length,
      },
    ),
    ...store.auditLogs,
  ].slice(0, 8);

  return {
    ok: true,
    workspace: getDemoWorkspaceSnapshot(),
  };
}

async function persistSupabaseWorkspace(
  viewer: ViewerContext,
  input: WorkspaceDraftInput,
  publish: boolean,
): Promise<WorkspaceMutationResult> {
  if (!viewer.userId) {
    return {
      ok: false,
      message: "Sign in to edit your workspace.",
      fieldErrors: {},
    };
  }

  const client = await createSupabaseServerClient();
  if (!client) {
    return {
      ok: false,
      message: "Supabase is not configured.",
      fieldErrors: {},
    };
  }

  const profileInput = profileDraftSchema.parse(input.profile);
  const normalizedHandle = profileInput.handle.trim().toLowerCase();

  if (isReservedHandle(normalizedHandle) && normalizedHandle !== DEMO_HANDLE) {
    return {
      ok: false,
      message: "Choose a different handle.",
      fieldErrors: {
        handle: "That handle is reserved.",
      },
    };
  }

  const { data: existingProfile } = await client
    .from("profiles")
    .select("*")
    .eq("owner_id", viewer.userId)
    .is("deleted_at", null)
    .maybeSingle<ProfilesRow>();

  const profileId = existingProfile?.id ?? randomUUID();
  const { data: conflictingProfile } = await client
    .from("profiles")
    .select("id")
    .eq("handle", normalizedHandle)
    .neq("id", profileId)
    .maybeSingle();

  if (conflictingProfile) {
    return {
      ok: false,
      message: "That handle is already taken.",
      fieldErrors: {
        handle: "That handle is already taken.",
      },
    };
  }

  const profileRow = mapProfileInputToRow(
    profileId,
    viewer.userId,
    profileInput,
    existingProfile ?? null,
    publish,
  );

  const { error: profileUpsertError } = await client.from("profiles").upsert(profileRow);
  if (profileUpsertError) {
    return {
      ok: false,
      message: profileUpsertError.message,
      fieldErrors: profileUpsertError.message.toLowerCase().includes("handle")
        ? { handle: profileUpsertError.message }
        : {},
    };
  }

  const { data: existingLinksMany } = await client
    .from("profile_links")
    .select("*")
    .eq("profile_id", profileId)
    .is("deleted_at", null);

  const nextLinks = mapLinkInputsToRows(
    profileId,
    input.links,
    (existingLinksMany ?? []) as ProfileLinksRow[],
  );

  const { error: linkUpsertError } = await client.from("profile_links").upsert(nextLinks);
  if (linkUpsertError) {
    return {
      ok: false,
      message: linkUpsertError.message,
      fieldErrors: {},
    };
  }

  const staleIds = (existingLinksMany ?? [])
    .map((link) => link.id)
    .filter((id) => !nextLinks.some((link) => link.id === id));

  if (staleIds.length > 0) {
    const { error: deleteError } = await client
      .from("profile_links")
      .delete()
      .eq("profile_id", profileId)
      .in("id", staleIds);

    if (deleteError) {
      return {
        ok: false,
        message: deleteError.message,
        fieldErrors: {},
      };
    }
  }

  const [{ data: existingSectionsMany }, { data: existingBlocksMany }] = await Promise.all([
    client
      .from("profile_sections")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
    client
      .from("profile_blocks")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null),
  ]);

  const nextSections = mapSectionInputsToRows(
    profileId,
    input.sections,
    (existingSectionsMany ?? []) as ProfileSectionsRow[],
  );
  const { error: sectionUpsertError } = await client
    .from("profile_sections")
    .upsert(nextSections);

  if (sectionUpsertError) {
    return {
      ok: false,
      message: sectionUpsertError.message,
      fieldErrors: {},
    };
  }

  const nextBlocks = mapBlockInputsToRows(
    profileId,
    input.blocks,
    (existingBlocksMany ?? []) as ProfileBlocksRow[],
  );
  const { error: blockUpsertError } = await client
    .from("profile_blocks")
    .upsert(nextBlocks);

  if (blockUpsertError) {
    return {
      ok: false,
      message: blockUpsertError.message,
      fieldErrors: {},
    };
  }

  const staleBlockIds = (existingBlocksMany ?? [])
    .map((block) => block.id)
    .filter((id) => !nextBlocks.some((block) => block.id === id));

  if (staleBlockIds.length > 0) {
    const { error: deleteError } = await client
      .from("profile_blocks")
      .delete()
      .eq("profile_id", profileId)
      .in("id", staleBlockIds);

    if (deleteError) {
      return {
        ok: false,
        message: deleteError.message,
        fieldErrors: {},
      };
    }
  }

  const staleSectionIds = (existingSectionsMany ?? [])
    .map((section) => section.id)
    .filter((id) => !nextSections.some((section) => section.id === id));

  if (staleSectionIds.length > 0) {
    const { error: deleteError } = await client
      .from("profile_sections")
      .delete()
      .eq("profile_id", profileId)
      .in("id", staleSectionIds);

    if (deleteError) {
      return {
        ok: false,
        message: deleteError.message,
        fieldErrors: {},
      };
    }
  }

  if (publish) {
    const published = buildPublicProfileSnapshot(
      profileRowToDraft(profileRow),
      nextLinks.map(linkRowToDraft),
      nowIso(),
      nextSections.map(sectionRowToDraft),
      nextBlocks
        .map(blockRowToDraft)
        .filter((block): block is ProfileBlockDraft => block !== null),
    );
    const publicRow = {
      profile_id: profileId,
      handle: profileRow.handle,
      display_name: profileRow.display_name,
      headline: profileRow.headline,
      bio: profileRow.bio,
      location_text: profileRow.location_text,
      timezone: profileRow.timezone,
      avatar_initials: profileRow.avatar_initials,
      avatar_url: profileRow.avatar_url,
      primary_cta_label: profileRow.primary_cta_label,
      primary_cta_url: profileRow.primary_cta_url,
      availability_status: profileRow.availability_status,
      published_links: published.publishedLinks,
      published_sections: published.publishedSections,
      published_blocks: published.publishedBlocks,
      is_published: true,
      published_at: nowIso(),
      updated_at: nowIso(),
    };

    const { error: publicUpsertError } = await client
      .from("public_profile_settings")
      .upsert(publicRow);

    if (publicUpsertError) {
      return {
        ok: false,
        message: publicUpsertError.message,
        fieldErrors: {},
      };
    }
  }

  const auditRow = createAuditRow(
    profileId,
    viewer.userId,
    publish ? "profile_published" : "profile_saved",
    publish
      ? `Published ${nextLinks.length} links and ${nextBlocks.length} blocks`
      : `Saved ${nextLinks.length} links and ${nextBlocks.length} blocks`,
    {
      published: publish,
      linkCount: nextLinks.length,
      blockCount: nextBlocks.length,
      sectionCount: nextSections.length,
      handle: profileRow.handle,
    },
  );
  await client.from("audit_logs").insert(auditEntryToRow(auditRow));

  return {
    ok: true,
    workspace: await loadSupabaseWorkspace(viewer.userId),
  };
}

export async function saveWorkspaceDraft(
  viewer: ViewerContext,
  input: unknown,
): Promise<WorkspaceMutationResult> {
  const parsed = workspaceDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  return viewer.mode === "demo"
    ? persistDemoWorkspace(parsed.data, false)
    : persistSupabaseWorkspace(viewer, parsed.data, false);
}

export async function publishWorkspace(
  viewer: ViewerContext,
  input: unknown,
): Promise<WorkspaceMutationResult> {
  const parsed = workspaceDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Fix the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  return viewer.mode === "demo"
    ? persistDemoWorkspace(parsed.data, true)
    : persistSupabaseWorkspace(viewer, parsed.data, true);
}
