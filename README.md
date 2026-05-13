# Claude Plugins Viewer

A small Next.js dashboard that reads `~/.claude/plugins/installed_plugins.json`
and the corresponding plugin manifests, showing every Claude Code plugin you
have installed — with skills, agents, commands, hooks, and MCP servers
exposed per plugin.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS
- Zustand (filter/search/sort state)

## Run

```bash
npm install
npm run dev
# open http://localhost:3737
```

The app reads from `~/.claude/plugins/` on every request, so installing or
uninstalling plugins is reflected on reload.

## Project layout

```
app/
  layout.tsx              shell + Tailwind
  page.tsx                dashboard (Server Component, lists plugins)
  PluginGrid.tsx          Client Component, filters via Zustand store
  plugins/[id]/page.tsx   plugin detail (skills, agents, README, etc.)
lib/
  plugins.ts              filesystem reader (returns PluginRecord[])
  store.ts                Zustand store for filter/search/sort
```
