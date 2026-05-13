# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server on `http://localhost:3737`
- `npm run build` — production build
- `npm run start` — serve production build on port 3737
- `npm run lint` — Next.js lint

No test framework is configured; verify changes with `npm run lint` + `npm run build`, then smoke-test in the browser.

## Architecture

Next.js 15 App Router dashboard (React 19, TypeScript strict, Tailwind, Zustand) that introspects locally installed Claude Code plugins by reading the user's `~/.claude/plugins/` directory at request time. There is no database and no API layer — the filesystem *is* the data source.

**Data flow:** Server Components in `app/` call readers in `lib/plugins.ts` (`getPlugins`, `getPluginById`) and `lib/resources.ts` (`getSkills`, `getAgents`, `getCommands`, `getHooks`, `getMcps` and their `*ById` variants). These readers:
1. Parse `~/.claude/plugins/installed_plugins.json` to enumerate installed plugins.
2. For each plugin, walk its `installPath` to load `plugin.json`/`manifest.json`, README, and the per-resource directories (`skills/`, `agents/`, `commands/`, `hooks/`, `.mcp.json`).
3. Return typed `PluginRecord` / `SkillRecord` / `AgentRecord` / `CommandRecord` / `HookRecord` / `McpRecord` shapes consumed directly by Server Components.

Because reads happen per request, installing/uninstalling a plugin is reflected on page reload — do not cache plugin data across requests.

**Routing:** Each resource type has both a list page and a detail page:
- `app/page.tsx` — plugin dashboard (uses `app/PluginGrid.tsx` client component)
- `app/plugins/[id]/page.tsx` — plugin detail
- `app/{skills,agents,commands,hooks,mcps}/page.tsx` — flat lists across all plugins
- `app/{agents,commands,hooks,mcps}/[id]/page.tsx` — resource detail pages

**Client/Server split:** Route files are Server Components by default and call the `lib/` readers directly. Only files needing hooks, browser events, or Zustand opt into `'use client'` (e.g. `PluginGrid.tsx`, `FilterBar.tsx`, `Nav.tsx`). Filter/search/sort state lives in `lib/store.ts` (plugins) and `lib/resourceStore.ts` (other resources).

## Conventions

- TypeScript `strict`; use the `@/*` path alias for root imports.
- Two-space indent, single quotes, semicolons; named exports for reusable components; `type` aliases for object shapes.
- React components PascalCase; hooks/stores camelCase; route folders lowercase.
- Treat plugin manifests and READMEs as untrusted local data — never execute plugin files; keep filesystem access scoped to the `~/.claude/plugins/` paths already used by the readers in `lib/`.
