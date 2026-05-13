# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)

1. **[2026-05-13] Always run `npx tsc --noEmit` after touching `lib/` or `app/`**
   Do instead: validate with `cd /Volumes/KINGSTON/Projects/claude-plugins-viewer && npx tsc --noEmit` before claiming work done. Dev server keeps running but TS errors surface only on full check.

2. **[2026-05-13] Server Components reading filesystem MUST use `export const dynamic = 'force-dynamic'`**
   Do instead: without it, Next.js pre-renders at build-time and captures a stale snapshot of `~/.claude/plugins/`. Every page that reads the filesystem needs this top-of-file export.

3. **[2026-05-13] KINGSTON drive can unmount mid-session — dev server gets stuck handles**
   Do instead: after remount, ALWAYS kill the old process first: `lsof -ti:3737 | xargs kill -9` then `npm run dev`. Trying to reuse the stale process gives `ENOENT scandir 'app'` even though files are back.

4. **[2026-05-13] Test routes with curl, not screenshots — RSC payload exposes ids**
   Do instead: `curl -s http://localhost:3737/skills | python3 -c "import sys,re; print([m.group(1) for m in re.finditer(r'\\\\\\\\\"id\\\\\\\\\":\\\\\\\\\"([^\\\\\\\\\"]+)\\\\\\\\\"',sys.stdin.read())][:5])"` reveals real resource ids without opening browser.

## Shell & Command Reliability

1. **[2026-05-13] Zsh expands `[id]` as glob — quote paths with brackets**
   Do instead: `mkdir -p "app/plugins/[id]"` (double-quoted). Unquoted `mkdir -p app/plugins/[id]` fails with `no matches found`.

2. **[2026-05-13] Long-running `npm install` / `next build` → use `run_in_background: true`**
   Do instead: cold install on this project takes ~60s, first `next build` ~30s. Run in background, await notification; don't block the foreground with sleep loops.

3. **[2026-05-13] Volume `/Volumes/KINGSTON` shell cwd vanishes when drive unmounts**
   Do instead: harness recovers cwd to `$HOME`. Re-issue commands with explicit absolute path: `cd /Volumes/KINGSTON/Projects/claude-plugins-viewer && <cmd>`.

## Next.js & React Patterns

1. **[2026-05-13] Browser extensions inject body attrs → React hydration mismatch**
   Do instead: ColorZilla writes `cz-shortcut-listen="true"`, Grammarly writes `data-gramm`. Add `suppressHydrationWarning` to `<body>` in `app/layout.tsx`. Narrow scope — only silences this element's attribute diffs, not children.

2. **[2026-05-13] Zustand selectors must return primitives, never derived arrays**
   Do instead: select stable scalars (`s.query`, `s.pluginFilter`, `s.sort`); do `.filter()`/`.sort()` inside `useMemo` in the component body. Returning `s.items.filter(...)` from the selector creates new array refs every render → infinite loop.

3. **[2026-05-13] Listing-vs-detail data split: keep list payloads small**
   Do instead: list reader returns `{id, name, description, plugin, ...}`; create separate `get*Detail(id)` that re-reads the file for body/markdown. Avoids shipping megabytes of markdown in the RSC payload for routes that only show titles.

4. **[2026-05-13] Server Component → Client Component data plumbing**
   Do instead: Server Component (`page.tsx`) fetches via `await getAll*()` and passes as prop to a `'use client'` component that uses Zustand for filter state. Don't try to call filesystem from inside a Client Component.

5. **[2026-05-13] Manual frontmatter parser is fine — no `gray-matter` needed**
   Do instead: `lib/resources.ts:parseFrontmatter` handles multiline values (continuation lines via `currentKey` buffer). Adding `gray-matter` adds 200KB+ deps for what's a 30-line regex.

## Plugin Data Format Gotchas

1. **[2026-05-13] `mcpServers` in plugin.json is either an object OR a string path**
   Do instead: type-guard with `typeof === 'object' && !Array.isArray()` before iterating. Docker plugin uses `"mcpServers": "./.mcp.json"` (indirect ref). Resolve string as `path.resolve(installPath, value)` and read that file.

2. **[2026-05-13] `Object.keys(someString)` returns numeric indexes silently**
   Do instead: never trust `Object.keys` on a `Record<string, unknown>` field without first verifying `typeof === 'object'`. JS strings are iterable and produce `["0","1",...]` — no error, just nonsense data. Was the root cause of MCP names showing as `0,1,2,...10`.

3. **[2026-05-13] Plugin manifests live at `<install>/.claude-plugin/plugin.json`**
   Do instead: NOT at `<install>/plugin.json`. The `.claude-plugin/` subdir also holds `marketplace.json`. Skills live in `<install>/skills/<name>/SKILL.md`, agents/commands as `<install>/{agents,commands}/*.md` (frontmatter `name`,`description`,`model`,`color`,`tools`).

4. **[2026-05-13] Hooks JSON path: `<install>/hooks/hooks.json` (not `hooks.json` at root)**
   Do instead: structure is `{description?, hooks: {EventName: [{matcher?, hooks: [{type, command}]}]}}`. Commands often use `${CLAUDE_PLUGIN_ROOT}/scripts/<name>.sh` — to resolve script source, regex `\$\{CLAUDE_PLUGIN_ROOT\}\/(\S+)` and read `<installPath>/<group1>`.

5. **[2026-05-13] `installed_plugins.json` lists registered plugins but cache dir may be missing**
   Do instead: stale entries appear in `~/.claude/plugins/installed_plugins.json` for plugins whose marketplace entry was deleted — the cache dir may not exist on disk. Always `safeRead` / `safeListDir` with try/catch, never assume the path resolves.

## User Directives

1. **[2026-05-13] Never use `useState` — always Zustand**
   Do instead: even local boolean state goes in a Zustand store. Selectors must be primitive (see Next.js & React Patterns #2).

2. **[2026-05-13] Commit by small modules, one-line message, no co-author**
   Do instead: conventional commits in English, scoped by feature (`feat(skills): ...`, `fix(layout): ...`). Never add `Co-Authored-By` or "Generated with" trailers.

3. **[2026-05-13] Never use `git add -A` or `git add .`**
   Do instead: add specific files by name in each commit. Even if all files are intended, list them explicitly.

4. **[2026-05-13] Only commit when explicitly asked; "continue" is not authorization**
   Do instead: words like "continue", "proceed", "go ahead" authorize WORK, not commits. Only commit on explicit "commit", "faça commits", "push", or similar.

5. **[2026-05-13] Dev server port is 3737 (not 3000) — defined in `package.json`**
   Do instead: `npm run dev` → `next dev -p 3737`. All URLs in this project use `localhost:3737`.
