export const lexiconSubTabs = [
  { id: "dictionary", label: "Dictionary" },
  { id: "swadesh", label: "Swadesh" },
  { id: "thesaurus", label: "Thesaurus" },
  { id: "derivations", label: "Derivations" },
] as const;

export type LexiconTab = (typeof lexiconSubTabs)[number]["id"];

export function parseLexiconTab(value: string | null | undefined): LexiconTab {
  return lexiconSubTabs.some((tab) => tab.id === value)
    ? (value as LexiconTab)
    : "dictionary";
}
