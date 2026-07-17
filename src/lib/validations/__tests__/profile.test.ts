import { describe, it, expect } from "vitest";
import { profileSchema, profileUpdateSchema, urlSchema } from "../profile";

describe("urlSchema", () => {
  it("accepts https URLs", () => {
    expect(urlSchema.safeParse("https://example.com").success).toBe(true);
  });

  it("accepts http URLs", () => {
    expect(urlSchema.safeParse("http://example.com").success).toBe(true);
  });

  it("rejects non-http protocols", () => {
    expect(urlSchema.safeParse("ftp://example.com").success).toBe(false);
    expect(urlSchema.safeParse("javascript:alert(1)").success).toBe(false);
  });

  it("rejects non-URL strings", () => {
    expect(urlSchema.safeParse("not a url").success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepts a valid profile", () => {
    const result = profileSchema.safeParse({
      handle: "jane-dev",
      display_name: "Jane Developer",
      headline: "Full-stack engineer",
      bio: "I build things",
      location: "SF",
      timezone: "America/Los_Angeles",
      avatar_initials: "JD",
      primary_cta_label: "Hire me",
      primary_cta_url: "https://example.com",
    });
    expect(result.success).toBe(true);
  });

  it("requires handle and display_name", () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects display_name longer than 100 characters", () => {
    const result = profileSchema.safeParse({
      handle: "jane-dev",
      display_name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects bio longer than 500 characters", () => {
    const result = profileSchema.safeParse({
      handle: "jane-dev",
      display_name: "Jane",
      bio: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("profileUpdateSchema", () => {
  it("allows partial updates", () => {
    const result = profileUpdateSchema.safeParse({
      display_name: "New Name",
    });
    expect(result.success).toBe(true);
  });

  it("does not allow handle updates", () => {
    const result = profileUpdateSchema.safeParse({
      handle: "new-handle",
      display_name: "Name",
    });
    // handle is stripped (omitted), not rejected
    expect(result.success).toBe(true);
    if (result.success) {
      expect("handle" in result.data).toBe(false);
    }
  });
});
