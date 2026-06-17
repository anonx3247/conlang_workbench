# Conlang Workbench

A web-native foundation for a professional constructed-language workbench.

This repository is being rebuilt as a Next.js + TypeScript application for Vercel serverless deployment and later Supabase integration. PR 1 intentionally contains only scaffold and workbench placeholders: project dashboard, open-project surface, and top-level areas for Phonology, Grammar, Lexicon, and Glossary.

## Local Development

Requirements:

- Node.js 20 or newer
- npm 10 or newer

Install dependencies:

```bash
npm install
```

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
- `src/components/` - React components for the workbench shell.
- `src/lib/` - Shared typed data and utilities.
- `test/` - Vitest setup and focused render/route tests.
- `public/logo.png` - Logo copied from the reference app; Flutter code and platform assets are intentionally not copied.

## Planned Environment Variables

No environment variables are required for PR 1.

Later Supabase/Vercel work is expected to introduce:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` must only be used in server-side code or Vercel serverless functions.

## Reference Notes

The reference implementation at `/Users/anas/dev/conlang` is a Flutter desktop alpha with local `.conlang` SQLite projects, platform file menus, generated GoRouter/Riverpod layers, resizable side panels, IPA audio assets, and richer feature shells. This scaffold deliberately keeps the web version simpler: no desktop menu abstraction, no copied Flutter implementation, no local file-picker state, no deep route graph before real pages exist, and no heavyweight IPA/audio data in PR 1.
