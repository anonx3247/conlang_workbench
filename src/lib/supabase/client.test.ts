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
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(getSupabasePublicEnv()).toBeNull();
    expect(createBrowserSupabaseClient()).toBeNull();
    expect(createBrowserClient).not.toHaveBeenCalled();
  });

  it("creates a typed browser client when public env exists", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    expect(createBrowserSupabaseClient()).toBeTruthy();
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
    );
  });

  it("creates a server client with getAll/setAll cookie adapters", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    const cookieStore = {
      getAll: vi.fn(() => [{ name: "sb", value: "token" }]),
      set: vi.fn(),
    };

    expect(createServerSupabaseClient(cookieStore)).toBeTruthy();
    expect(createServerClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );
  });
});
