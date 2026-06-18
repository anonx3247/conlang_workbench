import { describe, expect, it } from "vitest";

import LexiconPage from "@/../app/projects/[projectId]/lexicon/page";
import { lexiconSubTabs, parseLexiconTab } from "@/lib/lexicon-tabs";

describe("LexiconPage server tab metadata", () => {
  it("keeps lexicon tab metadata server-safe and array-backed", () => {
    expect(typeof LexiconPage).toBe("function");
    expect(Array.isArray(lexiconSubTabs)).toBe(true);
    expect(lexiconSubTabs.some((tab) => tab.id === "dictionary")).toBe(true);
    expect(parseLexiconTab("thesaurus")).toBe("thesaurus");
    expect(parseLexiconTab("unknown")).toBe("dictionary");
  });
});
