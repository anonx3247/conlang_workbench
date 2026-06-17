import {
  BookMarked,
  FolderOpen,
  Languages,
  Library,
  ListTree,
  type LucideIcon,
} from "lucide-react";

export type WorkbenchArea = {
  readonly name: string;
  readonly summary: string;
  readonly status: string;
  readonly items: readonly string[];
  readonly icon: LucideIcon;
};

export const workbenchAreas: readonly WorkbenchArea[] = [
  {
    name: "Phonology",
    summary: "Inventory, phonotactics, sound rules, and word generation.",
    status: "Foundation placeholder",
    items: ["Inventory", "Natural classes", "Sound rules"],
    icon: Languages,
  },
  {
    name: "Grammar",
    summary: "Parts of speech, inflections, typology, and paradigms.",
    status: "Foundation placeholder",
    items: ["POS & dimensions", "Inflections", "Typology"],
    icon: ListTree,
  },
  {
    name: "Lexicon",
    summary: "Dictionary, derivations, semantic prompts, and exports.",
    status: "Foundation placeholder",
    items: ["Dictionary", "Swadesh list", "Derivations"],
    icon: Library,
  },
  {
    name: "Glossary",
    summary: "Searchable linguistic reference material for workbench terms.",
    status: "Foundation placeholder",
    items: ["Terminology", "Examples", "Cross-links"],
    icon: BookMarked,
  },
];

export const projectActions = [
  {
    label: "New project",
    description: "Create a cloud-backed language workspace when storage lands.",
    icon: FolderOpen,
  },
  {
    label: "Open project",
    description: "Resume an existing project from the future project dashboard.",
    icon: Library,
  },
] as const;
