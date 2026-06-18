import type { SupabaseClient } from "@supabase/supabase-js";

import { buildDemoLexiconData } from "@/lib/lexicon-demo";
import type { Database, Json } from "@/lib/database.types";
import type {
  Lexeme,
  LexiconData,
  MorphologyRule,
  PartOfSpeech,
} from "@/lib/lexicon";
import { parseValidMorphologyRule } from "@/lib/morphology";
import type { ProjectDataStatus } from "@/lib/projects";

type Tables = Database["public"]["Tables"];
type PartOfSpeechRow = Tables["parts_of_speech"]["Row"];
type LexemeRow = Tables["lexemes"]["Row"];
type MorphologyRuleRow = Tables["morphology_rules"]["Row"];

export type LexiconDataClient = Pick<SupabaseClient<Database>, "auth" | "from">;

export type LexiconResult = {
  readonly status: ProjectDataStatus;
  readonly data: LexiconData;
  readonly message: string | null;
};

export type LexemeInput = {
  readonly projectId: string;
  readonly ipa: string;
  readonly romanization?: string | null;
  readonly meaning?: string | null;
  readonly partOfSpeechId?: string | null;
  readonly notes?: string | null;
};

const posSelect = "id, project_id, name, abbreviation, ordering, notes, created_at, updated_at";
const lexemeSelect =
  "id, project_id, ipa, romanization, meaning, part_of_speech_id, skipped_dimensions, intrinsic_levels, is_phonological_exception, derived_from_lexeme_id, derived_via_rule_id, root_only_via_derivations, notes, created_at, updated_at";
const ruleSelect =
  "id, project_id, name, rule_kind, rule_body, feature_bindings, input_pos_id, output_pos_id, auto_apply, is_active, ordering, notes, created_at, updated_at";

function mapPartOfSpeech(row: PartOfSpeechRow): PartOfSpeech {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    abbreviation: row.abbreviation,
    ordering: row.ordering,
    notes: row.notes,
  };
}

function mapLexeme(row: LexemeRow): Lexeme {
  return {
    id: row.id,
    projectId: row.project_id,
    ipa: row.ipa,
    romanization: row.romanization,
    meaning: row.meaning,
    partOfSpeechId: row.part_of_speech_id,
    isPhonologicalException: row.is_phonological_exception,
    derivedFromLexemeId: row.derived_from_lexeme_id,
    derivedViaRuleId: row.derived_via_rule_id,
    rootOnlyViaDerivations: row.root_only_via_derivations,
    notes: row.notes,
  };
}

function mapMorphologyRule(row: MorphologyRuleRow): MorphologyRule | null {
  const body = parseValidMorphologyRule(row.rule_body);
  if (!body) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    ruleKind: row.rule_kind,
    body,
    featureBindings: isRecord(row.feature_bindings) ? row.feature_bindings : {},
    inputPosId: row.input_pos_id,
    outputPosId: row.output_pos_id,
    autoApply: row.auto_apply,
    isActive: row.is_active,
    ordering: row.ordering,
    notes: row.notes,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function hasAuthenticatedUser(client: LexiconDataClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return {
      ok: false as const,
      message: error?.message ?? "Sign in to manage cloud lexicon data.",
    };
  }

  return { ok: true as const };
}

async function listTable<Row>(
  client: LexiconDataClient,
  table: keyof Tables,
  select: string,
  projectId: string,
  orderColumn: string,
) {
  const tableQuery = client.from(table) as never as {
    select(columns: string): {
      eq(column: string, value: string): {
        order(
          column: string,
          options: { readonly ascending: boolean },
        ): Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
  const { data, error } = await tableQuery
    .select(select)
    .eq("project_id", projectId)
    .order(orderColumn, { ascending: true });
  return { data: (data ?? []) as Row[], error };
}

export async function getLexiconData(
  client: LexiconDataClient | null,
  projectId: string,
): Promise<LexiconResult> {
  if (!client) {
    return {
      status: "demo",
      data: buildDemoLexiconData(projectId),
      message: "Supabase credentials are not configured. Lexicon changes are saved in this browser.",
    };
  }

  const auth = await hasAuthenticatedUser(client);
  if (!auth.ok) {
    return {
      status: "guest",
      data: buildDemoLexiconData(projectId),
      message: auth.message,
    };
  }

  const [partsOfSpeech, lexemes, morphologyRules] = await Promise.all([
    listTable<PartOfSpeechRow>(client, "parts_of_speech", posSelect, projectId, "ordering"),
    listTable<LexemeRow>(client, "lexemes", lexemeSelect, projectId, "ipa"),
    listTable<MorphologyRuleRow>(
      client,
      "morphology_rules",
      ruleSelect,
      projectId,
      "ordering",
    ),
  ]);

  const error = [partsOfSpeech.error, lexemes.error, morphologyRules.error].find(Boolean);
  if (error) {
    return {
      status: "error",
      data: buildDemoLexiconData(projectId),
      message: error.message,
    };
  }

  const referenceData = buildDemoLexiconData(projectId);

  return {
    status: "ready",
    data: {
      partsOfSpeech: partsOfSpeech.data.map(mapPartOfSpeech),
      lexemes: lexemes.data.map(mapLexeme),
      morphologyRules: morphologyRules.data
        .map(mapMorphologyRule)
        .filter((rule): rule is MorphologyRule => Boolean(rule)),
      swadesh: referenceData.swadesh,
      thesaurus: referenceData.thesaurus,
    },
    message: null,
  };
}

export async function createLexeme(
  client: LexiconDataClient | null,
  input: LexemeInput,
) {
  if (!client) {
    return { status: "demo" as const, lexeme: null, message: "Demo lexemes cannot be edited." };
  }

  const auth = await hasAuthenticatedUser(client);
  if (!auth.ok) {
    return { status: "guest" as const, lexeme: null, message: auth.message };
  }

  const { data, error } = await client
    .from("lexemes")
    .insert({
      project_id: input.projectId,
      ipa: input.ipa,
      romanization: input.romanization ?? null,
      meaning: input.meaning ?? null,
      part_of_speech_id: input.partOfSpeechId ?? null,
      skipped_dimensions: [] as Json,
      intrinsic_levels: {} as Json,
      is_phonological_exception: false,
      root_only_via_derivations: false,
      notes: input.notes ?? null,
    })
    .select(lexemeSelect)
    .single();

  if (error) {
    return { status: "error" as const, lexeme: null, message: error.message };
  }

  return { status: "ready" as const, lexeme: mapLexeme(data as LexemeRow), message: null };
}

export async function updateLexeme(
  client: LexiconDataClient | null,
  input: LexemeInput & { readonly id: string },
) {
  if (!client) {
    return { status: "demo" as const, lexeme: null, message: "Demo lexemes cannot be edited." };
  }

  const auth = await hasAuthenticatedUser(client);
  if (!auth.ok) {
    return { status: "guest" as const, lexeme: null, message: auth.message };
  }

  const { data, error } = await client
    .from("lexemes")
    .update({
      ipa: input.ipa,
      romanization: input.romanization ?? null,
      meaning: input.meaning ?? null,
      part_of_speech_id: input.partOfSpeechId ?? null,
      notes: input.notes ?? null,
    })
    .eq("id", input.id)
    .eq("project_id", input.projectId)
    .select(lexemeSelect)
    .single();

  if (error) {
    return { status: "error" as const, lexeme: null, message: error.message };
  }

  return { status: "ready" as const, lexeme: mapLexeme(data as LexemeRow), message: null };
}
