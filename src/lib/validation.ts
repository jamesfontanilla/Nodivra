import { z, type ZodError } from "zod";
import {
  AVAILABILITY_STATUSES,
  BLOCK_VISIBILITIES,
  LINK_VISIBILITIES,
  PROJECT_LINK_KINDS,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  REPOSITORY_LINK_KINDS,
  REPOSITORY_STATUSES,
  RESERVED_HANDLES,
  STACK_CATEGORY_KEYS,
  STACK_ICON_IDENTIFIERS,
  STACK_LEARNING_STATUSES,
  STACK_LINK_KINDS,
  PATH_DATE_VISIBILITIES,
  PATH_ENTRY_TYPES,
  PATH_LINK_KINDS,
  NOTE_LINK_KINDS,
  TALK_FORMATS,
  TALK_LINK_KINDS,
  SNIP_LANGUAGES,
  SNIP_LINK_KINDS,
  SNIP_VISIBILITIES,
  WORK_AVAILABILITY_STATUSES,
  WORK_SERVICE_LINK_KINDS,
} from "@/types/nodivra";

const handlePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const stackSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pathDatePattern = /^\d{4}-\d{2}-\d{2}$/;

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

const noteHighlightConfigurationSchema = z
  .object({
    noteId: z.string().uuid(),
    title: requiredText(72, "Note titles must be 72 characters or fewer."),
    excerpt: requiredText(280, "Note excerpts must be 280 characters or fewer."),
    url: optionalSafeHttpUrl,
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
  z.object({ ...blockBaseSchema, type: z.literal("note_highlight"), configuration: noteHighlightConfigurationSchema }).strict(),
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
  z.object({ ...publicBlockBaseSchema, type: z.literal("note_highlight"), configuration: noteHighlightConfigurationSchema }).strict(),
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

const repositoryLinkDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    repositoryId: z.string().uuid(),
    kind: z.enum(REPOSITORY_LINK_KINDS),
    projectId: z.string().uuid().or(z.literal("")).default(""),
    label: shortText(72, "Repository link labels must be 72 characters or fewer."),
    url: safeHttpUrl.default(""),
    position: z.number().int().min(0),
    isEnabled: z.boolean().default(true),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.kind === "project") {
      if (!data.projectId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Choose a related project.",
          path: ["projectId"],
        });
      }
      if (data.url) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Project links use the internal project route.",
          path: ["url"],
        });
      }
    }
    if (data.kind === "stack") {
      if (!data.label) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stack link labels are required.",
          path: ["label"],
        });
      }
      if (!data.url) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stack link URL is required.",
          path: ["url"],
        });
      }
      if (data.projectId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stack links cannot reference a project.",
          path: ["projectId"],
        });
      }
    }
  });

export const repositoryDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    repositoryName: requiredText(72, "Repository names must be 72 characters or fewer."),
    providerLabel: requiredText(32, "Provider labels must be 32 characters or fewer."),
    repositoryUrl: safeHttpUrl.refine((value) => value.length > 0, {
      message: "Repository URL is required.",
    }),
    description: requiredText(280, "Repository descriptions must be 280 characters or fewer."),
    language: shortText(48, "Languages must be 48 characters or fewer."),
    framework: shortText(64, "Frameworks must be 64 characters or fewer."),
    topics: z.array(requiredText(32, "Repository topics must be 32 characters or fewer.")).max(8, "Use eight topics or fewer."),
    starsText: shortText(32, "Stars text must be 32 characters or fewer."),
    forksText: shortText(32, "Forks text must be 32 characters or fewer."),
    activityLabel: shortText(80, "Activity labels must be 80 characters or fewer."),
    status: z.enum(REPOSITORY_STATUSES).default("active"),
    isStatsVisible: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isPublished: z.boolean().default(false),
    position: z.number().int().min(0),
    links: z.array(repositoryLinkDraftSchema).max(4),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    const linkIds = new Set<string>();
    const projectIds = new Set<string>();
    for (const [index, link] of data.links.entries()) {
      if (link.profileId !== data.profileId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Repository links must belong to the repository profile.",
          path: ["links", index, "profileId"],
        });
      }
      if (link.repositoryId !== data.id) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Repository links must belong to their repository.",
          path: ["links", index, "repositoryId"],
        });
      }
      if (linkIds.has(link.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Repository link IDs must be unique.",
          path: ["links", index, "id"],
        });
      }
      linkIds.add(link.id);
      if (link.kind === "project" && link.projectId) {
        if (projectIds.has(link.projectId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A related project can appear only once.",
            path: ["links", index, "projectId"],
          });
        }
        projectIds.add(link.projectId);
      }
    }
    for (const key of ["topics"] as const) {
      const values = new Set<string>();
      for (const [index, value] of data[key].entries()) {
        const normalized = value.trim().toLowerCase();
        if (values.has(normalized)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Repository topics must be unique.",
            path: [key, index],
          });
        }
        values.add(normalized);
      }
    }
  });

export const stackCategoryDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    key: z.union([z.enum(STACK_CATEGORY_KEYS), z.literal("custom")]),
    name: requiredText(48, "Stack category names must be 48 characters or fewer."),
    slug: z.string().transform((value) => value.trim().toLowerCase()).refine((value) => stackSlugPattern.test(value) && value.length <= 48, {
      message: "Use a lowercase stack category slug with letters, numbers, and hyphens.",
    }),
    isBuiltIn: z.boolean(),
    position: z.number().int().min(0),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.isBuiltIn && data.key === "custom") {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Built-in categories need a built-in key.", path: ["key"] });
    }
    if (!data.isBuiltIn && data.key !== "custom") {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Custom categories use the custom key.", path: ["key"] });
    }
  });

const stackProjectDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    stackItemId: z.string().uuid(),
    projectId: z.string().uuid(),
    position: z.number().int().min(0),
    isEnabled: z.boolean().default(true),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict();

const stackLinkDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    stackItemId: z.string().uuid(),
    kind: z.enum(STACK_LINK_KINDS),
    label: requiredText(72, "Stack link labels must be 72 characters or fewer."),
    url: safeHttpUrl.refine((value) => value.length > 0, { message: "Stack link URL is required." }),
    position: z.number().int().min(0),
    isEnabled: z.boolean().default(true),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict();

export const stackItemDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    categoryId: z.string().uuid(),
    technologyName: requiredText(72, "Technology names must be 72 characters or fewer."),
    proficiencyLabel: shortText(40, "Proficiency labels must be 40 characters or fewer."),
    yearsText: shortText(24, "Years text must be 24 characters or fewer."),
    confidenceLabel: shortText(40, "Confidence labels must be 40 characters or fewer."),
    learningStatus: z.enum(STACK_LEARNING_STATUSES),
    shortDescription: shortText(180, "Stack descriptions must be 180 characters or fewer."),
    iconIdentifier: z.enum(STACK_ICON_IDENTIFIERS),
    isFeatured: z.boolean().default(false),
    isPublished: z.boolean().default(false),
    position: z.number().int().min(0),
    projects: z.array(stackProjectDraftSchema).max(8),
    links: z.array(stackLinkDraftSchema).max(4),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    const projectIds = new Set<string>();
    const linkIds = new Set<string>();
    const linkUrls = new Set<string>();
    for (const [index, project] of data.projects.entries()) {
      if (project.profileId !== data.profileId || project.stackItemId !== data.id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack project links must belong to their stack item.", path: ["projects", index] });
      }
      if (projectIds.has(project.projectId)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "A project can be linked only once per technology.", path: ["projects", index, "projectId"] });
      }
      projectIds.add(project.projectId);
    }
    for (const [index, link] of data.links.entries()) {
      if (link.profileId !== data.profileId || link.stackItemId !== data.id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack links must belong to their stack item.", path: ["links", index] });
      }
      const normalizedUrl = link.url.toLowerCase();
      if (linkIds.has(link.id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack link IDs must be unique.", path: ["links", index, "id"] });
      }
      if (linkUrls.has(normalizedUrl)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack links must use unique URLs per technology.", path: ["links", index, "url"] });
      }
      linkIds.add(link.id);
      linkUrls.add(normalizedUrl);
    }
  });

const pathDate = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => {
    if (!value) return true;
    if (!pathDatePattern.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed.toISOString().slice(0, 10) === value;
  }, { message: "Use a valid date in YYYY-MM-DD format." });

const pathHighlightDraftSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  entryId: z.string().uuid(),
  content: requiredText(180, "Path highlights must be 180 characters or fewer."),
  position: z.number().int().min(0),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
}).strict();

const pathTechnologyDraftSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  entryId: z.string().uuid(),
  technology: requiredText(32, "Path technologies must be 32 characters or fewer."),
  position: z.number().int().min(0),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
}).strict();

const pathLinkDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    entryId: z.string().uuid(),
    kind: z.enum(PATH_LINK_KINDS),
    projectId: z.string().uuid().or(z.literal("")),
    label: requiredText(72, "Path link labels must be 72 characters or fewer."),
    url: safeHttpUrl,
    position: z.number().int().min(0),
    isEnabled: z.boolean().default(true),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.kind === "project") {
      if (!data.projectId) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a related project.", path: ["projectId"] });
      }
      if (data.url) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Project links use the internal project route.", path: ["url"] });
      }
    } else {
      if (!data.url) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Path link URL is required.", path: ["url"] });
      }
      if (data.projectId) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "External Path links cannot reference a project.", path: ["projectId"] });
      }
    }
  });

