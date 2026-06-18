"use client";

import {
  BookOpen,
  CheckCircle2,
  Edit3,
  FileText,
  GitBranch,
  Library,
  ListChecks,
  Plus,
  Save,
  Search,
  Tags,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { NotesPreview } from "@/components/notes-field";
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
import { applyMorphologyRule, morphologyRuleSummary } from "@/lib/morphology";
import { buildInventory, romanize, type PhonologyData } from "@/lib/phonology";
import type { ProjectDataStatus } from "@/lib/projects";

export const lexiconSubTabs = [
  { id: "dictionary", label: "Dictionary" },
  { id: "swadesh", label: "Swadesh" },
  { id: "thesaurus", label: "Thesaurus" },
  { id: "derivations", label: "Derivations" },
] as const;

type LexiconTab = (typeof lexiconSubTabs)[number]["id"];
type EditorMode = "create" | "edit";

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
  readonly activeTab?: LexiconTab;
  readonly searchQuery?: string;
  readonly partOfSpeechId?: string;
}) {
  const initialTab = lexiconSubTabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : "dictionary";
  const storageEnabled = status !== "ready";
  const storageKey = `conlang-workbench:${projectId}:lexicon:v1`;
  const initialLexemes = readStoredLexemes(storageEnabled, storageKey, data.lexemes);
  const [tab, setTab] = useState<LexiconTab>(initialTab);
  const [lexemes, setLexemes] = useState<readonly Lexeme[]>(initialLexemes);
  const [query, setQuery] = useState(searchQuery);
  const [posFilter, setPosFilter] = useState(partOfSpeechId);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialLexemes[0]?.id ?? null,
  );
  const [editor, setEditor] = useState<{
    readonly mode: EditorMode;
    readonly lexeme: Lexeme | null;
    readonly prefillMeaning?: string;
  } | null>(initialLexemes.length ? null : { mode: "create", lexeme: null });

  useEffect(() => {
    if (!storageEnabled || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify({ lexemes }));
  }, [lexemes, storageEnabled, storageKey]);

  const selectedTab = lexiconSubTabs.some((item) => item.id === tab)
    ? tab
    : "dictionary";
  const inventory = useMemo(() => buildInventory(phonologyData), [phonologyData]);
  const posById = useMemo(
    () => new Map(data.partsOfSpeech.map((pos) => [pos.id, pos])),
    [data.partsOfSpeech],
  );
  const filteredLexemes = useMemo(
    () =>
      filterLexemes(lexemes, data.partsOfSpeech, {
        query,
        partOfSpeechId: posFilter || undefined,
      }),
    [data.partsOfSpeech, lexemes, posFilter, query],
  );
  const selectedLexeme =
    lexemes.find((lexeme) => lexeme.id === selectedId) ??
    filteredLexemes[0] ??
    lexemes[0] ??
    null;
  const rootLexemes = lexemes.filter((lexeme) => !lexeme.derivedFromLexemeId);

  function selectTab(nextTab: LexiconTab) {
    setTab(nextTab);
  }

  function startCreate(prefillMeaning?: string) {
    setTab("dictionary");
    setEditor({ mode: "create", lexeme: null, prefillMeaning });
  }

  function startEdit(lexeme: Lexeme) {
    setEditor({ mode: "edit", lexeme });
  }

  function saveLexeme(input: LexemeFormInput) {
    if (editor?.mode === "edit" && editor.lexeme) {
      const updated = { ...editor.lexeme, ...input };
      setLexemes((current) =>
        current.map((lexeme) => (lexeme.id === updated.id ? updated : lexeme)),
      );
      setSelectedId(updated.id);
      setEditor(null);
      return;
    }

    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const lexeme: Lexeme = {
      id,
      projectId,
      ipa: input.ipa,
      romanization: input.romanization,
      meaning: input.meaning,
      partOfSpeechId: input.partOfSpeechId,
      isPhonologicalException: false,
      derivedFromLexemeId: null,
      derivedViaRuleId: null,
      rootOnlyViaDerivations: false,
      notes: input.notes,
    };
    setLexemes((current) => [...current, lexeme]);
    setSelectedId(id);
    setEditor(null);
  }

  return (
    <div className="mx-auto grid max-w-[96rem] gap-4">
      <header className="flex flex-col gap-3 border-b border-workbench-line pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-workbench-muted">
            Project lexicon
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">Lexicon</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-workbench-muted">
            Create words, search the dictionary, and browse reference prompts.
          </p>
        </div>
        <div className="rounded-md border border-workbench-line bg-white px-3 py-2 text-sm text-workbench-muted">
          {status === "ready" ? "Supabase data" : "Local browser data"}
          {message ? <span className="block text-xs">{message}</span> : null}
        </div>
      </header>

      <nav aria-label="Lexicon sections" className="flex flex-wrap gap-2">
        {lexiconSubTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectTab(item.id)}
            aria-current={selectedTab === item.id ? "page" : undefined}
            className={`inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium ${
              selectedTab === item.id
                ? "border-workbench-accent bg-[#eef6f4] text-workbench-ink"
                : "border-workbench-line bg-white text-workbench-muted hover:text-workbench-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {selectedTab === "dictionary" ? (
        <DictionaryView
          projectId={projectId}
          lexemes={lexemes}
          filteredLexemes={filteredLexemes}
          partsOfSpeech={data.partsOfSpeech}
          posById={posById}
          selectedLexeme={selectedLexeme}
          query={query}
          posFilter={posFilter}
          phonologyData={phonologyData}
          editor={editor}
          setQuery={setQuery}
          setPosFilter={setPosFilter}
          setSelectedId={setSelectedId}
          startCreate={startCreate}
          startEdit={startEdit}
          saveLexeme={saveLexeme}
          cancelEditor={() => setEditor(null)}
        />
      ) : null}

      {selectedTab === "swadesh" ? (
        <SwadeshSection data={{ ...data, lexemes }} startCreate={startCreate} />
      ) : null}

      {selectedTab === "thesaurus" ? (
        <ThesaurusSection
          categories={data.thesaurus}
          lexemes={lexemes}
          startCreate={startCreate}
        />
      ) : null}

      {selectedTab === "derivations" ? (
        <DerivationsSection
          rules={data.morphologyRules.filter((rule) => rule.ruleKind === "derivational")}
          roots={rootLexemes}
          partsOfSpeech={data.partsOfSpeech}
          inventory={inventory}
          romanizationMappings={phonologyData.romanizationMappings}
        />
      ) : null}
    </div>
  );
}

type LexemeFormInput = Pick<
  Lexeme,
  "ipa" | "romanization" | "meaning" | "partOfSpeechId" | "notes"
> & {
  readonly id?: string;
};

function DictionaryView({
  projectId,
  lexemes,
  filteredLexemes,
  partsOfSpeech,
  posById,
  selectedLexeme,
  query,
  posFilter,
  phonologyData,
  editor,
  setQuery,
  setPosFilter,
  setSelectedId,
  startCreate,
  startEdit,
  saveLexeme,
  cancelEditor,
}: {
  readonly projectId: string;
  readonly lexemes: readonly Lexeme[];
  readonly filteredLexemes: readonly Lexeme[];
  readonly partsOfSpeech: readonly PartOfSpeech[];
  readonly posById: ReadonlyMap<string, PartOfSpeech>;
  readonly selectedLexeme: Lexeme | null;
  readonly query: string;
  readonly posFilter: string;
  readonly phonologyData: PhonologyData;
  readonly editor: {
    readonly mode: EditorMode;
    readonly lexeme: Lexeme | null;
    readonly prefillMeaning?: string;
  } | null;
  readonly setQuery: (query: string) => void;
  readonly setPosFilter: (pos: string) => void;
  readonly setSelectedId: (id: string) => void;
  readonly startCreate: (meaning?: string) => void;
  readonly startEdit: (lexeme: Lexeme) => void;
  readonly saveLexeme: (input: LexemeFormInput) => void;
  readonly cancelEditor: () => void;
}) {
  return (
    <section aria-labelledby="dictionary-heading" className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 id="dictionary-heading" className="text-lg font-semibold">
          Dictionary
        </h2>
        <button
          type="button"
          onClick={() => startCreate()}
          className="ml-auto inline-flex h-9 items-center gap-2 rounded-md border border-workbench-line bg-white px-3 text-sm font-medium"
        >
          <Plus aria-hidden="true" size={15} />
          Lexeme
        </button>
      </div>

      <div
        data-testid="dictionary-layout"
        className="grid min-w-0 gap-4 xl:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]"
      >
        <section className="min-w-0 rounded-lg border border-workbench-line bg-white">
          <div className="border-b border-workbench-line p-4">
            <SectionTitle icon={Library} title="Entries" />
            <div className="grid gap-2">
              <label className="grid gap-1 text-xs font-medium text-workbench-muted">
                Search
                <span className="relative">
                  <Search
                    aria-hidden="true"
                    size={15}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-workbench-muted"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    placeholder="form, meaning, POS"
                    className="h-9 w-full rounded-md border border-workbench-line bg-white pl-8 pr-2 text-sm text-workbench-ink"
                  />
                </span>
              </label>
              <label className="grid gap-1 text-xs font-medium text-workbench-muted">
                POS
                <select
                  value={posFilter}
                  onChange={(event) => setPosFilter(event.currentTarget.value)}
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
            </div>
          </div>
          <div className="max-h-[36rem] overflow-auto p-3">
            {filteredLexemes.length ? (
              <div className="grid gap-2">
                {filteredLexemes.map((lexeme) => (
                  <LexemeListItem
                    key={lexeme.id}
                    lexeme={lexeme}
                    pos={lexeme.partOfSpeechId ? posById.get(lexeme.partOfSpeechId) : null}
                    selected={lexeme.id === selectedLexeme?.id}
                    onSelect={() => {
                      setSelectedId(lexeme.id);
                      cancelEditor();
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyDictionaryState
                hasLexemes={lexemes.length > 0}
                onCreate={() => startCreate()}
              />
            )}
          </div>
        </section>

        <div className="grid min-w-0 content-start gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,1.05fr)] xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)]">
          <LexemeDetail
            lexeme={selectedLexeme}
            pos={selectedLexeme?.partOfSpeechId ? posById.get(selectedLexeme.partOfSpeechId) : null}
            romanized={
              selectedLexeme
                ? romanize(selectedLexeme.ipa, phonologyData.romanizationMappings)
                : null
            }
            onEdit={selectedLexeme ? () => startEdit(selectedLexeme) : undefined}
          />
          <LexemeEditor
            key={`${editor?.mode ?? "create"}-${editor?.lexeme?.id ?? "new"}-${editor?.prefillMeaning ?? ""}`}
            projectId={projectId}
            partsOfSpeech={partsOfSpeech}
            mode={editor?.mode ?? "create"}
            lexeme={editor?.lexeme ?? null}
            prefillMeaning={editor?.prefillMeaning}
            onSave={saveLexeme}
            onCancel={editor ? cancelEditor : undefined}
          />
        </div>
      </div>
    </section>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  readonly icon: LucideIcon;
  readonly title: string;
}) {
  return (
    <div className="mb-3 flex min-h-8 items-center gap-2">
      <Icon aria-hidden="true" size={18} className="text-workbench-accent" />
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
  );
}

function LexemeListItem({
  lexeme,
  pos,
  selected,
  onSelect,
}: {
  readonly lexeme: Lexeme;
  readonly pos: PartOfSpeech | null | undefined;
  readonly selected: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-w-0 rounded-md border p-3 text-left transition ${
        selected
          ? "border-workbench-accent bg-[#eef6f4]"
          : "border-workbench-line bg-workbench-panel hover:border-workbench-accent"
      }`}
    >
      <span className="flex min-w-0 items-start gap-2">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {displayLexemeForm(lexeme)}
          </span>
          <span className="block truncate font-mono text-xs text-workbench-muted">
            /{lexeme.ipa}/
          </span>
        </span>
        <span className="rounded-md border border-workbench-line bg-white px-2 py-1 text-xs font-medium text-workbench-muted">
          {pos?.abbreviation ?? "POS"}
        </span>
      </span>
      <span className="mt-2 block truncate text-sm text-workbench-muted">
        {lexeme.meaning ?? "No meaning"}
      </span>
      <NotesPreview value={lexeme.notes} emptyLabel="No lexeme notes" />
    </button>
  );
}

