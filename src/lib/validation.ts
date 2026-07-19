import { z, type ZodError } from "zod";
import {
  AVAILABILITY_STATUSES,
  BLOCK_VISIBILITIES,
  LINK_VISIBILITIES,
  PROJECT_LINK_KINDS,
  PROJECT_STATUSES,
  PROJECT_TYPES,
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
  id: z.string().uuid().optional(),
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

const blockTitle = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length >= 1 && value.length <= 80, {
    message: "Block title must be 1 to 80 characters.",
  });

const shortText = (max: number, message: string) =>
  z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length <= max, { message });

const requiredText = (max: number, message: string) =>
  shortText(max, message).refine((value) => value.length > 0, {
    message: "This field is required.",
  });

const optionalSafeHttpUrl = safeHttpUrl.default("");

const technologiesSchema = z
  .array(requiredText(28, "Technology names must be 28 characters or fewer."))
  .max(6, "Use six technologies or fewer.");

const linkButtonConfigurationSchema = z
  .object({
    label: requiredText(48, "Button labels must be 48 characters or fewer."),
    url: safeHttpUrl.refine((value) => value.length > 0, {
      message: "Button URL is required.",
    }),
    detail: shortText(120, "Button detail must be 120 characters or fewer."),
    iconLabel: shortText(8, "Icon labels must be 8 characters or fewer."),
  })
  .strict();

const socialLinkConfigurationSchema = z
  .object({
    network: requiredText(24, "Network names must be 24 characters or fewer."),
    label: requiredText(40, "Social labels must be 40 characters or fewer."),
    url: safeHttpUrl.refine((value) => value.length > 0, {
      message: "Social URL is required.",
    }),
    iconLabel: shortText(8, "Icon labels must be 8 characters or fewer."),
  })
  .strict();

const projectHighlightConfigurationSchema = z
  .object({
    projectName: requiredText(72, "Project names must be 72 characters or fewer."),
    summary: requiredText(220, "Project summaries must be 220 characters or fewer."),
    role: shortText(72, "Roles must be 72 characters or fewer."),
    technologies: technologiesSchema,
    url: optionalSafeHttpUrl,
    projectId: z.string().uuid().or(z.literal("")).optional().default(""),
  })
  .strict();

const textSectionConfigurationSchema = z
  .object({
    body: requiredText(1200, "Text sections must be 1,200 characters or fewer."),
    align: z.enum(["left", "center"]).default("left"),
  })
  .strict();

const imageCardConfigurationSchema = z
  .object({
    imageUrl: safeHttpUrl.refine((value) => value.length > 0, {
      message: "Image URL is required.",
    }),
    altText: requiredText(160, "Alt text must be 160 characters or fewer."),
    caption: shortText(160, "Captions must be 160 characters or fewer."),
  })
  .strict();

const dividerConfigurationSchema = z
  .object({
    style: z.enum(["line", "space"]).default("line"),
    label: shortText(48, "Divider labels must be 48 characters or fewer."),
  })
  .strict();

const ctaCardConfigurationSchema = z
  .object({
    body: requiredText(240, "CTA copy must be 240 characters or fewer."),
    ctaLabel: requiredText(40, "CTA labels must be 40 characters or fewer."),
    ctaUrl: safeHttpUrl.refine((value) => value.length > 0, {
      message: "CTA URL is required.",
    }),
    accent: z.enum(["sand", "moss", "ink"]).default("sand"),
  })
  .strict();

const availabilityCardConfigurationSchema = z
  .object({
    status: z.enum(AVAILABILITY_STATUSES).default("available"),
    detail: requiredText(160, "Availability details must be 160 characters or fewer."),
    timezone: requiredText(64, "Timezones must be 64 characters or fewer."),
  })
  .strict();

const externalResourceConfigurationSchema = z
  .object({
    resourceType: z.enum(["article", "video", "document", "tool", "other"]).default("article"),
    url: safeHttpUrl.refine((value) => value.length > 0, {
      message: "Resource URL is required.",
    }),
    description: requiredText(220, "Resource descriptions must be 220 characters or fewer."),
  })
  .strict();

const blockBaseSchema = {
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  sectionId: z.string().uuid(),
  title: blockTitle,
  visibility: z.enum(BLOCK_VISIBILITIES).default("public"),
  position: z.number().int().min(0),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
};

