# Cross-platform CLI detection — implementation plan

Backing decision: [ADR-0003](../adr/0003-cross-platform-cli-detection.md).

## Goal

Make the app work on Windows / Linux / macOS without manual user setup, detect the host OS + default shell + arch for display, locate each known AI CLI binary (with WSL fallback on Windows), and surface a per-AI banner when a required CLI is missing.

## Non-goals

- Showing shell-specific snippets to copy. Auto-install only; user never sees a command.
- Detecting every installed shell. We detect the default shell of the current process only.
- Cross-platform tests (no test framework configured in the repo).

## Scope of detection

### Platform info (display)
- OS: `process.platform` → `win32 | darwin | linux`.
- WSL: on Linux, check `/proc/version` for `microsoft`.
- Shell: `process.env.SHELL` (`*nix`) or `process.env.COMSPEC` / detect PowerShell via `PSModulePath` (Windows).
- Arch: `process.arch`.

### Per-tool CLI status
Extend `KNOWN_TOOLS` in `src/entities/ai-source/api/aiSources.ts` with optional CLI metadata:

```ts
type KnownTool = {
  id: string;
  dir: string;
  defaultName: string;
  cli?: { binaries: string[]; versionArgs: string[] };
};
```

Tools that ship a CLI: `claude`, `codex`, `gemini`, `qwen`, `aider`.
Tools without a CLI (`cursor`, `continue`) are detected via the existing `.dir` presence check only; UI shows "no CLI".

### Resolution algorithm
1. For each candidate binary name, run `where <name>` (Windows) or `which <name>` (POSIX).
2. For each hit, run `<path> <versionArgs>` with a 5s timeout. Accept if exit 0 and stdout contains a version-looking string.
3. On Windows, if step 1 finds nothing AND `wsl --status` succeeds AND `wsl which <name>` returns a path, mark the tool as `useWsl: true` with binary `wsl` and the original name as the first arg.
4. Honor `cliOverrides[toolId].path` first when present.
5. Honor `preferWsl: true` to invert the Windows priority (WSL first, native second).

## Files

### New
- `src/shared/lib/platform.ts`
  - `getPlatformInfo()` → `{ os, isWsl, shell, arch }`. Module-cached.
  - `getCliStatus(toolId)` → `{ found, path, version, useWsl, error? }`. Module-cached, keyed by toolId.
  - `rescanCli()` → clears CLI cache.
  - `runCliTool(toolId, args, opts?)` → wraps `execFile`, prefixes `wsl <bin>` when `useWsl`.

### Modified
- `src/shared/lib/cli.ts` — replace direct `execFile('claude', ...)` with `runCliTool('claude', ...)`. All four claude calls + the four marketplace calls.
- `src/entities/ai-source/api/aiSources.ts` — add `cli` field to `KNOWN_TOOLS` definitions.
- `src/entities/ai-source/api/aiSourcesConfig.ts` — extend schema with `cliOverrides: Record<string, { path: string; useWsl?: boolean }>` and `preferWsl: boolean`. Default to `{}` / `false` when absent.
- `src/widgets/sidebar/*` — add platform badge in the footer (e.g. `macOS · zsh · arm64`). Server Component reads `getPlatformInfo()`.
- `src/app/layout.tsx` (or topmost server layout) — render a `<CliMissingBanner />` server component that pulls `getCliStatus('claude')` (and any other tool with an attempted action). Sticky top, red, dismiss-disabled until resolved.
- `src/features/install-plugin`, `update-plugin`, `uninstall-plugin`, `manage-marketplaces` — disable trigger buttons when `getCliStatus('claude').found === false`, tooltip "Configure Claude CLI first".
- `src/app/ai-sources/settings/page.tsx` — add "CLI Detection" section: list each `KNOWN_TOOLS` entry with status, "Configure path" modal, "Rescan", and `preferWsl` toggle.

## Server actions (new)
- `setCliOverride(toolId, path)` — validates by running `<path> <versionArgs>` (5s). Writes to config. Calls `rescanCli()`.
- `clearCliOverride(toolId)` — removes override, rescans.
- `setPreferWsl(value)` — writes flag, rescans.
- `rescanCliAction()` — clears cache.

## UI copy (English)

- Badge: `{prettyOs} · {shell} · {arch}` (e.g. `Windows · pwsh · x64`).
- Banner: `{ToolName} CLI not found.  [Configure path]`.
- Disabled-button tooltip: `Install {ToolName} or configure its path in AI Sources settings.`
- Settings row: `Found at /usr/local/bin/claude (v1.2.3)` / `Not found  [Configure path]  [Rescan]`.

## Implementation phases

1. **Detection core** — write `platform.ts` with `getPlatformInfo` + `getCliStatus` + tests-by-hand on macOS. Extend `KNOWN_TOOLS`. No UI yet.
2. **Wire `cli.ts`** — replace `execFile` calls with `runCliTool`. Smoke-test plugin install on macOS still works.
3. **Sidebar badge** — render platform info in sidebar footer.
4. **Settings page CLI section** — list tools, status, configure path, rescan, preferWsl. Persist via `aiSourcesConfig`.
5. **Banner + button gating** — sticky banner, disabled actions when claude missing.
6. **WSL path** — guard with `process.platform === 'win32'`, implement `wsl --status` + `wsl which` probes. Untestable on macOS; verify on a Windows host or VM.
7. **Verify** — `npm run lint` + `npm run build`. Manual smoke on macOS. Windows verification deferred to whoever has access to the machine.

## Risks

- **`where` / `which` differences** — `where` on Windows can return multiple lines (one per match); take first.
- **PowerShell vs cmd PATH** — Node inherits `process.env.PATH` from the launching shell. If user starts the dev server from a shell without claude in PATH, detection fails even though claude is installed. The "Configure path" fallback covers this.
- **WSL probe latency** — `wsl --status` cold-starts the VM. Run once, cache aggressively, accept the first-run delay.
- **Existing config files** — users with an `aiSourcesConfig.json` from the old schema must keep working. Default missing fields on read.
