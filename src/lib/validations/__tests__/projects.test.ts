import { describe, expect, it } from "vitest";
import {
  projectFormSchema,
  projectLinkInputSchema,
} from "../projects";

const validProject = {
  title: "Nodivra Projects",
  slug: "nodivra-projects",
  summary: "A curated developer portfolio module.",
  case_study_md: "# Case study\n\nWe built it with care.",
  role: "Founder",
  project_type: "web_app",
  status: "shipped",
  start_date: "2026-01-01",
  end_date: "2026-03-01",
  cover_image_url: "https://example.com/cover.jpg",
  cover_image_alt: "Cover shot",
  cover_image_caption: "Homepage snapshot",
  lessons_learned: "Keep the editorial structure lean.",
  is_featured: true,
  is_visible: true,
  is_published: true,
  technologies: ["TypeScript", "Next.js"],
  tags: ["Portfolio", "Case study"],
  links: [
    { kind: "live", url: "https://example.com" },
    { kind: "repository", url: "https://github.com/example/nodivra" },
  ],
};

describe("projectLinkInputSchema", () => {
  it("accepts null URLs for optional project links", () => {
    expect(
      projectLinkInputSchema.safeParse({
        kind: "demo",
        url: null,
      }).success
    ).toBe(true);
  });

  it("rejects non-http URLs", () => {
    expect(
      projectLinkInputSchema.safeParse({
        kind: "live",
        url: "javascript:alert(1)",
      }).success
    ).toBe(false);
  });
});

describe("projectFormSchema", () => {
  it("accepts a valid project payload", () => {
    expect(projectFormSchema.safeParse(validProject).success).toBe(true);
  });

  it("rejects duplicate link kinds", () => {
    expect(
      projectFormSchema.safeParse({
        ...validProject,
        links: [
          { kind: "live", url: "https://example.com" },
          { kind: "live", url: "https://example.com/demo" },
        ],
      }).success
    ).toBe(false);
  });

  it("rejects invalid slugs", () => {
    expect(
      projectFormSchema.safeParse({
        ...validProject,
        slug: "Invalid-Project",
      }).success
    ).toBe(false);
  });
});