export const profileBlockDraftSchema = z.union([
  z.object({ ...blockBaseSchema, type: z.literal("link_button"), configuration: linkButtonConfigurationSchema }).strict(),
  z.object({ ...blockBaseSchema, type: z.literal("social_link"), configuration: socialLinkConfigurationSchema }).strict(),
  z.object({ ...blockBaseSchema, type: z.literal("project_highlight"), configuration: projectHighlightConfigurationSchema }).strict(),
  z.object({ ...blockBaseSchema, type: z.literal("text_section"), configuration: textSectionConfigurationSchema }).strict(),
  z.object({ ...blockBaseSchema, type: z.literal("image_card"), configuration: imageCardConfigurationSchema }).strict(),
  z.object({ ...blockBaseSchema, type: z.literal("divider"), configuration: dividerConfigurationSchema }).strict(),
  z.object({ ...blockBaseSchema, type: z.literal("cta_card"), configuration: ctaCardConfigurationSchema }).strict(),
  z.object({ ...blockBaseSchema, type: z.literal("availability_card"), configuration: availabilityCardConfigurationSchema }).strict(),
  z.object({ ...blockBaseSchema, type: z.literal("external_resource"), configuration: externalResourceConfigurationSchema }).strict(),
]);

const publicBlockBaseSchema = {
  id: z.string().uuid(),
  sectionId: z.string().uuid(),
  title: blockTitle,
  visibility: z.enum(BLOCK_VISIBILITIES),
  position: z.number().int().min(0),
};

export const publicBlockSnapshotSchema = z.union([
  z.object({ ...publicBlockBaseSchema, type: z.literal("link_button"), configuration: linkButtonConfigurationSchema }).strict(),
  z.object({ ...publicBlockBaseSchema, type: z.literal("social_link"), configuration: socialLinkConfigurationSchema }).strict(),
  z.object({ ...publicBlockBaseSchema, type: z.literal("project_highlight"), configuration: projectHighlightConfigurationSchema }).strict(),
  z.object({ ...publicBlockBaseSchema, type: z.literal("text_section"), configuration: textSectionConfigurationSchema }).strict(),
  z.object({ ...publicBlockBaseSchema, type: z.literal("image_card"), configuration: imageCardConfigurationSchema }).strict(),
  z.object({ ...publicBlockBaseSchema, type: z.literal("divider"), configuration: dividerConfigurationSchema }).strict(),
  z.object({ ...publicBlockBaseSchema, type: z.literal("cta_card"), configuration: ctaCardConfigurationSchema }).strict(),
  z.object({ ...publicBlockBaseSchema, type: z.literal("availability_card"), configuration: availabilityCardConfigurationSchema }).strict(),
  z.object({ ...publicBlockBaseSchema, type: z.literal("external_resource"), configuration: externalResourceConfigurationSchema }).strict(),
]);

export const profileSectionDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    title: requiredText(48, "Section titles must be 48 characters or fewer."),
    slug: z
      .string()
      .transform((value) => value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""))
      .refine((value) => value.length >= 1 && value.length <= 48, {
        message: "Section slugs must be 1 to 48 characters.",
      }),
    position: z.number().int().min(0),
    isVisible: z.boolean().default(true),
    isCollapsed: z.boolean().default(false),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict();

const projectLinkDraftSchema = z
  .object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    kind: z.enum(PROJECT_LINK_KINDS),
    label: shortText(72, "Project link labels must be 72 characters or fewer."),
    url: safeHttpUrl.refine((value) => value.length > 0, {
      message: "Project link URL is required.",
    }),
    position: z.number().int().min(0),
    isEnabled: z.boolean().default(true),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict();

const projectSlug = z
  .string()
  .transform((value) => value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""))
  .refine((value) => value.length >= 1 && value.length <= 72, {
    message: "Project slugs must be 1 to 72 characters.",
  });

