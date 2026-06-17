# Conlang Workbench

A web-native foundation for a professional constructed-language workbench.

This repository is being rebuilt as a Next.js + TypeScript application for Vercel serverless deployment with Supabase Auth/Postgres as the cloud data foundation. The current app still renders scaffolded workbench surfaces while later PRs wire real project workflows.

## Local Development

Requirements:

- Node.js 20 or newer
- npm 10 or newer

Install dependencies:

```bash
npm install
```

Configure Supabase when you want to connect a real project:

```bash
cp .env.example .env.local
```

Required public values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`SUPABASE_SECRET_KEY` is documented for future server-only maintenance jobs. It must not be imported from client components or exposed in browser bundles. Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` fallbacks are still supported for older projects and local Supabase CLI output. Tests and builds do not require real Supabase credentials.

Run against a local Supabase stack in Docker:

```bash
npm run dev:supabase
```

This uses `npx supabase start`, reads `npx supabase status -o env`, maps the local API URL and key into the app environment, then starts `next dev`. Use `npm run prod` for a production-style build and start.

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Project Structure

- `app/` - Next.js App Router routes, layout, metadata, and serverless route handlers.
- `supabase/migrations/` - Supabase Postgres schema, Auth profile hook, indexes, and RLS policies.
- `docs/rules-model.md` - Structured rule storage contract for phonology, phonotactics, and morphology.
- `src/components/` - React components for the workbench shell.
- `src/lib/` - Shared typed data, Supabase clients, database contracts, and rule validators.
- `test/` - Vitest setup and focused render/route tests.
- `public/logo.png` - Logo copied from the reference app; Flutter code and platform assets are intentionally not copied.

## Data Model Notes

Supabase Auth owns users. `profiles` links to `auth.users`, `projects` are owned by a profile, and every project-scoped table carries `project_id`. RLS policies enforce access through `projects.owner_id = auth.uid()`.

Rules are stored as structured JSON, not opaque DSL strings. Human-readable notation can be generated later for display or import/export, but the canonical database shape is typed JSON with `version` and `kind` fields.

`src/lib/database.types.ts` is bootstrapped for this foundation PR. Once a local or hosted Supabase project is linked, refresh it from the schema with:

```bash
npm run db:types
```

## Reference Notes

The reference implementation at `/Users/anas/dev/conlang` is a Flutter desktop alpha with local `.conlang` SQLite projects, platform file menus, generated GoRouter/Riverpod layers, resizable side panels, IPA audio assets, and richer feature shells. This rebuild deliberately keeps the web version simpler: no desktop menu abstraction, no copied Flutter implementation, no local file-picker state, no deep route graph before real pages exist, and no heavyweight IPA/audio data in the scaffold.

The alpha also stored morphology, phonotactics, and rewrite rules as parser-facing strings. The Supabase schema avoids that migration/parser coupling by storing typed rule bodies and treating text notation as a future boundary format only.
