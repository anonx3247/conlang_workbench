import { patternToText, type PhonologyInventory } from "@/lib/phonology";
import {
  isMorphologyRuleBody,
  type MorphCondition,
  type MorphologyRuleBody,
  type MorphOperation,
  type SegmentPattern,
  type SegmentSelector,
} from "@/lib/rules";

export type MorphologyApplyResult =
  | { readonly status: "changed"; readonly form: string; readonly branchIndex: number }
  | { readonly status: "no-match"; readonly reason: string };

export function parseValidMorphologyRule(value: unknown) {
  return isMorphologyRuleBody(value) ? value : null;
}

export function tokenizeSegments(input: string, inventory: PhonologyInventory) {
  if (!input) {
    return [];
  }

  const symbols = [
    ...inventory.consonants.map((phoneme) => phoneme.symbol),
    ...inventory.vowels.map((phoneme) => phoneme.symbol),
    ...[...inventory.classes.values()].flat().map((phoneme) => phoneme.symbol),
  ]
    .filter((symbol, index, all) => all.indexOf(symbol) === index)
    .sort((left, right) => right.length - left.length || left.localeCompare(right));

  const tokens: string[] = [];
  let index = 0;
  while (index < input.length) {
    const match = symbols.find((symbol) => input.startsWith(symbol, index));
    if (match) {
      tokens.push(match);
      index += match.length;
    } else {
      tokens.push(input[index]);
      index += 1;
    }
  }

  return tokens;
}

export function applyMorphologyRule(
  root: string,
  rule: MorphologyRuleBody,
  inventory: PhonologyInventory,
): MorphologyApplyResult {
  if (!root) {
    return { status: "no-match", reason: "Root is empty." };
  }

  const branches = rule.branches?.length
    ? rule.branches
    : [
        {
          conditions: rule.conditions ?? [],
          operations: rule.operation ? [rule.operation] : [],
        },
      ];

  for (const [branchIndex, branch] of branches.entries()) {
    if (!matchesAllConditions(root, branch.conditions, inventory)) {
      continue;
    }

    const form = branch.operations.reduce(
      (working, operation) => applyMorphOperation(working, operation, inventory),
      root,
    );
    return { status: "changed", form, branchIndex };
  }

  return { status: "no-match", reason: `No branch matched ${root}.` };
}

export function applyMorphOperation(
  form: string,
  operation: MorphOperation,
  inventory: PhonologyInventory,
) {
  switch (operation.kind) {
    case "prefix":
      return `${operation.value}${form}`;
    case "suffix":
      return `${form}${operation.value}`;
    case "remove-suffix":
      return form.endsWith(operation.value)
        ? form.slice(0, form.length - operation.value.length)
        : form;
    case "suppletion":
      return operation.form;
    case "infix":
      return applyInfix(form, operation.value, operation.afterConsonant, inventory);
    case "ablaut":
    case "replace":
      return applyReplacement(
        form,
        operation.from,
        operation.to,
        inventory,
        operation.count,
        operation.direction ?? "from-start",
      );
    case "template":
      return applyTemplate(form, operation.slots, inventory);
    case "reduplication":
      return applyReduplication(form, operation.scope, operation.position, inventory);
  }
}

export function morphologyRuleSummary(rule: MorphologyRuleBody) {
  const bindings = rule.feature_bindings?.pos?.length
    ? ` for ${rule.feature_bindings.pos.join(", ")}`
    : "";

  if (rule.branches?.length) {
    const branchText = rule.branches
      .map((branch) => {
        const conditions = branch.conditions.length
          ? branch.conditions.map(conditionSummary).join(" and ")
          : "else";
        return `${conditions}: ${branch.operations.map(operationSummary).join(", ")}`;
      })
      .join(" | ");
    return `${branchText}${bindings}`;
  }

  const conditions = rule.conditions?.length
    ? `${rule.conditions.map(conditionSummary).join(" and ")}: `
    : "";
  return `${conditions}${rule.operation ? operationSummary(rule.operation) : "No operation"}${bindings}`;
}

export function operationSummary(operation: MorphOperation): string {
  switch (operation.kind) {
    case "prefix":
      return `prefix ${operation.value}`;
    case "suffix":
      return `suffix ${operation.value}`;
    case "infix":
      return `infix ${operation.value} after consonant ${operation.afterConsonant}`;
    case "ablaut":
    case "replace":
      return `replace ${selectorToText(operation.from)} with ${selectorToText(operation.to)}`;
    case "template":
      return `template ${operation.slots.join("")}`;
    case "reduplication":
      return `${operation.scope} reduplication as ${operation.position}`;
    case "suppletion":
      return `suppletion ${operation.form}`;
    case "remove-suffix":
      return `remove suffix ${operation.value}`;
  }
}