export const projectDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    slug: projectSlug,
    projectName: requiredText(72, "Project names must be 72 characters or fewer."),
    shortSummary: requiredText(240, "Project summaries must be 240 characters or fewer."),
    caseStudyMarkdown: requiredText(12000, "Case studies must be 12,000 characters or fewer."),
    role: shortText(96, "Roles must be 96 characters or fewer."),
    technologies: z.array(requiredText(32, "Technology names must be 32 characters or fewer.")).max(8, "Use eight technologies or fewer."),
    projectType: z.enum(PROJECT_TYPES).default("product"),
    startDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, "Use a valid start date."),
    endDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, "Use a valid end date."),
    status: z.enum(PROJECT_STATUSES).default("in_progress"),
    coverImageUrl: safeHttpUrl.default(""),
    lessonsLearned: shortText(1800, "Lessons learned must be 1,800 characters or fewer."),
    tags: z.array(requiredText(32, "Project tags must be 32 characters or fewer.")).max(8, "Use eight tags or fewer."),
    isFeatured: z.boolean().default(false),
    isPublished: z.boolean().default(false),
    position: z.number().int().min(0),
    links: z.array(projectLinkDraftSchema).max(3),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    const kinds = new Set<string>();
    for (const [index, link] of data.links.entries()) {
      if (link.projectId !== data.id) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Project links must belong to their project.",
          path: ["links", index, "projectId"],
        });
      }
      if (kinds.has(link.kind)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Each project link type can appear only once.",
          path: ["links", index, "kind"],
        });
      }
      kinds.add(link.kind);
    }
    for (const key of ["technologies", "tags"] as const) {
      const values = new Set<string>();
      for (const [index, value] of data[key].entries()) {
        const normalized = value.trim().toLowerCase();
        if (values.has(normalized)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Project ${key} must be unique.`,
            path: [key, index],
          });
        }
        values.add(normalized);
      }
    }
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be before start date.",
        path: ["endDate"],
      });
    }
  });

export const workspaceDraftSchema = z.object({
  profile: profileDraftSchema,
  links: z.array(profileLinkDraftSchema).max(30),
  sections: z.array(profileSectionDraftSchema).max(12).default([]),
  blocks: z.array(profileBlockDraftSchema).max(60).default([]),
  projects: z.array(projectDraftSchema).max(30).default([]),
}).superRefine((data, context) => {
  const sectionIds = new Set<string>();
  for (const [index, section] of data.sections.entries()) {
    if (sectionIds.has(section.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Section IDs must be unique.",
        path: ["sections", index, "id"],
      });
    }
    sectionIds.add(section.id);
  }

  const blockIds = new Set<string>();
  for (const [index, block] of data.blocks.entries()) {
    if (blockIds.has(block.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Block IDs must be unique.",
        path: ["blocks", index, "id"],
      });
    }
    blockIds.add(block.id);
    if (!sectionIds.has(block.sectionId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Every block must belong to an existing section.",
        path: ["blocks", index, "sectionId"],
      });
    }
  }

  const projectIds = new Set<string>();
  const projectSlugs = new Set<string>();
  let featuredCount = 0;
  for (const [index, project] of data.projects.entries()) {
    if (projectIds.has(project.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project IDs must be unique.",
        path: ["projects", index, "id"],
      });
    }
    if (projectSlugs.has(project.slug)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project slugs must be unique.",
        path: ["projects", index, "slug"],
      });
    }
    if (data.profile.id && project.profileId !== data.profile.id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Projects must belong to the current profile.",
        path: ["projects", index, "profileId"],
      });
    }
    if (project.isFeatured) {
      featuredCount += 1;
    }
    projectIds.add(project.id);
    projectSlugs.add(project.slug);
  }
  if (featuredCount > 3) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose three featured projects or fewer.",
      path: ["projects"],
    });
  }

  for (const [index, block] of data.blocks.entries()) {
    if (block.type === "project_highlight" && block.configuration.projectId && !projectIds.has(block.configuration.projectId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project highlights must link to an existing project.",
        path: ["blocks", index, "configuration", "projectId"],
      });
    }
  }
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
  publishedSections: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    position: z.number().int().min(0),
  }).strict()).default([]),
  publishedBlocks: z.array(publicBlockSnapshotSchema).default([]),
  publishedProjects: z.array(z.object({
    id: z.string().uuid(),
    slug: z.string(),
    projectName: z.string(),
    shortSummary: z.string(),
    caseStudyMarkdown: z.string(),
    role: z.string(),
    technologies: z.array(z.string()),
    projectType: z.enum(PROJECT_TYPES),
    startDate: z.string(),
    endDate: z.string(),
    status: z.enum(PROJECT_STATUSES),
    coverImageUrl: safeHttpUrl,
    lessonsLearned: z.string(),
    tags: z.array(z.string()),
    isFeatured: z.boolean(),
    position: z.number().int().min(0),
    links: z.array(z.object({
      id: z.string().uuid(),
      kind: z.enum(PROJECT_LINK_KINDS),
      label: z.string(),
      url: safeHttpUrl.refine((value) => value.length > 0, {
        message: "Project link URL is required.",
      }),
      position: z.number().int().min(0),
      isEnabled: z.boolean(),
    }).strict()),
  }).strict()).default([]),
  publishedAt: z.string(),
  isPublished: z.boolean(),
});

export type ProfileDraftInput = z.infer<typeof profileDraftSchema>;
export type ProfileLinkDraftInput = z.infer<typeof profileLinkDraftSchema>;
export type ProfileSectionDraftInput = z.infer<typeof profileSectionDraftSchema>;
export type ProfileBlockDraftInput = z.infer<typeof profileBlockDraftSchema>;
export type ProfileProjectDraftInput = z.infer<typeof projectDraftSchema>;
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
