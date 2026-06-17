import {
  BookOpen,
  FileText,
  GitBranch,
  Library,
  ListChecks,
  Plus,
  Search,
  Tags,
  type LucideIcon,
} from "lucide-react";

import { NotesField, NotesPreview } from "@/components/notes-field";
import {
  displayLexemeForm,
  filterLexemes,
  posLabel,
  swadeshCoverage,
  type Lexeme,
  type LexiconData,
  type MorphologyRule,
  type PartOfSpeech,
  type ThesaurusCategory,
} from "@/lib/lexicon";
import {
  applyMorphologyRule,
  morphologyRuleSummary,
} from "@/lib/morphology";
import { buildInventory, romanize, type PhonologyData } from "@/lib/phonology";
import type { ProjectDataStatus } from "@/lib/projects";

export const lexiconSubTabs = [
  { id: "dictionary", label: "Dictionary" },
  { id: "swadesh", label: "Swadesh" },
  { id: "thesaurus", label: "Thesaurus" },
  { id: "derivations", label: "Derivations" },
] as const;

export function LexiconWorkbench({
  projectId,
  data,
  phonologyData,
  status,
  message,
  activeTab = "dictionary",
  searchQuery = "",
  partOfSpeechId = "",
}: {
  readonly projectId: string;
  readonly data: LexiconData;
  readonly phonologyData: PhonologyData;
  readonly status: ProjectDataStatus;
  readonly message: string | null;
  readonly activeTab?: (typeof lexiconSubTabs)[number]["id"];
  readonly searchQuery?: string;
  readonly partOfSpeechId?: string;
}) {
  const selectedTab = lexiconSubTabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : "dictionary";
  const readOnly = status === "error";
  const inventory = buildInventory(phonologyData);
  const filteredLexemes = filterLexemes(data.lexemes, data.partsOfSpeech, {
    query: searchQuery,
    partOfSpeechId: partOfSpeechId || undefined,
  });
  const selectedLexeme = filteredLexemes[0] ?? data.lexemes[0] ?? null;
  const posById = new Map(data.partsOfSpeech.map((pos) => [pos.id, pos]));
  const rootLexemes = data.lexemes.filter((lexeme) => !lexeme.derivedFromLexemeId);

  return (
    <div className="mx-auto grid max-w-7xl gap-4">
      <header className="flex flex-col gap-3 border-b border-workbench-line pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-workbench-muted">
            Project lexicon
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">Lexicon</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-workbench-muted">
            Dictionary entries, semantic prompts, and structured derivational rules.
          </p>
        </div>
        <div className="rounded-md border border-workbench-line bg-white px-3 py-2 text-sm text-workbench-muted">
          {status === "ready" ? "Cloud data" : "Demo data"}
          {message ? <span className="block text-xs">{message}</span> : null}
        </div>
      </header>

      <nav aria-label="Lexicon sections" className="flex flex-wrap gap-2">
        {lexiconSubTabs.map((tab) => (
          <a
            key={tab.id}
            href={`/projects/${projectId}/lexicon?tab=${tab.id}`}
            aria-current={selectedTab === tab.id ? "page" : undefined}
            className={`inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium ${
              selectedTab === tab.id
                ? "border-workbench-accent bg-[#eef6f4] text-workbench-ink"
                : "border-workbench-line bg-white text-workbench-muted hover:text-workbench-ink"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </nav>

      {selectedTab === "dictionary" ? (
        <section aria-labelledby="dictionary-heading">
          <h2 id="dictionary-heading" className="mb-3 text-lg font-semibold">
            Dictionary
          </h2>
          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <Panel>
              <SectionTitle icon={Library} title="Entries" actionLabel="Lexeme" />
              <DictionaryFilters
                projectId={projectId}
                partsOfSpeech={data.partsOfSpeech}
                searchQuery={searchQuery}
                partOfSpeechId={partOfSpeechId}
              />
              <div className="mt-3 grid gap-2">
                {filteredLexemes.length ? (
                  filteredLexemes.map((lexeme) => (
                    <LexemeListItem
                      key={lexeme.id}
                      lexeme={lexeme}
                      pos={lexeme.partOfSpeechId ? posById.get(lexeme.partOfSpeechId) : null}
                      selected={lexeme.id === selectedLexeme?.id}
                    />
                  ))
                ) : (
                  <p className="rounded-md bg-workbench-panel p-3 text-sm text-workbench-muted">
                    No lexemes match the current filters.
                  </p>
                )}
              </div>
            </Panel>
            <div className="grid gap-4">
              <LexemeDetail
                lexeme={selectedLexeme}
                pos={selectedLexeme?.partOfSpeechId ? posById.get(selectedLexeme.partOfSpeechId) : null}
                romanized={
                  selectedLexeme
                    ? romanize(selectedLexeme.ipa, phonologyData.romanizationMappings)
                    : null
                }
              />
              <LexemeEditorShape
                partsOfSpeech={data.partsOfSpeech}
                readOnly={readOnly}
                selectedLexeme={selectedLexeme}
              />
            </div>
          </div>
        </section>
      ) : null}

      {selectedTab === "swadesh" ? (
        <section aria-labelledby="swadesh-heading">
          <h2 id="swadesh-heading" className="mb-3 text-lg font-semibold">
            Swadesh
          </h2>
          <SwadeshSection data={data} />
        </section>
      ) : null}

      {selectedTab === "thesaurus" ? (
        <section aria-labelledby="thesaurus-heading">
          <h2 id="thesaurus-heading" className="mb-3 text-lg font-semibold">
            Thesaurus
          </h2>
          <ThesaurusSection categories={data.thesaurus} lexemes={data.lexemes} />
        </section>
      ) : null}

      {selectedTab === "derivations" ? (
        <section aria-labelledby="derivations-heading">
          <h2 id="derivations-heading" className="mb-3 text-lg font-semibold">
            Derivations
          </h2>
          <DerivationsSection
            rules={data.morphologyRules.filter((rule) => rule.ruleKind === "derivational")}
            roots={rootLexemes}
            partsOfSpeech={data.partsOfSpeech}
            inventory={inventory}
            romanizationMappings={phonologyData.romanizationMappings}
            readOnly={readOnly}
          />
        </section>
      ) : null}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  actionLabel,
}: {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly actionLabel?: string;
}) {
  return (
    <div className="mb-3 flex min-h-9 items-center gap-2">
      <Icon aria-hidden="true" size={18} className="text-workbench-accent" />
      <h3 className="text-base font-semibold">{title}</h3>
      {actionLabel ? (
        <button
          type="button"
          className="ml-auto inline-flex h-8 items-center gap-2 rounded-md border border-workbench-line bg-white px-3 text-sm font-medium"
        >
          <Plus aria-hidden="true" size={15} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function Panel({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-workbench-line bg-white p-4">
      {children}
    </div>
  );
}

function DictionaryFilters({
  projectId,
  partsOfSpeech,
  searchQuery,
  partOfSpeechId,
}: {
  readonly projectId: string;
  readonly partsOfSpeech: readonly PartOfSpeech[];
  readonly searchQuery: string;
  readonly partOfSpeechId: string;
}) {
  return (
    <form
      action={`/projects/${projectId}/lexicon`}
      className="grid gap-2 rounded-md bg-workbench-panel p-3"
    >
      <label className="grid gap-1 text-xs font-medium text-workbench-muted">
        Search
        <span className="relative">
          <Search
            aria-hidden="true"
            size={15}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-workbench-muted"
          />
          <input
            name="q"
            defaultValue={searchQuery}
            placeholder="form, meaning, POS"
            className="h-9 w-full rounded-md border border-workbench-line bg-white pl-8 pr-2 text-sm text-workbench-ink"
          />
        </span>
      </label>
      <label className="grid gap-1 text-xs font-medium text-workbench-muted">
        POS
        <select
          name="pos"
          defaultValue={partOfSpeechId}
          className="h-9 rounded-md border border-workbench-line bg-white px-2 text-sm text-workbench-ink"
        >
          <option value="">All POS</option>
          {partsOfSpeech.map((pos) => (
            <option key={pos.id} value={pos.id}>
              {pos.name}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}

function LexemeListItem({
  lexeme,
  pos,
  selected,
}: {
  readonly lexeme: Lexeme;
  readonly pos: PartOfSpeech | null | undefined;
  readonly selected: boolean;
}) {
  return (
    <article
      className={`rounded-md border p-3 ${
        selected
          ? "border-workbench-accent bg-[#eef6f4]"
          : "border-workbench-line bg-workbench-panel"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {displayLexemeForm(lexeme)}
          </span>
          <span className="block font-mono text-xs text-workbench-muted">/{lexeme.ipa}/</span>
        </span>
        <span className="rounded-md border border-workbench-line bg-white px-2 py-1 text-xs font-medium text-workbench-muted">
          {pos?.abbreviation ?? "POS"}
        </span>
      </div>
      <p className="mt-2 truncate text-sm text-workbench-muted">
        {lexeme.meaning ?? "No meaning"}
      </p>
      <NotesPreview value={lexeme.notes} emptyLabel="No lexeme notes" />
    </article>
  );
}

function LexemeDetail({
  lexeme,
  pos,
  romanized,
}: {
  readonly lexeme: Lexeme | null;
  readonly pos: PartOfSpeech | null | undefined;
  readonly romanized: string | null;
}) {
  if (!lexeme) {
    return (
      <Panel>
        <SectionTitle icon={BookOpen} title="Detail" />
        <p className="rounded-md bg-workbench-panel p-4 text-sm text-workbench-muted">
          Select or create a lexeme to inspect its dictionary detail.
        </p>
      </Panel>
    );
  }

  return (
    <Panel>
      <SectionTitle icon={BookOpen} title="Detail" />
      <div className="grid gap-3">
        <div>
          <p className="text-2xl font-semibold">{displayLexemeForm(lexeme)}</p>
          <p className="font-mono text-sm text-workbench-muted">/{lexeme.ipa}/</p>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <Field label="Meaning" value={lexeme.meaning ?? "Unassigned"} />
          <Field label="Part of speech" value={posLabel(pos)} />
          <Field label="Romanization preview" value={romanized ?? "Unavailable"} />
          <Field
            label="Status"
            value={lexeme.isPhonologicalException ? "Phonological exception" : "Regular"}
          />
        </dl>
        <NotesPreview value={lexeme.notes} emptyLabel="No lexeme notes" />
      </div>
    </Panel>
  );
}

function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-md bg-workbench-panel px-3 py-2">
      <dt className="text-xs font-semibold uppercase text-workbench-muted">{label}</dt>
      <dd className="mt-1 truncate">{value}</dd>
    </div>
  );
}

function LexemeEditorShape({
  partsOfSpeech,
  readOnly,
  selectedLexeme,
}: {
  readonly partsOfSpeech: readonly PartOfSpeech[];
  readonly readOnly: boolean;
  readonly selectedLexeme: Lexeme | null;
}) {
  return (
    <Panel>
      <SectionTitle icon={FileText} title={selectedLexeme ? "Edit shape" : "Create shape"} />
      <form className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium text-workbench-muted">
          IPA
          <input
            name="ipa"
            disabled={readOnly}
            defaultValue={selectedLexeme?.ipa ?? ""}
            placeholder="paku"
            className="h-9 rounded-md border border-workbench-line bg-workbench-panel px-2 font-mono text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-workbench-muted">
          Romanization
          <input
            name="romanization"
            disabled={readOnly}
            defaultValue={selectedLexeme?.romanization ?? ""}
            placeholder="paku"
            className="h-9 rounded-md border border-workbench-line bg-workbench-panel px-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-workbench-muted">
          Meaning
          <input
            name="meaning"
            disabled={readOnly}
            defaultValue={selectedLexeme?.meaning ?? ""}
            placeholder="water"
            className="h-9 rounded-md border border-workbench-line bg-workbench-panel px-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-workbench-muted">
          POS
          <select
            name="partOfSpeechId"
            disabled={readOnly}
            defaultValue={selectedLexeme?.partOfSpeechId ?? ""}
            className="h-9 rounded-md border border-workbench-line bg-workbench-panel px-2 text-sm"
          >
            <option value="">Unassigned</option>
            {partsOfSpeech.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.name}
              </option>
            ))}
          </select>
        </label>
        <div className="md:col-span-2">
          <NotesField
            id="lexeme-notes"
            value={selectedLexeme?.notes ?? ""}
            disabled={readOnly}
            placeholder="Etymology, usage, register, or field notes"
          />
        </div>
      </form>
    </Panel>
  );
}

