import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { getSupabasePublicEnv } from "./config";

export type SupabaseCookie = {
  readonly name: string;
  readonly value: string;
};

export type SupabaseCookieStore = {
  getAll(): SupabaseCookie[];
  set(
    name: string,
    value: string,
    options?: Record<string, unknown>,
  ): void | Promise<void>;
};

export function createServerSupabaseClient(
  cookieStore: SupabaseCookieStore,
): SupabaseClient<Database> | null {
  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          void cookieStore.set(name, value, options);
        }
      },
    },
  });
}
