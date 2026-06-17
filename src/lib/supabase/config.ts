export type SupabasePublicEnv = {
  readonly url: string;
  readonly publishableKey: string;
};

function firstPresent(...values: Array<string | undefined>): string | null {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return null;
}

export function getSupabasePublicEnv(
  env: NodeJS.ProcessEnv = process.env,
): SupabasePublicEnv | null {
  const url = firstPresent(env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = firstPresent(
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function getSupabaseSecretKey(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  return firstPresent(
    env.SUPABASE_SECRET_KEY,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
