import { describe, expect, it } from "vitest";

import { applyMorphologyRule, morphologyRuleSummary } from "@/lib/morphology";
import { buildInventory } from "@/lib/phonology";
import { buildDemoPhonologyData } from "@/lib/phonology-demo";
import { isMorphologyRuleBody, type MorphologyRuleBody } from "@/lib/rules";

const inventory = buildInventory(buildDemoPhonologyData("project-1"));
const literal = (value: string) => ({ kind: "literal" as const, value });

describe("structured morphology engine", () => {
  it("applies suffix and prefix operations", () => {
    expect(
      applyMorphologyRule(
        "paku",
        { version: 1, kind: "morphology-rule", operation: { kind: "suffix", value: "ta" } },
        inventory,
      ),
    ).toMatchObject({ status: "changed", form: "pakuta" });

    expect(
      applyMorphologyRule(
        "meka",
        { version: 1, kind: "morphology-rule", operation: { kind: "prefix", value: "na" } },
        inventory,
      ),
    ).toMatchObject({ status: "changed", form: "nameka" });
  });

  it("applies infix, replacement, template, reduplication, suppletion, and remove-suffix", () => {
    const cases: readonly [MorphologyRuleBody, string][] = [
      [
        { version: 1, kind: "morphology-rule", operation: { kind: "infix", value: "um", afterConsonant: 1 } },
        "tumasi",
      ],
      [
        {
          version: 1,
          kind: "morphology-rule",
          operation: { kind: "replace", from: literal("a"), to: literal("o"), count: 1 },
        },
        "tosi",
      ],
      [
        { version: 1, kind: "morphology-rule", operation: { kind: "template", slots: ["1", "a", "2", "a"] } },
        "tasa",
      ],
      [
        {
          version: 1,
          kind: "morphology-rule",
          operation: { kind: "reduplication", scope: "cv", position: "prefix" },
        },
        "tatasi",
      ],
      [
        { version: 1, kind: "morphology-rule", operation: { kind: "suppletion", form: "eno" } },
        "eno",
      ],
      [
        {
          version: 1,
          kind: "morphology-rule",
          branches: [
            {
              conditions: [],
              operations: [
                { kind: "remove-suffix", value: "i" },
                { kind: "suffix", value: "en" },
              ],
            },
          ],
        },
        "tasen",
      ],
    ];

    for (const [rule, expected] of cases) {
      expect(applyMorphologyRule("tasi", rule, inventory)).toMatchObject({
        status: "changed",
        form: expected,
      });
    }
  });

  it("uses first matching branch and reports no-match for unmet conditions", () => {
    const rule: MorphologyRuleBody = {
      version: 1,
      kind: "morphology-rule",
      branches: [
        {
          conditions: [
            {
              kind: "pattern",
              position: "ends-with",
              pattern: [{ kind: "literal", value: "u" }],
            },
          ],
          operations: [{ kind: "suffix", value: "n" }],
        },
      ],
    };

    expect(applyMorphologyRule("paku", rule, inventory)).toMatchObject({
      status: "changed",
      form: "pakun",
    });
    expect(applyMorphologyRule("tasi", rule, inventory)).toMatchObject({
      status: "no-match",
    });
  });

  it("generates human-readable summaries from structured bodies", () => {
    const rule: MorphologyRuleBody = {
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
      ],
    };

    expect(morphologyRuleSummary(rule)).toBe("ends-with [V]: suffix n");
  });
});

describe("morphology rule validation", () => {
  it("rejects DSL-only and parser-source canonical storage", () => {
    expect(isMorphologyRuleBody("CVC +ta")).toBe(false);
    expect(
      isMorphologyRuleBody({
        version: 1,
        kind: "morphology-rule",
        dsl: "{V_} +n",
      }),
    ).toBe(false);
    expect(
      isMorphologyRuleBody({
        version: 1,
        kind: "morphology-rule",
        source: "{V_} +n",
        operation: { kind: "suffix", value: "n" },
      }),
    ).toBe(false);
  });

  it("accepts explicit replace operation as structured JSON", () => {
    expect(
      isMorphologyRuleBody({
        version: 1,
        kind: "morphology-rule",
        operation: {
          kind: "replace",
          from: literal("a"),
          to: literal("o"),
        },
      }),
    ).toBe(true);
  });
});
