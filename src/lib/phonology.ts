import {
  isPhonotacticConstraintBody,
  isPhonotacticTemplateBody,
  isSoundRuleBody,
  type PhonotacticConstraintBody,
  type PhonotacticSlot,
  type PhonotacticTemplateBody,
  type SegmentPattern,
  type SoundRuleBody,
} from "@/lib/rules";

export type PhonemeType = "consonant" | "vowel";

export type PhonemeFeatures = {
  readonly manner?: string;
  readonly place?: string;
  readonly voicing?: "voiced" | "voiceless";
  readonly height?: string;
  readonly backness?: string;
  readonly rounded?: boolean;
};

export type Phoneme = {
  readonly id: string;
  readonly projectId: string;
  readonly symbol: string;
  readonly type: PhonemeType;
  readonly features: PhonemeFeatures;
  readonly notes: string | null;
};

export type NaturalClass = {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly description: string | null;
  readonly phonemeIds: readonly string[];
  readonly notes: string | null;
};

export type RomanizationMapping = {
  readonly id: string;
  readonly projectId: string;
  readonly ipaSymbol: string;
  readonly latinMapping: string;
  readonly ordering: number;
};

export type PhonotacticTemplate = {
  readonly id: string;
  readonly projectId: string;
  readonly label: string | null;
  readonly body: PhonotacticTemplateBody;
  readonly isActive: boolean;
  readonly ordering: number;
  readonly notes: string | null;
};

export type PhonotacticConstraint = {
  readonly id: string;
  readonly projectId: string;
  readonly label: string | null;
  readonly body: PhonotacticConstraintBody;
  readonly isActive: boolean;
  readonly ordering: number;
  readonly notes: string | null;
};

export type SoundRule = {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly body: SoundRuleBody;
  readonly isActive: boolean;
  readonly ordering: number;
  readonly notes: string | null;
};

export type PhonologyData = {
  readonly phonemes: readonly Phoneme[];
  readonly naturalClasses: readonly NaturalClass[];
  readonly romanizationMappings: readonly RomanizationMapping[];
  readonly templates: readonly PhonotacticTemplate[];
  readonly constraints: readonly PhonotacticConstraint[];
  readonly soundRules: readonly SoundRule[];
};

export type PhonologyInventory = {
  readonly consonants: readonly Phoneme[];
  readonly vowels: readonly Phoneme[];
  readonly classes: ReadonlyMap<string, readonly Phoneme[]>;
};

export type Picker = <T>(items: readonly T[], context: string) => T;

export function buildInventory(data: Pick<PhonologyData, "phonemes" | "naturalClasses">) {
  const consonants = data.phonemes.filter((phoneme) => phoneme.type === "consonant");
  const vowels = data.phonemes.filter((phoneme) => phoneme.type === "vowel");
  const byId = new Map(data.phonemes.map((phoneme) => [phoneme.id, phoneme]));
  const classes = new Map<string, readonly Phoneme[]>([
    ["C", consonants],
    ["V", vowels],
  ]);

  for (const naturalClass of data.naturalClasses) {
    const members = naturalClass.phonemeIds
      .map((id) => byId.get(id))
      .filter((phoneme): phoneme is Phoneme => Boolean(phoneme));
    classes.set(naturalClass.name, members);
    classes.set(naturalClass.name.toLowerCase(), members);
  }

  return { consonants, vowels, classes } satisfies PhonologyInventory;
}

export function romanize(
  input: string,
  mappings: readonly Pick<RomanizationMapping, "ipaSymbol" | "latinMapping" | "ordering">[],
  options: { readonly longVowels?: boolean } = {},
) {
  const ordered = [...mappings].sort(
    (left, right) =>
      right.ipaSymbol.length - left.ipaSymbol.length ||
      left.ordering - right.ordering ||
      left.ipaSymbol.localeCompare(right.ipaSymbol),
  );
  let output = "";
  let index = 0;

  while (index < input.length) {
    const match = ordered.find((mapping) => input.startsWith(mapping.ipaSymbol, index));
    if (match) {
      output += match.latinMapping;
      index += match.ipaSymbol.length;
    } else {
      output += input[index];
      index += 1;
    }
  }

  return options.longVowels ? applyLongVowelMarks(output) : output;
}

