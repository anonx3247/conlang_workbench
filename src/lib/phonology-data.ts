import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/database.types";
import { buildDemoPhonologyData } from "@/lib/phonology-demo";
import {
  parseValidPhonotacticConstraint,
  parseValidPhonotacticTemplate,
  parseValidSoundRule,
  type NaturalClass,
  type Phoneme,
  type PhonemeFeatures,
  type PhonologyData,
  type PhonotacticConstraint,
  type PhonotacticTemplate,
  type RomanizationMapping,
  type SoundRule,
} from "@/lib/phonology";
import type { ProjectDataStatus } from "@/lib/projects";

type Tables = Database["public"]["Tables"];
type PhonemeRow = Tables["phonemes"]["Row"];
type NaturalClassRow = Tables["natural_classes"]["Row"];
type RomanizationRow = Tables["romanization_mappings"]["Row"];
type TemplateRow = Tables["phonotactic_templates"]["Row"];
type ConstraintRow = Tables["phonotactic_constraints"]["Row"];
type SoundRuleRow = Tables["sound_rules"]["Row"];

export type PhonologyDataClient = Pick<SupabaseClient<Database>, "auth" | "from">;

export type PhonologyResult = {
  readonly status: ProjectDataStatus;
  readonly data: PhonologyData;
  readonly message: string | null;
};

export type PhonemeInput = {
  readonly projectId: string;
  readonly symbol: string;
  readonly type: "consonant" | "vowel";
  readonly features?: PhonemeFeatures;
  readonly notes?: string | null;
};

const phonemeSelect =
  "id, project_id, symbol, phoneme_type, features, notes, created_at, updated_at";
const naturalClassSelect =
  "id, project_id, name, description, phoneme_ids, notes, created_at, updated_at";
const romanizationSelect =
  "id, project_id, ipa_symbol, latin_mapping, ordering, created_at, updated_at";
const templateSelect =
  "id, project_id, label, template_body, is_active, ordering, notes, created_at, updated_at";
const constraintSelect =
  "id, project_id, label, constraint_body, is_active, ordering, notes, created_at, updated_at";
const soundRuleSelect =
  "id, project_id, name, rule_body, is_active, ordering, notes, created_at, updated_at";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapFeatures(value: Json): PhonemeFeatures {
  return isRecord(value) ? (value as PhonemeFeatures) : {};
}

function mapPhoneme(row: PhonemeRow): Phoneme {
  return {
    id: row.id,
    projectId: row.project_id,
    symbol: row.symbol,
    type: row.phoneme_type,
    features: mapFeatures(row.features),
    notes: row.notes,
  };
}

function mapNaturalClass(row: NaturalClassRow): NaturalClass {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    phonemeIds: row.phoneme_ids,
    notes: row.notes,
  };
}

function mapRomanization(row: RomanizationRow): RomanizationMapping {
  return {
    id: row.id,
    projectId: row.project_id,
    ipaSymbol: row.ipa_symbol,
    latinMapping: row.latin_mapping,
    ordering: row.ordering,
  };
}

function mapTemplate(row: TemplateRow): PhonotacticTemplate | null {
  const body = parseValidPhonotacticTemplate(row.template_body);
  if (!body) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    label: row.label,
    body,
    isActive: row.is_active,
    ordering: row.ordering,
    notes: row.notes,
  };
}

function mapConstraint(row: ConstraintRow): PhonotacticConstraint | null {
  const body = parseValidPhonotacticConstraint(row.constraint_body);
  if (!body) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    label: row.label,
    body,
    isActive: row.is_active,
    ordering: row.ordering,
    notes: row.notes,
  };
}

function mapSoundRule(row: SoundRuleRow): SoundRule | null {
  const body = parseValidSoundRule(row.rule_body);
  if (!body) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    body,
    isActive: row.is_active,
    ordering: row.ordering,
    notes: row.notes,
  };
}

async function hasAuthenticatedUser(client: PhonologyDataClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return {
      ok: false as const,
      message: error?.message ?? "Sign in to manage cloud phonology data.",
    };
  }

  return { ok: true as const };
}

async function listTable<Row>(
  client: PhonologyDataClient,
  table: keyof Tables,
  select: string,
  projectId: string,
  orderColumn?: string,
) {
  const tableQuery = client.from(table) as never as {
    select(columns: string): {
      eq(column: string, value: string): {
        order(
          column: string,
          options: { readonly ascending: boolean },
        ): Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      } & Promise<{ data: unknown[] | null; error: { message: string } | null }>;
    };
  };
  const filtered = tableQuery.select(select).eq("project_id", projectId);
  const { data, error } = orderColumn
    ? await filtered.order(orderColumn, { ascending: true })
    : await filtered;
  return { data: (data ?? []) as Row[], error };
}

