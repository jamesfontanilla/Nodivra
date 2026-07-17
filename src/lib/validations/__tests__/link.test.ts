import { describe, it, expect } from "vitest";
import { linkSchema } from "../link";

describe("linkSchema", () => {
  it("accepts a valid link", () => {
    const result = linkSchema.safeParse({
      title: "My Website",
      url: "https://example.com",
      icon_label: "🌐",
      is_visible: true,
      is_enabled: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a link without optional fields", () => {
    const result = linkSchema.safeParse({
      title: "My Website",
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = linkSchema.safeParse({
      title: "",
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL", () => {
    const result = linkSchema.safeParse({
      title: "Bad Link",
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-http URLs", () => {
    const result = linkSchema.safeParse({
      title: "FTP Link",
      url: "ftp://example.com/file",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 100 characters", () => {
    const result = linkSchema.safeParse({
      title: "a".repeat(101),
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("accepts http URLs", () => {
    const result = linkSchema.safeParse({
      title: "HTTP Site",
      url: "http://example.com",
    });
    expect(result.success).toBe(true);
  });
});
