import { describe, expect, it } from "vitest";

import { noteMaxLength, notePreview, normalizeNote, validateNote } from "@/lib/notes";

describe("notes helpers", () => {
  it("normalizes blank notes to null", () => {
    expect(normalizeNote("   ")).toBeNull();
    expect(normalizeNote("  marks passive voice  ")).toBe("marks passive voice");
  });

  it("truncates compact previews without changing stored notes", () => {
    expect(notePreview("future generally but conditional in subjunctive clauses", 18)).toBe(
      "future generally...",
    );
  });

  it("validates note length", () => {
    expect(validateNote("a".repeat(noteMaxLength))).toMatchObject({ ok: true });
    expect(validateNote("a".repeat(noteMaxLength + 1))).toMatchObject({
      ok: false,
    });
  });
});
