import { redirect } from "next/navigation";

export default async function ProjectIndexPage({
  params,
}: {
  readonly params: Promise<{ readonly projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}/phonology`);
}
