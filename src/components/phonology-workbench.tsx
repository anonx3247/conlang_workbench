"use client";

import { useMemo, useState } from "react";
import { BookOpen, CircleDot, Keyboard, Plus, RefreshCw, ScrollText, Sigma } from "lucide-react";

import { NotesField, NotesPreview } from "@/components/notes-field";
import {
  audioState,
  chartCell,
  findChartSound,
  ipaKeyboardGroups,
  phonemeChartPlacement,
  referenceConsonantManners,
  referenceConsonantPlaces,
  referenceVowelBacknesses,
  referenceVowelHeights,
  type IpaChartSound,
} from "@/lib/phonology-chart";
import {
  buildInventory,
  applyLongVowelMarks,
  constraintSummary,
  generateWords,
  romanize,
  soundRuleSummary,
  templateToText,
  type NaturalClass,
  type Phoneme,
  type PhonologyData,
  type PhonotacticConstraint,
  type PhonotacticTemplate,
  type SoundRule,
} from "@/lib/phonology";
import {
  getPhonologyTabById,
  type PhonologyTabId,
} from "@/lib/phonology-tabs";
import type { ProjectDataStatus } from "@/lib/projects";

export function PhonologyWorkbench({
  projectId,
  data,
  status,
  message,
  selectedTab = "inventory",
}: {
  readonly projectId: string;
  readonly data: PhonologyData;
  readonly status: ProjectDataStatus;
  readonly message: string | null;
  readonly selectedTab?: PhonologyTabId;
}) {
  const [phonemes, setPhonemes] = useState([...data.phonemes]);
  const [naturalClasses] = useState([...data.naturalClasses]);
  const [romanizationMappings] = useState([...data.romanizationMappings]);
  const [templates] = useState([...data.templates]);
  const [constraints] = useState([...data.constraints]);
  const [soundRules] = useState([...data.soundRules]);
  const [selectedSymbol, setSelectedSymbol] = useState(phonemes[0]?.symbol ?? "p");
  const [wordBatch, setWordBatch] = useState(0);
  const [audioMessage, setAudioMessage] = useState("");

  const inventory = useMemo(
    () => buildInventory({ phonemes, naturalClasses }),
    [phonemes, naturalClasses],
  );
  const words = useMemo(() => {
    return generateWords({
      inventory,
      templates,
      count: 10,
      picker(items, context) {
        const contextValue = [...context].reduce(
          (total, character) => total + character.charCodeAt(0),
          wordBatch,
        );
        return items[contextValue % items.length];
      },
    });
  }, [inventory, templates, wordBatch]);
  const selectedPhoneme =
    phonemes.find((phoneme) => phoneme.symbol === selectedSymbol) ?? null;
  const selectedSound = findChartSound(selectedSymbol);
  const localMode = status !== "ready";

  function addPhoneme(formData: FormData) {
    const symbol = String(formData.get("symbol") ?? "").trim();
    const type = formData.get("phonemeType") === "vowel" ? "vowel" : "consonant";
    const notes = String(formData.get("notes") ?? "").trim() || null;
    if (!symbol || phonemes.some((phoneme) => phoneme.symbol === symbol)) {
      return;
    }

    const chartSound = findChartSound(symbol);
    setPhonemes((current) => [
      ...current,
      {
        id: `local-phoneme-${symbol}-${current.length + 1}`,
        projectId,
        symbol,
        type: chartSound?.type ?? type,
        features: chartSound
          ? {
              manner: chartSound.manner,
              place: chartSound.place,
              voicing: chartSound.voicing,
              height: chartSound.height,
              backness: chartSound.backness,
              rounded: chartSound.rounded,
            }
          : {},
        notes,
      },
    ]);
    setSelectedSymbol(symbol);
  }

  function updateSelectedNote(note: string) {
    if (!selectedPhoneme) {
      return;
    }
    setPhonemes((current) =>
      current.map((phoneme) =>
        phoneme.id === selectedPhoneme.id
          ? { ...phoneme, notes: note.trim() || null }
          : phoneme,
      ),
    );
  }

  function playIpaSound(sound: IpaChartSound) {
    onSelectAudio(sound, setAudioMessage);
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-4">
      <header className="flex flex-col gap-3 border-b border-workbench-line pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-workbench-muted">
            Project phonology
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">
            Phonology
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-workbench-muted">
            {getPhonologyTabById(selectedTab).label}
          </p>
        </div>
        <div className="rounded-md border border-workbench-line bg-white px-3 py-2 text-sm text-workbench-muted">
          {localMode ? "Demo/local interactions" : "Cloud data"}
          <span className="block text-xs">
            {message ??
              (localMode
                ? "Changes are kept in this browser session only."
                : "Persistence wiring will use the same controls.")}
          </span>
        </div>
      </header>

      {selectedTab === "inventory" ? (
        <InventoryView
          phonemes={phonemes}
          selectedPhoneme={selectedPhoneme}
          selectedSound={selectedSound}
          selectedSymbol={selectedSymbol}
          romanizationMappings={romanizationMappings}
          onAddPhoneme={addPhoneme}
          onSelectSymbol={setSelectedSymbol}
          onPlaySound={playIpaSound}
          audioMessage={audioMessage}
          onUpdateSelectedNote={updateSelectedNote}
        />
      ) : null}

      {selectedTab === "natural-classes" ? (
        <NaturalClassesView naturalClasses={naturalClasses} phonemes={phonemes} />
      ) : null}

      {selectedTab === "sound-rules" ? (
        <SoundRulesView
          projectId={projectId}
          templates={templates}
          constraints={constraints}
          soundRules={soundRules}
          words={words}
          romanizationMappings={romanizationMappings}
          onRegenerate={() => setWordBatch((value) => value + 1)}
        />
      ) : null}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  actionLabel,
}: {
  readonly icon: typeof CircleDot;
  readonly title: string;
  readonly actionLabel?: string;
}) {
  return (
    <div className="mb-3 flex min-h-9 items-center gap-2">
      <Icon aria-hidden="true" size={18} className="text-workbench-accent" />
      <h2 className="text-base font-semibold">{title}</h2>
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

function InventoryView({
  phonemes,
  selectedPhoneme,
  selectedSound,
  selectedSymbol,
  romanizationMappings,
  onAddPhoneme,
  onSelectSymbol,
  onPlaySound,
  audioMessage,
  onUpdateSelectedNote,
}: {
  readonly phonemes: readonly Phoneme[];
  readonly selectedPhoneme: Phoneme | null;
  readonly selectedSound: IpaChartSound | null;
  readonly selectedSymbol: string;
  readonly romanizationMappings: PhonologyData["romanizationMappings"];
  readonly onAddPhoneme: (formData: FormData) => void;
  readonly onSelectSymbol: (symbol: string) => void;
  readonly onPlaySound: (sound: IpaChartSound) => void;
  readonly audioMessage: string;
  readonly onUpdateSelectedNote: (note: string) => void;
}) {
  return (
    <section aria-labelledby="inventory-heading">
      <h2 id="inventory-heading" className="mb-3 text-lg font-semibold">
        Inventory
      </h2>
      <div className="grid gap-4">
        <Panel>
          <SectionTitle icon={CircleDot} title="Reference IPA Chart" />
          <IpaChart
            phonemes={phonemes}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={onSelectSymbol}
            onPlaySound={onPlaySound}
            audioMessage={audioMessage}
          />
        </Panel>
        <div className="grid gap-4 xl:grid-cols-[minmax(340px,0.8fr)_minmax(300px,0.6fr)_minmax(340px,0.8fr)]">
          <InventorySummary
            phonemes={phonemes}
            selectedPhoneme={selectedPhoneme}
            selectedSound={selectedSound}
            onSelectSymbol={onSelectSymbol}
            onUpdateSelectedNote={onUpdateSelectedNote}
          />
          <AddPhonemePanel onAddPhoneme={onAddPhoneme} />
          <RomanizationSection mappings={romanizationMappings} />
        </div>
      </div>
    </section>
  );
}

function IpaChart({
  phonemes,
  selectedSymbol,
  onSelectSymbol,
  onPlaySound,
  audioMessage,
}: {
  readonly phonemes: readonly Phoneme[];
  readonly selectedSymbol: string;
  readonly onSelectSymbol: (symbol: string) => void;
  readonly onPlaySound: (sound: IpaChartSound) => void;
  readonly audioMessage: string;
}) {
  const inventorySymbols = new Set(phonemes.map((phoneme) => phoneme.symbol));
  const consonantSymbols =
    ipaKeyboardGroups.find((group) => group.label === "Consonants")?.symbols ?? [];
  const vowelSymbols =
    ipaKeyboardGroups.find((group) => group.label === "Vowels")?.symbols ?? [];

  return (
    <div className="grid gap-5">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-workbench-muted">
          Consonants
        </h3>
        <div className="overflow-x-auto">
          <div className="grid min-w-[72rem] grid-cols-[120px_repeat(13,minmax(64px,1fr))] gap-1 text-sm">
            <div />
            {referenceConsonantPlaces.map((place) => (
              <div key={place} className="px-2 py-1 text-center text-xs text-workbench-muted">
                {place}
              </div>
            ))}
            {referenceConsonantManners.map((manner) => (
              <ChartRow
                key={manner}
                row={manner}
                columns={referenceConsonantPlaces}
                symbols={consonantSymbols}
                inventorySymbols={inventorySymbols}
                selectedSymbol={selectedSymbol}
                onSelectSymbol={onSelectSymbol}
                onPlaySound={onPlaySound}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-workbench-muted">Vowels</h3>
        <div className="overflow-x-auto">
        <div className="grid min-w-[34rem] grid-cols-[120px_repeat(5,minmax(64px,1fr))] gap-1 text-sm">
          <div />
          {referenceVowelBacknesses.map((backness) => (
            <div key={backness} className="px-2 py-1 text-center text-xs text-workbench-muted">
              {backness}
            </div>
          ))}
          {referenceVowelHeights.map((height) => (
            <ChartRow
              key={height}
              row={height}
              columns={referenceVowelBacknesses}
              symbols={vowelSymbols}
              inventorySymbols={inventorySymbols}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={onSelectSymbol}
              onPlaySound={onPlaySound}
            />
          ))}
        </div>
        </div>
      </div>
      <p role="status" className="text-xs text-workbench-muted">
        {audioMessage || "Click any IPA symbol to select it and play audio when available."}
      </p>
    </div>
  );
}

function ChartRow({
  row,
  columns,
  symbols,
  inventorySymbols,
  selectedSymbol,
  onSelectSymbol,
  onPlaySound,
}: {
  readonly row: string;
  readonly columns: readonly string[];
  readonly symbols: readonly string[];
  readonly inventorySymbols: ReadonlySet<string>;
  readonly selectedSymbol: string;
  readonly onSelectSymbol: (symbol: string) => void;
  readonly onPlaySound: (sound: IpaChartSound) => void;
}) {
  return (
    <>
      <div className="px-2 py-2 text-xs font-medium text-workbench-muted">{row}</div>
      {columns.map((column) => {
        const cellSymbols = symbols.filter((symbol) => chartCell(symbol, row, column));
        return (
          <div
            key={`${row}-${column}`}
            className="min-h-12 p-1"
          >
            <div className="flex flex-wrap gap-1">
              {cellSymbols.map((symbol) => {
                const sound = findChartSound(symbol) ?? {
                  symbol,
                  type: "consonant" as const,
                  label: symbol,
                };
                const inInventory = inventorySymbols.has(sound.symbol);
                const selected = selectedSymbol === sound.symbol;
                return (
                  <button
                    key={sound.symbol}
                    type="button"
                    onClick={() => {
                      onSelectSymbol(sound.symbol);
                      onPlaySound(sound);
                    }}
                    aria-pressed={selected}
                    aria-label={`${sound.symbol} ${sound.label}${inInventory ? " in inventory" : ""}; ${audioState(sound).label}`}
                    className={[
                      "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 font-mono text-base transition",
                      inInventory
                        ? "border-workbench-accent bg-white font-bold text-workbench-ink shadow-hairline"
                        : "border-transparent bg-transparent text-workbench-muted hover:bg-white",
                      selected ? "ring-2 ring-workbench-accent" : "",
                    ].join(" ")}
                  >
                    {sound.symbol}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function InventorySummary({
  phonemes,
  selectedPhoneme,
  selectedSound,
  onSelectSymbol,
  onUpdateSelectedNote,
}: {
  readonly phonemes: readonly Phoneme[];
  readonly selectedPhoneme: Phoneme | null;
  readonly selectedSound: IpaChartSound | null;
  readonly onSelectSymbol: (symbol: string) => void;
  readonly onUpdateSelectedNote: (note: string) => void;
}) {
  return (
    <Panel>
      <SectionTitle icon={CircleDot} title="Inventory Summary" />
      <div className="mb-3 flex flex-wrap gap-2">
        {phonemes.map((phoneme) => (
          <button
            key={phoneme.id}
            type="button"
            onClick={() => onSelectSymbol(phoneme.symbol)}
            className="rounded-md border border-workbench-line bg-workbench-panel px-3 py-1 font-mono text-sm"
          >
            /{phoneme.symbol}/
          </button>
        ))}
      </div>

      <div className="rounded-md border border-workbench-line bg-workbench-panel p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xl font-semibold">
              /{selectedPhoneme?.symbol ?? selectedSound?.symbol ?? "?"}/
            </p>
            <p className="mt-1 text-sm text-workbench-muted">
              {selectedPhoneme
                ? describePhoneme(selectedPhoneme)
                : selectedSound?.label ?? "Select an IPA chart sound."}
            </p>
          </div>
        </div>

        {selectedPhoneme ? (
          <label className="mt-3 grid gap-1 text-xs font-medium text-workbench-muted">
            Local notes
            <textarea
              key={selectedPhoneme.id}
              defaultValue={selectedPhoneme.notes ?? ""}
              onBlur={(event) => onUpdateSelectedNote(event.currentTarget.value)}
              rows={3}
              className="resize-y rounded-md border border-workbench-line bg-white px-2 py-1 text-sm text-workbench-ink"
            />
          </label>
        ) : (
          <p className="mt-3 rounded-md bg-white p-2 text-sm text-workbench-muted">
            This IPA sound is available in the reference chart but is not in the
            project inventory yet.
          </p>
        )}
      </div>
    </Panel>
  );
}

function AddPhonemePanel({
  onAddPhoneme,
}: {
  readonly onAddPhoneme: (formData: FormData) => void;
}) {
  return (
    <Panel>
      <SectionTitle icon={Plus} title="Add Phoneme" />
      <form
        aria-label="Add phoneme"
        onSubmit={(event) => {
          event.preventDefault();
          onAddPhoneme(new FormData(event.currentTarget));
          event.currentTarget.reset();
        }}
        className="grid gap-3 rounded-md border border-workbench-line bg-workbench-panel p-3"
      >
        <div className="grid gap-2 sm:grid-cols-[100px_140px]">
          <IpaInput name="symbol" label="Symbol" placeholder="ɾ" />
          <label className="grid gap-1 text-xs font-medium text-workbench-muted">
            Type
            <select
              name="phonemeType"
              className="h-9 rounded-md border border-workbench-line bg-white px-2 text-sm text-workbench-ink"
            >
              <option value="consonant">Consonant</option>
              <option value="vowel">Vowel</option>
            </select>
          </label>
        </div>
        <NotesField
          id="new-phoneme-notes"
          value=""
          placeholder="Usage, alternations, audio TODOs, or field notes"
        />
        <button
          type="submit"
          className="h-9 rounded-md border border-workbench-line bg-white px-3 text-sm font-medium"
        >
          Add locally
        </button>
      </form>
    </Panel>
  );
}

function describePhoneme(phoneme: Phoneme) {
  const placement = phonemeChartPlacement(phoneme);
  if (phoneme.type === "vowel") {
    return [phoneme.features.rounded ? "rounded" : "unrounded", placement?.row, placement?.column, "vowel"]
      .filter(Boolean)
      .join(" ");
  }

  return [phoneme.features.voicing, placement?.column, placement?.row]
    .filter(Boolean)
    .join(" ");
}

function RomanizationSection({
  mappings,
}: {
  readonly mappings: PhonologyData["romanizationMappings"];
}) {
  const [localMappings, setLocalMappings] = useState([...mappings]);
  const [latinMapping, setLatinMapping] = useState("");
  const [longVowels, setLongVowels] = useState(false);

  function updateLatinMapping(value: string, enabled = longVowels) {
    setLatinMapping(enabled ? applyLongVowelMarks(value) : value);
  }

  function addMapping(formData: FormData) {
    const latin = String(formData.get("latinMapping") ?? "").trim();
    const ipa = String(formData.get("ipaSymbol") ?? "").trim();
    if (!latin || !ipa) {
      return;
    }

    setLocalMappings((current) => [
      ...current,
      {
        id: `local-rom-${current.length + 1}-${ipa}`,
        projectId: "local",
        ipaSymbol: ipa,
        latinMapping: latin,
        ordering: current.length + 1,
      },
    ]);
    setLatinMapping("");
  }

  return (
    <Panel>
      <SectionTitle icon={BookOpen} title="Romanization" actionLabel="Mapping" />
      <div className="grid gap-2">
        {localMappings.length ? (
          localMappings.map((mapping) => (
            <div
              key={mapping.id}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md bg-workbench-panel px-3 py-2 text-sm"
            >
              <span>{mapping.latinMapping}</span>
              <span className="text-workbench-muted">=</span>
              <span className="font-mono">/{mapping.ipaSymbol}/</span>
            </div>
          ))
        ) : (
          <p className="rounded-md bg-workbench-panel p-3 text-sm text-workbench-muted">
            No romanization mappings yet.
          </p>
        )}
      </div>
      <form
        aria-label="Add romanization mapping"
        onSubmit={(event) => {
          event.preventDefault();
          addMapping(new FormData(event.currentTarget));
          event.currentTarget.reset();
        }}
        className="mt-3 grid items-start gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <label className="grid gap-1 text-xs font-medium text-workbench-muted">
          Romanization
          <input
            name="latinMapping"
            aria-label="Latin mapping"
            placeholder="sh"
            value={latinMapping}
            onChange={(event) => updateLatinMapping(event.currentTarget.value)}
            className="h-9 rounded-md border border-workbench-line bg-white px-2 text-sm"
          />
        </label>
        <IpaInput name="ipaSymbol" label="IPA symbol" placeholder="ʃ" />
        <button
          type="submit"
          className="mt-5 h-9 rounded-md border border-workbench-line bg-white px-3 text-sm font-medium"
        >
          Add
        </button>
      </form>
      <label className="mt-3 flex items-center gap-2 rounded-md bg-workbench-panel px-3 py-2 text-sm text-workbench-muted">
        <input
          name="longVowels"
          type="checkbox"
          checked={longVowels}
          onChange={(event) => {
            setLongVowels(event.currentTarget.checked);
            updateLatinMapping(latinMapping, event.currentTarget.checked);
          }}
          className="h-4 w-4 accent-workbench-accent"
        />
        Long vowels: aa ee ii oo uu {"->"} ā ē ī ō ū
      </label>
    </Panel>
  );
}

function NaturalClassesView({
  naturalClasses,
  phonemes,
}: {
  readonly naturalClasses: readonly NaturalClass[];
  readonly phonemes: readonly Phoneme[];
}) {
  const byId = new Map(phonemes.map((phoneme) => [phoneme.id, phoneme.symbol]));

  return (
    <section aria-labelledby="natural-classes-heading">
      <h2 id="natural-classes-heading" className="mb-3 text-lg font-semibold">
        Natural classes
      </h2>
      <Panel>
        <SectionTitle icon={Sigma} title="Natural Classes" actionLabel="Class" />
        <div className="grid gap-2">
          <div className="rounded-md bg-workbench-panel p-3 text-sm">
            <span className="font-semibold">C</span>
            <span className="text-workbench-muted"> = all consonants</span>
            <span className="mx-3 text-workbench-line">|</span>
            <span className="font-semibold">V</span>
            <span className="text-workbench-muted"> = all vowels</span>
          </div>
          {naturalClasses.map((naturalClass) => (
            <div
              key={naturalClass.id}
              className="rounded-md border border-workbench-line bg-workbench-panel p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">[{naturalClass.name}]</span>
                <span className="font-mono text-sm text-workbench-muted">
                  {naturalClass.phonemeIds.map((id) => byId.get(id)).filter(Boolean).join(" ")}
                </span>
              </div>
              <NotesPreview value={naturalClass.notes} emptyLabel="No class notes" />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <NotesField
            id="new-natural-class-notes"
            value=""
            placeholder="Why this class exists or where it is used"
          />
        </div>
      </Panel>
    </section>
  );
}

function SoundRulesView({
  projectId,
  templates,
  constraints,
  soundRules,
  words,
  romanizationMappings,
  onRegenerate,
}: {
  readonly projectId: string;
  readonly templates: readonly PhonotacticTemplate[];
  readonly constraints: readonly PhonotacticConstraint[];
  readonly soundRules: readonly SoundRule[];
  readonly words: readonly string[];
  readonly romanizationMappings: PhonologyData["romanizationMappings"];
  readonly onRegenerate: () => void;
}) {
  return (
    <section aria-labelledby="sound-rules-heading">
      <h2 id="sound-rules-heading" className="mb-3 text-lg font-semibold">
        Sound rules
      </h2>
      <div className="grid gap-4 xl:grid-cols-2">
        <PhonotacticsSection
          projectId={projectId}
          templates={templates}
          constraints={constraints}
        />
        <div className="grid gap-4">
          <SoundRulesSection projectId={projectId} soundRules={soundRules} />
          <WordPreviewSection
            words={words}
            romanizationMappings={romanizationMappings}
            templateCount={templates.filter((template) => template.isActive).length}
            onRegenerate={onRegenerate}
          />
        </div>
      </div>
    </section>
  );
}

function WordPreviewSection({
  words,
  romanizationMappings,
  templateCount,
  onRegenerate,
}: {
  readonly words: readonly string[];
  readonly romanizationMappings: PhonologyData["romanizationMappings"];
  readonly templateCount: number;
  readonly onRegenerate: () => void;
}) {
  return (
    <Panel>
      <div className="mb-3 flex items-center gap-2">
        <RefreshCw aria-hidden="true" size={18} className="text-workbench-accent" />
        <h2 className="text-base font-semibold">Word Generator Preview</h2>
        <button
          type="button"
          onClick={onRegenerate}
          className="ml-auto inline-flex h-8 items-center gap-2 rounded-md border border-workbench-line bg-white px-3 text-sm font-medium"
        >
          <RefreshCw aria-hidden="true" size={14} />
          Generate
        </button>
      </div>
      <div className="mb-3 flex gap-2 text-xs text-workbench-muted">
        <span className="rounded-md bg-workbench-panel px-2 py-1">
          {templateCount} active templates
        </span>
        <span className="rounded-md bg-workbench-panel px-2 py-1">
          Structured slots only
        </span>
      </div>
      {words.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {words.map((word, index) => (
            <div
              key={`${word}-${index}`}
              className="rounded-md border border-workbench-line bg-workbench-panel p-3"
            >
              <p className="text-base font-semibold">
                {romanize(word, romanizationMappings)}
              </p>
              <p className="font-mono text-sm text-workbench-muted">/{word}/</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md bg-workbench-panel p-4 text-sm text-workbench-muted">
          Add phonemes and active structured templates to preview generated words.
        </p>
      )}
    </Panel>
  );
}

function PhonotacticsSection({
  projectId,
  templates,
  constraints,
}: {
  readonly projectId: string;
  readonly templates: readonly PhonotacticTemplate[];
  readonly constraints: readonly PhonotacticConstraint[];
}) {
  return (
    <Panel>
      <SectionTitle icon={ScrollText} title="Structured Phonotactics" actionLabel="Template" />
      <div className="grid gap-3">
        {templates.map((template) => (
          <div key={template.id} className="rounded-md border border-workbench-line p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{template.label ?? "Untitled template"}</span>
              <span className="rounded-md bg-workbench-panel px-2 py-1 font-mono text-sm">
                {templateToText(template.body.slots)}
              </span>
            </div>
            <NotesPreview value={template.notes} emptyLabel="No template notes" />
          </div>
        ))}
        {constraints.map((constraint) => (
          <div key={constraint.id} className="rounded-md border border-workbench-line p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{constraint.label ?? "Constraint"}</span>
              <span className="rounded-md bg-workbench-panel px-2 py-1 text-sm">
                {constraintSummary(constraint.body)}
              </span>
            </div>
            <NotesPreview value={constraint.notes} emptyLabel="No constraint notes" />
          </div>
        ))}
      </div>
      <form className="mt-3 grid gap-3 rounded-md bg-workbench-panel p-3">
        <input type="hidden" name="projectId" value={projectId} />
        <p className="text-xs font-semibold uppercase text-workbench-muted">
          New structured template
        </p>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)_140px_minmax(0,1fr)]">
          <input
            name="label"
            aria-label="Template label"
            placeholder="Template label"
            className="h-9 rounded-md border border-workbench-line bg-white px-2 text-sm"
          />
          <select
            name="onset"
            aria-label="Onset"
            className="h-9 rounded-md border border-workbench-line bg-white px-2 text-sm"
          >
            <option value="optional-class:C">optional C onset</option>
            <option value="class:C">required C onset</option>
            <option value="literal">exact IPA onset</option>
            <option value="none">no onset</option>
          </select>
          <input
            name="onsetValue"
            aria-label="Onset value"
            placeholder="C, [Stop], p"
            className="h-9 rounded-md border border-workbench-line bg-white px-2 text-sm"
          />
          <select
            name="nucleus"
            aria-label="Nucleus"
            className="h-9 rounded-md border border-workbench-line bg-white px-2 text-sm"
          >
            <option value="class:V">required V nucleus</option>
            <option value="literal">exact IPA nucleus</option>
          </select>
          <input
            name="codaValue"
            aria-label="Coda value"
            placeholder="optional C, [Nasal], t"
            className="h-9 rounded-md border border-workbench-line bg-white px-2 text-sm"
          />
        </div>
        <p className="text-xs leading-5 text-workbench-muted">
          Templates are stored as structured slots. Use C for consonants, V for
          vowels, [Name] for natural classes, and plain IPA for exact sounds.
        </p>
        <NotesField
          id="new-template-notes"
          value=""
          placeholder="Usage notes for this phonotactic template"
        />
      </form>
    </Panel>
  );
}

function SoundRulesSection({
  projectId,
  soundRules,
}: {
  readonly projectId: string;
  readonly soundRules: readonly SoundRule[];
}) {
  return (
    <Panel>
      <SectionTitle icon={ScrollText} title="Structured Sound Rules" actionLabel="Rule" />
      <div className="grid gap-3">
        {soundRules.map((rule) => (
          <div key={rule.id} className="rounded-md border border-workbench-line p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{rule.name}</span>
              <span className="rounded-md bg-workbench-panel px-2 py-1 font-mono text-sm">
                {soundRuleSummary(rule.body)}
              </span>
              {!rule.isActive ? (
                <span className="rounded-md border border-workbench-line px-2 py-1 text-xs text-workbench-muted">
                  inactive
                </span>
              ) : null}
            </div>
            <NotesPreview value={rule.notes} emptyLabel="No rule notes" />
          </div>
        ))}
      </div>
      <form className="mt-3 grid gap-3 rounded-md bg-workbench-panel p-3">
        <input type="hidden" name="projectId" value={projectId} />
        <p className="text-xs font-semibold uppercase text-workbench-muted">
          Fill-in rewrite rule
        </p>
        <div className="grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <IpaInput name="target" label="Pattern (phonemic)" placeholder="k" />
          <span className="pb-2 text-center font-mono text-lg text-workbench-muted">
            -&gt;
          </span>
          <IpaInput name="replacement" label="Replacement (phonetic)" placeholder="x" />
        </div>
        <div className="grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <IpaInput name="before" label="Before" placeholder="V" />
          <span className="pb-2 text-center font-mono text-lg text-workbench-muted">
            _
          </span>
          <IpaInput name="after" label="After" placeholder="V" />
        </div>
        <p className="text-xs leading-5 text-workbench-muted">
          Pattern matches phonemic input; replacement is surface phonetic.
          Context is optional and uses the same structured class references.
        </p>
        <NotesField
          id="new-sound-rule-notes"
          value=""
          placeholder="Free-text caveats, examples, or register notes; rule data stays structured"
        />
      </form>
    </Panel>
  );
}

function IpaInput({
  name,
  label,
  placeholder,
}: {
  readonly name: string;
  readonly label: string;
  readonly placeholder: string;
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  function insertSymbol(symbol: string) {
    setValue((current) => `${current}${symbol}`);
  }

  return (
    <label className="relative grid gap-1 text-xs font-medium text-workbench-muted">
      {label}
      <span className="flex min-w-0">
        <input
          name={name}
          aria-label={label}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          placeholder={placeholder}
          className="h-9 min-w-0 flex-1 rounded-l-md border border-workbench-line bg-white px-2 font-mono text-sm text-workbench-ink"
        />
        <button
          type="button"
          aria-label={`${open ? "Hide" : "Show"} IPA keyboard for ${label}`}
          onClick={() => setOpen((visible) => !visible)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-r-md border border-l-0 border-workbench-line bg-white text-workbench-muted"
        >
          <Keyboard aria-hidden="true" size={15} />
        </button>
      </span>
      {open ? (
        <div className="absolute left-0 top-[4.25rem] z-30 grid w-[min(24rem,calc(100vw-2rem))] gap-2 rounded-md border border-workbench-line bg-white p-2 shadow-lg">
          {ipaKeyboardGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1 text-[0.7rem] font-semibold uppercase text-workbench-muted">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.symbols.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => insertSymbol(symbol)}
                    className="h-8 min-w-8 rounded-md border border-workbench-line bg-workbench-panel px-2 font-mono text-sm text-workbench-ink"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </label>
  );
}

function onSelectAudio(
  sound: IpaChartSound,
  setAudioMessage: (message: string) => void,
) {
  const state = audioState(sound);
  if (!state.available || !sound.audioAssetPath) {
    setAudioMessage(`Audio unavailable for /${sound.symbol}/`);
    return;
  }

  const audio = new Audio(sound.audioAssetPath);
  void audio.play();
  setAudioMessage(`Playing /${sound.symbol}/`);
}