function SwadeshSection({ data }: { readonly data: LexiconData }) {
  const coverage = swadeshCoverage(data.swadesh, data.lexemes);
  const covered = coverage.filter((item) => item.lexeme).length;

  return (
    <Panel>
      <SectionTitle icon={ListChecks} title="Reference Concepts" />
      <div className="mb-3 flex items-center gap-3 text-sm text-workbench-muted">
        <span className="rounded-md bg-workbench-panel px-2 py-1">
          {covered}/{data.swadesh.length} covered
        </span>
        <span className="h-2 flex-1 rounded-full bg-workbench-panel">
          <span
            className="block h-2 rounded-full bg-workbench-accent"
            style={{
              width: `${data.swadesh.length ? (covered / data.swadesh.length) * 100 : 0}%`,
            }}
          />
        </span>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {coverage.map(({ concept, lexeme }) => (
          <div
            key={concept.id}
            className="rounded-md border border-workbench-line bg-workbench-panel p-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{concept.concept}</span>
              <span className="ml-auto text-xs text-workbench-muted">{concept.category}</span>
            </div>
            <p className="mt-1 truncate text-workbench-muted">
              {lexeme ? displayLexemeForm(lexeme) : "Uncovered"}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ThesaurusSection({
  categories,
  lexemes,
}: {
  readonly categories: readonly ThesaurusCategory[];
  readonly lexemes: readonly Lexeme[];
}) {
  const byMeaning = new Map(
    lexemes
      .filter((lexeme) => lexeme.meaning)
      .map((lexeme) => [lexeme.meaning!.toLowerCase(), lexeme]),
  );

  return (
    <Panel>
      <SectionTitle icon={Tags} title="Semantic Prompts" />
      <div className="grid gap-3 lg:grid-cols-2">
        {categories.map((category) => (
          <ThesaurusCategoryView
            key={category.id}
            category={category}
            byMeaning={byMeaning}
          />
        ))}
      </div>
    </Panel>
  );
}

function ThesaurusCategoryView({
  category,
  byMeaning,
}: {
  readonly category: ThesaurusCategory;
  readonly byMeaning: ReadonlyMap<string, Lexeme>;
}) {
  return (
    <div className="rounded-md border border-workbench-line bg-workbench-panel p-3">
      <h3 className="text-sm font-semibold">{category.name}</h3>
      <ConceptList concepts={category.concepts} byMeaning={byMeaning} />
      {category.children?.map((child) => (
        <div key={child.id} className="mt-3 border-l border-workbench-line pl-3">
          <h4 className="text-xs font-semibold uppercase text-workbench-muted">
            {child.name}
          </h4>
          <ConceptList concepts={child.concepts} byMeaning={byMeaning} />
        </div>
      ))}
    </div>
  );
}

function ConceptList({
  concepts,
  byMeaning,
}: {
  readonly concepts: readonly string[];
  readonly byMeaning: ReadonlyMap<string, Lexeme>;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {concepts.map((concept) => {
        const lexeme = byMeaning.get(concept.toLowerCase());
        return (
          <span
            key={concept}
            className="rounded-md border border-workbench-line bg-white px-2 py-1 text-xs"
          >
            {concept}
            {lexeme ? (
              <span className="ml-1 text-workbench-accent">
                {displayLexemeForm(lexeme)}
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

function DerivationsSection({
  rules,
  roots,
  partsOfSpeech,
  inventory,
  romanizationMappings,
  readOnly,
}: {
  readonly rules: readonly MorphologyRule[];
  readonly roots: readonly Lexeme[];
  readonly partsOfSpeech: readonly PartOfSpeech[];
  readonly inventory: ReturnType<typeof buildInventory>;
  readonly romanizationMappings: PhonologyData["romanizationMappings"];
  readonly readOnly: boolean;
}) {
  const posById = new Map(partsOfSpeech.map((pos) => [pos.id, pos]));

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel>
        <SectionTitle icon={GitBranch} title="Structured Rules" actionLabel="Rule" />
        <div className="grid gap-3">
          {rules.map((rule) => (
            <article key={rule.id} className="rounded-md border border-workbench-line p-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">{rule.name}</h3>
                <span className="rounded-md bg-workbench-panel px-2 py-1 text-xs text-workbench-muted">
                  {rule.inputPosId ? posById.get(rule.inputPosId)?.abbreviation : "Any"} {"->"}{" "}
                  {rule.outputPosId ? posById.get(rule.outputPosId)?.abbreviation : "Any"}
                </span>
                {!rule.isActive ? (
                  <span className="rounded-md border border-workbench-line px-2 py-1 text-xs text-workbench-muted">
                    inactive
                  </span>
                ) : null}
              </div>
              <p className="mt-2 rounded-md bg-workbench-panel px-3 py-2 text-sm">
                {morphologyRuleSummary(rule.body)}
              </p>
              <RulePreview
                rule={rule}
                roots={roots}
                inventory={inventory}
                romanizationMappings={romanizationMappings}
              />
              <NotesPreview value={rule.notes} emptyLabel="No rule notes" />
            </article>
          ))}
        </div>
      </Panel>
      <Panel>
        <SectionTitle icon={FileText} title="Rule editor shape" />
        <form className="grid gap-3">
          <input
            name="name"
            aria-label="Rule name"
            disabled={readOnly}
            placeholder="Rule name"
            className="h-9 rounded-md border border-workbench-line bg-workbench-panel px-2 text-sm"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              name="operation"
              aria-label="Operation"
              disabled={readOnly}
              className="h-9 rounded-md border border-workbench-line bg-workbench-panel px-2 text-sm"
            >
              <option value="suffix">Suffix</option>
              <option value="prefix">Prefix</option>
              <option value="infix">Infix</option>
              <option value="ablaut">Replacement</option>
              <option value="template">Template</option>
              <option value="reduplication">Reduplication</option>
              <option value="suppletion">Suppletion</option>
              <option value="remove-suffix">Remove suffix</option>
            </select>
            <input
              name="operationValue"
              aria-label="Operation value"
              disabled={readOnly}
              placeholder="Structured value"
              className="h-9 rounded-md border border-workbench-line bg-workbench-panel px-2 text-sm"
            />
          </div>
          <NotesField
            id="morphology-rule-notes"
            value=""
            disabled={readOnly}
            placeholder="Usage notes; canonical rule data stays structured JSON"
          />
        </form>
      </Panel>
    </div>
  );
}

function RulePreview({
  rule,
  roots,
  inventory,
  romanizationMappings,
}: {
  readonly rule: MorphologyRule;
  readonly roots: readonly Lexeme[];
  readonly inventory: ReturnType<typeof buildInventory>;
  readonly romanizationMappings: PhonologyData["romanizationMappings"];
}) {
  const candidates = roots.filter(
    (root) => !rule.inputPosId || root.partOfSpeechId === rule.inputPosId,
  );
  const previews = candidates.slice(0, 3).map((root) => {
    const result = applyMorphologyRule(root.ipa, rule.body, inventory);
    return { root, result };
  });

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-3">
      {previews.map(({ root, result }) => (
        <div key={root.id} className="rounded-md bg-workbench-panel p-3 text-sm">
          <p className="font-medium">{displayLexemeForm(root)}</p>
          {result.status === "changed" ? (
            <>
              <p className="font-mono text-workbench-muted">/{result.form}/</p>
              <p className="truncate text-xs text-workbench-muted">
                {romanize(result.form, romanizationMappings)}
              </p>
            </>
          ) : (
            <p className="text-xs text-workbench-muted">{result.reason}</p>
          )}
        </div>
      ))}
    </div>
  );
}