function EmptyDictionaryState({
  hasLexemes,
  onCreate,
}: {
  readonly hasLexemes: boolean;
  readonly onCreate: () => void;
}) {
  return (
    <div className="rounded-md bg-workbench-panel p-4 text-sm text-workbench-muted">
      <p>{hasLexemes ? "No lexemes match the current filters." : "No lexemes yet."}</p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-3 inline-flex h-8 items-center gap-2 rounded-md border border-workbench-line bg-white px-3 text-sm font-medium text-workbench-ink"
      >
        <Plus aria-hidden="true" size={14} />
        Add a lexeme
      </button>
    </div>
  );
}

function LexemeDetail({
  lexeme,
  pos,
  romanized,
  onEdit,
}: {
  readonly lexeme: Lexeme | null;
  readonly pos: PartOfSpeech | null | undefined;
  readonly romanized: string | null;
  readonly onEdit?: () => void;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-workbench-line bg-white p-4">
      <div className="mb-3 flex min-h-9 items-center gap-2">
        <BookOpen aria-hidden="true" size={18} className="text-workbench-accent" />
        <h3 className="text-base font-semibold">Detail</h3>
        {lexeme && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="ml-auto inline-flex h-8 items-center gap-2 rounded-md border border-workbench-line bg-white px-3 text-sm font-medium"
          >
            <Edit3 aria-hidden="true" size={14} />
            Edit
          </button>
        ) : null}
      </div>
      {lexeme ? (
        <div className="grid min-w-0 gap-3">
          <div className="min-w-0">
            <p className="truncate text-2xl font-semibold">{displayLexemeForm(lexeme)}</p>
            <p className="truncate font-mono text-sm text-workbench-muted">/{lexeme.ipa}/</p>
          </div>
          <dl className="grid min-w-0 gap-2 text-sm">
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
      ) : (
        <p className="rounded-md bg-workbench-panel p-4 text-sm text-workbench-muted">
          Create a lexeme to inspect it here.
        </p>
      )}
    </section>
  );
}

