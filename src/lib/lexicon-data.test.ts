import { describe, expect, it, vi } from "vitest";

import {
  createLexeme,
  getLexiconData,
  updateLexeme,
  type LexiconDataClient,
} from "@/lib/lexicon-data";

const posRow = {
  id: "pos-noun",
  project_id: "project-1",
  name: "Noun",
  abbreviation: "N",
  ordering: 10,
  notes: "Open class.",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const lexemeRow = {
  id: "lexeme-1",
  project_id: "project-1",
  ipa: "paku",
  romanization: "paku",
  meaning: "water",
  part_of_speech_id: "pos-noun",
  skipped_dimensions: [],
  intrinsic_levels: {},
  is_phonological_exception: false,
  derived_from_lexeme_id: null,
  derived_via_rule_id: null,
  root_only_via_derivations: false,
  notes: "Core root.",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const ruleRow = {
  id: "rule-1",
  project_id: "project-1",
  name: "Locative",
  rule_kind: "derivational" as const,
  rule_body: {
    version: 1,
    kind: "morphology-rule",
    operation: { kind: "suffix", value: "ta" },
  },
  feature_bindings: {},
  input_pos_id: "pos-noun",
  output_pos_id: "pos-noun",
  auto_apply: false,
  is_active: true,
  ordering: 10,
  notes: "Rule note.",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function clientWithTables(tables: Record<string, unknown>): LexiconDataClient {
  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "user-1" } },
        error: null,
      })),
    },
    from: vi.fn((table: string) => tables[table]),
  } as unknown as LexiconDataClient;
}

function listTable(data: readonly unknown[] = []) {
  const order = vi.fn(async () => ({ data, error: null }));
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  return { table: { select }, select, eq, order };
}

describe("lexicon data access", () => {
  it("returns demo lexicon data when Supabase is not configured", async () => {
    const result = await getLexiconData(null, "project-1");

    expect(result.status).toBe("demo");
    expect(result.data.lexemes[0]).toMatchObject({ ipa: "paku", notes: expect.any(String) });
    expect(result.data.morphologyRules[0].body).toMatchObject({
      kind: "morphology-rule",
    });
  });

  it("lists project lexicon tables with structured rule bodies and notes", async () => {
    const pos = listTable([posRow]);
    const lexemes = listTable([lexemeRow]);
    const rules = listTable([ruleRow]);

    const result = await getLexiconData(
      clientWithTables({
        parts_of_speech: pos.table,
        lexemes: lexemes.table,
        morphology_rules: rules.table,
      }),
      "project-1",
    );

    expect(pos.select).toHaveBeenCalledWith(expect.stringContaining("notes"));
    expect(lexemes.select).toHaveBeenCalledWith(expect.stringContaining("notes"));
    expect(rules.select).toHaveBeenCalledWith(expect.stringContaining("rule_body"));
    expect(lexemes.eq).toHaveBeenCalledWith("project_id", "project-1");
    expect(result.data.partsOfSpeech[0]).toMatchObject({ name: "Noun", notes: "Open class." });
    expect(result.data.lexemes[0]).toMatchObject({ meaning: "water", notes: "Core root." });
    expect(result.data.morphologyRules[0]).toMatchObject({ name: "Locative", notes: "Rule note." });
  });

  it("creates lexemes with notes", async () => {
    const single = vi.fn(async () => ({ data: lexemeRow, error: null }));
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));

    await createLexeme(clientWithTables({ lexemes: { insert } }), {
      projectId: "project-1",
      ipa: "paku",
      romanization: "paku",
      meaning: "water",
      partOfSpeechId: "pos-noun",
      notes: "Core root.",
    });

    expect(insert).toHaveBeenCalledWith({
      project_id: "project-1",
      ipa: "paku",
      romanization: "paku",
      meaning: "water",
      part_of_speech_id: "pos-noun",
      skipped_dimensions: [],
      intrinsic_levels: {},
      is_phonological_exception: false,
      root_only_via_derivations: false,
      notes: "Core root.",
    });
  });

  it("updates lexemes through id and project filters", async () => {
    const single = vi.fn(async () => ({ data: lexemeRow, error: null }));
    const select = vi.fn(() => ({ single }));
    const eqProject = vi.fn(() => ({ select }));
    const eqId = vi.fn(() => ({ eq: eqProject }));
    const update = vi.fn(() => ({ eq: eqId }));

    await updateLexeme(clientWithTables({ lexemes: { update } }), {
      id: "lexeme-1",
      projectId: "project-1",
      ipa: "paku",
      notes: "Updated.",
    });

    expect(eqId).toHaveBeenCalledWith("id", "lexeme-1");
    expect(eqProject).toHaveBeenCalledWith("project_id", "project-1");
  });
});