export function conditionSummary(condition: MorphCondition) {
  return `${condition.position} ${patternToText(condition.pattern)}`;
}

function applyInfix(
  form: string,
  value: string,
  afterConsonant: number,
  inventory: PhonologyInventory,
) {
  const tokens = tokenizeSegments(form, inventory);
  let consonantsSeen = 0;

  for (const [index, token] of tokens.entries()) {
    if (!isConsonant(token, inventory)) {
      continue;
    }
    consonantsSeen += 1;
    if (consonantsSeen === afterConsonant) {
      return `${tokens.slice(0, index + 1).join("")}${value}${tokens.slice(index + 1).join("")}`;
    }
  }

  return `${form}${value}`;
}

function applyReplacement(
  form: string,
  from: SegmentSelector,
  to: SegmentSelector,
  inventory: PhonologyInventory,
  count: number | undefined,
  direction: "from-start" | "from-end",
) {
  const tokens = tokenizeSegments(form, inventory);
  const replacement = selectorReplacementText(to);
  const matches = tokens
    .map((token, index) => (selectorMatchesToken(from, token, inventory) ? index : -1))
    .filter((index) => index >= 0);

  const selected = new Set(
    count
      ? direction === "from-end"
        ? matches.slice(-count)
        : matches.slice(0, count)
      : matches,
  );

  return tokens
    .map((token, index) => (selected.has(index) ? replacement : token))
    .join("");
}

function applyTemplate(
  form: string,
  slots: readonly string[],
  inventory: PhonologyInventory,
) {
  const consonants = tokenizeSegments(form, inventory).filter((token) =>
    isConsonant(token, inventory),
  );

  return slots
    .map((slot) => {
      const index = Number.parseInt(slot, 10);
      if (Number.isInteger(index) && index > 0) {
        return consonants[index - 1] ?? "";
      }
      return slot;
    })
    .join("");
}

function applyReduplication(
  form: string,
  scope: "full" | "cv" | "c",
  position: "prefix" | "suffix",
  inventory: PhonologyInventory,
) {
  const tokens = tokenizeSegments(form, inventory);
  const part =
    scope === "full"
      ? form
      : scope === "c"
        ? tokens.find((token) => isConsonant(token, inventory)) ?? ""
        : firstConsonantVowel(tokens, inventory) || form;

  return position === "prefix" ? `${part}${form}` : `${form}${part}`;
}

function firstConsonantVowel(tokens: readonly string[], inventory: PhonologyInventory) {
  const start = tokens.findIndex((token) => isConsonant(token, inventory));
  if (start < 0) {
    return "";
  }
  const vowel = tokens.slice(start + 1).find((token) => isVowel(token, inventory));
  return vowel ? `${tokens[start]}${vowel}` : tokens[start];
}

function matchesAllConditions(
  form: string,
  conditions: readonly MorphCondition[],
  inventory: PhonologyInventory,
) {
  return conditions.every((condition) =>
    patternMatches(form, condition.pattern, condition.position, inventory),
  );
}

function patternMatches(
  form: string,
  pattern: SegmentPattern,
  position: MorphCondition["position"],
  inventory: PhonologyInventory,
) {
  const tokens = tokenizeSegments(form, inventory);
  if (pattern.length === 0) {
    return true;
  }

  const matchAt = (start: number) => {
    if (start + pattern.length > tokens.length) {
      return false;
    }
    return pattern.every((selector, offset) =>
      selectorMatchesToken(selector, tokens[start + offset], inventory),
    );
  };

  if (position === "starts-with") {
    return matchAt(0);
  }
  if (position === "ends-with") {
    return matchAt(tokens.length - pattern.length);
  }

  return tokens.some((_, index) => matchAt(index));
}

function selectorMatchesToken(
  selector: SegmentSelector,
  token: string,
  inventory: PhonologyInventory,
) {
  if (selector.kind === "literal") {
    return selector.value === token;
  }
  if (selector.kind === "boundary") {
    return false;
  }

  const members = inventory.classes.get(selector.name) ?? inventory.classes.get(selector.name.toLowerCase()) ?? [];
  return members.some((phoneme) => phoneme.symbol === token);
}

function selectorReplacementText(selector: SegmentSelector) {
  return selector.kind === "literal" ? selector.value : selector.kind === "class" ? `[${selector.name}]` : "";
}

function selectorToText(selector: SegmentSelector) {
  return selector.kind === "literal" ? selector.value : selector.kind === "class" ? `[${selector.name}]` : "#";
}

function isConsonant(token: string, inventory: PhonologyInventory) {
  return inventory.consonants.some((phoneme) => phoneme.symbol === token);
}

function isVowel(token: string, inventory: PhonologyInventory) {
  return inventory.vowels.some((phoneme) => phoneme.symbol === token);
}
