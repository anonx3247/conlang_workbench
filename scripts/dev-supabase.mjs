import { spawn, spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.capture ? "pipe" : "inherit",
    encoding: "utf8",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result.stdout ?? "";
}

function parseEnv(output) {
  const parsed = {};

  for (const line of output.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^(?:export\s+)?([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    parsed[key] = rawValue.replace(/^["']|["']$/g, "");
  }

  return parsed;
}

run("npx", ["supabase", "start"]);

const localSupabaseEnv = parseEnv(
  run("npx", ["supabase", "status", "-o", "env"], { capture: true }),
);

const nextEnv = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    localSupabaseEnv.SUPABASE_URL ??
    localSupabaseEnv.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    localSupabaseEnv.SUPABASE_PUBLISHABLE_KEY ??
    localSupabaseEnv.SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    localSupabaseEnv.SUPABASE_ANON_KEY,
  SUPABASE_SECRET_KEY:
    process.env.SUPABASE_SECRET_KEY ??
    localSupabaseEnv.SUPABASE_SECRET_KEY ??
    localSupabaseEnv.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    localSupabaseEnv.SUPABASE_SERVICE_ROLE_KEY,
};

const next = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  env: nextEnv,
});

next.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 0);
});
