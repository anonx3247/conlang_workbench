import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createBrowserSupabaseClient } from "./browser";
import { getSupabasePublicEnv } from "./config";
import { createServerSupabaseClient } from "./server";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({ from: vi.fn() })),
  createServerClient: vi.fn(() => ({ auth: {} })),
}));

describe("Supabase clients", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("does not require Supabase credentials at build or test time", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    expect(getSupabasePublicEnv()).toBeNull();
    expect(createBrowserSupabaseClient()).toBeNull();
    expect(createBrowserClient).not.toHaveBeenCalled();
  });

  it("creates a typed browser client when public env exists", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_key");

    expect(createBrowserSupabaseClient()).toBeTruthy();
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "sb_publishable_key",
    );
  });

  it("supports legacy anon env as a fallback for older/local projects", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "legacy-anon-key");

    expect(createBrowserSupabaseClient()).toBeTruthy();
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "legacy-anon-key",
    );
  });

  it("creates a server client with getAll/setAll cookie adapters", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_key");

    const cookieStore = {
      getAll: vi.fn(() => [{ name: "sb", value: "token" }]),
      set: vi.fn(),
    };

    expect(createServerSupabaseClient(cookieStore)).toBeTruthy();
    expect(createServerClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "sb_publishable_key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );
  });
});
