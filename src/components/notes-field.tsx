import { FileText } from "lucide-react";

import { notePreview } from "@/lib/notes";

export function NotesField({
  id,
  name = "notes",
  label = "Notes",
  value,
  disabled = false,
  placeholder = "Add arbitrary notes",
}: {
  readonly id: string;
  readonly name?: string;
  readonly label?: string;
  readonly value?: string | null;
  readonly disabled?: boolean;
  readonly placeholder?: string;
}) {
  const preview = notePreview(value);

  return (
    <details className="group rounded-md border border-workbench-line bg-white">
      <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm">
        <FileText aria-hidden="true" size={15} className="text-workbench-accent" />
        <span className="font-medium">{label}</span>
        <span className="min-w-0 flex-1 truncate text-workbench-muted">
          {preview || "No notes"}
        </span>
      </summary>
      <div className="border-t border-workbench-line p-3">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <textarea
          id={id}
          name={name}
          defaultValue={value ?? ""}
          disabled={disabled}
          rows={4}
          maxLength={4000}
          placeholder={placeholder}
          className="block w-full resize-y rounded-md border border-workbench-line bg-workbench-panel px-3 py-2 text-sm leading-6 text-workbench-ink outline-none focus:border-workbench-accent disabled:opacity-70"
        />
      </div>
    </details>
  );
}

export function NotesPreview({
  value,
  emptyLabel = "No notes",
}: {
  readonly value?: string | null;
  readonly emptyLabel?: string;
}) {
  const preview = notePreview(value);

  if (!preview) {
    return <p className="text-xs italic text-workbench-muted">{emptyLabel}</p>;
  }

  return (
    <details className="text-sm">
      <summary className="cursor-pointer list-none truncate text-workbench-muted">
        {preview}
      </summary>
      <p className="mt-2 whitespace-pre-wrap rounded-md bg-workbench-panel p-3 leading-6 text-workbench-ink">
        {value}
      </p>
    </details>
  );
}
