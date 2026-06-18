type UnknownRecord = Record<string, unknown>;

export type SegmentSelector =
  | { readonly kind: "literal"; readonly value: string }
  | { readonly kind: "class"; readonly name: string }
  | { readonly kind: "boundary"; readonly value: "word-start" | "word-end" };

export type SegmentPattern = readonly SegmentSelector[];

export type SoundRuleBody = {
  readonly version: 1;
  readonly kind: "sound-rule";
  readonly target: SegmentPattern;
  readonly replacement: SegmentPattern;
  readonly context?: {
    readonly left?: SegmentPattern;
    readonly right?: SegmentPattern;
  };
};

export type MorphOperation =
  | { readonly kind: "prefix"; readonly value: string }
  | { readonly kind: "suffix"; readonly value: string }
  | { readonly kind: "infix"; readonly value: string; readonly afterConsonant: number }
  | {
      readonly kind: "ablaut";
      readonly from: SegmentSelector;
      readonly to: SegmentSelector;
      readonly count?: number;
      readonly direction?: "from-start" | "from-end";
    }
  | { readonly kind: "template"; readonly slots: readonly string[] }
  | { readonly kind: "reduplication"; readonly scope: "full" | "cv" | "c"; readonly position: "prefix" | "suffix" }
  | { readonly kind: "suppletion"; readonly form: string }
  | { readonly kind: "remove-suffix"; readonly value: string };

export type MorphCondition = {
  readonly kind: "pattern";
  readonly pattern: SegmentPattern;
  readonly position: "starts-with" | "ends-with" | "contains";
};

export type MorphBranch = {
  readonly conditions: readonly MorphCondition[];
  readonly operations: readonly MorphOperation[];
};

export type MorphologyRuleBody = {
  readonly version: 1;
  readonly kind: "morphology-rule";
  readonly operation?: MorphOperation;
  readonly conditions?: readonly MorphCondition[];
  readonly branches?: readonly MorphBranch[];
  readonly feature_bindings?: {
    readonly pos?: readonly string[];
    readonly dimensions?: Record<string, string>;
  };
};

export type PhonotacticSlot =
  | { readonly kind: "class"; readonly ref: string; readonly optional?: boolean }
  | { readonly kind: "literal"; readonly value: string; readonly optional?: boolean };

export type PhonotacticTemplateBody = {
  readonly version: 1;
  readonly kind: "phonotactic-template";
  readonly slots: readonly PhonotacticSlot[];
};

export type PhonotacticConstraintBody =
  | {
      readonly version: 1;
      readonly kind: "forbidden-sequence";
      readonly sequence: readonly PhonotacticSlot[];
      readonly position?: "anywhere" | "start" | "end";
    }
  | {
      readonly version: 1;
      readonly kind: "gemination";
      readonly positions: readonly ("everywhere" | "coda" | "onset" | "initial" | "final")[];
    };

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isSegmentSelector(value: unknown): value is SegmentSelector {
  if (!isRecord(value)) {
    return false;
  }

  if (value.kind === "literal") {
    return isNonEmptyString(value.value);
  }

  if (value.kind === "class") {
    return isNonEmptyString(value.name);
  }

  return (
    value.kind === "boundary" &&
    (value.value === "word-start" || value.value === "word-end")
  );
}

function isSegmentPattern(value: unknown): value is SegmentPattern {
  return Array.isArray(value) && value.every(isSegmentSelector);
}

function isMorphOperation(value: unknown): value is MorphOperation {
  if (!isRecord(value) || !isNonEmptyString(value.kind)) {
    return false;
  }

  switch (value.kind) {
    case "prefix":
    case "suffix":
    case "remove-suffix":
      return isNonEmptyString(value.value);
    case "suppletion":
      return isNonEmptyString(value.form);
    case "infix":
      return (
        isNonEmptyString(value.value) &&
        Number.isInteger(value.afterConsonant) &&
        Number(value.afterConsonant) > 0
      );
    case "ablaut":
      return (
        isSegmentSelector(value.from) &&
        isSegmentSelector(value.to) &&
        (!("count" in value) ||
          (Number.isInteger(value.count) && Number(value.count) > 0))
      );
    case "template":
      return Array.isArray(value.slots) && value.slots.every(isNonEmptyString);
    case "reduplication":
      return (
        (value.scope === "full" || value.scope === "cv" || value.scope === "c") &&
        (value.position === "prefix" || value.position === "suffix")
      );
    default:
      return false;
  }
}

