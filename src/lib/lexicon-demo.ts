import type { LexiconData } from "@/lib/lexicon";

export const demoSwadesh = [
  { id: "swadesh-water", category: "Nature", concept: "water" },
  { id: "swadesh-fire", category: "Nature", concept: "fire" },
  { id: "swadesh-stone", category: "Nature", concept: "stone" },
  { id: "swadesh-eat", category: "Actions", concept: "eat" },
  { id: "swadesh-see", category: "Actions", concept: "see" },
  { id: "swadesh-person", category: "People", concept: "person" },
] as const;

export const demoThesaurus = [
  {
    id: "world",
    name: "World & Matter",
    concepts: ["sky", "rain", "river"],
    children: [
      {
        id: "terrain",
        name: "Terrain",
        concepts: ["mountain", "valley", "island"],
      },
    ],
  },
  {
    id: "society",
    name: "People & Society",
    concepts: ["family", "village", "gift"],
    children: [
      {
        id: "kinship",
        name: "Kinship",
        concepts: ["parent", "child", "sibling"],
      },
    ],
  },
] as const;

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
    lexemes: [
      {
        id: "demo-lexeme-water",
        projectId,
        ipa: "paku",
        romanization: "paku",
        meaning: "water",
        partOfSpeechId: nounId,
        isPhonologicalException: false,
        derivedFromLexemeId: null,
        derivedViaRuleId: null,
        rootOnlyViaDerivations: false,
        notes: "Core root used in several reference concepts.",
      },
      {
        id: "demo-lexeme-fire",
        projectId,
        ipa: "tasi",
        romanization: "tasi",
        meaning: "fire",
        partOfSpeechId: nounId,
        isPhonologicalException: false,
        derivedFromLexemeId: null,
        derivedViaRuleId: null,
        rootOnlyViaDerivations: false,
        notes: null,
      },
      {
        id: "demo-lexeme-see",
        projectId,
        ipa: "meka",
        romanization: "meka",
        meaning: "see",
        partOfSpeechId: verbId,
        isPhonologicalException: false,
        derivedFromLexemeId: null,
        derivedViaRuleId: null,
        rootOnlyViaDerivations: false,
        notes: "Verb root; previews prefix and reduplication rules.",
      },
      {
        id: "demo-lexeme-red",
        projectId,
        ipa: "sina",
        romanization: "sina",
        meaning: "red",
        partOfSpeechId: adjectiveId,
        isPhonologicalException: false,
        derivedFromLexemeId: null,
        derivedViaRuleId: null,
        rootOnlyViaDerivations: false,
        notes: null,
      },
    ],
    morphologyRules: [
      {
        id: "demo-rule-place",
        projectId,
        name: "Locative noun",
        ruleKind: "derivational",
        body: {
          version: 1,
          kind: "morphology-rule",
          operation: { kind: "suffix", value: "ta" },
          feature_bindings: { pos: [nounId] },
        },
        featureBindings: {},
        inputPosId: nounId,
        outputPosId: nounId,
        autoApply: false,
        isActive: true,
        ordering: 10,
        notes: "Derives a place associated with the noun.",
      },
      {
        id: "demo-rule-agent",
        projectId,
        name: "Agent noun",
        ruleKind: "derivational",
        body: {
          version: 1,
          kind: "morphology-rule",
          branches: [
            {
              conditions: [
                {
                  kind: "pattern",
                  position: "ends-with",
                  pattern: [{ kind: "class", name: "V" }],
                },
              ],
              operations: [{ kind: "suffix", value: "n" }],
            },
            {
              conditions: [],
              operations: [{ kind: "suffix", value: "an" }],
            },
          ],
          feature_bindings: { pos: [verbId] },
        },
        featureBindings: {},
        inputPosId: verbId,
        outputPosId: nounId,
        autoApply: false,
        isActive: true,
        ordering: 20,
        notes: "Branching example: vowel-final roots take -n, otherwise -an.",
      },
      {
        id: "demo-rule-intensive",
        projectId,
        name: "Intensive",
        ruleKind: "derivational",
        body: {
          version: 1,
          kind: "morphology-rule",
          operation: { kind: "reduplication", scope: "cv", position: "prefix" },
          feature_bindings: { pos: [verbId, adjectiveId] },
        },
        featureBindings: {},
        inputPosId: null,
        outputPosId: null,
        autoApply: false,
        isActive: true,
        ordering: 30,
        notes: null,
      },
    ],
    swadesh: demoSwadesh,
    thesaurus: demoThesaurus,
  };
}
