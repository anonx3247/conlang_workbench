import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  LexiconWorkbench,
  lexiconSubTabs,
} from "@/components/lexicon-workbench";
import { buildDemoLexiconData } from "@/lib/lexicon-demo";
import { buildDemoPhonologyData } from "@/lib/phonology-demo";

const lexicon = buildDemoLexiconData("project-1");
const phonology = buildDemoPhonologyData("project-1");

describe("LexiconWorkbench", () => {
  it("renders dictionary as a selected sub-tab view with lexeme notes and enabled demo fields", () => {
    render(
      <LexiconWorkbench
        projectId="project-1"
        data={lexicon}
        phonologyData={phonology}
        status="demo"
        message="Supabase credentials are not configured."
        activeTab="dictionary"
      />,
    );

    expect(screen.getByRole("heading", { name: "Lexicon" })).toBeInTheDocument();
    expect(lexiconSubTabs.map((tab) => tab.label)).toEqual([
      "Dictionary",
      "Swadesh",
      "Thesaurus",
      "Derivations",
    ]);
    expect(screen.getByRole("heading", { name: "Dictionary" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Swadesh" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Core root used in several reference concepts.").length).toBeGreaterThan(0);
    expect(screen.getByRole("textbox", { name: "IPA" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Lexeme" })).toBeEnabled();
  });

  it("renders derivations as a distinct view with rule notes and previews", () => {
    render(
      <LexiconWorkbench
        projectId="project-1"
        data={lexicon}
        phonologyData={phonology}
        status="demo"
        message={null}
        activeTab="derivations"
      />,
    );

    expect(screen.getByRole("heading", { name: "Derivations" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Dictionary" })).not.toBeInTheDocument();
    expect(screen.getByText("Locative noun")).toBeInTheDocument();
    expect(screen.getAllByText("paku").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/pakuta/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Derives a place associated with the noun.").length).toBeGreaterThan(0);
    expect(screen.getByRole("textbox", { name: "Rule name" })).toBeEnabled();
  });

  it("renders Swadesh and Thesaurus selected views independently", () => {
    const { rerender } = render(
      <LexiconWorkbench
        projectId="project-1"
        data={lexicon}
        phonologyData={phonology}
        status="demo"
        message={null}
        activeTab="swadesh"
      />,
    );

    expect(screen.getByRole("heading", { name: "Swadesh" })).toBeInTheDocument();
    expect(screen.getByText("3/6 covered")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Thesaurus" })).not.toBeInTheDocument();

    rerender(
      <LexiconWorkbench
        projectId="project-1"
        data={lexicon}
        phonologyData={phonology}
        status="demo"
        message={null}
        activeTab="thesaurus"
      />,
    );

    expect(screen.getByRole("heading", { name: "Thesaurus" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Swadesh" })).not.toBeInTheDocument();
    expect(
      within(screen.getByText("World & Matter").closest("div")!).getByText("river"),
    ).toBeInTheDocument();
  });
});
