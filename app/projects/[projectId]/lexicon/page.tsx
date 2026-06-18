import { cookies } from "next/headers";

import { LexiconWorkbench } from "@/components/lexicon-workbench";
import { ProjectShell } from "@/components/project-shell";
import { getLexiconData } from "@/lib/lexicon-data";
import { parseLexiconTab } from "@/lib/lexicon-tabs";
import { getPhonologyData } from "@/lib/phonology-data";
import { getProjectById } from "@/lib/projects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function LexiconPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ readonly projectId: string }>;
  readonly searchParams: Promise<{
    readonly tab?: string;
    readonly q?: string;
    readonly pos?: string;
  }>;
}) {
  const { projectId } = await params;
  const { tab, q, pos } = await searchParams;
  const activeTab = parseLexiconTab(tab);
  const client = createServerSupabaseClient(await cookies());
  const [projectResult, lexiconResult, phonologyResult] = await Promise.all([
    getProjectById(client, projectId),
    getLexiconData(client, projectId),
    getPhonologyData(client, projectId),
  ]);

  return (
    <ProjectShell result={projectResult} selectedAreaSlug="lexicon">
      <LexiconWorkbench
        projectId={projectId}
        data={lexiconResult.data}
        phonologyData={phonologyResult.data}
        status={lexiconResult.status}
        message={lexiconResult.message}
        activeTab={activeTab}
        searchQuery={q ?? ""}
        partOfSpeechId={pos ?? ""}
      />
    </ProjectShell>
  );
}
