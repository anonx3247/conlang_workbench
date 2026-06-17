import type { Phoneme, PhonemeType } from "@/lib/phonology";

export type IpaChartSound = {
  readonly symbol: string;
  readonly type: PhonemeType;
  readonly label: string;
  readonly manner?: string;
  readonly place?: string;
  readonly voicing?: "voiced" | "voiceless";
  readonly height?: string;
  readonly backness?: string;
  readonly rounded?: boolean;
  readonly audioAssetPath?: string;
};

export const consonantManners = [
  "plosive",
  "nasal",
  "fricative",
  "affricate",
] as const;

export const consonantPlaces = [
  "bilabial",
  "alveolar",
  "postalveolar",
  "velar",
] as const;

export const vowelHeights = ["close", "close-mid", "open"] as const;
export const vowelBacknesses = ["front", "back"] as const;

export const referenceConsonantManners = [
  "plosive",
  "nasal",
  "trill",
  "tap/flap",
  "fricative",
  "lateral fricative",
  "approximant",
  "lateral approximant",
  "affricate",
] as const;

export const referenceConsonantPlaces = [
  "bilabial",
  "labiodental",
  "dental",
  "alveolar",
  "postalveolar",
  "retroflex",
  "palatal",
  "velar",
  "uvular",
  "pharyngeal",
  "glottal",
  "labial-velar",
  "labial-palatal",
] as const;

export const referenceVowelHeights = [
  "close",
  "near-close",
  "close-mid",
  "mid",
  "open-mid",
  "near-open",
  "open",
] as const;

export const referenceVowelBacknesses = [
  "front",
  "near-front",
  "central",
  "near-back",
  "back",
] as const;

export const ipaKeyboardGroups = [
  {
    label: "Consonants",
    symbols: [
      "p",
      "b",
      "t",
      "d",
      "ʈ",
      "ɖ",
      "c",
      "ɟ",
      "k",
      "g",
      "q",
      "ɢ",
      "ʔ",
      "m",
      "ɱ",
      "n",
      "ŋ",
      "ɳ",
      "ɲ",
      "ɴ",
      "ʙ",
      "r",
      "ʀ",
      "ɾ",
      "ɽ",
      "ɸ",
      "β",
      "f",
      "v",
      "θ",
      "ð",
      "s",
      "z",
      "ʃ",
      "ʒ",
      "ʂ",
      "ʐ",
      "ç",
      "ʝ",
      "x",
      "ɣ",
      "χ",
      "ʁ",
      "ħ",
      "ʕ",
      "h",
      "ɦ",
      "ɬ",
      "ɮ",
      "ʋ",
      "ɹ",
      "ɻ",
      "l",
      "ɭ",
      "ʎ",
      "ʟ",
      "j",
      "ɰ",
      "w",
      "ʍ",
      "ɥ",
      "t͡ʃ",
      "d͡ʒ",
      "t͡s",
      "d͡z",
      "t͡ɕ",
      "d͡ʑ",
      "p͡f",
      "b͡v",
    ],
  },
  {
    label: "Vowels",
    symbols: [
      "i",
      "y",
      "ɨ",
      "ʉ",
      "ɯ",
      "u",
      "ɪ",
      "ʏ",
      "ʊ",
      "e",
      "ø",
      "ɘ",
      "ɵ",
      "ɤ",
      "o",
      "e̞",
      "ə",
      "ɛ",
      "œ",
      "ɜ",
      "ɞ",
      "ʌ",
      "ɔ",
      "æ",
      "ɐ",
      "a",
      "ɶ",
      "ä",
      "ɑ",
      "ɒ",
    ],
  },
  {
    label: "Non-pulmonic",
    symbols: [
      "ʘ",
      "ǀ",
      "ǃ",
      "ǂ",
      "ǁ",
      "ɓ",
      "ɗ",
      "ʄ",
      "ɠ",
      "ʛ",
      "pʼ",
      "tʼ",
      "kʼ",
      "sʼ",
      "ʃʼ",
      "ʼ",
    ],
  },
  {
    label: "Diacritics",
    symbols: [
      "̥",
      "̬",
      "ʰ",
      "ʱ",
      "̤",
      "̰",
      "̪",
      "̺",
      "̻",
      "̟",
      "̠",
      "̈",
      "̽",
      "˞",
      "̃",
      "ː",
      "ˑ",
      "̩",
      "̯",
      "ʷ",
      "ʲ",
      "ˠ",
      "ˤ",
      "̚",
    ],
  },
  {
    label: "Suprasegmentals",
    symbols: [
      "ˈ",
      "ˌ",
      "ː",
      "ˑ",
      "̆",
      ".",
      "|",
      "‖",
      "‿",
      "˥",
      "˦",
      "˧",
      "˨",
      "˩",
      "↗",
      "↘",
      "ꜛ",
      "ꜜ",
    ],
  },
] as const;

