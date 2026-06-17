import Link from "next/link";

import { TopBar } from "@/components/top-bar";

export function AuthShell({ mode }: { readonly mode: "sign-in" | "sign-up" }) {
  const isSignIn = mode === "sign-in";

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-workbench-ink">
      <TopBar mode="auth" />
      <section className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-md place-items-center px-4 py-8">
        <div className="w-full rounded-lg border border-workbench-line bg-white p-5">
          <div className="mb-5 border-b border-workbench-line pb-4">
            <h2 className="text-xl font-semibold">
              {isSignIn ? "Sign in" : "Create account"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-workbench-muted">
              Supabase Auth will handle account sessions when credentials are
              configured. Without credentials, the dashboard stays available in
              read-only demo mode.
            </p>
          </div>

          <form className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Email</span>
              <input
                type="email"
                name="email"
                className="h-9 rounded-md border border-workbench-line px-3 outline-none transition focus:border-workbench-accent"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Password</span>
              <input
                type="password"
                name="password"
                className="h-9 rounded-md border border-workbench-line px-3 outline-none transition focus:border-workbench-accent"
              />
            </label>
            <button
              type="button"
              className="mt-1 h-9 rounded-md bg-workbench-accent px-3 text-sm font-semibold text-white"
            >
              {isSignIn ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href="/" className="font-medium text-workbench-accent">
              Continue to dashboard
            </Link>
            <Link
              href={isSignIn ? "/auth/sign-up" : "/auth/sign-in"}
              className="text-workbench-muted"
            >
              {isSignIn ? "Need an account?" : "Have an account?"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
