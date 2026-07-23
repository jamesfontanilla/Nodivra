import { createHash, randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDemoStore } from "@/lib/fallback-data";
import {
  ownerInquiryActionSchema,
  publicInquirySchema,
  toFieldErrors,
} from "@/lib/validation";
import {
  DEMO_HANDLE,
  DEMO_USER_ID,
  type InboxInquiry,
  type InquiryStatus,
  type ViewerContext,
} from "@/types/nodivra";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

export const GENERIC_INQUIRY_MESSAGE =
  "If this profile accepts messages, your note has been received.";

type InquiryRow = {
  id: string;
  profile_id: string;
  name: string;
  contact_text: string;
  subject: string;
  message: string;
  inquiry_type: InboxInquiry["inquiryType"];
  status: InboxInquiry["status"];
  consent_at: string;
  source: "public_profile";
  related_service_id: string | null;
  related_project_id: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

type PublicProfileRow = {
  profile_id: string;
};

const demoInquiries: InboxInquiry[] = [
  {
    id: "aa0f8f13-0c2b-4b0e-9001-000000000001",
    profileId: DEMO_USER_ID,
    name: "Morgan Lee",
    contactText: "morgan@example.com",
    subject: "A calmer onboarding surface",
    message: "We are shaping a developer onboarding flow and could use a second set of eyes on the system around it.",
    inquiryType: "project",
    status: "unread",
    consentAt: "2026-07-21T08:30:00.000Z",
    source: "public_profile",
    relatedServiceId: "ff0f8f13-0c2b-4b0e-9001-000000000003",
    relatedProjectId: "4c0f8f13-0c2b-4b0e-9001-000000000001",
    createdAt: "2026-07-21T08:30:00.000Z",
    updatedAt: "2026-07-21T08:30:00.000Z",
    archivedAt: "",
  },
  {
    id: "aa0f8f13-0c2b-4b0e-9001-000000000002",
    profileId: DEMO_USER_ID,
    name: "Tess Howard",
    contactText: "tess@example.com",
    subject: "Workshop for our platform team",
    message: "Could we explore a half-day workshop about making internal developer tools easier to navigate?",
    inquiryType: "service",
    status: "replied",
    consentAt: "2026-07-18T14:10:00.000Z",
    source: "public_profile",
    relatedServiceId: "ff0f8f13-0c2b-4b0e-9001-000000000004",
    relatedProjectId: "",
    createdAt: "2026-07-18T14:10:00.000Z",
    updatedAt: "2026-07-18T16:00:00.000Z",
    archivedAt: "",
  },
];

function cloneInquiries() {
  return structuredClone(demoInquiries);
}

function rowToInquiry(row: InquiryRow): InboxInquiry {
  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    contactText: row.contact_text,
    subject: row.subject,
    message: row.message,
    inquiryType: row.inquiry_type,
    status: row.status,
    consentAt: row.consent_at,
    source: row.source,
    relatedServiceId: row.related_service_id ?? "",
    relatedProjectId: row.related_project_id ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at ?? "",
  };
}

function getProfileIdForOwner(client: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string) {
  return client
    .from("profiles")
    .select("id")
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .maybeSingle<{ id: string }>();
}

function rateLimitHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function canAcceptSubmission(
  client: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  token: string,
) {
  const keyHash = rateLimitHash(token);
  const now = Date.now();
  const { data } = await client
    .from("inquiry_rate_limits")
    .select("window_started_at, attempt_count")
    .eq("key_hash", keyHash)
    .maybeSingle<{ window_started_at: string; attempt_count: number }>();

  if (data) {
    const windowStartedAt = new Date(data.window_started_at).getTime();
    if (Number.isFinite(windowStartedAt) && now - windowStartedAt < RATE_LIMIT_WINDOW_MS) {
      if (data.attempt_count >= RATE_LIMIT_MAX_ATTEMPTS) {
        return false;
      }

      await client
        .from("inquiry_rate_limits")
        .update({ attempt_count: data.attempt_count + 1, last_seen_at: new Date(now).toISOString() })
        .eq("key_hash", keyHash);
      return true;
    }
  }

  await client.from("inquiry_rate_limits").upsert({
    key_hash: keyHash,
    window_started_at: new Date(now).toISOString(),
    attempt_count: 1,
    last_seen_at: new Date(now).toISOString(),
  });
  return true;
}

