import { cookies } from "next/headers";

import { ProjectShell } from "@/components/project-shell";
import { WorkbenchPlaceholder } from "@/components/workbench-placeholder";
import { getProjectById } from "@/lib/projects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function ProjectWorkbenchPage({
  projectId,
  section,
}: {
  readonly projectId: string;
  readonly section: string;
}) {
  const client = createServerSupabaseClient(await cookies());
  const result = await getProjectById(client, projectId);

  return (
    <ProjectShell result={result} selectedAreaSlug={section}>
      <WorkbenchPlaceholder section={section} />
    </ProjectShell>
  );
}
