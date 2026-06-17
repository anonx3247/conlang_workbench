import { describe, expect, it } from "vitest";

import {
  isMorphologyRuleBody,
  isPhonotacticConstraintBody,
  isPhonotacticTemplateBody,
  isSoundRuleBody,
  type MorphologyRuleBody,
  type SoundRuleBody,
} from "./rules";

const literal = (value: string) => ({ kind: "literal" as const, value });
const naturalClass = (name: string) => ({ kind: "class" as const, name });

describe("structured rule body validators", () => {
  it("accepts structured sound rules", () => {
    const body: SoundRuleBody = {
      version: 1,
      kind: "sound-rule",
      target: [literal("k")],
      replacement: [literal("x")],
      context: {
        left: [naturalClass("V")],
        right: [naturalClass("V")],
      },
    };

    expect(isSoundRuleBody(body)).toBe(true);
  });

  it("rejects sound rules stored only as DSL strings", () => {
    expect(isSoundRuleBody("k -> x / V_V")).toBe(false);
    expect(
      isSoundRuleBody({
        version: 1,
        kind: "sound-rule",
        source: "k -> x / V_V",
      }),
    ).toBe(false);
  });

  it("accepts structured morphology rules with operations and conditions", () => {
    const body: MorphologyRuleBody = {
      version: 1,
      kind: "morphology-rule",
      branches: [
        {
          conditions: [
            {
              kind: "pattern",
              position: "ends-with",
              pattern: [naturalClass("V")],
            },
          ],
          operations: [{ kind: "suffix", value: "n" }],
        },
      ],
      feature_bindings: {
        dimensions: { number: "plural" },
      },
    };

    expect(isMorphologyRuleBody(body)).toBe(true);
  });

  it("rejects morphology rules without structured operations", () => {
    expect(isMorphologyRuleBody("+n")).toBe(false);
    expect(
      isMorphologyRuleBody({
        version: 1,
        kind: "morphology-rule",
        source: '{V_} +n',
      }),
    ).toBe(false);
  });

  it("accepts structured phonotactic templates and constraints", () => {
    expect(
      isPhonotacticTemplateBody({
        version: 1,
        kind: "phonotactic-template",
        slots: [
          { kind: "class", name: "C", optional: true },
          { kind: "class", name: "V" },
        ],
      }),
    ).toBe(true);

    expect(
      isPhonotacticConstraintBody({
        version: 1,
        kind: "forbidden-sequence",
        sequence: [
          { kind: "class", name: "C" },
          { kind: "class", name: "C" },
        ],
        position: "start",
      }),
    ).toBe(true);
  });

  it("rejects phonotactics stored as pattern text", () => {
    expect(
      isPhonotacticTemplateBody({
        version: 1,
        kind: "phonotactic-template",
        pattern: "(C)V(C)",
      }),
    ).toBe(false);

    expect(
      isPhonotacticConstraintBody({
        version: 1,
        kind: "forbidden-sequence",
        pattern: "CC",
      }),
    ).toBe(false);
  });
});
