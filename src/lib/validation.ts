import { z, type ZodError } from "zod";
import {
  AVAILABILITY_STATUSES,
  LINK_VISIBILITIES,
  RESERVED_HANDLES,
} from "@/types/nodivra";

const handlePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeHandle(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

export function isReservedHandle(handle: string) {
  return RESERVED_HANDLES.includes(handle as (typeof RESERVED_HANDLES)[number]);
}

export function normalizeHttpUrl(input: string) {
  return input.trim();
}

export function isSafeHttpUrl(input: string) {
  try {
    const parsed = new URL(input);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalTrimmedString = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .default("");

const safeHttpUrl = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length === 0 || isSafeHttpUrl(value), {
    message: "Use an http or https URL.",
  })
  .transform((value) => (value.length === 0 ? "" : normalizeHttpUrl(value)));

export const profileDraftSchema = z.object({
  handle: z
    .string()
    .transform(normalizeHandle)
    .refine((value) => value.length >= 3 && value.length <= 32, {
      message: "Handle must be 3 to 32 characters.",
    })
    .refine((value) => handlePattern.test(value), {
      message: "Handle can use lowercase letters, numbers, and hyphens.",
    })
    .refine((value) => !isReservedHandle(value), {
      message: "This handle is reserved.",
    }),
  displayName: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length >= 2 && value.length <= 72, {
      message: "Display name must be 2 to 72 characters.",
    }),
  headline: optionalTrimmedString,
  bio: z
    .string()
    .transform((value) => value.trim())
    .default("")
    .refine((value) => value.length <= 240, {
      message: "Bio must be 240 characters or fewer.",
    }),
  locationText: optionalTrimmedString,
  timezone: z.string().transform((value) => value.trim()).default("UTC"),
  avatarInitials: z
    .string()
    .transform((value) => value.trim().toUpperCase())
    .default("")
    .refine((value) => value.length <= 4, {
      message: "Avatar initials must be 4 characters or fewer.",
    }),
  avatarUrl: safeHttpUrl.default(""),
  primaryCtaLabel: z
    .string()
    .transform((value) => value.trim())
    .default("")
    .refine((value) => value.length <= 48, {
      message: "CTA label must be 48 characters or fewer.",
    }),
  primaryCtaUrl: safeHttpUrl.default(""),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES).default("available"),
  isPublished: z.boolean().default(false),
}).superRefine((data, context) => {
  const hasLabel = data.primaryCtaLabel.length > 0;
  const hasUrl = data.primaryCtaUrl.length > 0;

  if (hasLabel !== hasUrl) {
    const issueMessage =
      "Primary CTA label and URL must either both be filled or both be empty.";

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: issueMessage,
      path: hasLabel ? ["primaryCtaUrl"] : ["primaryCtaLabel"],
    });
  }
});

export const profileLinkDraftSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length >= 1 && value.length <= 72, {
      message: "Link title must be 1 to 72 characters.",
    }),
  url: safeHttpUrl.refine((value) => value.length > 0, {
    message: "Link URL is required.",
  }),
  iconLabel: z.string().transform((value) => value.trim()).default(""),
  visibility: z.enum(LINK_VISIBILITIES).default("public"),
  isEnabled: z.boolean().default(true),
  position: z.number().int().min(0),
});

export const workspaceDraftSchema = z.object({
  profile: profileDraftSchema,
  links: z.array(profileLinkDraftSchema).max(30),
});

export const publishWorkspaceSchema = workspaceDraftSchema;

export const publicLinkSnapshotSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  url: z.string(),
  iconLabel: z.string(),
  visibility: z.enum(LINK_VISIBILITIES),
  isEnabled: z.boolean(),
  position: z.number().int().min(0),
});

export const publicProfileSnapshotSchema = z.object({
  profileId: z.string().uuid(),
  handle: z.string(),
  displayName: z.string(),
  headline: z.string(),
  bio: z.string(),
  locationText: z.string(),
  timezone: z.string(),
  avatarInitials: z.string(),
  avatarUrl: z.string(),
  primaryCtaLabel: z.string(),
  primaryCtaUrl: z.string(),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES),
  publishedLinks: z.array(publicLinkSnapshotSchema),
  publishedAt: z.string(),
  isPublished: z.boolean(),
});

export type ProfileDraftInput = z.infer<typeof profileDraftSchema>;
export type ProfileLinkDraftInput = z.infer<typeof profileLinkDraftSchema>;
export type WorkspaceDraftInput = z.infer<typeof workspaceDraftSchema>;
export type PublicLinkSnapshotInput = z.infer<typeof publicLinkSnapshotSchema>;
export type PublicProfileSnapshotInput = z.infer<typeof publicProfileSnapshotSchema>;

export function getInitials(displayName: string, handle: string) {
  const words = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length > 0) {
    return words
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2);
  }

  return handle.slice(0, 2).toUpperCase();
}

export function buildHandleSuggestion(input: string) {
  return normalizeHandle(input)
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toFieldErrors(error: ZodError) {
  const output: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!output[key]) {
      output[key] = issue.message;
    }
  }

  return output;
}

export function getTimeZoneOptions() {
  return [
    "UTC",
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Warsaw",
    "Asia/Dubai",
    "Asia/Singapore",
    "Australia/Sydney",
  ];
}