function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-workbench-panel px-3 py-2">
      <dt className="text-xs font-semibold uppercase text-workbench-muted">{label}</dt>
      <dd className="mt-1 min-w-0 break-words">{value}</dd>
    </div>
  );
}

function LexemeEditor({
  projectId,
  partsOfSpeech,
  mode,
  lexeme,
  prefillMeaning,
  onSave,
  onCancel,
}: {
  readonly projectId: string;
  readonly partsOfSpeech: readonly PartOfSpeech[];
  readonly mode: EditorMode;
  readonly lexeme: Lexeme | null;
  readonly prefillMeaning?: string;
  readonly onSave: (input: LexemeFormInput) => void;
  readonly onCancel?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ipa = String(form.get("ipa") ?? "").trim();
    if (!ipa) {
      setError("IPA is required.");
      return;
    }
    setError(null);
    onSave({
      id: lexeme?.id,
      ipa,
      romanization: nullableString(form.get("romanization")),
      meaning: nullableString(form.get("meaning")),
      partOfSpeechId: nullableString(form.get("partOfSpeechId")),
      notes: nullableString(form.get("notes")),
    });
    event.currentTarget.reset();
  }

  return (
    <section className="min-w-0 rounded-lg border border-workbench-line bg-white p-4">
      <div className="mb-3 flex min-h-9 items-center gap-2">
        <FileText aria-hidden="true" size={18} className="text-workbench-accent" />
        <h3 className="text-base font-semibold">
          {mode === "edit" ? "Edit lexeme" : "New lexeme"}
        </h3>
      </div>
      <form onSubmit={submit} className="grid min-w-0 gap-3">
        <input type="hidden" name="projectId" value={projectId} />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <label className="grid min-w-0 gap-1 text-xs font-medium text-workbench-muted">
            IPA
            <input
              name="ipa"
              defaultValue={lexeme?.ipa ?? ""}
              placeholder="paku"
              className="h-9 min-w-0 rounded-md border border-workbench-line bg-workbench-panel px-2 font-mono text-sm"
            />
          </label>
          <label className="grid min-w-0 gap-1 text-xs font-medium text-workbench-muted">
            Romanization
            <input
              name="romanization"
              defaultValue={lexeme?.romanization ?? ""}
              placeholder="paku"
              className="h-9 min-w-0 rounded-md border border-workbench-line bg-workbench-panel px-2 text-sm"
            />
          </label>
          <label className="grid min-w-0 gap-1 text-xs font-medium text-workbench-muted">
            Meaning
            <input
              name="meaning"
              defaultValue={lexeme?.meaning ?? prefillMeaning ?? ""}
              placeholder="water"
              className="h-9 min-w-0 rounded-md border border-workbench-line bg-workbench-panel px-2 text-sm"
            />
          </label>
          <label className="grid min-w-0 gap-1 text-xs font-medium text-workbench-muted">
            POS
            <select
              name="partOfSpeechId"
              defaultValue={lexeme?.partOfSpeechId ?? ""}
              className="h-9 min-w-0 rounded-md border border-workbench-line bg-workbench-panel px-2 text-sm"
            >
              <option value="">Unassigned</option>
              {partsOfSpeech.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid min-w-0 gap-1 text-xs font-medium text-workbench-muted">
          Notes
          <textarea
            name="notes"
            defaultValue={lexeme?.notes ?? ""}
            rows={5}
            maxLength={4000}
            placeholder="Etymology, usage, register, or field notes"
            className="min-w-0 resize-y rounded-md border border-workbench-line bg-workbench-panel px-3 py-2 text-sm leading-6 text-workbench-ink"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-workbench-accent px-3 text-sm font-medium text-white"
          >
            <Save aria-hidden="true" size={15} />
            {mode === "edit" ? "Save lexeme" : "Create lexeme"}
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-workbench-line bg-white px-3 text-sm font-medium"
            >
              <X aria-hidden="true" size={15} />
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

function SwadeshSection({
  data,
  startCreate,
}: {
  readonly data: LexiconData;
  readonly startCreate: (meaning?: string) => void;
}) {
  const coverage = swadeshCoverage(data.swadesh, data.lexemes);
  const covered = coverage.filter((item) => item.lexeme).length;
  const grouped = groupBy(coverage, (item) => item.concept.category);

  return (
    <section aria-labelledby="swadesh-heading" className="min-w-0">
      <h2 id="swadesh-heading" className="mb-3 text-lg font-semibold">
        Swadesh
      </h2>
      <div className="rounded-lg border border-workbench-line bg-white p-4">
        <SectionTitle icon={ListChecks} title="Reference Concepts" />
        <div className="mb-4 flex items-center gap-3 text-sm text-workbench-muted">
          <span className="rounded-md bg-workbench-panel px-2 py-1">
            {covered}/{data.swadesh.length} covered
          </span>
          <span className="h-2 min-w-32 flex-1 rounded-full bg-workbench-panel">
            <span
              className="block h-2 rounded-full bg-workbench-accent"
              style={{
                width: `${data.swadesh.length ? (covered / data.swadesh.length) * 100 : 0}%`,
              }}
            />
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...grouped.entries()].map(([category, items]) => (
            <section key={category} className="min-w-0">
              <h3 className="mb-2 text-sm font-semibold">{category}</h3>
              <div className="grid gap-1">
                {items.map(({ concept, lexeme }) => (
                  <div
                    key={concept.id}
                    className="flex min-w-0 items-center gap-2 rounded-md bg-workbench-panel px-3 py-2 text-sm"
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      size={15}
                      className={lexeme ? "text-workbench-accent" : "text-workbench-muted"}
                    />
                    <span className="min-w-0 flex-1 truncate">{concept.concept}</span>
                    {lexeme ? (
                      <span className="max-w-32 truncate text-workbench-accent">
                        {displayLexemeForm(lexeme)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startCreate(concept.concept)}
                        className="shrink-0 rounded-md border border-workbench-line bg-white px-2 py-1 text-xs font-medium"
                      >
                        Add
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThesaurusSection({
  categories,
  lexemes,
  startCreate,
}: {
  readonly categories: readonly ThesaurusCategory[];
  readonly lexemes: readonly Lexeme[];
  readonly startCreate: (meaning?: string) => void;
}) {
  const [query, setQuery] = useState("");
  const byMeaning = useMemo(
    () =>
      new Map(
        lexemes
          .filter((lexeme) => lexeme.meaning)
          .map((lexeme) => [lexeme.meaning!.toLowerCase(), lexeme]),
      ),
    [lexemes],
  );
  const visible = useMemo(
    () => filterThesaurus(categories, query),
    [categories, query],
  );

  return (
    <section aria-labelledby="thesaurus-heading" className="min-w-0">
      <h2 id="thesaurus-heading" className="mb-3 text-lg font-semibold">
        Thesaurus
      </h2>
      <div className="rounded-lg border border-workbench-line bg-white p-4">
        <SectionTitle icon={Tags} title="Semantic Prompts" />
        <label className="mb-4 grid max-w-xl gap-1 text-xs font-medium text-workbench-muted">
          Search concepts
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="river, kinship, weather"
            className="h-9 rounded-md border border-workbench-line bg-workbench-panel px-3 text-sm text-workbench-ink"
          />
        </label>
        {visible.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {visible.map((category) => (
              <ThesaurusCategoryView
                key={category.id}
                category={category}
                byMeaning={byMeaning}
                startCreate={startCreate}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md bg-workbench-panel p-4 text-sm text-workbench-muted">
            No matching concepts.
          </p>
        )}
      </div>
    </section>
  );
}

function ThesaurusCategoryView({
  category,
  byMeaning,
  startCreate,
}: {
  readonly category: ThesaurusCategory;
  readonly byMeaning: ReadonlyMap<string, Lexeme>;
  readonly startCreate: (meaning?: string) => void;
}) {
  return (
    <details open className="min-w-0 rounded-md border border-workbench-line bg-workbench-panel p-3">
      <summary className="cursor-pointer list-none text-sm font-semibold">
        {category.name}
      </summary>
      {category.concepts.length ? (
        <ConceptList
          concepts={category.concepts}
          byMeaning={byMeaning}
          startCreate={startCreate}
        />
      ) : null}
      {category.children?.map((child) => (
        <div key={child.id} className="mt-3 border-l border-workbench-line pl-3">
          <ThesaurusCategoryView
            category={child}
            byMeaning={byMeaning}
            startCreate={startCreate}
          />
        </div>
      ))}
    </details>
  );
}

function ConceptList({
  concepts,
  byMeaning,
  startCreate,
}: {
  readonly concepts: readonly string[];
  readonly byMeaning: ReadonlyMap<string, Lexeme>;
  readonly startCreate: (meaning?: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {concepts.map((concept) => {
        const lexeme = byMeaning.get(concept.toLowerCase());
        return (
          <span
            key={concept}
            className="inline-flex min-w-0 items-center gap-1 rounded-md border border-workbench-line bg-white px-2 py-1 text-xs"
          >
            <span className="truncate">{concept}</span>
            {lexeme ? (
              <span className="text-workbench-accent">{displayLexemeForm(lexeme)}</span>
            ) : (
              <button
                type="button"
                onClick={() => startCreate(concept)}
                className="text-workbench-accent"
              >
                Name
              </button>
            )}
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
}: {
  readonly rules: readonly MorphologyRule[];
  readonly roots: readonly Lexeme[];
  readonly partsOfSpeech: readonly PartOfSpeech[];
  readonly inventory: ReturnType<typeof buildInventory>;
  readonly romanizationMappings: PhonologyData["romanizationMappings"];
}) {
  const posById = new Map(partsOfSpeech.map((pos) => [pos.id, pos]));

  return (
    <section aria-labelledby="derivations-heading" className="min-w-0">
      <h2 id="derivations-heading" className="mb-3 text-lg font-semibold">
        Derivations
      </h2>
      <div className="rounded-lg border border-workbench-line bg-white p-4">
        <SectionTitle icon={GitBranch} title="Structured Rules" />
        {rules.length ? (
          <div className="grid gap-3">
            {rules.map((rule) => (
              <article key={rule.id} className="rounded-md border border-workbench-line p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{rule.name}</h3>
                  <span className="rounded-md bg-workbench-panel px-2 py-1 text-xs text-workbench-muted">
                    {rule.inputPosId ? posById.get(rule.inputPosId)?.abbreviation : "Any"}{" "}
                    {"->"} {rule.outputPosId ? posById.get(rule.outputPosId)?.abbreviation : "Any"}
                  </span>
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
        ) : (
          <p className="rounded-md bg-workbench-panel p-4 text-sm text-workbench-muted">
            No derivational rules yet. Structured rule editing can build on this view
            without storing DSL strings.
          </p>
        )}
      </div>
    </section>
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

  if (!previews.length) {
    return (
      <p className="mt-3 rounded-md bg-workbench-panel p-3 text-sm text-workbench-muted">
        Add matching roots to preview derived forms.
      </p>
    );
  }

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-3">
      {previews.map(({ root, result }) => (
        <div key={root.id} className="rounded-md bg-workbench-panel p-3 text-sm">
          <p className="truncate font-medium">{displayLexemeForm(root)}</p>
          {result.status === "changed" ? (
            <>
              <p className="truncate font-mono text-workbench-muted">/{result.form}/</p>
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

function nullableString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readStoredLexemes(
  storageEnabled: boolean,
  storageKey: string,
  fallback: readonly Lexeme[],
) {
  if (!storageEnabled || typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(stored) as { readonly lexemes?: readonly Lexeme[] };
    return Array.isArray(parsed.lexemes) ? parsed.lexemes : fallback;
  } catch {
    window.localStorage.removeItem(storageKey);
    return fallback;
  }
}

function groupBy<T, K>(items: readonly T[], getKey: (item: T) => K) {
  const grouped = new Map<K, T[]>();
  for (const item of items) {
    const key = getKey(item);
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }
  return grouped;
}

function filterThesaurus(
  categories: readonly ThesaurusCategory[],
  query: string,
): readonly ThesaurusCategory[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return categories;
  }

  return categories
    .map((category) => filterCategory(category, normalized))
    .filter((category): category is ThesaurusCategory => Boolean(category));
}

function filterCategory(category: ThesaurusCategory, query: string): ThesaurusCategory | null {
  const concepts = category.concepts.filter((concept) =>
    concept.toLowerCase().includes(query),
  );
  const children = (category.children ?? [])
    .map((child) => filterCategory(child, query))
    .filter((child): child is ThesaurusCategory => Boolean(child));
  const nameMatches = category.name.toLowerCase().includes(query);

  if (!nameMatches && concepts.length === 0 && children.length === 0) {
    return null;
  }

  return {
    ...category,
    concepts: nameMatches ? category.concepts : concepts,
    children: nameMatches ? category.children : children,
  };
}
