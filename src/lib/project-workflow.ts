import {
  FolderKanban,
  Languages,
  Library,
  ListTree,
  type LucideIcon,
} from "lucide-react";

export type WorkbenchArea = {
  readonly name: string;
  readonly slug: string;
  readonly summary: string;
  readonly status: string;
  readonly items: readonly string[];
  readonly icon: LucideIcon;
};

export const workbenchAreas: readonly WorkbenchArea[] = [
  {
    name: "Phonology",
    slug: "phonology",
    summary: "Inventory, phonotactics, sound rules, and word generation.",
    status: "Route placeholder",
    items: ["Inventory", "Natural classes", "Sound rules"],
    icon: Languages,
  },
  {
    name: "Grammar",
    slug: "grammar",
    summary: "Parts of speech, inflections, typology, and paradigms.",
    status: "Route placeholder",
    items: ["POS & dimensions", "Inflections", "Typology"],
    icon: ListTree,
  },
  {
    name: "Lexicon",
    slug: "lexicon",
    summary: "Dictionary, derivations, semantic prompts, and exports.",
    status: "Route placeholder",
    items: ["Dictionary", "Swadesh list", "Derivations"],
    icon: Library,
  },
] as const;

export const glossaryDrawerItems = [
  "Terminology",
  "Examples",
  "Cross-links",
] as const;

export const projectLauncherActions = [
  {
    label: "New project",
    description: "Create a cloud-backed language workspace.",
    icon: FolderKanban,
  },
  {
    label: "Open project",
    description: "Resume one of your existing projects.",
    icon: Library,
  },
] as const;
