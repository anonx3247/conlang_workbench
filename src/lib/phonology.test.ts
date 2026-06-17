import { describe, expect, it } from "vitest";

import { buildDemoPhonologyData } from "@/lib/phonology-demo";
import {
  applyLongVowelMarks,
  buildInventory,
  generateWord,
  generateWords,
  romanize,
  templateToText,
} from "@/lib/phonology";
import type { PhonotacticSlot } from "@/lib/rules";

describe("phonology domain", () => {
  it("generates words from structured template slots with injectable picking", () => {
    const data = buildDemoPhonologyData("project-1");
    const inventory = buildInventory(data);
    const slots: readonly PhonotacticSlot[] = [
      { kind: "class", ref: "C" },
      { kind: "class", ref: "V" },
      { kind: "literal", value: "s" },
    ];

    const word = generateWord(slots, inventory, (items) => items[0]);

    expect(word).toBe("pis");
    expect(templateToText(slots)).toBe("CVs");
  });

  it("honors optional slots deterministically", () => {
    const data = buildDemoPhonologyData("project-1");
    const inventory = buildInventory(data);
    const slots: readonly PhonotacticSlot[] = [
      { kind: "class", ref: "C", optional: true },
      { kind: "class", ref: "V" },
      { kind: "class", ref: "C", optional: true },
    ];
    const decisions = [false, true];

    const word = generateWord(slots, inventory, (items, context) => {
      if (context.startsWith("optional")) {
        return decisions.shift() as (typeof items)[number];
      }
      return items[0];
    });

    expect(word).toBe("ip");
  });

  it("generates batches only from active structured templates", () => {
    const data = buildDemoPhonologyData("project-1");
    const inventory = buildInventory(data);

    expect(generateWords({ inventory, templates: data.templates, count: 3 })).toEqual([
      "pip",
      "pip",
      "pip",
    ]);
  });

  it("romanizes with longest IPA match first", () => {
    expect(
      romanize("t͡ʃaʃ", [
        { ipaSymbol: "t", latinMapping: "t", ordering: 1 },
        { ipaSymbol: "t͡ʃ", latinMapping: "ch", ordering: 2 },
        { ipaSymbol: "ʃ", latinMapping: "sh", ordering: 3 },
      ]),
    ).toBe("chash");
  });

  it("can fold doubled regular vowels into macron long-vowel letters", () => {
    expect(applyLongVowelMarks("paatee EEKU")).toBe("pātē ĒKU");
    expect(
      romanize(
        "aːteː",
        [
          { ipaSymbol: "aː", latinMapping: "aa", ordering: 1 },
          { ipaSymbol: "eː", latinMapping: "ee", ordering: 2 },
        ],
        { longVowels: true },
      ),
    ).toBe("ātē");
  });
});