export const ipaChartSounds: readonly IpaChartSound[] = [
  {
    symbol: "p",
    type: "consonant",
    label: "voiceless bilabial plosive",
    manner: "plosive",
    place: "bilabial",
    voicing: "voiceless",
    audioAssetPath: "/ipa/p.ogg",
  },
  {
    symbol: "b",
    type: "consonant",
    label: "voiced bilabial plosive",
    manner: "plosive",
    place: "bilabial",
    voicing: "voiced",
  },
  {
    symbol: "t",
    type: "consonant",
    label: "voiceless alveolar plosive",
    manner: "plosive",
    place: "alveolar",
    voicing: "voiceless",
    audioAssetPath: "/ipa/t.ogg",
  },
  {
    symbol: "d",
    type: "consonant",
    label: "voiced alveolar plosive",
    manner: "plosive",
    place: "alveolar",
    voicing: "voiced",
  },
  {
    symbol: "k",
    type: "consonant",
    label: "voiceless velar plosive",
    manner: "plosive",
    place: "velar",
    voicing: "voiceless",
  },
  {
    symbol: "m",
    type: "consonant",
    label: "voiced bilabial nasal",
    manner: "nasal",
    place: "bilabial",
    voicing: "voiced",
  },
  {
    symbol: "n",
    type: "consonant",
    label: "voiced alveolar nasal",
    manner: "nasal",
    place: "alveolar",
    voicing: "voiced",
  },
  {
    symbol: "s",
    type: "consonant",
    label: "voiceless alveolar fricative",
    manner: "fricative",
    place: "alveolar",
    voicing: "voiceless",
  },
  {
    symbol: "ʃ",
    type: "consonant",
    label: "voiceless postalveolar fricative",
    manner: "fricative",
    place: "postalveolar",
    voicing: "voiceless",
  },
  {
    symbol: "t͡ʃ",
    type: "consonant",
    label: "voiceless postalveolar affricate",
    manner: "affricate",
    place: "postalveolar",
    voicing: "voiceless",
  },
  {
    symbol: "i",
    type: "vowel",
    label: "close front unrounded vowel",
    height: "close",
    backness: "front",
    rounded: false,
    audioAssetPath: "/ipa/i.ogg",
  },
  {
    symbol: "e",
    type: "vowel",
    label: "close-mid front unrounded vowel",
    height: "close-mid",
    backness: "front",
    rounded: false,
  },
  {
    symbol: "a",
    type: "vowel",
    label: "open front unrounded vowel",
    height: "open",
    backness: "front",
    rounded: false,
  },
  {
    symbol: "o",
    type: "vowel",
    label: "close-mid back rounded vowel",
    height: "close-mid",
    backness: "back",
    rounded: true,
  },
  {
    symbol: "u",
    type: "vowel",
    label: "close back rounded vowel",
    height: "close",
    backness: "back",
    rounded: true,
    audioAssetPath: "/ipa/u.ogg",
  },
];

export function findChartSound(symbol: string) {
  return ipaChartSounds.find((sound) => sound.symbol === symbol) ?? null;
}

export function phonemeChartPlacement(phoneme: Pick<Phoneme, "symbol" | "type" | "features">) {
  const chartSound = findChartSound(phoneme.symbol);
  const source = chartSound ?? {
    type: phoneme.type,
    ...phoneme.features,
  };

  if (source.type === "consonant") {
    const row = source.manner;
    const column = source.place;
    return row && column ? { chart: "consonants" as const, row, column } : null;
  }

  const row = source.height;
  const column = source.backness;
  return row && column ? { chart: "vowels" as const, row, column } : null;
}

export function chartHighlights(phonemes: readonly Phoneme[]) {
  const highlighted = new Set<string>();
  for (const phoneme of phonemes) {
    const placement = phonemeChartPlacement(phoneme);
    if (placement) {
      highlighted.add(`${placement.chart}:${placement.row}:${placement.column}:${phoneme.symbol}`);
    }
  }
  return highlighted;
}

export function audioState(sound: Pick<IpaChartSound, "audioAssetPath">) {
  return sound.audioAssetPath
    ? { available: true as const, label: "Play audio" }
    : { available: false as const, label: "Audio unavailable" };
}

