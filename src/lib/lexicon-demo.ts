import type { LexiconData } from "@/lib/lexicon";
import { swadeshReference, thesaurusReference } from "@/lib/lexicon-reference";

export function buildDemoLexiconData(projectId: string): LexiconData {
  const nounId = "demo-pos-noun";
  const verbId = "demo-pos-verb";
  const adjectiveId = "demo-pos-adjective";

  return {
    partsOfSpeech: [
      {
        id: nounId,
        projectId,
        name: "Noun",
        abbreviation: "N",
        ordering: 10,
        notes: "Minimal POS labels for dictionary filtering and derivation bindings.",
      },
      {
        id: verbId,
        projectId,
        name: "Verb",
        abbreviation: "V",
        ordering: 20,
        notes: null,
      },
      {
        id: adjectiveId,
        projectId,
        name: "Adjective",
        abbreviation: "ADJ",
        ordering: 30,
        notes: null,
      },
    ],
    lexemes: [],
    morphologyRules: [],
    swadesh: swadeshReference,
    thesaurus: thesaurusReference,
  };
}