function isMorphCondition(value: unknown): value is MorphCondition {
  return (
    isRecord(value) &&
    value.kind === "pattern" &&
    isSegmentPattern(value.pattern) &&
    (value.position === "starts-with" ||
      value.position === "ends-with" ||
      value.position === "contains")
  );
}

function isMorphBranch(value: unknown): value is MorphBranch {
  return (
    isRecord(value) &&
    Array.isArray(value.conditions) &&
    value.conditions.every(isMorphCondition) &&
    Array.isArray(value.operations) &&
    value.operations.length > 0 &&
    value.operations.every(isMorphOperation)
  );
}

function hasNoCanonicalSource(value: UnknownRecord): boolean {
  return !("source" in value) && !("dsl" in value) && !("pattern" in value);
}

export function isSoundRuleBody(value: unknown): value is SoundRuleBody {
  return (
    isRecord(value) &&
    hasNoCanonicalSource(value) &&
    value.version === 1 &&
    value.kind === "sound-rule" &&
    isSegmentPattern(value.target) &&
    isSegmentPattern(value.replacement) &&
    (!("context" in value) ||
      (isRecord(value.context) &&
        (!("left" in value.context) || isSegmentPattern(value.context.left)) &&
        (!("right" in value.context) || isSegmentPattern(value.context.right))))
  );
}

export function isMorphologyRuleBody(value: unknown): value is MorphologyRuleBody {
  if (
    !isRecord(value) ||
    !hasNoCanonicalSource(value) ||
    value.version !== 1 ||
    value.kind !== "morphology-rule"
  ) {
    return false;
  }

  const hasOperation = "operation" in value && isMorphOperation(value.operation);
  const hasBranches =
    "branches" in value &&
    Array.isArray(value.branches) &&
    value.branches.length > 0 &&
    value.branches.every(isMorphBranch);

  if (!hasOperation && !hasBranches) {
    return false;
  }

  return (
    !("conditions" in value) ||
    (Array.isArray(value.conditions) && value.conditions.every(isMorphCondition))
  );
}

function isPhonotacticSlot(value: unknown): value is PhonotacticSlot {
  if (!isRecord(value)) {
    return false;
  }

  if ("optional" in value && typeof value.optional !== "boolean") {
    return false;
  }

  if (value.kind === "class") {
    return isNonEmptyString(value.ref);
  }

  return value.kind === "literal" && isNonEmptyString(value.value);
}

export function isPhonotacticTemplateBody(
  value: unknown,
): value is PhonotacticTemplateBody {
  return (
    isRecord(value) &&
    hasNoCanonicalSource(value) &&
    value.version === 1 &&
    value.kind === "phonotactic-template" &&
    Array.isArray(value.slots) &&
    value.slots.length > 0 &&
    value.slots.every(isPhonotacticSlot)
  );
}

export function isPhonotacticConstraintBody(
  value: unknown,
): value is PhonotacticConstraintBody {
  if (!isRecord(value) || !hasNoCanonicalSource(value) || value.version !== 1) {
    return false;
  }

  if (value.kind === "forbidden-sequence") {
    return (
      Array.isArray(value.sequence) &&
      value.sequence.length > 0 &&
      value.sequence.every(isPhonotacticSlot)
    );
  }

  return (
    value.kind === "gemination" &&
    Array.isArray(value.positions) &&
    value.positions.length > 0 &&
    value.positions.every(
      (position) =>
        position === "everywhere" ||
        position === "coda" ||
        position === "onset" ||
        position === "initial" ||
        position === "final",
    )
  );
}
