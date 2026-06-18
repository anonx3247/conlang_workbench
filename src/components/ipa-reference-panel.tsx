"use client";

import { useState } from "react";

import {
  audioState,
  chartCell,
  findChartSound,
  ipaKeyboardGroups,
  referenceConsonantManners,
  referenceConsonantPlaces,
  referenceVowelBacknesses,
  referenceVowelHeights,
} from "@/lib/phonology-chart";

export function IpaReferencePanel() {
  const [message, setMessage] = useState(
    "Click any IPA symbol to preview audio when available.",
  );

  function play(symbol: string) {
    const sound = findChartSound(symbol);
    const state = audioState(sound ?? {});

    if (!state.available || !sound?.audioAssetPath) {
      setMessage(`Audio unavailable for /${symbol}/`);
      return;
    }

    const audio = new Audio(sound.audioAssetPath);
    void audio.play();
    setMessage(`Playing /${symbol}/`);
  }

  return (
    <div className="grid gap-3">
      <section aria-label="IPA pulmonic consonant chart">
        <h3 className="mb-1 text-xs font-semibold uppercase text-workbench-muted">
          Pulmonic consonants
        </h3>
        <div className="overflow-x-auto">
          <div className="grid min-w-[54rem] grid-cols-[100px_repeat(13,minmax(48px,1fr))] gap-1 text-xs">
            <div />
            {referenceConsonantPlaces.map((place) => (
              <div
                key={place}
                className="px-1 py-1 text-center text-[0.65rem] text-workbench-muted"
              >
                {place}
              </div>
            ))}
            {referenceConsonantManners.map((manner) => (
              <ReferenceChartRow
                key={manner}
                row={manner}
                columns={referenceConsonantPlaces}
                symbols={
                  ipaKeyboardGroups
                    .find((group) => group.label === "Consonants")
                    ?.symbols.filter((symbol) =>
                      referenceConsonantPlaces.some((place) =>
                        chartCell(symbol, manner, place),
                      ),
                    ) ?? []
                }
                play={play}
              />
            ))}
          </div>
        </div>
      </section>

      <section aria-label="IPA vowel chart">
        <h3 className="mb-1 text-xs font-semibold uppercase text-workbench-muted">
          Vowels
        </h3>
        <div className="overflow-x-auto">
          <div className="grid min-w-[28rem] grid-cols-[100px_repeat(5,minmax(48px,1fr))] gap-1 text-xs">
            <div />
            {referenceVowelBacknesses.map((backness) => (
              <div
                key={backness}
                className="px-1 py-1 text-center text-[0.65rem] text-workbench-muted"
              >
                {backness}
              </div>
            ))}
            {referenceVowelHeights.map((height) => (
              <ReferenceChartRow
                key={height}
                row={height}
                columns={referenceVowelBacknesses}
                symbols={
                  ipaKeyboardGroups
                    .find((group) => group.label === "Vowels")
                    ?.symbols.filter((symbol) =>
                      referenceVowelBacknesses.some((backness) =>
                        chartCell(symbol, height, backness),
                      ),
                    ) ?? []
                }
                play={play}
              />
            ))}
          </div>
        </div>
      </section>

      {ipaKeyboardGroups.filter((group) => !["Consonants", "Vowels"].includes(group.label)).map((group) => (
        <section key={group.label} aria-label={`IPA ${group.label}`}>
          <h3 className="mb-1 text-xs font-semibold uppercase text-workbench-muted">
            {group.label}
          </h3>
          <div className="flex flex-wrap gap-1">
            {group.symbols.map((symbol) => (
              <button
                key={`${group.label}-${symbol}`}
                type="button"
                onClick={() => play(symbol)}
                className="h-8 min-w-8 rounded-md border border-workbench-line bg-workbench-panel px-2 font-mono text-sm text-workbench-ink hover:bg-white"
              >
                {symbol}
              </button>
            ))}
          </div>
        </section>
      ))}
      <p role="status" className="text-xs text-workbench-muted">
        {message}
      </p>
    </div>
  );
}

function ReferenceChartRow({
  row,
  columns,
  symbols,
  play,
}: {
  readonly row: string;
  readonly columns: readonly string[];
  readonly symbols: readonly string[];
  readonly play: (symbol: string) => void;
}) {
  return (
    <>
      <div className="px-1 py-2 text-[0.65rem] font-medium text-workbench-muted">
        {row}
      </div>
      {columns.map((column) => {
        const cellSymbols = symbols.filter((symbol) => chartCell(symbol, row, column));
        return (
          <div
            key={`${row}-${column}`}
            className="min-h-9 p-1"
          >
            <div className="flex flex-wrap gap-1">
              {cellSymbols.map((symbol) => (
                <button
                  key={`${row}-${column}-${symbol}`}
                  type="button"
                  onClick={() => play(symbol)}
                  className="h-7 min-w-7 rounded-md border border-workbench-line bg-white px-1 font-mono text-sm text-workbench-ink hover:bg-workbench-panel"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