const consonantPlacement: Record<string, { row: string; column: string }> = {
  p: { row: "plosive", column: "bilabial" },
  b: { row: "plosive", column: "bilabial" },
  t: { row: "plosive", column: "alveolar" },
  d: { row: "plosive", column: "alveolar" },
  "ʈ": { row: "plosive", column: "retroflex" },
  "ɖ": { row: "plosive", column: "retroflex" },
  c: { row: "plosive", column: "palatal" },
  "ɟ": { row: "plosive", column: "palatal" },
  k: { row: "plosive", column: "velar" },
  g: { row: "plosive", column: "velar" },
  q: { row: "plosive", column: "uvular" },
  "ɢ": { row: "plosive", column: "uvular" },
  "ʔ": { row: "plosive", column: "glottal" },
  m: { row: "nasal", column: "bilabial" },
  "ɱ": { row: "nasal", column: "labiodental" },
  n: { row: "nasal", column: "alveolar" },
  "ɳ": { row: "nasal", column: "retroflex" },
  "ɲ": { row: "nasal", column: "palatal" },
  "ŋ": { row: "nasal", column: "velar" },
  "ɴ": { row: "nasal", column: "uvular" },
  "ʙ": { row: "trill", column: "bilabial" },
  r: { row: "trill", column: "alveolar" },
  "ʀ": { row: "trill", column: "uvular" },
  "ɾ": { row: "tap/flap", column: "alveolar" },
  "ɽ": { row: "tap/flap", column: "retroflex" },
  "ɸ": { row: "fricative", column: "bilabial" },
  β: { row: "fricative", column: "bilabial" },
  f: { row: "fricative", column: "labiodental" },
  v: { row: "fricative", column: "labiodental" },
  θ: { row: "fricative", column: "dental" },
  ð: { row: "fricative", column: "dental" },
  s: { row: "fricative", column: "alveolar" },
  z: { row: "fricative", column: "alveolar" },
  "ʃ": { row: "fricative", column: "postalveolar" },
  "ʒ": { row: "fricative", column: "postalveolar" },
  "ʂ": { row: "fricative", column: "retroflex" },
  "ʐ": { row: "fricative", column: "retroflex" },
  ç: { row: "fricative", column: "palatal" },
  "ʝ": { row: "fricative", column: "palatal" },
  x: { row: "fricative", column: "velar" },
  "ɣ": { row: "fricative", column: "velar" },
  χ: { row: "fricative", column: "uvular" },
  "ʁ": { row: "fricative", column: "uvular" },
  ħ: { row: "fricative", column: "pharyngeal" },
  "ʕ": { row: "fricative", column: "pharyngeal" },
  h: { row: "fricative", column: "glottal" },
  "ɦ": { row: "fricative", column: "glottal" },
  "ɬ": { row: "lateral fricative", column: "alveolar" },
  "ɮ": { row: "lateral fricative", column: "alveolar" },
  "ʋ": { row: "approximant", column: "labiodental" },
  "ɹ": { row: "approximant", column: "alveolar" },
  "ɻ": { row: "approximant", column: "retroflex" },
  j: { row: "approximant", column: "palatal" },
  "ɰ": { row: "approximant", column: "velar" },
  w: { row: "approximant", column: "labial-velar" },
  "ʍ": { row: "fricative", column: "labial-velar" },
  "ɥ": { row: "approximant", column: "labial-palatal" },
  l: { row: "lateral approximant", column: "alveolar" },
  "ɭ": { row: "lateral approximant", column: "retroflex" },
  "ʎ": { row: "lateral approximant", column: "palatal" },
  "ʟ": { row: "lateral approximant", column: "velar" },
  "t͡s": { row: "affricate", column: "alveolar" },
  "d͡z": { row: "affricate", column: "alveolar" },
  "t͡ʃ": { row: "affricate", column: "postalveolar" },
  "d͡ʒ": { row: "affricate", column: "postalveolar" },
  "t͡ɕ": { row: "affricate", column: "palatal" },
  "d͡ʑ": { row: "affricate", column: "palatal" },
  "p͡f": { row: "affricate", column: "labiodental" },
  "b͡v": { row: "affricate", column: "labiodental" },
};

const vowelPlacement: Record<string, { row: string; column: string }> = {
  i: { row: "close", column: "front" },
  y: { row: "close", column: "front" },
  "ɨ": { row: "close", column: "central" },
  "ʉ": { row: "close", column: "central" },
  "ɯ": { row: "close", column: "back" },
  u: { row: "close", column: "back" },
  "ɪ": { row: "near-close", column: "near-front" },
  "ʏ": { row: "near-close", column: "near-front" },
  "ʊ": { row: "near-close", column: "near-back" },
  e: { row: "close-mid", column: "front" },
  ø: { row: "close-mid", column: "front" },
  "ɘ": { row: "close-mid", column: "central" },
  "ɵ": { row: "close-mid", column: "central" },
  "ɤ": { row: "close-mid", column: "back" },
  o: { row: "close-mid", column: "back" },
  "e̞": { row: "mid", column: "front" },
  ə: { row: "mid", column: "central" },
  ɛ: { row: "open-mid", column: "front" },
  œ: { row: "open-mid", column: "front" },
  "ɜ": { row: "open-mid", column: "central" },
  "ɞ": { row: "open-mid", column: "central" },
  "ʌ": { row: "open-mid", column: "back" },
  ɔ: { row: "open-mid", column: "back" },
  æ: { row: "near-open", column: "front" },
  "ɐ": { row: "near-open", column: "central" },
  a: { row: "open", column: "front" },
  "ɶ": { row: "open", column: "front" },
  ä: { row: "open", column: "central" },
  "ɑ": { row: "open", column: "back" },
  "ɒ": { row: "open", column: "back" },
};

export function chartCell(symbol: string, row: string, column: string) {
  const consonant = consonantPlacement[symbol];
  if (consonant) {
    return consonant.row === row && consonant.column === column;
  }

  const vowel = vowelPlacement[symbol];
  return vowel?.row === row && vowel.column === column;
}
