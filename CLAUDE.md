# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server on `http://localhost:3737`
- `npm run build` — production build
- `npm run start` — serve production build on port 3737
- `npm run lint` — Next.js lint

No test framework is configured; verify changes with `npm run lint` + `npm run build`, then smoke-test in the browser.

## Architecture

Next.js 15 App Router dashboard (React 19, TypeScript strict, Tailwind, Zustand) that introspects locally installed Claude Code plugins by reading the user's `~/.claude/plugins/` directory at request time. There is no database and no API layer — the filesystem _is_ the data source.

The codebase follows Feature-Sliced Design under `src/` (`entities/`, `features/`, `widgets/`, `shared/`, `app/`).

**Data flow:** Server Components in `src/app/` call readers in `src/entities/plugin/api/plugins.ts` (`getPlugins`, `getPluginById`) and `src/entities/resource/api/resources.ts` (`getAllSkills`, `getAllAgents`, `getAllCommands`, `getAllHooks`, `getAllMcps` and their `*Detail` variants). The AI-source readers live in `src/entities/ai-source/api/aiSources.ts` (`getSources`, `getSourceFiles`). These readers:

1. Parse `~/.claude/plugins/installed_plugins.json` to enumerate installed plugins.
2. For each plugin, walk its `installPath` to load `plugin.json`/`manifest.json`, README, and the per-resource directories (`skills/`, `agents/`, `commands/`, `hooks/`, `.mcp.json`).
3. Return typed `PluginRecord` / `SkillRecord` / `AgentRecord` / `CommandRecord` / `HookRecord` / `McpRecord` shapes consumed directly by Server Components.

**Caching:** The readers walk thousands of files, so they are memoized across requests by `ResourceCache` (`src/shared/lib/resourceCache.ts`) — a process-wide cache with a short TTL, keyed by tag (`plugins`, `skills`, `agents`, `commands`, `hooks`, `mcps`, `sources`). React's `cache()` only dedupes within one request; `ResourceCache` persists between navigations and server actions. Freshness is preserved by every mutation server action calling `ResourceCache.invalidate(<tag>)` (or `invalidateAll()` for install/uninstall) before `revalidatePath`. When adding a new mutation, invalidate the tags it affects.

**Routing:** Each resource type has both a list page and a detail page:

- `app/page.tsx` — plugin dashboard (uses `app/PluginGrid.tsx` client component)
- `app/plugins/[id]/page.tsx` — plugin detail
- `app/{skills,agents,commands,hooks,mcps}/page.tsx` — flat lists across all plugins
- `app/{agents,commands,hooks,mcps}/[id]/page.tsx` — resource detail pages

**Client/Server split:** Route files are Server Components by default and call the `entities/*/api` readers directly. Only files needing hooks, browser events, or Zustand opt into `'use client'`. Filter/search/sort state lives in Zustand stores under `src/features/*/model/`.

## Conventions

- TypeScript `strict`; use the `@/*` path alias for root imports.
- Two-space indent, single quotes, semicolons; named exports for reusable components; `type` aliases for object shapes.
- React components PascalCase; hooks/stores camelCase; route folders lowercase.
- Treat plugin manifests and READMEs as untrusted local data — never execute plugin files; keep filesystem access scoped to the `~/.claude/plugins/` paths already used by the readers in `lib/`.
