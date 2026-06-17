"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { getSupabasePublicEnv } from "./config";

export function createBrowserSupabaseClient(): SupabaseClient<Database> | null {
  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }

  return createBrowserClient<Database>(env.url, env.publishableKey);
}
