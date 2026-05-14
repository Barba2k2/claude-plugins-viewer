# Claude Plugins Viewer

A Next.js dashboard that reads your local Claude Code installation and exposes
plugins, skills, agents, commands, hooks, MCP servers, marketplaces, and
memory — and now also memory/config for other AI tools installed on your
machine (Gemini, Codex, Qwen, Cursor, Continue, Aider, and any custom path).

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS
- Zustand for all client state

## Run

```bash
npm install
npm run dev
# open http://localhost:3737
```

All data is read from the filesystem on every request. Installing, uninstalling,
toggling, or renaming reflects on reload — there is no database and no API
layer.

Production:

```bash
npm run build
npm run start
```

Lint is currently broken (`eslint-plugin-react` ↔ ESLint 10 version mismatch);
use `npm run build` as the validation gate.

## Features

### Claude (default active source)

- **Plugins** — list installed plugins, install/uninstall/update, per-plugin
  enable toggle (`enabledPlugins` in `~/.claude/settings.json`).
- **Skills / Agents / Commands / Hooks / MCP Servers** — flat listings across
  all plugins with filter/search via Zustand; per-resource enable/disable
  (file-rename for skills/agents/commands, shadow JSON for hooks,
  `disabledMcpjsonServers` for MCPs).
- **Marketplaces** — add, remove, update marketplaces via `claude plugin
  marketplace` CLI.
- **Memory** — edit `~/.claude/CLAUDE.md`, `~/.claude/rules/**/*.md`, and
  per-project `~/.claude/projects/<id>/CLAUDE.md` + memory files.

### AI Sources (other installed AIs)

A persistent **left sidebar** lists every AI source and selecting one
re-scopes the entire app to that source.

- **Auto-discovery** of common AI tool directories in `$HOME`:
  - `~/.claude` (always present, can't be disabled)
  - `~/.gemini` · `~/.codex` · `~/.qwen` · `~/.cursor` · `~/.continue` ·
    `~/.aider`
- **Display names**:
  - Auto sources: UPPERCASE folder name (`GEMINI`, `CODEX`, `QWEN`, …).
  - Custom sources: as typed by the user.
  - Both renameable via Settings.
- **Custom sources**: add any absolute path or `~/...` shorthand and give it
  a friendly name (optional — defaults to folder name UPPERCASED).
- **Per-source file editor**: read/write/delete/create `.md`, `.json`, `.toml`
  files, walked recursively with safety scoped to each source's root.
- **Cookie-driven active source**: clicking a source in the sidebar fires a
  server action that sets the `cpv-active-source` cookie and revalidates the
  whole layout. All top-nav tabs re-render against the new active source.
- **Behaviour for non-Claude sources**: Plugins/Skills/Agents/Commands/Hooks/
  MCPs/Marketplaces show a stub explaining the concept doesn't apply.
  **Memory** adapts to show the source's `.md`/`.json`/`.toml` files.

User-managed settings are persisted at
`~/.claude-plugins-viewer/sources.json`:

```json
{
  "customSources": [{ "id": "custom-…", "name": "…", "path": "/abs/path" }],
  "disabledDefaults": ["aider"],
  "nameOverrides": { "gemini": "Gemini CLI" }
}
```

## Architecture

The project follows **Feature-Sliced Design** adapted for Next.js App Router.
Server Components fetch from the filesystem on every request. Client
Components only handle interaction (Zustand) and server-action callbacks. No
shared API layer.

```
src/
  app/                       Next.js App Router (routes only — thin pages
                              that compose widgets/features)
    layout.tsx                root shell + Nav + Sidebar
    page.tsx                  plugins dashboard
    {skills,agents,commands,hooks,mcps,marketplaces,memory,ai-sources}/

  widgets/                   composite UI blocks rendered by routes
    nav/  sidebar/  plugin-grid/  filter-bar/  detail-header/
    non-claude-stub/
    {skills,agents,commands,hooks,mcps}-list/

  features/                  user-facing actions (UI + server action + state)
    install-plugin/  uninstall-plugin/  update-plugin/
    toggle-plugin/  toggle-mcp/  toggle-resource/
    plugin-actions/          shared install/uninstall/update server actions
    filter-plugins/  filter-resources/   Zustand filter stores
    edit-memory/             Claude memory editor (ui + api + model)
    manage-marketplaces/     add/remove/update marketplaces
    manage-ai-sources/       AI Sources file editor + source CRUD
    select-active-source/    server action that sets active-source cookie

  entities/                  pure domain readers (no UI)
    plugin/                   ~/.claude/plugins reader
    resource/                 skills/agents/commands/hooks/mcps reader
    memory/                   ~/.claude memory editor
    ai-source/                discover + file CRUD for any AI tool dir
    active-source/            cookie → resolve active AiSource

  shared/                    cross-cutting code
    lib/cli.ts                claude CLI wrapper
    lib/settings.ts           ~/.claude/settings.json read/write
    ui/Chevron.tsx            tiny visual primitives

Each slice exposes a layered structure (`api/`, `model/`, `ui/`). Pages
import from `@/widgets/*`, `@/features/*`, `@/entities/*`, `@/shared/*` —
never from sibling app/ files.
```

## Conventions

- TypeScript `strict`; `@/*` alias maps to `src/*`.
- Two-space indent, single quotes, semicolons; named exports.
- React components PascalCase; hooks/stores camelCase; route folders
  lowercase.
- **One component per file** (project rule).
- **No `useState`** — all local UI state goes through Zustand
  (`useTransition` is fine).
- Treat plugin manifests and READMEs as untrusted local data; filesystem
  access is scoped to the source's root (Claude: `~/.claude/`, others:
  the path resolved at discovery time).

## Safety notes

- Each source has its own root; `ensureWithinSource` resolves any incoming
  path against that root and rejects escape attempts.
- Only `.md`, `.json`, `.toml` files are read or written through the AI
  Sources editor.
- Writes go to a `.tmp` sibling first and are atomically renamed.
- The global `~/.claude/CLAUDE.md` cannot be deleted via the UI (only
  edited).
