import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NotesField, NotesPreview } from "@/components/notes-field";

describe("notes UI", () => {
  it("renders collapsed note preview and editable textarea", () => {
    render(
      <NotesField
        id="pronoun-notes"
        value="Marks passive voice in inclusive first person contexts."
      />,
    );

    expect(screen.getAllByText("Notes")).toHaveLength(2);
    expect(
      screen.getAllByText("Marks passive voice in inclusive first person contexts."),
    ).toHaveLength(2);
    expect(screen.getByLabelText("Notes")).toHaveValue(
      "Marks passive voice in inclusive first person contexts.",
    );
  });

  it("renders an empty note state", () => {
    render(<NotesPreview value={null} emptyLabel="No rule notes" />);

    expect(screen.getByText("No rule notes")).toBeInTheDocument();
  });
});
