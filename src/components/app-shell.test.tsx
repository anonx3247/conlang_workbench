import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthShell } from "@/components/auth-shell";
import { Dashboard } from "@/components/dashboard";
import { ProjectShell } from "@/components/project-shell";
import { WorkbenchPlaceholder } from "@/components/workbench-placeholder";
import { demoProjects } from "@/lib/projects";

describe("project workflow routes", () => {
  it("renders the dashboard launcher with demo projects", () => {
    render(
      <Dashboard
        result={{
          status: "demo",
          projects: demoProjects,
          message:
            "Supabase credentials are not configured. Demo projects are read-only.",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Conlang Workbench" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Project dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Atelier Demo")).toBeInTheDocument();
    expect(screen.getByText("Demo mode")).toBeInTheDocument();

    for (const area of ["Phonology", "Grammar", "Lexicon"]) {
      expect(screen.getByRole("heading", { name: area })).toBeInTheDocument();
    }
    expect(
      screen.queryByRole("heading", { name: "Glossary" }),
    ).not.toBeInTheDocument();
  });

  it("renders auth shell without requiring Supabase credentials", () => {
    render(<AuthShell mode="sign-in" />);

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Continue to dashboard" }),
    ).toHaveAttribute("href", "/");
  });

  it("keeps project editing on the dashboard behind a gear action", () => {
    render(
      <Dashboard
        result={{
          status: "ready",
          projects: [
            {
              id: "project-1",
              ownerId: "user-1",
              name: "Test Language",
              description: "Workbench notes",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-02T00:00:00.000Z",
            },
          ],
          message: null,
        }}
      />,
    );

    const editButton = screen.getByLabelText("Edit Test Language");
    const editDetails = editButton.closest("details");

    expect(editDetails).not.toHaveAttribute("open");
    fireEvent.click(editButton);
    expect(editDetails).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Save details" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete project" })).toBeInTheDocument();
  });

  it("renders project shell placeholders with semantic project routes", () => {
    render(
      <ProjectShell
        selectedAreaSlug="phonology"
        result={{
          status: "ready",
          project: {
            id: "project-1",
            ownerId: "user-1",
            name: "Test Language",
            description: "Workbench notes",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z",
          },
          message: null,
        }}
      >
        <WorkbenchPlaceholder section="phonology" />
      </ProjectShell>,
    );

    const areaNav = screen.getByRole("navigation", { name: "Project areas" });
    expect(
      within(areaNav).getByRole("link", { name: "Phonology" }),
    ).toHaveAttribute(
      "href",
      "/projects/project-1/phonology",
    );
    expect(within(areaNav).getByRole("link", { name: "Grammar" })).toHaveAttribute(
      "href",
      "/projects/project-1/grammar",
    );
    expect(
      within(areaNav).queryByRole("link", { name: "Glossary" }),
    ).not.toBeInTheDocument();

    const sectionNav = screen.getByRole("navigation", { name: "Project sections" });
    expect(
      within(sectionNav).getByRole("link", { name: "Inventory" }),
    ).toHaveAttribute("href", "/projects/project-1/phonology");
    expect(
      within(sectionNav).getByRole("link", { name: "Natural classes" }),
    ).toHaveAttribute("href", "/projects/project-1/phonology");
    expect(
      within(sectionNav).getByRole("link", { name: "Sound rules" }),
    ).toHaveAttribute("href", "/projects/project-1/phonology");
    expect(
      within(sectionNav).queryByRole("link", { name: "Grammar" }),
    ).not.toBeInTheDocument();

    expect(screen.queryByText("Current project")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save details" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete project" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Phonology" })).toBeInTheDocument();
    expect(screen.getAllByText("Inventory")).toHaveLength(2);
    expect(screen.getByLabelText("Open glossary")).toHaveClass("h-9", "w-9");
    expect(
      screen.getByRole("complementary", { name: "Glossary drawer" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Reference IPA chart")).not.toBeInTheDocument();
  });

  it("renders a clear unavailable state for unauthenticated project routes", () => {
    render(
      <ProjectShell
        selectedAreaSlug="phonology"
        result={{
          status: "guest",
          project: null,
          message: "Sign in to manage cloud projects.",
        }}
      >
        <WorkbenchPlaceholder section="phonology" />
      </ProjectShell>,
    );

    expect(
      screen.getByRole("heading", { name: "Project unavailable" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to dashboard" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
