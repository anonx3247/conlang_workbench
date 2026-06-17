import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "20260617233000_user_authored_notes.sql",
);
const foundationPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "20260617221500_foundation.sql",
);
const migrationSql = readFileSync(migrationPath, "utf8");
const foundationSql = readFileSync(foundationPath, "utf8");

const addedNotesTables = [
  "natural_classes",
  "phonotactic_templates",
  "phonotactic_constraints",
  "sound_rules",
  "parts_of_speech",
  "dimensions",
  "morphology_rules",
  "lexemes",
  "markers",
] as const;

describe("user-authored notes migration", () => {
  it("keeps already-modeled notes columns as the notes foundation baseline", () => {
    expect(foundationSql).toMatch(/create table public\.phonemes \([\s\S]*?notes text,/);
    expect(foundationSql).toMatch(
      /create table public\.morphological_rule_exceptions \([\s\S]*?notes text,/,
    );
    expect(foundationSql).toMatch(
      /create table public\.paradigm_cell_overrides \([\s\S]*?notes text,/,
    );
  });

  it("adds reusable notes columns to user-authored project entities missing them", () => {
    for (const table of addedNotesTables) {
      expect(migrationSql).toContain(`alter table public.${table}`);
      expect(migrationSql).toContain("add column notes text");
    }
  });

  it("does not duplicate relationship-specific notes columns that already exist", () => {
    expect(migrationSql).not.toContain("alter table public.paradigm_cell_overrides");
    expect(migrationSql).not.toContain("alter table public.morphological_rule_exceptions");
    expect(migrationSql).not.toContain("alter table public.lexeme_parents");
  });
});
