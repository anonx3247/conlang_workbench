import { describe, expect, it } from "vitest";

import { buildDemoLexiconData } from "@/lib/lexicon-demo";
import { filterLexemes, swadeshCoverage } from "@/lib/lexicon";

describe("lexicon domain", () => {
  it("filters lexemes by IPA, romanization, meaning, and POS labels", () => {
    const data = buildDemoLexiconData("project-1");
    const noun = data.partsOfSpeech.find((pos) => pos.name === "Noun");

    expect(filterLexemes(data.lexemes, data.partsOfSpeech, { query: "pak" })).toHaveLength(1);
    expect(filterLexemes(data.lexemes, data.partsOfSpeech, { query: "water" })).toHaveLength(1);
    expect(filterLexemes(data.lexemes, data.partsOfSpeech, { query: "verb" })).toHaveLength(1);
    expect(
      filterLexemes(data.lexemes, data.partsOfSpeech, { partOfSpeechId: noun?.id }),
    ).toHaveLength(2);
  });

  it("computes Swadesh concept coverage from lexeme meanings", () => {
    const data = buildDemoLexiconData("project-1");
    const coverage = swadeshCoverage(data.swadesh, data.lexemes);

    expect(coverage.find((item) => item.concept.concept === "water")?.lexeme?.ipa).toBe("paku");
    expect(coverage.find((item) => item.concept.concept === "person")?.lexeme).toBeNull();
  });
});