export const pathEntryDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    entryType: z.enum(PATH_ENTRY_TYPES),
    title: requiredText(72, "Path titles must be 72 characters or fewer."),
    organization: requiredText(72, "Organizations must be 72 characters or fewer."),
    locationText: shortText(72, "Path locations must be 72 characters or fewer."),
    startDate: pathDate.refine((value) => value.length > 0, { message: "Start date is required." }),
    endDate: pathDate,
    isCurrent: z.boolean().default(false),
    dateVisibility: z.enum(PATH_DATE_VISIBILITIES).default("exact"),
    summary: requiredText(420, "Path summaries must be 420 characters or fewer."),
    highlights: z.array(pathHighlightDraftSchema).max(8, "Use eight highlights or fewer."),
    technologies: z.array(pathTechnologyDraftSchema).max(8, "Use eight technologies or fewer."),
    links: z.array(pathLinkDraftSchema).max(4, "Use four links or fewer."),
    isPublished: z.boolean().default(false),
    position: z.number().int().min(0),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.endDate && data.endDate < data.startDate) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "End date cannot be before start date.", path: ["endDate"] });
    }
    if (data.isCurrent && data.endDate) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Current entries cannot have an end date.", path: ["endDate"] });
    }
    const highlightIds = new Set<string>();
    const technologyIds = new Set<string>();
    const technologyNames = new Set<string>();
    const linkIds = new Set<string>();
    for (const [index, highlight] of data.highlights.entries()) {
      if (highlight.profileId !== data.profileId || highlight.entryId !== data.id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Highlights must belong to their Path entry.", path: ["highlights", index] });
      }
      if (highlightIds.has(highlight.id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Path highlight IDs must be unique.", path: ["highlights", index, "id"] });
      }
      highlightIds.add(highlight.id);
    }
    for (const [index, technology] of data.technologies.entries()) {
      const normalized = technology.technology.toLowerCase();
      if (technology.profileId !== data.profileId || technology.entryId !== data.id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Technologies must belong to their Path entry.", path: ["technologies", index] });
      }
      if (technologyIds.has(technology.id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Path technology IDs must be unique.", path: ["technologies", index, "id"] });
      }
      if (technologyNames.has(normalized)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Path technologies must be unique per entry.", path: ["technologies", index, "technology"] });
      }
      technologyIds.add(technology.id);
      technologyNames.add(normalized);
    }
    for (const [index, link] of data.links.entries()) {
      if (link.profileId !== data.profileId || link.entryId !== data.id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Links must belong to their Path entry.", path: ["links", index] });
      }
      if (linkIds.has(link.id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Path link IDs must be unique.", path: ["links", index, "id"] });
      }
      linkIds.add(link.id);
    }
  });

const dateOnly = (message: string) => z
  .string()
  .transform((value) => value.trim())
  .refine((value) => {
    if (!value) return true;
    if (!pathDatePattern.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, { message });

const noteDate = dateOnly("Use a valid publication date in YYYY-MM-DD format.");
const talkDate = dateOnly("Use a valid event date in YYYY-MM-DD format.").refine((value) => value.length > 0, {
  message: "Event date is required.",
});

const noteLinkDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    noteId: z.string().uuid(),
    kind: z.enum(NOTE_LINK_KINDS),
    projectId: z.string().uuid().or(z.literal("")),
    label: requiredText(72, "Note link labels must be 72 characters or fewer."),
    url: safeHttpUrl,
    position: z.number().int().min(0),
    isEnabled: z.boolean().default(true),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.kind === "project") {
      if (!data.projectId) context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a related project.", path: ["projectId"] });
      if (data.url) context.addIssue({ code: z.ZodIssueCode.custom, message: "Project links use the internal project route.", path: ["url"] });
    } else {
      if (!data.url) context.addIssue({ code: z.ZodIssueCode.custom, message: "Note link URL is required.", path: ["url"] });
      if (data.projectId) context.addIssue({ code: z.ZodIssueCode.custom, message: "External Note links cannot reference a project.", path: ["projectId"] });
    }
  });

export const noteDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    title: requiredText(96, "Note titles must be 96 characters or fewer."),
    slug: z
      .string()
      .transform((value) => value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""))
      .refine((value) => value.length >= 1 && value.length <= 96, { message: "Note slugs must be 1 to 96 characters." }),
    excerpt: requiredText(280, "Note excerpts must be 280 characters or fewer."),
    bodyMarkdown: requiredText(16000, "Note bodies must be 16,000 characters or fewer.")
      .refine((value) => !/<[^>]+>|(?:javascript|data):/i.test(value), { message: "Notes cannot contain HTML, scripts, or unsafe embeds." }),
    coverImageUrl: safeHttpUrl.default(""),
    tags: z.array(requiredText(32, "Note tags must be 32 characters or fewer.")).max(8, "Use eight tags or fewer."),
    publishedAt: noteDate,
    readingTimeText: shortText(32, "Reading-time text must be 32 characters or fewer."),
    canonicalUrl: safeHttpUrl.default(""),
    isPublished: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    position: z.number().int().min(0),
    links: z.array(noteLinkDraftSchema).max(4),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.isPublished && !data.publishedAt) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Published notes need a publication date.", path: ["publishedAt"] });
    }
    if (data.isFeatured && !data.isPublished) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Only published notes can be featured.", path: ["isFeatured"] });
    }
    const linkIds = new Set<string>();
    for (const [index, link] of data.links.entries()) {
      if (link.profileId !== data.profileId || link.noteId !== data.id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Note links must belong to their note.", path: ["links", index] });
      }
      if (linkIds.has(link.id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Note link IDs must be unique.", path: ["links", index, "id"] });
      }
      linkIds.add(link.id);
    }
  });

const talkLinkDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    talkId: z.string().uuid(),
    kind: z.enum(TALK_LINK_KINDS),
    projectId: z.string().uuid().or(z.literal("")),
    stackItemId: z.string().uuid().or(z.literal("")),
    noteId: z.string().uuid().or(z.literal("")),
    label: requiredText(72, "Talk link labels must be 72 characters or fewer."),
    url: safeHttpUrl,
    position: z.number().int().min(0),
    isEnabled: z.boolean().default(true),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    const relationCount = [data.projectId, data.stackItemId, data.noteId].filter(Boolean).length;
    if (data.kind === "project") {
      if (!data.projectId) context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a related project.", path: ["projectId"] });
      if (relationCount !== 1 || data.stackItemId || data.noteId || data.url) context.addIssue({ code: z.ZodIssueCode.custom, message: "Project talk links must use one internal project.", path: ["projectId"] });
    } else if (data.kind === "stack") {
      if (!data.stackItemId) context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a related Stack item.", path: ["stackItemId"] });
      if (relationCount !== 1 || data.projectId || data.noteId || data.url) context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack talk links must use one internal Stack item.", path: ["stackItemId"] });
    } else if (data.kind === "note") {
      if (!data.noteId) context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a related Note.", path: ["noteId"] });
      if (relationCount !== 1 || data.projectId || data.stackItemId || data.url) context.addIssue({ code: z.ZodIssueCode.custom, message: "Note talk links must use one internal Note.", path: ["noteId"] });
    } else {
      if (!data.url) context.addIssue({ code: z.ZodIssueCode.custom, message: "Talk link URL is required.", path: ["url"] });
      if (relationCount > 0) context.addIssue({ code: z.ZodIssueCode.custom, message: "External talk links cannot reference workspace records.", path: ["url"] });
    }
  });

