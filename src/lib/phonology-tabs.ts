export const phonologySubTabs = [
  { id: "inventory", label: "Inventory" },
  { id: "natural-classes", label: "Natural classes" },
  { id: "sound-rules", label: "Sound rules" },
] as const;

export type PhonologyTabId = (typeof phonologySubTabs)[number]["id"];

export function getPhonologyTabById(value: string | null | undefined) {
  return phonologySubTabs.find((tab) => tab.id === value) ?? phonologySubTabs[0];
}

export function getPhonologyTabByLabel(value: string) {
  return phonologySubTabs.find((tab) => tab.label === value) ?? phonologySubTabs[0];
}
