export type SupabasePublicEnv = {
  readonly url: string;
  readonly anonKey: string;
};

export function getSupabasePublicEnv(
  env: NodeJS.ProcessEnv = process.env,
): SupabasePublicEnv | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}