export const talkDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    title: requiredText(96, "Talk titles must be 96 characters or fewer."),
    slug: z
      .string()
      .transform((value) => value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""))
      .refine((value) => value.length >= 1 && value.length <= 96, { message: "Talk slugs must be 1 to 96 characters." }),
    eventName: requiredText(96, "Event names must be 96 characters or fewer."),
    eventDate: talkDate,
    locationText: shortText(96, "Locations must be 96 characters or fewer.").default(""),
    format: z.enum(TALK_FORMATS),
    role: requiredText(72, "Talk roles must be 72 characters or fewer."),
    summary: requiredText(600, "Talk summaries must be 600 characters or fewer.")
      .refine((value) => !/<[^>]+>|(?:javascript|data):/i.test(value), { message: "Talk summaries cannot contain HTML or unsafe content." }),
    slidesUrl: optionalSafeHttpUrl,
    recordingUrl: optionalSafeHttpUrl,
    eventUrl: optionalSafeHttpUrl,
    coverImageUrl: optionalSafeHttpUrl,
    tags: z.array(requiredText(32, "Talk tags must be 32 characters or fewer.")).max(8, "Use eight tags or fewer."),
    isPublished: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    position: z.number().int().min(0),
    links: z.array(talkLinkDraftSchema).max(8),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.isFeatured && !data.isPublished) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Only published Talks can be featured.", path: ["isFeatured"] });
    }
    const tags = new Set<string>();
    for (const [index, tag] of data.tags.entries()) {
      const normalizedTag = tag.toLowerCase();
      if (tags.has(normalizedTag)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Talk tags must be unique.", path: ["tags", index] });
      }
      tags.add(normalizedTag);
    }
    const linkIds = new Set<string>();
    for (const [index, link] of data.links.entries()) {
      if (link.profileId !== data.profileId || link.talkId !== data.id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Talk links must belong to their Talk.", path: ["links", index] });
      }
      if (linkIds.has(link.id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Talk link IDs must be unique.", path: ["links", index, "id"] });
      }
      linkIds.add(link.id);
    }
  });

const snipLinkDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    snipId: z.string().uuid(),
    kind: z.enum(SNIP_LINK_KINDS),
    projectId: z.string().uuid().or(z.literal("")),
    label: requiredText(72, "Snip link labels must be 72 characters or fewer."),
    url: safeHttpUrl,
    position: z.number().int().min(0),
    isEnabled: z.boolean().default(true),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.kind === "project") {
      if (!data.projectId) context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a related project.", path: ["projectId"] });
      if (data.url) context.addIssue({ code: z.ZodIssueCode.custom, message: "Project Snip links use the internal project route.", path: ["url"] });
    } else {
      if (!data.url) context.addIssue({ code: z.ZodIssueCode.custom, message: "Snip resource URL is required.", path: ["url"] });
      if (data.projectId) context.addIssue({ code: z.ZodIssueCode.custom, message: "External Snip links cannot reference a project.", path: ["projectId"] });
    }
  });

export const snipDraftSchema = z
  .object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    title: requiredText(96, "Snip titles must be 96 characters or fewer."),
    slug: z
      .string()
      .transform((value) => value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""))
      .refine((value) => value.length >= 1 && value.length <= 96, { message: "Snip slugs must be 1 to 96 characters." }),
    description: requiredText(280, "Snip descriptions must be 280 characters or fewer."),
    code: z.string().transform((value) => value.replace(/\r\n/g, "\n").trim()).refine((value) => value.length >= 1 && value.length <= 24000, { message: "Snip code must be 1 to 24,000 characters." }),
    language: z.enum(SNIP_LANGUAGES),
    visibility: z.enum(SNIP_VISIBILITIES).default("public"),
    tags: z.array(requiredText(32, "Snip tags must be 32 characters or fewer.")).max(8, "Use eight tags or fewer."),
    sourceUrl: optionalSafeHttpUrl,
    isPublished: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    position: z.number().int().min(0),
    links: z.array(snipLinkDraftSchema).max(4),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.isFeatured && (!data.isPublished || data.visibility !== "public")) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Only published Snips can be featured.", path: ["isFeatured"] });
    }
    const tags = new Set<string>();
    for (const [index, tag] of data.tags.entries()) {
      const normalizedTag = tag.toLowerCase();
      if (tags.has(normalizedTag)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Snip tags must be unique.", path: ["tags", index] });
      }
      tags.add(normalizedTag);
    }
    const linkIds = new Set<string>();
    for (const [index, link] of data.links.entries()) {
      if (link.profileId !== data.profileId || link.snipId !== data.id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Snip links must belong to their Snip.", path: ["links", index] });
      }
      if (linkIds.has(link.id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Snip link IDs must be unique.", path: ["links", index, "id"] });
      }
      linkIds.add(link.id);
    }
  });

