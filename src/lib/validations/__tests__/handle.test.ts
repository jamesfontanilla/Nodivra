import { describe, it, expect } from "vitest";
import { handleSchema, RESERVED_HANDLES } from "../handle";

describe("handleSchema", () => {
  it("accepts valid handles", () => {
    const validHandles = [
      "jane",
      "jane-dev",
      "dev123",
      "my_handle",
      "abc",
      "a-very-long-but-valid-handle12",
    ];

    validHandles.forEach((handle) => {
      const result = handleSchema.safeParse(handle);
      expect(result.success, `Expected "${handle}" to be valid`).toBe(true);
    });
  });

  it("rejects handles that are too short", () => {
    const result = handleSchema.safeParse("ab");
    expect(result.success).toBe(false);
  });

  it("rejects handles that are too long", () => {
    const result = handleSchema.safeParse("a".repeat(31));
    expect(result.success).toBe(false);
  });

  it("rejects handles starting with a number", () => {
    const result = handleSchema.safeParse("1jane");
    expect(result.success).toBe(false);
  });

  it("rejects handles with uppercase letters", () => {
    const result = handleSchema.safeParse("Jane");
    expect(result.success).toBe(false);
  });

  it("rejects handles ending with a hyphen", () => {
    const result = handleSchema.safeParse("jane-");
    expect(result.success).toBe(false);
  });

  it("rejects handles with special characters", () => {
    const invalid = ["jane.dev", "jane@dev", "jane dev", "jane!"];
    invalid.forEach((handle) => {
      const result = handleSchema.safeParse(handle);
      expect(result.success, `Expected "${handle}" to be invalid`).toBe(false);
    });
  });

  it("rejects reserved handles", () => {
    RESERVED_HANDLES.forEach((handle) => {
      // Only test handles that pass the format regex (3+ chars, valid format)
      if (handle.length >= 3 && /^[a-z][a-z0-9_-]*[a-z0-9]$/.test(handle)) {
        const result = handleSchema.safeParse(handle);
        expect(result.success, `Expected "${handle}" to be reserved`).toBe(
          false
        );
      }
    });
  });
});
