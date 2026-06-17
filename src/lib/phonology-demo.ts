import type { Phoneme, PhonologyData } from "@/lib/phonology";

export const commonIpaSeed: readonly Omit<Phoneme, "id" | "projectId" | "notes">[] = [
  {
    symbol: "p",
    type: "consonant",
    features: { manner: "plosive", place: "bilabial", voicing: "voiceless" },
  },
  {
    symbol: "b",
    type: "consonant",
    features: { manner: "plosive", place: "bilabial", voicing: "voiced" },
  },
  {
    symbol: "t",
    type: "consonant",
    features: { manner: "plosive", place: "alveolar", voicing: "voiceless" },
  },
  {
    symbol: "d",
    type: "consonant",
    features: { manner: "plosive", place: "alveolar", voicing: "voiced" },
  },
  {
    symbol: "k",
    type: "consonant",
    features: { manner: "plosive", place: "velar", voicing: "voiceless" },
  },
  {
    symbol: "m",
    type: "consonant",
    features: { manner: "nasal", place: "bilabial", voicing: "voiced" },
  },
  {
    symbol: "n",
    type: "consonant",
    features: { manner: "nasal", place: "alveolar", voicing: "voiced" },
  },
  {
    symbol: "s",
    type: "consonant",
    features: { manner: "fricative", place: "alveolar", voicing: "voiceless" },
  },
  {
    symbol: "ʃ",
    type: "consonant",
    features: {
      manner: "fricative",
      place: "postalveolar",
      voicing: "voiceless",
    },
  },
  {
    symbol: "t͡ʃ",
    type: "consonant",
    features: {
      manner: "affricate",
      place: "postalveolar",
      voicing: "voiceless",
    },
  },
  {
    symbol: "i",
    type: "vowel",
    features: { height: "close", backness: "front", rounded: false },
  },
  {
    symbol: "e",
    type: "vowel",
    features: { height: "close-mid", backness: "front", rounded: false },
  },
  {
    symbol: "a",
    type: "vowel",
    features: { height: "open", backness: "front", rounded: false },
  },
  {
    symbol: "o",
    type: "vowel",
    features: { height: "close-mid", backness: "back", rounded: true },
  },
  {
    symbol: "u",
    type: "vowel",
    features: { height: "close", backness: "back", rounded: true },
  },
];

export function buildDemoPhonologyData(projectId: string): PhonologyData {
  const phonemes: readonly Phoneme[] = commonIpaSeed.map((phoneme, index) => ({
    ...phoneme,
    id: `demo-phoneme-${index + 1}`,
    projectId,
    notes: null,
  }));

  const bySymbol = new Map(phonemes.map((phoneme) => [phoneme.symbol, phoneme.id]));
  const ids = (...symbols: readonly string[]) =>
    symbols.map((symbol) => bySymbol.get(symbol)).filter((id): id is string => Boolean(id));

  return {
    phonemes,
    naturalClasses: [
      {
        id: "demo-class-stops",
        projectId,
        name: "Stop",
        description: "Oral stops in the active inventory.",
        phonemeIds: ids("p", "b", "t", "d", "k"),
        notes: "Use this class for simple onset and coda templates.",
      },
      {
        id: "demo-class-sibilants",
        projectId,
        name: "Sibilant",
        description: "Alveolar and postalveolar fricatives or affricates.",
        phonemeIds: ids("s", "ʃ", "t͡ʃ"),
        notes: null,
      },
    ],
    romanizationMappings: [
      {
        id: "demo-rom-sh",
        projectId,
        ipaSymbol: "ʃ",
        latinMapping: "sh",
        ordering: 10,
      },
      {
        id: "demo-rom-ch",
        projectId,
        ipaSymbol: "t͡ʃ",
        latinMapping: "ch",
        ordering: 20,
      },
    ],
    templates: [
      {
        id: "demo-template-cvc",
        projectId,
        label: "Open/closed syllable",
        body: {
          version: 1,
          kind: "phonotactic-template",
          slots: [
            { kind: "class", ref: "C", optional: true },
            { kind: "class", ref: "V" },
            { kind: "class", ref: "C", optional: true },
          ],
        },
        isActive: true,
        ordering: 10,
        notes: "Optional onset and coda, required vowel nucleus.",
      },
      {
        id: "demo-template-sv",
        projectId,
        label: "Sibilant onset",
        body: {
          version: 1,
          kind: "phonotactic-template",
          slots: [
            { kind: "class", ref: "Sibilant" },
            { kind: "class", ref: "V" },
          ],
        },
        isActive: true,
        ordering: 20,
        notes: null,
      },
    ],
    constraints: [
      {
        id: "demo-constraint-cluster",
        projectId,
        label: "No initial clusters",
        body: {
          version: 1,
          kind: "forbidden-sequence",
          sequence: [
            { kind: "class", ref: "C" },
            { kind: "class", ref: "C" },
          ],
          position: "start",
        },
        isActive: true,
        ordering: 10,
        notes: "Prevents generated words from starting with two consonants.",
      },
    ],
    soundRules: [
      {
        id: "demo-rule-lenition",
        projectId,
        name: "Intervocalic lenition placeholder",
        body: {
          version: 1,
          kind: "sound-rule",
          target: [{ kind: "literal", value: "k" }],
          replacement: [{ kind: "literal", value: "x" }],
          context: {
            left: [{ kind: "class", name: "V" }],
            right: [{ kind: "class", name: "V" }],
          },
        },
        isActive: false,
        ordering: 10,
        notes: "Placeholder only; application will come after structured rule editing.",
      },
    ],
  };
}
