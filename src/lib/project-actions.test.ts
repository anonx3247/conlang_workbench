import { describe, expect, it, vi } from "vitest";

import {
  createProjectWithClient,
  deleteProjectWithClient,
  updateProjectWithClient,
} from "@/lib/project-actions";
import type { ProjectDataClient } from "@/lib/projects";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const projectRow = {
  id: "project-1",
  owner_id: "user-1",
  name: "Talarin",
  description: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
};

function form(entries: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

function clientWithTable(table: unknown): ProjectDataClient {
  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "user-1" } },
        error: null,
      })),
    },
    from: vi.fn(() => table),
  } as unknown as ProjectDataClient;
}

describe("project actions", () => {
  it("trims project names before creating", async () => {
    const single = vi.fn(async () => ({ data: projectRow, error: null }));
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));

    const result = await createProjectWithClient(
      clientWithTable({ insert }),
      form({ name: "  Talarin  ", description: "  " }),
    );

    expect(result).toEqual({ ok: true, message: null, projectId: "project-1" });
    expect(insert).toHaveBeenCalledWith({
      owner_id: "user-1",
      name: "Talarin",
      description: null,
    });
  });

  it("rejects empty project names before hitting Supabase", async () => {
    const insert = vi.fn();

    const result = await createProjectWithClient(
      clientWithTable({ insert }),
      form({ name: "   " }),
    );

    expect(result).toEqual({
      ok: false,
      message: "Project name is required.",
    });
    expect(insert).not.toHaveBeenCalled();
  });

  it("validates update project id and name", async () => {
    await expect(
      updateProjectWithClient(null, form({ name: "Renamed" })),
    ).resolves.toEqual({
      ok: false,
      message: "Project id is required.",
    });

    await expect(
      updateProjectWithClient(null, form({ projectId: "project-1", name: "" })),
    ).resolves.toEqual({
      ok: false,
      message: "Project name is required.",
    });
  });

  it("uses ownership-safe update query shape", async () => {
    const single = vi.fn(async () => ({ data: projectRow, error: null }));
    const select = vi.fn(() => ({ single }));
    const eqOwner = vi.fn(() => ({ select }));
    const eqId = vi.fn(() => ({ eq: eqOwner }));
    const update = vi.fn(() => ({ eq: eqId }));

    const result = await updateProjectWithClient(
      clientWithTable({ update }),
      form({
        projectId: "project-1",
        name: "Renamed",
        description: "Updated",
      }),
    );

    expect(result).toEqual({ ok: true, message: "Project updated." });
    expect(eqId).toHaveBeenCalledWith("id", "project-1");
    expect(eqOwner).toHaveBeenCalledWith("owner_id", "user-1");
  });

  it("uses ownership-safe delete query shape", async () => {
    const eqOwner = vi.fn(async () => ({ error: null }));
    const eqId = vi.fn(() => ({ eq: eqOwner }));
    const deleteQuery = vi.fn(() => ({ eq: eqId }));

    const result = await deleteProjectWithClient(
      clientWithTable({ delete: deleteQuery }),
      form({ projectId: "project-1" }),
    );

    expect(result).toEqual({ ok: true, message: "Project deleted." });
    expect(eqId).toHaveBeenCalledWith("id", "project-1");
    expect(eqOwner).toHaveBeenCalledWith("owner_id", "user-1");
  });
});
