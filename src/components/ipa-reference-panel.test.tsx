import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IpaReferencePanel } from "@/components/ipa-reference-panel";

describe("IpaReferencePanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders broad IPA symbol groups", () => {
    render(<IpaReferencePanel />);

    expect(
      screen.getByRole("region", { name: "IPA pulmonic consonant chart" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "IPA vowel chart" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "IPA Diacritics" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ɖ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ɒ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "˥" })).toBeInTheDocument();
  });

  it("plays available audio and reports unavailable symbols", () => {
    const play = vi.fn();
    const audio = vi.fn(function AudioMock(this: { play: typeof play }) {
      this.play = play;
    });
    vi.stubGlobal("Audio", audio);

    render(<IpaReferencePanel />);

    fireEvent.click(screen.getByRole("button", { name: "p" }));
    expect(audio).toHaveBeenCalledWith("/ipa/p.ogg");
    expect(play).toHaveBeenCalled();
    expect(screen.getByText("Playing /p/")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ɖ" }));
    expect(screen.getByText("Audio unavailable for /ɖ/")).toBeInTheDocument();
  });
});
