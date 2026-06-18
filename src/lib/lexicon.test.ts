import { describe, expect, it } from "vitest";

import { buildDemoLexiconData } from "@/lib/lexicon-demo";
import { filterLexemes, swadeshCoverage } from "@/lib/lexicon";
import {
  countThesaurusConcepts,
  swadeshReference,
  thesaurusReference,
} from "@/lib/lexicon-reference";

describe("lexicon domain", () => {
  it("filters lexemes by IPA, romanization, meaning, and POS labels", () => {
    const data = {
      ...buildDemoLexiconData("project-1"),
      lexemes: [
        {
          id: "lexeme-1",
          projectId: "project-1",
          ipa: "paku",
          romanization: "paku",
          meaning: "water",
          partOfSpeechId: "demo-pos-noun",
          isPhonologicalException: false,
          derivedFromLexemeId: null,
          derivedViaRuleId: null,
          rootOnlyViaDerivations: false,
          notes: null,
        },
        {
          id: "lexeme-2",
          projectId: "project-1",
          ipa: "meka",
          romanization: "meka",
          meaning: "see",
          partOfSpeechId: "demo-pos-verb",
          isPhonologicalException: false,
          derivedFromLexemeId: null,
          derivedViaRuleId: null,
          rootOnlyViaDerivations: false,
          notes: null,
        },
      ],
    };
    const noun = data.partsOfSpeech.find((pos) => pos.name === "Noun");

    expect(filterLexemes(data.lexemes, data.partsOfSpeech, { query: "pak" })).toHaveLength(1);
    expect(filterLexemes(data.lexemes, data.partsOfSpeech, { query: "water" })).toHaveLength(1);
    expect(filterLexemes(data.lexemes, data.partsOfSpeech, { query: "verb" })).toHaveLength(1);
    expect(
      filterLexemes(data.lexemes, data.partsOfSpeech, { partOfSpeechId: noun?.id }),
    ).toHaveLength(1);
  });

  it("computes Swadesh concept coverage from lexeme meanings", () => {
    const data = {
      ...buildDemoLexiconData("project-1"),
      lexemes: [
        {
          id: "lexeme-1",
          projectId: "project-1",
          ipa: "paku",
          romanization: "paku",
          meaning: "water",
          partOfSpeechId: "demo-pos-noun",
          isPhonologicalException: false,
          derivedFromLexemeId: null,
          derivedViaRuleId: null,
          rootOnlyViaDerivations: false,
          notes: null,
        },
      ],
    };
    const coverage = swadeshCoverage(data.swadesh, data.lexemes);

    expect(coverage.find((item) => item.concept.concept === "water")?.lexeme?.ipa).toBe("paku");
    expect(coverage.find((item) => item.concept.concept === "stone")?.lexeme).toBeNull();
  });

  it("loads the full bundled Swadesh and Conlanger's Thesaurus references", () => {
    expect(swadeshReference).toHaveLength(207);
    expect(swadeshReference[0]).toMatchObject({
      id: "1",
      concept: "I",
      category: "Pronouns",
    });
    expect(swadeshReference.some((item) => item.concept === "water")).toBe(true);

    expect(thesaurusReference.length).toBeGreaterThan(5);
    expect(thesaurusReference[0]).toMatchObject({ name: "The Physical World" });
    expect(countThesaurusConcepts()).toBeGreaterThan(400);
  });
});
