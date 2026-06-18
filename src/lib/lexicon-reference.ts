import swadeshRaw from "@/data/swadesh_list.json";
import thesaurusRaw from "@/data/conlangers_thesaurus.json";
import type { SwadeshConcept, ThesaurusCategory } from "@/lib/lexicon";

type RawSwadesh = {
  readonly id: number;
  readonly concept: string;
  readonly category: string;
};

type RawThesaurusCategory = {
  readonly name: string;
  readonly concepts?: readonly string[];
  readonly subcategories?: readonly RawThesaurusCategory[];
};

export const swadeshReference: readonly SwadeshConcept[] = (
  swadeshRaw as readonly RawSwadesh[]
).map((item) => ({
  id: String(item.id),
  concept: item.concept,
  category: item.category,
}));

export const thesaurusReference: readonly ThesaurusCategory[] = (
  (thesaurusRaw as { readonly categories: readonly RawThesaurusCategory[] }).categories
).map((category, index) => mapThesaurusCategory(category, `${index + 1}`));

export function countThesaurusConcepts(
  categories: readonly ThesaurusCategory[] = thesaurusReference,
): number {
  return categories.reduce(
    (count, category) =>
      count +
      category.concepts.length +
      countThesaurusConcepts(category.children ?? []),
    0,
  );
}

function mapThesaurusCategory(
  category: RawThesaurusCategory,
  path: string,
): ThesaurusCategory {
  return {
    id: path,
    name: category.name,
    concepts: category.concepts ?? [],
    children: category.subcategories?.map((child, index) =>
      mapThesaurusCategory(child, `${path}.${index + 1}`),
    ),
  };
}
