import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createProject,
  deleteProject,
  normalizeProjectDescription,
  updateProject,
  validateProjectName,
  type ProjectDataClient,
} from "@/lib/projects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ProjectActionState = {
  readonly ok: boolean;
  readonly message: string | null;
};

export async function createProjectWithClient(
  client: ProjectDataClient | null,
  formData: FormData,
): Promise<ProjectActionState & { readonly projectId?: string }> {
  const validation = validateProjectName(formData.get("name"));
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const result = await createProject(client, {
    name: validation.name,
    description: normalizeProjectDescription(formData.get("description")),
  });

  if (result.status !== "ready" || !result.project) {
    return { ok: false, message: result.message ?? "Project was not created." };
  }

  return { ok: true, message: null, projectId: result.project.id };
}

export async function createProjectAction(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const client = createServerSupabaseClient(cookieStore);
  const result = await createProjectWithClient(client, formData);

  if (!result.ok || !result.projectId) {
    return result;
  }

  revalidatePath("/");
  redirect(`/projects/${result.projectId}`);
}

export async function submitCreateProjectAction(formData: FormData) {
  "use server";

  await createProjectAction(formData);
}

export async function updateProjectWithClient(
  client: ProjectDataClient | null,
  formData: FormData,
): Promise<ProjectActionState> {
  const projectId = formData.get("projectId");
  if (typeof projectId !== "string" || !projectId.trim()) {
    return { ok: false, message: "Project id is required." };
  }

  const validation = validateProjectName(formData.get("name"));
  if (!validation.ok) {
    return { ok: false, message: validation.message };
  }

  const result = await updateProject(client, {
    id: projectId,
    name: validation.name,
    description: normalizeProjectDescription(formData.get("description")),
  });

  if (result.status !== "ready") {
    return { ok: false, message: result.message ?? "Project was not updated." };
  }

  return { ok: true, message: "Project updated." };
}

export async function updateProjectAction(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const client = createServerSupabaseClient(cookieStore);
  const result = await updateProjectWithClient(client, formData);

  if (result.ok) {
    revalidatePath("/");
    revalidatePath(`/projects/${formData.get("projectId")}`);
  }

  return result;
}

export async function submitUpdateProjectAction(formData: FormData) {
  "use server";

  await updateProjectAction(formData);
}

export async function deleteProjectWithClient(
  client: ProjectDataClient | null,
  formData: FormData,
): Promise<ProjectActionState> {
  const projectId = formData.get("projectId");
  if (typeof projectId !== "string" || !projectId.trim()) {
    return { ok: false, message: "Project id is required." };
  }

  const result = await deleteProject(client, projectId);
  if (result.status !== "ready") {
    return { ok: false, message: result.message ?? "Project was not deleted." };
  }

  return { ok: true, message: "Project deleted." };
}

export async function deleteProjectAction(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const client = createServerSupabaseClient(cookieStore);
  const result = await deleteProjectWithClient(client, formData);

  if (!result.ok) {
    return result;
  }

  revalidatePath("/");
  redirect("/");
}

export async function submitDeleteProjectAction(formData: FormData) {
  "use server";

  await deleteProjectAction(formData);
}
