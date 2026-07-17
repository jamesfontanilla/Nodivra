import { z } from "zod";

/**
 * Reserved handles that cannot be claimed by users.
 * These match system routes or common administrative paths.
 */
export const RESERVED_HANDLES = new Set([
  "admin",
  "api",
  "login",
  "signup",
  "settings",
  "support",
  "assets",
  "u",
  "dashboard",
  "profile",
  "profiles",
  "help",
  "about",
  "contact",
  "blog",
  "docs",
  "pricing",
  "terms",
  "privacy",
  "status",
  "app",
  "www",
  "mail",
  "ftp",
  "static",
  "public",
  "system",
  "root",
  "null",
  "undefined",
]);

export const handleSchema = z
  .string()
  .min(3, "Handle must be at least 3 characters")
  .max(30, "Handle must be at most 30 characters")
  .regex(
    /^[a-z][a-z0-9_-]*[a-z0-9]$/,
    "Handle must start with a letter, end with a letter or number, and contain only lowercase letters, numbers, hyphens, or underscores"
  )
  .refine((val) => !RESERVED_HANDLES.has(val), {
    message: "This handle is reserved",
  });