export const availabilitySettingsSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  status: z.enum(WORK_AVAILABILITY_STATUSES),
  headline: shortText(120, "Availability headlines must be 120 characters or fewer."),
  detail: z.string().transform((value) => value.trim()).refine((value) => value.length <= 280, { message: "Availability details must be 280 characters or fewer." }),
  contactCtaLabel: shortText(72, "Availability CTA labels must be 72 characters or fewer."),
  contactCtaUrl: optionalSafeHttpUrl,
  isEnabled: z.boolean().default(true),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
}).strict().superRefine((data, context) => {
  const hasLabel = data.contactCtaLabel.length > 0;
  const hasUrl = data.contactCtaUrl.length > 0;
  if (hasLabel !== hasUrl) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Availability CTA label and URL must either both be filled or both be empty.", path: [hasLabel ? "contactCtaUrl" : "contactCtaLabel"] });
  }
});

export const workServiceLinkDraftSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  serviceId: z.string().uuid(),
  kind: z.enum(WORK_SERVICE_LINK_KINDS),
  projectId: z.string().uuid().or(z.literal("")),
  label: requiredText(72, "Work link labels must be 72 characters or fewer."),
  url: safeHttpUrl,
  position: z.number().int().min(0),
  isEnabled: z.boolean().default(true),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
}).strict().superRefine((data, context) => {
  if (data.kind === "project") {
    if (!data.projectId) context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose a related project.", path: ["projectId"] });
    if (data.url) context.addIssue({ code: z.ZodIssueCode.custom, message: "Project Work links use the internal project route.", path: ["url"] });
  } else {
    if (!data.url) context.addIssue({ code: z.ZodIssueCode.custom, message: "Work resource URL is required.", path: ["url"] });
    if (data.projectId) context.addIssue({ code: z.ZodIssueCode.custom, message: "External Work links cannot reference a project.", path: ["projectId"] });
  }
});

