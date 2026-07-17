import { z } from "zod";
import {
  PROJECT_LINK_KINDS,
  PROJECT_STATUSES,
  PROJECT_TYPES,
} from "../projects";
import { urlSchema } from "./profile";

const safeOptionalUrl = urlSchema.optional().nullable();
const projectText = z.string().trim().min(1).max(60);

export const projectLinkInputSchema = z.object({
  kind: z.enum(PROJECT_LINK_KINDS),
  url: safeOptionalUrl,
});

export const projectFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .max(120, "Project name must be at most 120 characters"),
    slug: z
      .string()
      .trim()
      .min(2, "Slug must be at least 2 characters")
      .max(60, "Slug must be at most 60 characters")
      .regex(/^[a-z][a-z0-9-]*[a-z0-9]$/, "Slug must be lowercase with hyphens"),
    summary: z
      .string()
      .trim()
      .min(1, "Short summary is required")
      .max(280, "Summary must be at most 280 characters"),
    case_study_md: z
      .string()
      .trim()
      .min(1, "Case study content is required")
      .max(12000, "Case study must be at most 12,000 characters"),
    role: z
      .string()
      .trim()
      .max(120, "Role must be at most 120 characters")
      .nullable()
      .optional(),
    project_type: z.enum(PROJECT_TYPES),
    status: z.enum(PROJECT_STATUSES),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    cover_image_url: safeOptionalUrl,
    cover_image_alt: projectText.nullable().optional(),
    cover_image_caption: z
      .string()
      .trim()
      .max(240, "Caption must be at most 240 characters")
      .nullable()
      .optional(),
    lessons_learned: z
      .string()
      .trim()
      .max(1000, "Lessons learned must be at most 1,000 characters")
      .nullable()
      .optional(),
    is_featured: z.boolean().default(false),
    is_visible: z.boolean().default(true),
    is_published: z.boolean().default(false),
    technologies: z.array(projectText).max(20).default([]),
    tags: z.array(projectText).max(20).default([]),
    links: z.array(projectLinkInputSchema).max(3).default([]),
  })
  .superRefine((value, ctx) => {
    const seenKinds = new Set<string>();
    value.links.forEach((link, index) => {
      if (seenKinds.has(link.kind)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["links", index, "kind"],
          message: "Each project link type can only be used once",
        });
      }
      seenKinds.add(link.kind);
    });
  });

export type ProjectFormData = z.infer<typeof projectFormSchema>;
export type ProjectLinkInputData = z.infer<typeof projectLinkInputSchema>;