export async function getPhonologyData(
  client: PhonologyDataClient | null,
  projectId: string,
): Promise<PhonologyResult> {
  if (!client) {
    return {
      status: "demo",
      data: buildDemoPhonologyData(projectId),
      message: "Supabase credentials are not configured. Phonology data is read-only.",
    };
  }

  const auth = await hasAuthenticatedUser(client);
  if (!auth.ok) {
    return {
      status: "guest",
      data: buildDemoPhonologyData(projectId),
      message: auth.message,
    };
  }

  const [
    phonemes,
    naturalClasses,
    romanizationMappings,
    templates,
    constraints,
    soundRules,
  ] = await Promise.all([
    listTable<PhonemeRow>(client, "phonemes", phonemeSelect, projectId, "symbol"),
    listTable<NaturalClassRow>(
      client,
      "natural_classes",
      naturalClassSelect,
      projectId,
      "name",
    ),
    listTable<RomanizationRow>(
      client,
      "romanization_mappings",
      romanizationSelect,
      projectId,
      "ordering",
    ),
    listTable<TemplateRow>(
      client,
      "phonotactic_templates",
      templateSelect,
      projectId,
      "ordering",
    ),
    listTable<ConstraintRow>(
      client,
      "phonotactic_constraints",
      constraintSelect,
      projectId,
      "ordering",
    ),
    listTable<SoundRuleRow>(
      client,
      "sound_rules",
      soundRuleSelect,
      projectId,
      "ordering",
    ),
  ]);

  const error = [
    phonemes.error,
    naturalClasses.error,
    romanizationMappings.error,
    templates.error,
    constraints.error,
    soundRules.error,
  ].find(Boolean);

  if (error) {
    return {
      status: "error",
      data: buildDemoPhonologyData(projectId),
      message: error.message,
    };
  }

  return {
    status: "ready",
    data: {
      phonemes: phonemes.data.map(mapPhoneme),
      naturalClasses: naturalClasses.data.map(mapNaturalClass),
      romanizationMappings: romanizationMappings.data.map(mapRomanization),
      templates: templates.data.map(mapTemplate).filter((row): row is PhonotacticTemplate => Boolean(row)),
      constraints: constraints.data
        .map(mapConstraint)
        .filter((row): row is PhonotacticConstraint => Boolean(row)),
      soundRules: soundRules.data.map(mapSoundRule).filter((row): row is SoundRule => Boolean(row)),
    },
    message: null,
  };
}

export async function createPhoneme(
  client: PhonologyDataClient | null,
  input: PhonemeInput,
) {
  if (!client) {
    return { status: "demo" as const, phoneme: null, message: "Demo phonemes cannot be edited." };
  }

  const auth = await hasAuthenticatedUser(client);
  if (!auth.ok) {
    return { status: "guest" as const, phoneme: null, message: auth.message };
  }

  const { data, error } = await client
    .from("phonemes")
    .insert({
      project_id: input.projectId,
      symbol: input.symbol,
      phoneme_type: input.type,
      features: (input.features ?? {}) as Json,
      notes: input.notes ?? null,
    })
    .select(phonemeSelect)
    .single();

  if (error) {
    return { status: "error" as const, phoneme: null, message: error.message };
  }

  return { status: "ready" as const, phoneme: mapPhoneme(data as PhonemeRow), message: null };
}

export async function updatePhoneme(
  client: PhonologyDataClient | null,
  input: PhonemeInput & { readonly id: string },
) {
  if (!client) {
    return { status: "demo" as const, phoneme: null, message: "Demo phonemes cannot be edited." };
  }

  const auth = await hasAuthenticatedUser(client);
  if (!auth.ok) {
    return { status: "guest" as const, phoneme: null, message: auth.message };
  }

  const { data, error } = await client
    .from("phonemes")
    .update({
      symbol: input.symbol,
      phoneme_type: input.type,
      features: (input.features ?? {}) as Json,
      notes: input.notes ?? null,
    })
    .eq("id", input.id)
    .eq("project_id", input.projectId)
    .select(phonemeSelect)
    .single();

  if (error) {
    return { status: "error" as const, phoneme: null, message: error.message };
  }

  return { status: "ready" as const, phoneme: mapPhoneme(data as PhonemeRow), message: null };
}

export async function deletePhoneme(
  client: PhonologyDataClient | null,
  input: { readonly id: string; readonly projectId: string },
) {
  if (!client) {
    return { status: "demo" as const, message: "Demo phonemes cannot be edited." };
  }

  const auth = await hasAuthenticatedUser(client);
  if (!auth.ok) {
    return { status: "guest" as const, message: auth.message };
  }

  const { error } = await client
    .from("phonemes")
    .delete()
    .eq("id", input.id)
    .eq("project_id", input.projectId);

  if (error) {
    return { status: "error" as const, message: error.message };
  }

  return { status: "ready" as const, message: null };
}
