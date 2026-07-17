import { z } from "zod";
import { handleSchema } from "./handle";

export const urlSchema = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (url) => url.startsWith("http://") || url.startsWith("https://"),
    "URL must start with http:// or https://"
  );

export const profileSchema = z.object({
  handle: handleSchema,
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name must be at most 100 characters"),
  headline: z
    .string()
    .max(160, "Headline must be at most 160 characters")
    .nullable()
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .nullable()
    .optional(),
  location: z
    .string()
    .max(100, "Location must be at most 100 characters")
    .nullable()
    .optional(),
  timezone: z
    .string()
    .max(50, "Timezone must be at most 50 characters")
    .nullable()
    .optional(),
  avatar_initials: z
    .string()
    .max(3, "Initials must be at most 3 characters")
    .nullable()
    .optional(),
  primary_cta_label: z
    .string()
    .max(50, "CTA label must be at most 50 characters")
    .nullable()
    .optional(),
  primary_cta_url: urlSchema.nullable().optional(),
  is_available: z.boolean().optional(),
});

export const profileUpdateSchema = profileSchema.partial().omit({ handle: true });

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
