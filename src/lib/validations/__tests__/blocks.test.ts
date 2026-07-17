import { describe, it, expect } from "vitest";
import {
  validateBlockConfig,
  linkButtonConfigSchema,
  socialLinkConfigSchema,
  projectHighlightConfigSchema,
  textSectionConfigSchema,
  dividerConfigSchema,
  ctaCardConfigSchema,
  availabilityCardConfigSchema,
  externalResourceConfigSchema,
  sectionSchema,
} from "../blocks";

describe("validateBlockConfig", () => {
  it("validates a valid link_button config", () => {
    const result = validateBlockConfig("link_button", {
      url: "https://example.com",
      label: "Click me",
      style: "default",
    });
    expect(result.success).toBe(true);
  });

  it("rejects link_button with non-http URL", () => {
    const result = validateBlockConfig("link_button", {
      url: "ftp://example.com",
      label: "Bad",
    });
    expect(result.success).toBe(false);
  });

  it("rejects link_button with empty label", () => {
    const result = validateBlockConfig("link_button", {
      url: "https://example.com",
      label: "",
    });
    expect(result.success).toBe(false);
  });

  it("validates a social_link config", () => {
    const result = validateBlockConfig("social_link", {
      url: "https://github.com/user",
      platform: "GitHub",
      username: "user",
    });
    expect(result.success).toBe(true);
  });

  it("validates a project_highlight config", () => {
    const result = validateBlockConfig("project_highlight", {
      name: "My App",
      description: "A cool app",
      technologies: ["TypeScript", "React"],
      status: "active",
    });
    expect(result.success).toBe(true);
  });

  it("rejects project_highlight with too many technologies", () => {
    const result = validateBlockConfig("project_highlight", {
      name: "App",
      technologies: Array(11).fill("tech"),
    });
    expect(result.success).toBe(false);
  });

  it("validates text_section config", () => {
    const result = validateBlockConfig("text_section", {
      body: "Hello world",
      format: "plain",
    });
    expect(result.success).toBe(true);
  });

  it("rejects text_section with empty body", () => {
    const result = validateBlockConfig("text_section", {
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("validates divider config", () => {
    const result = validateBlockConfig("divider", { style: "dots" });
    expect(result.success).toBe(true);
  });

  it("validates cta_card config", () => {
    const result = validateBlockConfig("cta_card", {
      heading: "Work with me",
      body: "I'm available",
      button_label: "Contact",
      button_url: "https://example.com/contact",
    });
    expect(result.success).toBe(true);
  });

  it("rejects cta_card with missing button_url", () => {
    const result = validateBlockConfig("cta_card", {
      heading: "Hi",
      button_label: "Click",
    });
    expect(result.success).toBe(false);
  });

  it("validates availability_card config", () => {
    const result = validateBlockConfig("availability_card", {
      status: "available",
      message: "Open for freelance",
    });
    expect(result.success).toBe(true);
  });

  it("validates external_resource config", () => {
    const result = validateBlockConfig("external_resource", {
      url: "https://blog.example.com/post",
      title: "My Blog Post",
      source: "Personal Blog",
    });
    expect(result.success).toBe(true);
  });

  it("returns error for unknown block type", () => {
    const result = validateBlockConfig("nonexistent" as any, {});
    expect(result.success).toBe(false);
  });
});

describe("sectionSchema", () => {
  it("accepts a valid section", () => {
    const result = sectionSchema.safeParse({
      title: "About",
      slug: "about",
      is_visible: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects slugs with uppercase", () => {
    const result = sectionSchema.safeParse({
      title: "About",
      slug: "About",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = sectionSchema.safeParse({
      title: "",
      slug: "about",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slugs shorter than 2 chars", () => {
    const result = sectionSchema.safeParse({
      title: "X",
      slug: "x",
    });
    expect(result.success).toBe(false);
  });
});
