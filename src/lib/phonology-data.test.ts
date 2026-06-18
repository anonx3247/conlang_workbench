import { describe, expect, it, vi } from "vitest";

import {
  createPhoneme,
  deletePhoneme,
  getPhonologyData,
  updatePhoneme,
  type PhonologyDataClient,
} from "@/lib/phonology-data";

const phonemeRow = {
  id: "phoneme-1",
  project_id: "project-1",
  symbol: "ʃ",
  phoneme_type: "consonant" as const,
  features: { manner: "fricative" },
  notes: "Only appears in careful speech.",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function clientWithTables(tables: Record<string, unknown>): PhonologyDataClient {
  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "user-1" } },
        error: null,
      })),
    },
    from: vi.fn((table: string) => tables[table]),
  } as unknown as PhonologyDataClient;
}

function listTable(data: readonly unknown[] = []) {
  const order = vi.fn(async () => ({ data, error: null }));
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  return { table: { select }, select, eq, order };
}

describe("phonology data access", () => {
  it("returns demo phonology data when Supabase is not configured", async () => {
    const result = await getPhonologyData(null, "project-1");

    expect(result.status).toBe("demo");
    expect(result.data.phonemes.length).toBeGreaterThan(0);
    expect(result.data.templates[0].body.slots[0]).toMatchObject({
      kind: "class",
      ref: "C",
    });
  });

  it("lists project phonology tables with notes columns", async () => {
    const phonemes = listTable([phonemeRow]);
    const naturalClasses = listTable([]);
    const romanization = listTable([]);
    const templates = listTable([]);
    const constraints = listTable([]);
    const soundRules = listTable([]);

    const result = await getPhonologyData(
      clientWithTables({
        phonemes: phonemes.table,
        natural_classes: naturalClasses.table,
        romanization_mappings: romanization.table,
        phonotactic_templates: templates.table,
        phonotactic_constraints: constraints.table,
        sound_rules: soundRules.table,
      }),
      "project-1",
    );

    expect(phonemes.select).toHaveBeenCalledWith(
      expect.stringContaining("notes"),
    );
    expect(naturalClasses.select).toHaveBeenCalledWith(
      expect.stringContaining("notes"),
    );
    expect(templates.select).toHaveBeenCalledWith(expect.stringContaining("notes"));
    expect(phonemes.eq).toHaveBeenCalledWith("project_id", "project-1");
    expect(result.data.phonemes[0]).toMatchObject({
      symbol: "ʃ",
      notes: "Only appears in careful speech.",
    });
  });

  it("creates phonemes with structured features and notes", async () => {
    const single = vi.fn(async () => ({ data: phonemeRow, error: null }));
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));

    await createPhoneme(clientWithTables({ phonemes: { insert } }), {
      projectId: "project-1",
      symbol: "ʃ",
      type: "consonant",
      features: { manner: "fricative" },
      notes: "Only appears in careful speech.",
    });

    expect(insert).toHaveBeenCalledWith({
      project_id: "project-1",
      symbol: "ʃ",
      phoneme_type: "consonant",
      features: { manner: "fricative" },
      notes: "Only appears in careful speech.",
    });
  });

  it("updates phonemes through id and project filters", async () => {
    const single = vi.fn(async () => ({ data: phonemeRow, error: null }));
    const select = vi.fn(() => ({ single }));
    const eqProject = vi.fn(() => ({ select }));
    const eqId = vi.fn(() => ({ eq: eqProject }));
    const update = vi.fn(() => ({ eq: eqId }));

    await updatePhoneme(clientWithTables({ phonemes: { update } }), {
      id: "phoneme-1",
      projectId: "project-1",
      symbol: "ʃ",
      type: "consonant",
      notes: "Updated note.",
    });

    expect(eqId).toHaveBeenCalledWith("id", "phoneme-1");
    expect(eqProject).toHaveBeenCalledWith("project_id", "project-1");
  });

  it("deletes phonemes through id and project filters", async () => {
    const eqProject = vi.fn(async () => ({ error: null }));
    const eqId = vi.fn(() => ({ eq: eqProject }));
    const deleteQuery = vi.fn(() => ({ eq: eqId }));

    await deletePhoneme(clientWithTables({ phonemes: { delete: deleteQuery } }), {
      id: "phoneme-1",
      projectId: "project-1",
    });

    expect(eqId).toHaveBeenCalledWith("id", "phoneme-1");
    expect(eqProject).toHaveBeenCalledWith("project_id", "project-1");
  });
});
