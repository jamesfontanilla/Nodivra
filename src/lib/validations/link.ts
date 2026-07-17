import { z } from "zod";
import { urlSchema } from "./profile";

export const linkSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  url: urlSchema,
  icon_label: z
    .string()
    .max(30, "Icon label must be at most 30 characters")
    .nullable()
    .optional(),
  is_visible: z.boolean().default(true),
  is_enabled: z.boolean().default(true),
});

export const linkUpdateSchema = linkSchema.partial();

export const linkReorderSchema = z.object({
  link_ids: z.array(z.string().uuid()),
});

export type LinkFormData = z.infer<typeof linkSchema>;
export type LinkUpdateData = z.infer<typeof linkUpdateSchema>;
