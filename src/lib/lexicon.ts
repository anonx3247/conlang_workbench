import type { MorphologyRuleBody } from "@/lib/rules";

export type PartOfSpeech = {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly abbreviation: string;
  readonly ordering: number;
  readonly notes: string | null;
};

export type Lexeme = {
  readonly id: string;
  readonly projectId: string;
  readonly ipa: string;
  readonly romanization: string | null;
  readonly meaning: string | null;
  readonly partOfSpeechId: string | null;
  readonly isPhonologicalException: boolean;
  readonly derivedFromLexemeId: string | null;
  readonly derivedViaRuleId: string | null;
  readonly rootOnlyViaDerivations: boolean;
  readonly notes: string | null;
};

export type MorphologyRule = {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly ruleKind: "inflectional" | "derivational";
  readonly body: MorphologyRuleBody;
  readonly featureBindings: Record<string, unknown>;
  readonly inputPosId: string | null;
  readonly outputPosId: string | null;
  readonly autoApply: boolean;
  readonly isActive: boolean;
  readonly ordering: number;
  readonly notes: string | null;
};

export type SwadeshConcept = {
  readonly id: string;
  readonly category: string;
  readonly concept: string;
};

export type ThesaurusCategory = {
  readonly id: string;
  readonly name: string;
  readonly concepts: readonly string[];
  readonly children?: readonly ThesaurusCategory[];
};

export type LexiconData = {
  readonly partsOfSpeech: readonly PartOfSpeech[];
  readonly lexemes: readonly Lexeme[];
  readonly morphologyRules: readonly MorphologyRule[];
  readonly swadesh: readonly SwadeshConcept[];
  readonly thesaurus: readonly ThesaurusCategory[];
};

export type LexiconFilters = {
  readonly query?: string;
  readonly partOfSpeechId?: string;
};

export function displayLexemeForm(lexeme: Lexeme) {
  return lexeme.romanization || lexeme.ipa;
}

export function posLabel(pos: PartOfSpeech | null | undefined) {
  if (!pos) {
    return "Unassigned";
  }
  return `${pos.name} (${pos.abbreviation})`;
}

export function filterLexemes(
  lexemes: readonly Lexeme[],
  partsOfSpeech: readonly PartOfSpeech[],
  filters: LexiconFilters,
) {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const posById = new Map(partsOfSpeech.map((pos) => [pos.id, pos]));

  return lexemes.filter((lexeme) => {
    const pos = lexeme.partOfSpeechId ? posById.get(lexeme.partOfSpeechId) : null;
    const matchesPos =
      !filters.partOfSpeechId || lexeme.partOfSpeechId === filters.partOfSpeechId;
    const searchable = [
      lexeme.ipa,
      lexeme.romanization,
      lexeme.meaning,
      pos?.name,
      pos?.abbreviation,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesPos && (!query || searchable.includes(query));
  });
}

export function swadeshCoverage(
  concepts: readonly SwadeshConcept[],
  lexemes: readonly Lexeme[],
) {
  const lexemesByMeaning = new Map(
    lexemes
      .filter((lexeme) => lexeme.meaning)
      .map((lexeme) => [lexeme.meaning!.toLowerCase(), lexeme]),
  );

  return concepts.map((concept) => ({
    concept,
    lexeme: lexemesByMeaning.get(concept.concept.toLowerCase()) ?? null,
  }));
}
