import { cookies } from "next/headers";

import { Dashboard } from "@/components/dashboard";
import { listProjects } from "@/lib/projects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Home() {
  const client = createServerSupabaseClient(await cookies());
  const result = await listProjects(client);

  return <Dashboard result={result} />;
}
