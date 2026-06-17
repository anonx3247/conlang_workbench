import { describe, expect, it } from "vitest";

import {
  audioState,
  chartHighlights,
  findChartSound,
  phonemeChartPlacement,
} from "@/lib/phonology-chart";
import { buildDemoPhonologyData } from "@/lib/phonology-demo";

describe("phonology IPA chart helpers", () => {
  it("places consonants and vowels in chart coordinates", () => {
    const data = buildDemoPhonologyData("project-1");

    expect(phonemeChartPlacement(data.phonemes.find((p) => p.symbol === "p")!)).toEqual({
      chart: "consonants",
      row: "plosive",
      column: "bilabial",
    });
    expect(phonemeChartPlacement(data.phonemes.find((p) => p.symbol === "u")!)).toEqual({
      chart: "vowels",
      row: "close",
      column: "back",
    });
  });

  it("builds highlight keys for inventory sounds", () => {
    const data = buildDemoPhonologyData("project-1");

    expect(chartHighlights(data.phonemes)).toContain(
      "consonants:plosive:bilabial:p",
    );
    expect(chartHighlights(data.phonemes)).toContain("vowels:close:back:u");
  });

  it("reports IPA audio availability", () => {
    expect(audioState(findChartSound("p")!)).toEqual({
      available: true,
      label: "Play audio",
    });
    expect(audioState(findChartSound("b")!)).toEqual({
      available: false,
      label: "Audio unavailable",
    });
  });
});
