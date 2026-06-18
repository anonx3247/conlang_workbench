import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export type ProjectSummary = {
  readonly id: string;
  readonly ownerId: string;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/**
 * ready: Supabase is configured and the current user owns the returned data.
 * demo: Supabase credentials are absent, so the UI shows read-only samples.
 * guest: Supabase is configured, but there is no authenticated user session.
 * error: Supabase was reachable, but the query/action failed.
 */
export type ProjectDataStatus = "ready" | "demo" | "guest" | "error";

export type ProjectListResult = {
  readonly status: ProjectDataStatus;
  readonly projects: readonly ProjectSummary[];
  readonly message: string | null;
};

export type ProjectResult = {
  readonly status: ProjectDataStatus | "not-found";
  readonly project: ProjectSummary | null;
  readonly message: string | null;
};

export type ProjectDataClient = Pick<SupabaseClient<Database>, "auth" | "from">;

export const demoProjects: readonly ProjectSummary[] = [
  {
    id: "demo",
    ownerId: "demo",
    name: "Local Demo",
    description: "A browser-local workspace shown when Supabase is not configured.",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-atelier",
    ownerId: "demo",
    name: "Atelier Demo",
    description: "A browser-local sample workspace shown when Supabase is not configured.",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export function normalizeProjectName(value: FormDataEntryValue | string | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeProjectDescription(
  value: FormDataEntryValue | string | null,
) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateProjectName(value: FormDataEntryValue | string | null) {
  const name = normalizeProjectName(value);
  if (!name) {
    return { ok: false as const, message: "Project name is required." };
  }

  if (name.length > 80) {
    return {
      ok: false as const,
      message: "Project name must be 80 characters or fewer.",
    };
  }

  return { ok: true as const, name };
}

function mapProject(row: ProjectRow): ProjectSummary {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function authMessage(error: { message?: string } | null | undefined) {
  return error?.message ?? "Sign in to manage cloud projects.";
}

async function getAuthenticatedUser(client: ProjectDataClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return {
      user: null,
      message: authMessage(error),
    };
  }

  return {
    user: data.user as Pick<User, "id">,
    message: null,
  };
}

export async function listProjects(
  client: ProjectDataClient | null,
): Promise<ProjectListResult> {
  if (!client) {
    return {
      status: "demo",
      projects: demoProjects,
      message:
        "Supabase credentials are not configured. Demo projects use local browser data.",
    };
  }

  const { user, message } = await getAuthenticatedUser(client);
  if (!user) {
    return { status: "guest", projects: [], message };
  }

  const { data, error } = await client
    .from("projects")
    .select("id, owner_id, name, description, created_at, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return { status: "error", projects: [], message: error.message };
  }

  return {
    status: "ready",
    projects: (data ?? []).map((row) => mapProject(row as ProjectRow)),
    message: null,
  };
}

export async function getProjectById(
  client: ProjectDataClient | null,
  projectId: string,
): Promise<ProjectResult> {
  if (!client) {
    const demoProject =
      demoProjects.find((project) => project.id === projectId) ?? null;

    return {
      status: demoProject ? "demo" : "not-found",
      project: demoProject,
      message: demoProject
        ? "Supabase credentials are not configured. This project uses local browser data."
        : "Project not found.",
    };
  }

  const { user, message } = await getAuthenticatedUser(client);
  if (!user) {
    return { status: "guest", project: null, message };
  }

  const { data, error } = await client
    .from("projects")
    .select("id, owner_id, name, description, created_at, updated_at")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    return { status: "error", project: null, message: error.message };
  }

  if (!data) {
    return { status: "not-found", project: null, message: "Project not found." };
  }

  return {
    status: "ready",
    project: mapProject(data as ProjectRow),
    message: null,
  };
}

export async function createProject(
  client: ProjectDataClient | null,
  input: { readonly name: string; readonly description?: string | null },
): Promise<ProjectResult> {
  if (!client) {
    return {
      status: "demo",
      project: null,
      message: "Configure Supabase before creating cloud projects.",
    };
  }

  const { user, message } = await getAuthenticatedUser(client);
  if (!user) {
    return { status: "guest", project: null, message };
  }

  const { data, error } = await client
    .from("projects")
    .insert({
      owner_id: user.id,
      name: input.name,
      description: input.description ?? null,
    })
    .select("id, owner_id, name, description, created_at, updated_at")
    .single();

  if (error) {
    return { status: "error", project: null, message: error.message };
  }

  return {
    status: "ready",
    project: mapProject(data as ProjectRow),
    message: null,
  };
}

export async function updateProject(
  client: ProjectDataClient | null,
  input: {
    readonly id: string;
    readonly name: string;
    readonly description?: string | null;
  },
): Promise<ProjectResult> {
  if (!client) {
    return {
      status: "demo",
      project: null,
      message: "Demo projects cannot be edited.",
    };
  }

  const { user, message } = await getAuthenticatedUser(client);
  if (!user) {
    return { status: "guest", project: null, message };
  }

  const { data, error } = await client
    .from("projects")
    .update({
      name: input.name,
      description: input.description ?? null,
    })
    .eq("id", input.id)
    .eq("owner_id", user.id)
    .select("id, owner_id, name, description, created_at, updated_at")
    .single();

  if (error) {
    return { status: "error", project: null, message: error.message };
  }

  return {
    status: "ready",
    project: mapProject(data as ProjectRow),
    message: null,
  };
}

export async function deleteProject(
  client: ProjectDataClient | null,
  projectId: string,
): Promise<ProjectResult> {
  if (!client) {
    return {
      status: "demo",
      project: null,
      message: "Demo projects cannot be deleted.",
    };
  }

  const { user, message } = await getAuthenticatedUser(client);
  if (!user) {
    return { status: "guest", project: null, message };
  }

  const { error } = await client
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) {
    return { status: "error", project: null, message: error.message };
  }

  return { status: "ready", project: null, message: null };
}
