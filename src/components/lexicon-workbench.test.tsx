import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  LexiconWorkbench,
} from "@/components/lexicon-workbench";
import { buildDemoLexiconData } from "@/lib/lexicon-demo";
import { lexiconSubTabs } from "@/lib/lexicon-tabs";
import { buildDemoPhonologyData } from "@/lib/phonology-demo";
import type { Lexeme, LexiconData } from "@/lib/lexicon";

const phonology = buildDemoPhonologyData("project-1");

beforeEach(() => {
  const storage = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    },
  });
});

function renderWorkbench(data: LexiconData = buildDemoLexiconData("project-1")) {
  return render(
    <LexiconWorkbench
      projectId="project-1"
      data={data}
      phonologyData={phonology}
      status="demo"
      message="Supabase credentials are not configured."
      activeTab="dictionary"
    />,
  );
}

function fillLexemeForm({
  ipa,
  romanization,
  meaning,
  notes,
}: {
  readonly ipa: string;
  readonly romanization: string;
  readonly meaning: string;
  readonly notes: string;
}) {
  fireEvent.change(screen.getByLabelText("IPA"), { target: { value: ipa } });
  fireEvent.change(screen.getByLabelText("Romanization"), {
    target: { value: romanization },
  });
  fireEvent.change(screen.getByLabelText("Meaning"), { target: { value: meaning } });
  fireEvent.change(screen.getByLabelText("Notes"), { target: { value: notes } });
}

describe("LexiconWorkbench", () => {
  it("renders selected sub-tab controls and a non-clipping dictionary layout", () => {
    renderWorkbench();

    expect(screen.getByRole("heading", { name: "Lexicon" })).toBeInTheDocument();
    expect(lexiconSubTabs.map((tab) => tab.label)).toEqual([
      "Dictionary",
      "Swadesh",
      "Thesaurus",
      "Derivations",
    ]);
    expect(screen.getByRole("heading", { name: "Dictionary" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Swadesh" })).not.toBeInTheDocument();
    expect(screen.getByTestId("dictionary-layout")).toHaveClass("min-w-0");
    expect(screen.getByRole("button", { name: "Lexeme" })).toBeEnabled();
  });

  it("creates lexemes locally, searches them, and persists them in localStorage", async () => {
    const { unmount } = renderWorkbench();

    fillLexemeForm({
      ipa: "kala",
      romanization: "kala",
      meaning: "river",
      notes: "Used for large moving water.",
    });
    fireEvent.click(screen.getByRole("button", { name: "Create lexeme" }));

    await waitFor(() => expect(screen.getAllByText("kala").length).toBeGreaterThan(0));
    expect(screen.getAllByText("river").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Used for large moving water.").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "river" } });
    expect(screen.getAllByText("kala").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "zzz" } });
    expect(screen.getByText("No lexemes match the current filters.")).toBeInTheDocument();

    await waitFor(() =>
      expect(
        window.localStorage.getItem("conlang-workbench:project-1:lexicon:v1"),
      ).toContain("kala"),
    );

    unmount();
    renderWorkbench();
    await waitFor(() => expect(screen.getAllByText("kala").length).toBeGreaterThan(0));
  });

  it("edits lexeme fields and notes locally", async () => {
    const data = withLexemes([
      {
        id: "lexeme-1",
        projectId: "project-1",
        ipa: "paku",
        romanization: "paku",
        meaning: "water",
        partOfSpeechId: "demo-pos-noun",
        isPhonologicalException: false,
        derivedFromLexemeId: null,
        derivedViaRuleId: null,
        rootOnlyViaDerivations: false,
        notes: "Original note.",
      },
    ]);
    renderWorkbench(data);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("IPA"), { target: { value: "pakun" } });
    fireEvent.change(screen.getByLabelText("Meaning"), { target: { value: "spring" } });
    fireEvent.change(screen.getByLabelText("Notes"), {
      target: { value: "Edited local note." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save lexeme" }));

    await waitFor(() => expect(screen.getAllByText("pakun").length).toBeGreaterThan(0));
    expect(screen.getAllByText("spring").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Edited local note.").length).toBeGreaterThan(0);
  });

  it("switches tabs and can start lexeme creation from reference concept views", async () => {
    renderWorkbench();

    fireEvent.click(screen.getByRole("button", { name: "Swadesh" }));
    expect(screen.getByRole("heading", { name: "Swadesh" })).toBeInTheDocument();
    expect(screen.getByText("0/207 covered")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Add" })[0]);
    expect(screen.getByRole("heading", { name: "Dictionary" })).toBeInTheDocument();
    expect(screen.getByLabelText("Meaning")).toHaveValue("I");

    fireEvent.click(screen.getByRole("button", { name: "Thesaurus" }));
    expect(screen.getByRole("heading", { name: "Thesaurus" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search concepts"), {
      target: { value: "river" },
    });
    expect(screen.getByText("Water Features")).toBeInTheDocument();
  });

  it("renders derivations as a distinct selected view", () => {
    renderWorkbench();

    fireEvent.click(screen.getByRole("button", { name: "Derivations" }));
    expect(screen.getByRole("heading", { name: "Derivations" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Dictionary" })).not.toBeInTheDocument();
    expect(screen.getByText(/No derivational rules yet/)).toBeInTheDocument();
  });
});

function withLexemes(lexemes: readonly Lexeme[]): LexiconData {
  return {
    ...buildDemoLexiconData("project-1"),
    lexemes,
  };
}
