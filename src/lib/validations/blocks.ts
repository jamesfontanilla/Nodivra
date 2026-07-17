import { z } from "zod";

// URL must be http/https only
const safeUrlSchema = z
  .string()
  .url()
  .refine((u) => u.startsWith("http://") || u.startsWith("https://"), {
    message: "URL must start with http:// or https://",
  });

const optionalUrl = safeUrlSchema.optional().nullable();

// Block types enum
export const BLOCK_TYPES = [
  "link_button",
  "social_link",
  "project_highlight",
  "text_section",
  "image_card",
  "divider",
  "cta_card",
  "availability_card",
  "external_resource",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

// Config schemas per block type
export const linkButtonConfigSchema = z.object({
  url: safeUrlSchema,
  label: z.string().min(1).max(80),
  icon: z.string().max(30).optional().nullable(),
  style: z.enum(["default", "outline", "ghost"]).default("default"),
});

export const socialLinkConfigSchema = z.object({
  url: safeUrlSchema,
  platform: z.string().min(1).max(40),
  username: z.string().max(60).optional().nullable(),
});

export const projectHighlightConfigSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional().nullable(),
  url: optionalUrl,
  repo_url: optionalUrl,
  technologies: z.array(z.string().max(30)).max(10).default([]),
  status: z.enum(["active", "archived", "wip"]).default("active"),
});

export const textSectionConfigSchema = z.object({
  body: z.string().min(1).max(2000),
  format: z.enum(["plain", "markdown"]).default("plain"),
});

export const imageCardConfigSchema = z.object({
  src: safeUrlSchema,
  alt: z.string().max(200).default(""),
  caption: z.string().max(200).optional().nullable(),
  aspect_ratio: z.enum(["auto", "16:9", "4:3", "1:1"]).default("auto"),
});

export const dividerConfigSchema = z.object({
  style: z.enum(["line", "dots", "space"]).default("line"),
});

export const ctaCardConfigSchema = z.object({
  heading: z.string().min(1).max(100),
  body: z.string().max(300).optional().nullable(),
  button_label: z.string().min(1).max(50),
  button_url: safeUrlSchema,
});

export const availabilityCardConfigSchema = z.object({
  status: z.enum(["available", "limited", "unavailable"]).default("available"),
  message: z.string().max(200).optional().nullable(),
  calendar_url: optionalUrl,
});

export const externalResourceConfigSchema = z.object({
  url: safeUrlSchema,
  title: z.string().min(1).max(120),
  description: z.string().max(300).optional().nullable(),
  source: z.string().max(60).optional().nullable(),
  thumbnail_url: optionalUrl,
});

// Map of type to config schema
export const blockConfigSchemas: Record<BlockType, z.ZodSchema> = {
  link_button: linkButtonConfigSchema,
  social_link: socialLinkConfigSchema,
  project_highlight: projectHighlightConfigSchema,
  text_section: textSectionConfigSchema,
  image_card: imageCardConfigSchema,
  divider: dividerConfigSchema,
  cta_card: ctaCardConfigSchema,
  availability_card: availabilityCardConfigSchema,
  external_resource: externalResourceConfigSchema,
};

// Block creation/update schema
export const blockSchema = z.object({
  block_type: z.enum(BLOCK_TYPES),
  title: z.string().max(120).default(""),
  is_visible: z.boolean().default(true),
  config: z.record(z.unknown()),
});

// Section schema
export const sectionSchema = z.object({
  title: z.string().min(1).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z][a-z0-9-]*[a-z0-9]$/, "Slug must be lowercase with hyphens"),
  is_visible: z.boolean().default(true),
});

export const sectionUpdateSchema = sectionSchema.partial();

/**
 * Validates a block's config against its type-specific schema.
 */
export function validateBlockConfig(
  blockType: BlockType,
  config: unknown
): { success: true; data: unknown } | { success: false; error: string } {
  const schema = blockConfigSchemas[blockType];
  if (!schema) {
    return { success: false, error: `Unknown block type: ${blockType}` };
  }
  const result = schema.safeParse(config);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message ?? "Invalid config" };
  }
  return { success: true, data: result.data };
}

export type LinkButtonConfig = z.infer<typeof linkButtonConfigSchema>;
export type SocialLinkConfig = z.infer<typeof socialLinkConfigSchema>;
export type ProjectHighlightConfig = z.infer<typeof projectHighlightConfigSchema>;
export type TextSectionConfig = z.infer<typeof textSectionConfigSchema>;
export type ImageCardConfig = z.infer<typeof imageCardConfigSchema>;
export type DividerConfig = z.infer<typeof dividerConfigSchema>;
export type CtaCardConfig = z.infer<typeof ctaCardConfigSchema>;
export type AvailabilityCardConfig = z.infer<typeof availabilityCardConfigSchema>;
export type ExternalResourceConfig = z.infer<typeof externalResourceConfigSchema>;