export function getDemoInquiries() {
  return cloneInquiries();
}

export function updateDemoInquiry(id: string, status: InquiryStatus) {
  const inquiry = demoInquiries.find((candidate) => candidate.id === id);
  if (!inquiry) return null;
  inquiry.status = status;
  inquiry.updatedAt = new Date().toISOString();
  inquiry.archivedAt = status === "archived" ? inquiry.updatedAt : "";
  return structuredClone(inquiry);
}

export function deleteDemoInquiry(id: string) {
  const index = demoInquiries.findIndex((candidate) => candidate.id === id);
  if (index < 0) return false;
  demoInquiries.splice(index, 1);
  return true;
}

export async function getOwnerInquiries(viewer: ViewerContext): Promise<InboxInquiry[]> {
  if (viewer.mode === "demo") {
    return getDemoInquiries();
  }

  if (viewer.mode !== "authenticated" || !viewer.userId) {
    return [];
  }

  const client = await createSupabaseServerClient();
  if (!client) return [];

  const { data: profile } = await getProfileIdForOwner(client, viewer.userId);
  if (!profile) return [];

  const { data } = await client
    .from("inquiries")
    .select("*")
    .eq("profile_id", profile.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(60);

  return ((data ?? []) as InquiryRow[]).map(rowToInquiry);
}

export async function submitPublicInquiry(input: unknown, rateLimitToken: string) {
  const parsed = publicInquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Review the highlighted fields and try again.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const payload = parsed.data;
  const client = await createSupabaseServerClient();

  if (!client) {
    if (payload.handle === DEMO_HANDLE && !payload.honeypot) {
      const store = getDemoStore();
      demoInquiries.unshift({
        id: randomUUID(),
        profileId: store.profile.id,
        name: payload.name,
        contactText: payload.contactText,
        subject: payload.subject,
        message: payload.message,
        inquiryType: payload.inquiryType,
        status: "unread",
        consentAt: new Date().toISOString(),
        source: "public_profile",
        relatedServiceId: "",
        relatedProjectId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: "",
      });
    }
    return { ok: true as const, message: GENERIC_INQUIRY_MESSAGE };
  }

  const canAccept = await canAcceptSubmission(client, rateLimitToken);
  if (!canAccept || payload.honeypot) {
    return { ok: true as const, message: GENERIC_INQUIRY_MESSAGE };
  }

  const { data: profile } = await client
    .from("public_profile_settings")
    .select("profile_id")
    .eq("handle", payload.handle)
    .eq("is_published", true)
    .maybeSingle<PublicProfileRow>();

  if (!profile) {
    return { ok: true as const, message: GENERIC_INQUIRY_MESSAGE };
  }

  let relatedServiceId: string | null = null;
  let relatedProjectId: string | null = null;

  if (payload.relatedServiceSlug) {
    const { data: service } = await client
      .from("services")
      .select("id")
      .eq("profile_id", profile.profile_id)
      .eq("slug", payload.relatedServiceSlug)
      .eq("is_published", true)
      .is("deleted_at", null)
      .maybeSingle<{ id: string }>();
    relatedServiceId = service?.id ?? null;
  }

  if (payload.relatedProjectSlug) {
    const { data: project } = await client
      .from("projects")
      .select("id")
      .eq("profile_id", profile.profile_id)
      .eq("slug", payload.relatedProjectSlug)
      .eq("is_published", true)
      .is("deleted_at", null)
      .maybeSingle<{ id: string }>();
    relatedProjectId = project?.id ?? null;
  }

  const { data: inquiry, error } = await client
    .from("inquiries")
    .insert({
      profile_id: profile.profile_id,
      name: payload.name,
      contact_text: payload.contactText,
      subject: payload.subject,
      message: payload.message,
      inquiry_type: payload.inquiryType,
      status: "unread",
      consent_at: new Date().toISOString(),
      source: "public_profile",
      related_service_id: relatedServiceId,
      related_project_id: relatedProjectId,
    })
    .select("*")
    .maybeSingle<InquiryRow>();

  if (error || !inquiry) {
    return { ok: true as const, message: GENERIC_INQUIRY_MESSAGE };
  }

  await client.from("inquiry_status_history").insert({
    inquiry_id: inquiry.id,
    profile_id: profile.profile_id,
    from_status: null,
    to_status: "unread",
    actor_id: null,
    note: "Public inquiry received",
  });

  const links = [
    relatedServiceId ? { kind: "service", targetId: relatedServiceId } : null,
    relatedProjectId ? { kind: "project", targetId: relatedProjectId } : null,
  ].filter((link): link is { kind: "service" | "project"; targetId: string } => Boolean(link));

  if (links.length > 0) {
    await client.from("inquiry_links").insert(
      links.map((link) => ({
        inquiry_id: inquiry.id,
        profile_id: profile.profile_id,
        kind: link.kind,
        target_id: link.targetId,
      })),
    );
  }

  return { ok: true as const, message: GENERIC_INQUIRY_MESSAGE };
}

async function writeInquiryAudit(
  client: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  profileId: string,
  actorId: string,
  inquiryId: string,
  action: string,
  summary: string,
) {
  await client.from("audit_logs").insert({
    profile_id: profileId,
    actor_id: actorId,
    action,
    entity_type: "inquiry",
    entity_id: inquiryId,
    summary,
    metadata: { source: "inbox" },
  });
}

export async function updateInquiry(viewer: ViewerContext, input: unknown) {
  const parsed = ownerInquiryActionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Invalid inbox action.", fieldErrors: toFieldErrors(parsed.error) };
  }

  if (viewer.mode === "demo") {
    const inquiry = updateDemoInquiry(parsed.data.id, parsed.data.status);
    return inquiry
      ? { ok: true as const, inquiry }
      : { ok: false as const, message: "Inquiry not found.", fieldErrors: {} };
  }

  if (viewer.mode !== "authenticated" || !viewer.userId) {
    return { ok: false as const, message: "Sign in to manage your inbox.", fieldErrors: {} };
  }

  const client = await createSupabaseServerClient();
  if (!client) return { ok: false as const, message: "Supabase is not configured.", fieldErrors: {} };
  const { data: profile } = await getProfileIdForOwner(client, viewer.userId);
  if (!profile) return { ok: false as const, message: "Profile not found.", fieldErrors: {} };

  const { data: existing } = await client
    .from("inquiries")
    .select("*")
    .eq("id", parsed.data.id)
    .eq("profile_id", profile.id)
    .is("deleted_at", null)
    .maybeSingle<InquiryRow>();
  if (!existing) return { ok: false as const, message: "Inquiry not found.", fieldErrors: {} };

  const archivedAt = parsed.data.status === "archived" ? new Date().toISOString() : null;
  const { data: updated } = await client
    .from("inquiries")
    .update({ status: parsed.data.status, archived_at: archivedAt, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.id)
    .eq("profile_id", profile.id)
    .select("*")
    .maybeSingle<InquiryRow>();
  if (!updated) return { ok: false as const, message: "Unable to update inquiry.", fieldErrors: {} };

  if (existing.status !== parsed.data.status) {
    await client.from("inquiry_status_history").insert({
      inquiry_id: updated.id,
      profile_id: profile.id,
      from_status: existing.status,
      to_status: updated.status,
      actor_id: viewer.userId,
      note: "Inbox status updated",
    });
    await writeInquiryAudit(client, profile.id, viewer.userId, updated.id, "inquiry_status_changed", `Marked inquiry ${updated.status}`);
  }

  return { ok: true as const, inquiry: rowToInquiry(updated) };
}

export async function deleteInquiry(viewer: ViewerContext, id: string) {
  if (viewer.mode === "demo") {
    return deleteDemoInquiry(id)
      ? { ok: true as const }
      : { ok: false as const, message: "Inquiry not found." };
  }

  if (viewer.mode !== "authenticated" || !viewer.userId) {
    return { ok: false as const, message: "Sign in to manage your inbox." };
  }

  const client = await createSupabaseServerClient();
  if (!client) return { ok: false as const, message: "Supabase is not configured." };
  const { data: profile } = await getProfileIdForOwner(client, viewer.userId);
  if (!profile) return { ok: false as const, message: "Profile not found." };

  const { data: inquiry } = await client
    .from("inquiries")
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("profile_id", profile.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (!inquiry) return { ok: false as const, message: "Inquiry not found." };

  await writeInquiryAudit(client, profile.id, viewer.userId, id, "inquiry_deleted", "Deleted an inquiry");
  return { ok: true as const };
}
