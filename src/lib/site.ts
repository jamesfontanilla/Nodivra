export const siteName = "Nodivra";
export const siteTagline =
  "A polished link-in-bio workspace for developers who want their proof of work to feel intentional.";

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) {
    return "http://localhost:3000";
  }

  return value.replace(/\/+$/, "");
}
