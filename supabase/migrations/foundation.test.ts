import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "20260617221500_foundation.sql",
);
const migrationSql = readFileSync(migrationPath, "utf8");

const projectOwnedTables = [
  "phonemes",
  "natural_classes",
  "romanization_mappings",
  "phonotactic_templates",
  "phonotactic_constraints",
  "sound_rules",
  "parts_of_speech",
  "dimensions",
  "morphology_rules",
  "morphology_rule_parts_of_speech",
  "lexemes",
  "morphological_rule_exceptions",
  "paradigm_cell_overrides",
  "markers",
  "lexeme_parents",
  "project_settings",
] as const;

describe("Supabase foundation migration", () => {
  it("enables RLS on every project-owned table", () => {
    for (const table of projectOwnedTables) {
      expect(migrationSql).toContain(
        `alter table public.${table} enable row level security;`,
      );
    }
  });

  it("centralizes project ownership checks through projects.owner_id", () => {
    expect(migrationSql).toContain("create or replace function public.is_project_owner");
    expect(migrationSql).toContain("p.owner_id = auth.uid()");
    expect(migrationSql).toContain("public.is_project_owner(project_id)");
  });

  it("requires structured rule JSON instead of source DSL columns", () => {
    expect(migrationSql).toContain("rule_body jsonb not null");
    expect(migrationSql).toContain("template_body jsonb not null");
    expect(migrationSql).toContain("constraint_body jsonb not null");
    expect(migrationSql).toContain("rule_body ->> 'kind' = 'sound-rule'");
    expect(migrationSql).toContain("rule_body ->> 'kind' = 'morphology-rule'");
    expect(migrationSql).not.toMatch(/\bsource\s+text\s+not\s+null/i);
  });

  it("stores morphology rule application order per part of speech", () => {
    expect(migrationSql).toContain("rule_ordering integer not null default 0");
    expect(migrationSql).toContain(
      "morphology_rule_parts_of_speech_pos_order_idx",
    );
  });
});
