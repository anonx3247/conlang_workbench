import { ProjectWorkbenchPage } from "@/components/project-workbench-page";

export default async function PhonologyPage({
  params,
}: {
  readonly params: Promise<{ readonly projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectWorkbenchPage projectId={projectId} section="phonology" />;
}
