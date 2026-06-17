import { Plus } from "lucide-react";

import { submitCreateProjectAction } from "@/lib/project-actions";

export function ProjectCreateForm() {
  return (
    <form action={submitCreateProjectAction} className="grid gap-3">
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Project name</span>
        <input
          name="name"
          required
          maxLength={80}
          placeholder="New language"
          className="h-9 rounded-md border border-workbench-line bg-white px-3 text-sm outline-none transition focus:border-workbench-accent"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          name="description"
          rows={3}
          placeholder="Optional notes about the project"
          className="resize-none rounded-md border border-workbench-line bg-white px-3 py-2 text-sm outline-none transition focus:border-workbench-accent"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-workbench-accent px-3 text-sm font-semibold text-white"
      >
        <Plus aria-hidden="true" size={16} />
        Create project
      </button>
    </form>
  );
}
