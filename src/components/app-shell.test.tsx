import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the project surface and top-level workbench navigation", () => {
    render(<AppShell />);

    expect(
      screen.getByRole("heading", { name: "Conlang Workbench" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Project" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Open project surface" }),
    ).toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: "Workbench areas" });
    for (const area of ["Phonology", "Grammar", "Lexicon", "Glossary"]) {
      expect(within(nav).getByRole("link", { name: area })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: area })).toBeInTheDocument();
    }
  });

  it("keeps project actions visible without wiring storage behavior yet", () => {
    render(<AppShell />);

    expect(
      screen.getByRole("button", { name: /New project/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Open project/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("No project open")).toBeInTheDocument();
  });
});
