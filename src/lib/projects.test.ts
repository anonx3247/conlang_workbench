import { describe, expect, it, vi } from "vitest";

import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  updateProject,
  type ProjectDataClient,
} from "@/lib/projects";

const projectRow = {
  id: "project-1",
  owner_id: "user-1",
  name: "Talarin",
  description: "Test project",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
};

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

describe("project data access", () => {
  it("returns read-only demo projects when Supabase is not configured", async () => {
    await expect(listProjects(null)).resolves.toMatchObject({
      status: "demo",
      projects: [{ id: "demo-atelier" }],
    });
  });

  it("lists projects through an ownership-filtered query", async () => {
    const order = vi.fn(async () => ({ data: [projectRow], error: null }));
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    const table = { select };

    const result = await listProjects(clientWithTable(table));

    expect(select).toHaveBeenCalledWith(
      "id, owner_id, name, description, created_at, updated_at",
    );
    expect(eq).toHaveBeenCalledWith("owner_id", "user-1");
    expect(order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(result.projects[0]).toMatchObject({
      id: "project-1",
      ownerId: "user-1",
      name: "Talarin",
    });
  });

  it("loads a single project by id and owner id", async () => {
    const maybeSingle = vi.fn(async () => ({ data: projectRow, error: null }));
    const eqOwner = vi.fn(() => ({ maybeSingle }));
    const eqId = vi.fn(() => ({ eq: eqOwner }));
    const select = vi.fn(() => ({ eq: eqId }));

    await getProjectById(clientWithTable({ select }), "project-1");

    expect(eqId).toHaveBeenCalledWith("id", "project-1");
    expect(eqOwner).toHaveBeenCalledWith("owner_id", "user-1");
  });

  it("creates projects with the authenticated owner id", async () => {
    const single = vi.fn(async () => ({ data: projectRow, error: null }));
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));

    await createProject(clientWithTable({ insert }), {
      name: "Talarin",
      description: null,
    });

    expect(insert).toHaveBeenCalledWith({
      owner_id: "user-1",
      name: "Talarin",
      description: null,
    });
  });

  it("updates projects through id and owner filters", async () => {
    const single = vi.fn(async () => ({ data: projectRow, error: null }));
    const select = vi.fn(() => ({ single }));
    const eqOwner = vi.fn(() => ({ select }));
    const eqId = vi.fn(() => ({ eq: eqOwner }));
    const update = vi.fn(() => ({ eq: eqId }));

    await updateProject(clientWithTable({ update }), {
      id: "project-1",
      name: "Renamed",
      description: "Updated",
    });

    expect(update).toHaveBeenCalledWith({
      name: "Renamed",
      description: "Updated",
    });
    expect(eqId).toHaveBeenCalledWith("id", "project-1");
    expect(eqOwner).toHaveBeenCalledWith("owner_id", "user-1");
  });

  it("deletes projects through id and owner filters", async () => {
    const eqOwner = vi.fn(async () => ({ error: null }));
    const eqId = vi.fn(() => ({ eq: eqOwner }));
    const deleteQuery = vi.fn(() => ({ eq: eqId }));

    await deleteProject(clientWithTable({ delete: deleteQuery }), "project-1");

    expect(eqId).toHaveBeenCalledWith("id", "project-1");
    expect(eqOwner).toHaveBeenCalledWith("owner_id", "user-1");
  });
});
