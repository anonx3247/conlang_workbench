import { cookies } from "next/headers";

import { PhonologyWorkbench } from "@/components/phonology-workbench";
import { ProjectShell } from "@/components/project-shell";
import { getPhonologyData } from "@/lib/phonology-data";
import {
  getPhonologyTabById,
  getPhonologyTabByLabel,
} from "@/lib/phonology-tabs";
import { getProjectById } from "@/lib/projects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PhonologyPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ readonly projectId: string }>;
  readonly searchParams?: Promise<{ readonly tab?: string }>;
}) {
  const { projectId } = await params;
  const selectedTab = getPhonologyTabById((await searchParams)?.tab);
  const client = createServerSupabaseClient(await cookies());
  const [projectResult, phonologyResult] = await Promise.all([
    getProjectById(client, projectId),
    getPhonologyData(client, projectId),
  ]);

  return (
    <ProjectShell
      result={projectResult}
      selectedAreaSlug="phonology"
      selectedSectionName={selectedTab.label}
      sectionHref={(item) => {
        const tab = getPhonologyTabByLabel(item);
        return `/projects/${projectId}/phonology?tab=${tab.id}`;
      }}
    >
      <PhonologyWorkbench
        projectId={projectId}
        data={phonologyResult.data}
        status={phonologyResult.status}
        message={phonologyResult.message}
        selectedTab={selectedTab.id}
      />
    </ProjectShell>
  );
}
