export const notePreviewLength = 120;
export const noteMaxLength = 4000;

export function normalizeNote(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateNote(value: FormDataEntryValue | string | null | undefined) {
  const note = normalizeNote(value);
  if (note && note.length > noteMaxLength) {
    return {
      ok: false as const,
      message: `Notes must be ${noteMaxLength} characters or fewer.`,
    };
  }

  return { ok: true as const, note };
}

export function notePreview(value: string | null | undefined, limit = notePreviewLength) {
  const note = normalizeNote(value ?? null);
  if (!note) {
    return "";
  }

  if (note.length <= limit) {
    return note;
  }

  return `${note.slice(0, Math.max(0, limit - 1)).trimEnd()}...`;
}
