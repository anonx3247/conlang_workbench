import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PhonologyWorkbench } from "@/components/phonology-workbench";
import { buildDemoPhonologyData } from "@/lib/phonology-demo";
import { phonologySubTabs } from "@/lib/phonology-tabs";

describe("PhonologyWorkbench", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders only the selected inventory sub-tab content", () => {
    render(
      <PhonologyWorkbench
        projectId="demo-atelier"
        data={buildDemoPhonologyData("demo-atelier")}
        status="demo"
        message="Supabase credentials are not configured."
        selectedTab="inventory"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Phonology" }),
    ).toBeInTheDocument();
    expect(phonologySubTabs.map((tab) => tab.label)).toEqual([
      "Inventory",
      "Natural classes",
      "Sound rules",
    ]);
    expect(screen.getByRole("heading", { name: "Inventory" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Natural classes" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Sound rules" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Reference IPA Chart")).toBeInTheDocument();
    expect(screen.getAllByText("Romanization").length).toBeGreaterThan(0);
    expect(screen.getByText("Long vowels: aa ee ii oo uu -> ā ē ī ō ū")).toBeInTheDocument();
    expect(screen.queryByText("Structured Phonotactics")).not.toBeInTheDocument();
    expect(screen.queryByText("Structured Sound Rules")).not.toBeInTheDocument();
    expect(screen.queryByText("Word Generator Preview")).not.toBeInTheDocument();
    expect(screen.getByText("Demo/local interactions")).toBeInTheDocument();
  });

  it("renders only the selected natural classes sub-tab content", () => {
    render(
      <PhonologyWorkbench
        projectId="demo-atelier"
        data={buildDemoPhonologyData("demo-atelier")}
        status="demo"
        message={null}
        selectedTab="natural-classes"
      />,
    );

    expect(screen.getByRole("heading", { name: "Natural classes" })).toBeInTheDocument();
    expect(screen.getByText("[Stop]")).toBeInTheDocument();
    expect(screen.queryByText("Reference IPA Chart")).not.toBeInTheDocument();
    expect(screen.queryByText("Structured Sound Rules")).not.toBeInTheDocument();
  });

  it("renders only the selected sound rules sub-tab content", () => {
    render(
      <PhonologyWorkbench
        projectId="demo-atelier"
        data={buildDemoPhonologyData("demo-atelier")}
        status="demo"
        message={null}
        selectedTab="sound-rules"
      />,
    );

    expect(screen.getByRole("heading", { name: "Sound rules" })).toBeInTheDocument();
    expect(screen.getByText("Structured Phonotactics")).toBeInTheDocument();
    expect(screen.getByText("Structured Sound Rules")).toBeInTheDocument();
    expect(screen.getByText("Word Generator Preview")).toBeInTheDocument();
    expect(screen.queryByText("Reference IPA Chart")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Natural classes" }),
    ).not.toBeInTheDocument();
  });

  it("keeps demo-mode controls interactive with local unsaved state", () => {
    render(
      <PhonologyWorkbench
        projectId="demo-atelier"
        data={buildDemoPhonologyData("demo-atelier")}
        status="demo"
        message="Supabase credentials are not configured."
        selectedTab="inventory"
      />,
    );

    expect(screen.getByText("Demo/local interactions")).toBeInTheDocument();
    const form = screen.getByRole("form", { name: "Add phoneme" });
    fireEvent.change(within(form).getByLabelText("Symbol"), {
      target: { value: "ɾ" },
    });
    fireEvent.submit(form);

    expect(screen.getByRole("button", { name: "/ɾ/" })).toBeInTheDocument();
    expect(screen.getAllByText("/ɾ/")).toHaveLength(2);
  });

  it("offers IPA keyboards for phoneme and romanization IPA inputs", () => {
    render(
      <PhonologyWorkbench
        projectId="demo-atelier"
        data={buildDemoPhonologyData("demo-atelier")}
        status="demo"
        message={null}
        selectedTab="inventory"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show IPA keyboard for Symbol" }));
    fireEvent.click(screen.getByRole("button", { name: "ŋ" }));
    expect(screen.getByLabelText("Symbol")).toHaveValue("ŋ");

    fireEvent.click(screen.getByRole("button", { name: "Show IPA keyboard for IPA symbol" }));
    fireEvent.click(screen.getAllByRole("button", { name: "ʃ" }).at(-1)!);
    expect(screen.getByLabelText("IPA symbol")).toHaveValue("ʃ");
  });

  it("replaces long vowels in-place inside the romanization box", () => {
    render(
      <PhonologyWorkbench
        projectId="demo-atelier"
        data={buildDemoPhonologyData("demo-atelier")}
        status="demo"
        message={null}
        selectedTab="inventory"
      />,
    );

    fireEvent.change(screen.getByLabelText("Latin mapping"), {
      target: { value: "ee" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /Long vowels/ }));
    expect(screen.getByLabelText("Latin mapping")).toHaveValue("ē");

    fireEvent.change(screen.getByLabelText("Latin mapping"), {
      target: { value: "aa" },
    });
    expect(screen.getByLabelText("Latin mapping")).toHaveValue("ā");
  });

  it("adds romanization mappings on form submit", () => {
    render(
      <PhonologyWorkbench
        projectId="demo-atelier"
        data={buildDemoPhonologyData("demo-atelier")}
        status="demo"
        message={null}
        selectedTab="inventory"
      />,
    );

    const form = screen.getByRole("form", { name: "Add romanization mapping" });
    fireEvent.change(within(form).getByLabelText("Latin mapping"), {
      target: { value: "ng" },
    });
    fireEvent.change(within(form).getByLabelText("IPA symbol"), {
      target: { value: "ŋ" },
    });
    fireEvent.submit(form);

    expect(screen.getByText("ng")).toBeInTheDocument();
    expect(screen.getByText("/ŋ/")).toBeInTheDocument();
  });

  it("uses clearer structured template and rewrite rule controls", () => {
    render(
      <PhonologyWorkbench
        projectId="demo-atelier"
        data={buildDemoPhonologyData("demo-atelier")}
        status="demo"
        message={null}
        selectedTab="sound-rules"
      />,
    );

    expect(screen.getByLabelText("Onset")).toHaveDisplayValue("optional C onset");
    expect(screen.getByLabelText("Onset value")).toHaveAttribute(
      "placeholder",
      "C, [Stop], p",
    );
    expect(screen.getByLabelText("Nucleus")).toHaveDisplayValue("required V nucleus");
    expect(
      screen.getByText(/Templates are stored as structured slots/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Pattern (phonemic)")).toBeInTheDocument();
    expect(screen.getByLabelText("Replacement (phonetic)")).toBeInTheDocument();
    expect(screen.getByLabelText("Before")).toBeInTheDocument();
    expect(screen.getByLabelText("After")).toBeInTheDocument();
    expect(
      screen.getByText(/Pattern matches phonemic input; replacement is surface phonetic/i),
    ).toBeInTheDocument();
  });

  it("highlights inventory phonemes in the IPA chart and selects chart sounds", () => {
    vi.stubGlobal(
      "Audio",
      vi.fn(function AudioMock(this: { play: () => void }) {
        this.play = vi.fn();
      }),
    );

    render(
      <PhonologyWorkbench
        projectId="demo-atelier"
        data={buildDemoPhonologyData("demo-atelier")}
        status="demo"
        message={null}
        selectedTab="inventory"
      />,
    );

    const pButton = screen.getByRole("button", {
      name: "p voiceless bilabial plosive in inventory; Play audio",
    });
    expect(pButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "u close back rounded vowel in inventory; Play audio" }));
    expect(screen.getAllByText("/u/").length).toBeGreaterThan(0);
  });

  it("plays IPA audio from chart symbol clicks and reports unavailable audio gracefully", () => {
    const play = vi.fn();
    const audio = vi.fn(function AudioMock(this: { play: typeof play }) {
      this.play = play;
    });
    vi.stubGlobal("Audio", audio);

    render(
      <PhonologyWorkbench
        projectId="demo-atelier"
        data={buildDemoPhonologyData("demo-atelier")}
        status="demo"
        message={null}
        selectedTab="inventory"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "p voiceless bilabial plosive in inventory; Play audio" }));
    expect(audio).toHaveBeenCalledWith("/ipa/p.ogg");
    expect(play).toHaveBeenCalled();
    expect(screen.getByText("Playing /p/")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "b voiced bilabial plosive in inventory; Audio unavailable" }));
    expect(screen.getByText("Audio unavailable for /b/")).toBeInTheDocument();
  });

  it("renders empty states for project data without phonology rows", () => {
    render(
      <PhonologyWorkbench
        projectId="project-1"
        status="ready"
        message={null}
        selectedTab="inventory"
        data={{
          phonemes: [],
          naturalClasses: [],
          romanizationMappings: [],
          templates: [],
          constraints: [],
          soundRules: [],
        }}
      />,
    );

    expect(screen.getByText("No romanization mappings yet.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This IPA sound is available in the reference chart but is not in the project inventory yet.",
      ),
    ).toBeInTheDocument();
  });
});