export function applyLongVowelMarks(input: string) {
  return input.replaceAll("aa", "ā")
    .replaceAll("ee", "ē")
    .replaceAll("ii", "ī")
    .replaceAll("oo", "ō")
    .replaceAll("uu", "ū")
    .replaceAll("AA", "Ā")
    .replaceAll("EE", "Ē")
    .replaceAll("II", "Ī")
    .replaceAll("OO", "Ō")
    .replaceAll("UU", "Ū");
}

export function generateWords({
  inventory,
  templates,
  count = 12,
  picker = firstPicker,
}: {
  readonly inventory: PhonologyInventory;
  readonly templates: readonly PhonotacticTemplate[];
  readonly count?: number;
  readonly picker?: Picker;
}) {
  const activeTemplates = templates
    .filter((template) => template.isActive && isPhonotacticTemplateBody(template.body))
    .sort((left, right) => left.ordering - right.ordering);

  if (activeTemplates.length === 0) {
    return [];
  }

  const words: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const template = picker(activeTemplates, `template:${index}`);
    const word = generateWord(template.body.slots, inventory, picker);
    if (word) {
      words.push(word);
    }
  }

  return words;
}

export function generateWord(
  slots: readonly PhonotacticSlot[],
  inventory: PhonologyInventory,
  picker: Picker = firstPicker,
) {
  let output = "";

  for (const [index, slot] of slots.entries()) {
    if (slot.optional) {
      const include = picker([true, false], `optional:${index}`);
      if (!include) {
        continue;
      }
    }

    if (slot.kind === "literal") {
      output += slot.value;
      continue;
    }

    const candidates = inventory.classes.get(slot.ref) ?? inventory.classes.get(slot.ref.toLowerCase()) ?? [];
    if (candidates.length === 0) {
      continue;
    }
    output += picker(candidates, `class:${slot.ref}:${index}`).symbol;
  }

  return output;
}

export function firstPicker<T>(items: readonly T[]) {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty list.");
  }
  return items[0];
}

export function templateToText(slots: readonly PhonotacticSlot[]) {
  return slots
    .map((slot) => {
      const value = slot.kind === "class" ? slot.ref : slot.value;
      return slot.optional ? `(${value})` : value;
    })
    .join("");
}

export function patternToText(pattern: SegmentPattern) {
  return pattern
    .map((segment) => {
      if (segment.kind === "literal") {
        return segment.value;
      }
      if (segment.kind === "class") {
        return `[${segment.name}]`;
      }
      return segment.value === "word-start" ? "#" : "#";
    })
    .join("");
}

export function soundRuleSummary(rule: SoundRuleBody) {
  const context = rule.context
    ? ` / ${patternToText(rule.context.left ?? [])}_${patternToText(rule.context.right ?? [])}`
    : "";
  return `${patternToText(rule.target)} -> ${patternToText(rule.replacement)}${context}`;
}

export function constraintSummary(body: PhonotacticConstraintBody) {
  if (body.kind === "gemination") {
    return `No gemination in ${body.positions.join(", ")}`;
  }

  const sequence = templateToText(body.sequence);
  const position = body.position && body.position !== "anywhere" ? ` at ${body.position}` : "";
  return `No ${sequence}${position}`;
}

export function parseValidPhonotacticTemplate(value: unknown) {
  return isPhonotacticTemplateBody(value) ? value : null;
}

export function parseValidPhonotacticConstraint(value: unknown) {
  return isPhonotacticConstraintBody(value) ? value : null;
}

export function parseValidSoundRule(value: unknown) {
  return isSoundRuleBody(value) ? value : null;
}
