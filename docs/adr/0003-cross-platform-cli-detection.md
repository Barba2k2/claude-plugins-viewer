# Cross-platform CLI detection with WSL fallback and per-tool config

The app drives Claude (and other AI) CLIs via `execFile`, which fails on Windows because Node's `execFile` does not resolve `.cmd`/`.exe`/`.ps1` and `claude` may be installed only inside WSL. We resolve binaries explicitly per platform: search candidate names via `where`/`which`, validate with `<tool> --version`, and on Windows transparently fall back to `wsl <tool> ...` when the native binary is missing. Detection is cached at the module level (rescannable from settings), per-tool overrides and a `preferWsl` flag are persisted alongside the existing AI-sources config, and missing binaries surface a sticky banner that names the specific AI (since a user may have Codex but not Claude).

## Considered options

- **`shell: true` on Windows** — simplest, but reopens injection surface and obscures which interpreter ran. Rejected.
- **`cross-spawn` npm dep** — solves `.cmd` resolution but doesn't handle the WSL case and adds a runtime dep for a one-file problem. Rejected.
- **Require user to run the app inside WSL when Claude is in WSL** — pushes setup burden onto the user and breaks the "auto-install, no manual steps" UX goal. Rejected.

## Consequences

- `src/shared/lib/cli.ts` no longer hardcodes the literal `'claude'` arg to `execFile`; all CLI invocations route through the platform resolver.
- `aiSourcesConfig` schema gains `cliOverrides` and `preferWsl` — existing config files without those fields must default cleanly.
- Plugin install/uninstall/update buttons become gated on Claude CLI presence; banner + disabled state replace the previous silent failure.