export const workServiceDraftSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  title: requiredText(96, "Work service titles must be 96 characters or fewer."),
  slug: z.string().transform((value) => value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "")).refine((value) => value.length >= 1 && value.length <= 96, { message: "Work service slugs must be 1 to 96 characters." }),
  description: requiredText(600, "Work service descriptions must be 600 characters or fewer."),
  startingPriceText: shortText(72, "Starting price text must be 72 characters or fewer."),
  deliveryTimeText: shortText(72, "Delivery time text must be 72 characters or fewer."),
  skills: z.array(requiredText(32, "Work skills must be 32 characters or fewer.")).max(8, "Use eight skills or fewer."),
  availabilityStatus: z.enum(WORK_AVAILABILITY_STATUSES),
  contactCtaLabel: shortText(72, "Work CTA labels must be 72 characters or fewer."),
  contactCtaUrl: optionalSafeHttpUrl,
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  position: z.number().int().min(0),
  links: z.array(workServiceLinkDraftSchema).max(4),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
}).strict().superRefine((data, context) => {
  if (data.isFeatured && !data.isPublished) context.addIssue({ code: z.ZodIssueCode.custom, message: "Only published Work services can be featured.", path: ["isFeatured"] });
  const hasLabel = data.contactCtaLabel.length > 0;
  const hasUrl = data.contactCtaUrl.length > 0;
  if (hasLabel !== hasUrl) context.addIssue({ code: z.ZodIssueCode.custom, message: "Work CTA label and URL must either both be filled or both be empty.", path: [hasLabel ? "contactCtaUrl" : "contactCtaLabel"] });
  const skills = new Set<string>();
  for (const [index, skill] of data.skills.entries()) {
    const normalized = skill.toLowerCase();
    if (skills.has(normalized)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Work skills must be unique.", path: ["skills", index] });
    skills.add(normalized);
  }
  const linkIds = new Set<string>();
  for (const [index, link] of data.links.entries()) {
    if (link.profileId !== data.profileId || link.serviceId !== data.id) context.addIssue({ code: z.ZodIssueCode.custom, message: "Work links must belong to their service.", path: ["links", index] });
    if (linkIds.has(link.id)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Work link IDs must be unique.", path: ["links", index, "id"] });
    linkIds.add(link.id);
  }
});

export const workspaceDraftSchema = z.object({
  profile: profileDraftSchema,
  links: z.array(profileLinkDraftSchema).max(30),
  sections: z.array(profileSectionDraftSchema).max(12).default([]),
  blocks: z.array(profileBlockDraftSchema).max(60).default([]),
  projects: z.array(projectDraftSchema).max(30).default([]),
  repositories: z.array(repositoryDraftSchema).max(30).default([]),
  stackCategories: z.array(stackCategoryDraftSchema).max(20).default([]),
  stackItems: z.array(stackItemDraftSchema).max(60).default([]),
  pathEntries: z.array(pathEntryDraftSchema).max(40).default([]),
  notes: z.array(noteDraftSchema).max(40).default([]),
  talks: z.array(talkDraftSchema).max(40).default([]),
  snippets: z.array(snipDraftSchema).max(40).default([]),
  availabilitySettings: availabilitySettingsSchema.optional(),
  services: z.array(workServiceDraftSchema).max(40).default([]),
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
    if (!data.profile.id || project.profileId === data.profile.id) {
      projectIds.add(project.id);
    }
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

  const repositoryIds = new Set<string>();
  const repositoryUrls = new Set<string>();
  let featuredRepositoryCount = 0;
  for (const [index, repository] of data.repositories.entries()) {
    const normalizedUrl = repository.repositoryUrl.toLowerCase();
    if (repositoryIds.has(repository.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Repository IDs must be unique.",
        path: ["repositories", index, "id"],
      });
    }
    if (repositoryUrls.has(normalizedUrl)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Repository URLs must be unique for this profile.",
        path: ["repositories", index, "repositoryUrl"],
      });
    }
    if (data.profile.id && repository.profileId !== data.profile.id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Repositories must belong to the current profile.",
        path: ["repositories", index, "profileId"],
      });
    }
    if (repository.isFeatured) {
      featuredRepositoryCount += 1;
    }
    repositoryIds.add(repository.id);
    repositoryUrls.add(normalizedUrl);
  }
  if (featuredRepositoryCount > 3) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Choose three featured repositories or fewer.",
      path: ["repositories"],
    });
  }

  for (const [index, repository] of data.repositories.entries()) {
    for (const [linkIndex, link] of repository.links.entries()) {
      if (link.kind === "project" && link.projectId && !projectIds.has(link.projectId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Related repository projects must exist in this workspace.",
          path: ["repositories", index, "links", linkIndex, "projectId"],
        });
      }
    }
  }

  const stackCategoryIds = new Set<string>();
  const stackCategorySlugs = new Set<string>();
  const stackCategoryKeys = new Set<string>();
  for (const [index, category] of data.stackCategories.entries()) {
    if (stackCategoryIds.has(category.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack category IDs must be unique.", path: ["stackCategories", index, "id"] });
    }
    if (stackCategorySlugs.has(category.slug)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack category slugs must be unique.", path: ["stackCategories", index, "slug"] });
    }
    if (category.isBuiltIn && stackCategoryKeys.has(category.key)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Built-in stack categories must be unique.", path: ["stackCategories", index, "key"] });
    }
    if (category.profileId !== data.profile.id) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack categories must belong to the current profile.", path: ["stackCategories", index, "profileId"] });
    }
    stackCategoryIds.add(category.id);
    stackCategorySlugs.add(category.slug);
    if (category.isBuiltIn) stackCategoryKeys.add(category.key);
  }

  const stackItemIds = new Set<string>();
  const stackTechnologyNames = new Set<string>();
  let featuredStackCount = 0;
  for (const [index, item] of data.stackItems.entries()) {
    const normalizedName = item.technologyName.toLowerCase();
    if (stackItemIds.has(item.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack item IDs must be unique.", path: ["stackItems", index, "id"] });
    }
    if (stackTechnologyNames.has(normalizedName)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Technology names must be unique per profile.", path: ["stackItems", index, "technologyName"] });
    }
    if (!stackCategoryIds.has(item.categoryId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Every stack item must belong to an existing category.", path: ["stackItems", index, "categoryId"] });
    }
    if (item.profileId !== data.profile.id) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack items must belong to the current profile.", path: ["stackItems", index, "profileId"] });
    }
    if (item.isFeatured) featuredStackCount += 1;
    for (const [projectIndex, project] of item.projects.entries()) {
      if (!projectIds.has(project.projectId)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack projects must exist in this workspace.", path: ["stackItems", index, "projects", projectIndex, "projectId"] });
      }
    }
    stackItemIds.add(item.id);
    stackTechnologyNames.add(normalizedName);
  }

  const pathEntryIds = new Set<string>();
  for (const [index, entry] of data.pathEntries.entries()) {
    if (pathEntryIds.has(entry.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Path entry IDs must be unique.", path: ["pathEntries", index, "id"] });
    }
    if (data.profile.id && entry.profileId !== data.profile.id) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Path entries must belong to the current profile.", path: ["pathEntries", index, "profileId"] });
    }
    pathEntryIds.add(entry.id);
  }
  const noteIds = new Set<string>();
  const noteSlugs = new Set<string>();
  const workspaceProjectIds = new Set(data.projects.filter((project) => project.profileId === data.profile.id).map((project) => project.id));
  let featuredNoteCount = 0;
  for (const [index, note] of data.notes.entries()) {
    if (noteIds.has(note.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Note IDs must be unique.", path: ["notes", index, "id"] });
    }
    if (noteSlugs.has(note.slug)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Note slugs must be unique.", path: ["notes", index, "slug"] });
    }
    if (data.profile.id && note.profileId !== data.profile.id) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Notes must belong to the current profile.", path: ["notes", index, "profileId"] });
    }
    if (note.isFeatured) featuredNoteCount += 1;
    for (const [linkIndex, link] of note.links.entries()) {
      if (link.kind === "project" && !workspaceProjectIds.has(link.projectId)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Note project links must reference a project in this workspace.", path: ["notes", index, "links", linkIndex, "projectId"] });
      }
    }
    noteIds.add(note.id);
    noteSlugs.add(note.slug);
  }
  if (featuredStackCount > 6) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose six featured technologies or fewer.", path: ["stackItems"] });
  }
  for (const [index, item] of data.stackItems.entries()) {
    for (const [projectIndex, project] of item.projects.entries()) {
      if (project.profileId !== data.profile.id || project.stackItemId !== item.id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Stack project links must belong to the current profile and item.", path: ["stackItems", index, "projects", projectIndex] });
      }
    }
  }
  if (featuredNoteCount > 3) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose three featured notes or fewer.", path: ["notes"] });
  }

  const talkIds = new Set<string>();
  const talkSlugs = new Set<string>();
  const workspaceStackItemIds = new Set(data.stackItems.filter((item) => item.profileId === data.profile.id).map((item) => item.id));
  let featuredTalkCount = 0;
  for (const [index, talk] of data.talks.entries()) {
    if (talkIds.has(talk.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Talk IDs must be unique.", path: ["talks", index, "id"] });
    }
    if (talkSlugs.has(talk.slug)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Talk slugs must be unique.", path: ["talks", index, "slug"] });
    }
    if (data.profile.id && talk.profileId !== data.profile.id) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Talks must belong to the current profile.", path: ["talks", index, "profileId"] });
    }
    if (talk.isFeatured) featuredTalkCount += 1;
    for (const [linkIndex, link] of talk.links.entries()) {
      if (link.kind === "project" && !workspaceProjectIds.has(link.projectId)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Talk project links must reference a project in this workspace.", path: ["talks", index, "links", linkIndex, "projectId"] });
      }
      if (link.kind === "stack" && !workspaceStackItemIds.has(link.stackItemId)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Talk Stack links must reference a Stack item in this workspace.", path: ["talks", index, "links", linkIndex, "stackItemId"] });
      }
      if (link.kind === "note" && !noteIds.has(link.noteId)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Talk Note links must reference a Note in this workspace.", path: ["talks", index, "links", linkIndex, "noteId"] });
      }
    }
    talkIds.add(talk.id);
    talkSlugs.add(talk.slug);
  }
  if (featuredTalkCount > 3) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose three featured Talks or fewer.", path: ["talks"] });
  }

  const snipIds = new Set<string>();
  const snipSlugs = new Set<string>();
  let featuredSnipCount = 0;
  for (const [index, snip] of data.snippets.entries()) {
    if (snipIds.has(snip.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Snip IDs must be unique.", path: ["snippets", index, "id"] });
    }
    if (snipSlugs.has(snip.slug)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Snip slugs must be unique.", path: ["snippets", index, "slug"] });
    }
    if (data.profile.id && snip.profileId !== data.profile.id) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Snips must belong to the current profile.", path: ["snippets", index, "profileId"] });
    }
    if (snip.isFeatured) featuredSnipCount += 1;
    for (const [linkIndex, link] of snip.links.entries()) {
      if (link.kind === "project" && !workspaceProjectIds.has(link.projectId)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Snip project links must reference a project in this workspace.", path: ["snippets", index, "links", linkIndex, "projectId"] });
      }
    }
    snipIds.add(snip.id);
    snipSlugs.add(snip.slug);
  }
  if (featuredSnipCount > 3) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose three featured Snips or fewer.", path: ["snippets"] });
  }

  if (data.availabilitySettings && data.availabilitySettings.profileId !== data.profile.id) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Availability settings must belong to the current profile.", path: ["availabilitySettings", "profileId"] });
  }

  const serviceIds = new Set<string>();
  const serviceSlugs = new Set<string>();
  let featuredServiceCount = 0;
  for (const [index, service] of data.services.entries()) {
    if (serviceIds.has(service.id)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Work service IDs must be unique.", path: ["services", index, "id"] });
    if (serviceSlugs.has(service.slug)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Work service slugs must be unique.", path: ["services", index, "slug"] });
    if (service.profileId !== data.profile.id) context.addIssue({ code: z.ZodIssueCode.custom, message: "Work services must belong to the current profile.", path: ["services", index, "profileId"] });
    if (service.isFeatured) featuredServiceCount += 1;
    for (const [linkIndex, link] of service.links.entries()) {
      if (link.kind === "project" && !workspaceProjectIds.has(link.projectId)) context.addIssue({ code: z.ZodIssueCode.custom, message: "Work project links must reference a project in this workspace.", path: ["services", index, "links", linkIndex, "projectId"] });
    }
    serviceIds.add(service.id);
    serviceSlugs.add(service.slug);
  }
  if (featuredServiceCount > 3) context.addIssue({ code: z.ZodIssueCode.custom, message: "Choose three featured Work services or fewer.", path: ["services"] });
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
  publishedRepositories: z.array(z.object({
    id: z.string().uuid(),
    repositoryName: z.string(),
    providerLabel: z.string(),
    repositoryUrl: safeHttpUrl.refine((value) => value.length > 0),
    description: z.string(),
    language: z.string(),
    framework: z.string(),
    topics: z.array(z.string()),
    starsText: z.string(),
    forksText: z.string(),
    activityLabel: z.string(),
    status: z.enum(REPOSITORY_STATUSES),
    isStatsVisible: z.boolean(),
    isFeatured: z.boolean(),
    position: z.number().int().min(0),
    links: z.array(z.object({
      id: z.string().uuid(),
      kind: z.enum(REPOSITORY_LINK_KINDS),
      projectId: z.string().uuid().or(z.literal("")),
      label: z.string(),
      url: safeHttpUrl,
      position: z.number().int().min(0),
      isEnabled: z.boolean(),
    }).strict()),
  }).strict()).default([]),
  publishedStackCategories: z.array(z.object({
    id: z.string().uuid(),
    key: z.union([z.enum(STACK_CATEGORY_KEYS), z.literal("custom")]),
    name: z.string(),
    slug: z.string(),
    position: z.number().int().min(0),
  }).strict()).default([]),
  publishedStackItems: z.array(z.object({
    id: z.string().uuid(),
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    categorySlug: z.string(),
    technologyName: z.string(),
    proficiencyLabel: z.string(),
    yearsText: z.string(),
    confidenceLabel: z.string(),
    learningStatus: z.enum(STACK_LEARNING_STATUSES),
    shortDescription: z.string(),
    iconIdentifier: z.enum(STACK_ICON_IDENTIFIERS),
    isFeatured: z.boolean(),
    position: z.number().int().min(0),
    projects: z.array(z.object({
      id: z.string().uuid(),
      projectId: z.string().uuid(),
      position: z.number().int().min(0),
      isEnabled: z.boolean(),
    }).strict()),
    links: z.array(z.object({
      id: z.string().uuid(),
      kind: z.enum(STACK_LINK_KINDS),
      label: z.string(),
      url: safeHttpUrl.refine((value) => value.length > 0),
      position: z.number().int().min(0),
      isEnabled: z.boolean(),
    }).strict()),
  }).strict()).default([]),
  publishedPathEntries: z.array(z.object({
    id: z.string().uuid(),
    entryType: z.enum(PATH_ENTRY_TYPES),
    title: z.string(),
    organization: z.string(),
    locationText: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    isCurrent: z.boolean(),
    dateVisibility: z.enum(PATH_DATE_VISIBILITIES),
    summary: z.string(),
    highlights: z.array(z.object({
      id: z.string().uuid(),
      content: z.string(),
      position: z.number().int().min(0),
    }).strict()),
    technologies: z.array(z.object({
      id: z.string().uuid(),
      technology: z.string(),
      position: z.number().int().min(0),
    }).strict()),
    links: z.array(z.object({
      id: z.string().uuid(),
      kind: z.enum(PATH_LINK_KINDS),
      projectId: z.string().uuid().or(z.literal("")),
      label: z.string(),
      url: safeHttpUrl,
      position: z.number().int().min(0),
      isEnabled: z.boolean(),
    }).strict()),
    position: z.number().int().min(0),
  }).strict()).default([]),
  publishedNotes: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    excerpt: z.string(),
    bodyMarkdown: z.string(),
    coverImageUrl: safeHttpUrl,
    tags: z.array(z.string()),
    publishedAt: z.string(),
    readingTimeText: z.string(),
    canonicalUrl: safeHttpUrl,
    isFeatured: z.boolean(),
    position: z.number().int().min(0),
    links: z.array(z.object({
      id: z.string().uuid(),
      kind: z.enum(NOTE_LINK_KINDS),
      projectId: z.string().uuid().or(z.literal("")),
      label: z.string(),
      url: safeHttpUrl,
      position: z.number().int().min(0),
      isEnabled: z.boolean(),
    }).strict()),
  }).strict()).default([]),
  publishedTalks: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    eventName: z.string(),
    eventDate: z.string(),
    locationText: z.string(),
    format: z.enum(TALK_FORMATS),
    role: z.string(),
    summary: z.string(),
    slidesUrl: safeHttpUrl,
    recordingUrl: safeHttpUrl,
    eventUrl: safeHttpUrl,
    coverImageUrl: safeHttpUrl,
    tags: z.array(z.string()),
    isFeatured: z.boolean(),
    position: z.number().int().min(0),
    links: z.array(z.object({
      id: z.string().uuid(),
      kind: z.enum(TALK_LINK_KINDS),
      projectId: z.string().uuid().or(z.literal("")),
      stackItemId: z.string().uuid().or(z.literal("")),
      noteId: z.string().uuid().or(z.literal("")),
      label: z.string(),
      url: safeHttpUrl,
      position: z.number().int().min(0),
      isEnabled: z.boolean(),
    }).strict()),
  }).strict()).default([]),
  publishedSnippets: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    code: z.string(),
    language: z.enum(SNIP_LANGUAGES),
    tags: z.array(z.string()),
    sourceUrl: safeHttpUrl,
    isFeatured: z.boolean(),
    position: z.number().int().min(0),
    links: z.array(z.object({
      id: z.string().uuid(),
      kind: z.enum(SNIP_LINK_KINDS),
      projectId: z.string().uuid().or(z.literal("")),
      label: z.string(),
      url: safeHttpUrl,
      position: z.number().int().min(0),
      isEnabled: z.boolean(),
    }).strict()),
  }).strict()).default([]),
  publishedAvailability: z.object({
    status: z.enum(WORK_AVAILABILITY_STATUSES),
    headline: z.string(),
    detail: z.string(),
    contactCtaLabel: z.string(),
    contactCtaUrl: safeHttpUrl,
  }).strict().nullable().default(null),
  publishedServices: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    startingPriceText: z.string(),
    deliveryTimeText: z.string(),
    skills: z.array(z.string()),
    availabilityStatus: z.enum(WORK_AVAILABILITY_STATUSES),
    contactCtaLabel: z.string(),
    contactCtaUrl: safeHttpUrl,
    isFeatured: z.boolean(),
    position: z.number().int().min(0),
    links: z.array(z.object({
      id: z.string().uuid(),
      kind: z.enum(WORK_SERVICE_LINK_KINDS),
      projectId: z.string().uuid().or(z.literal("")),
      label: z.string(),
      url: safeHttpUrl,
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
export type ProfileRepositoryDraftInput = z.infer<typeof repositoryDraftSchema>;
export type ProfileStackCategoryDraftInput = z.infer<typeof stackCategoryDraftSchema>;
export type ProfileStackItemDraftInput = z.infer<typeof stackItemDraftSchema>;
export type ProfilePathEntryDraftInput = z.infer<typeof pathEntryDraftSchema>;
export type ProfileNoteDraftInput = z.infer<typeof noteDraftSchema>;
export type ProfileTalkDraftInput = z.infer<typeof talkDraftSchema>;
export type ProfileSnipDraftInput = z.infer<typeof snipDraftSchema>;
export type AvailabilitySettingsDraftInput = z.infer<typeof availabilitySettingsSchema>;
export type ProfileWorkServiceDraftInput = z.infer<typeof workServiceDraftSchema>;
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
