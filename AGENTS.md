# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 15 App Router dashboard for inspecting locally installed Claude Code plugins. Route files and UI components live in `app/`: `app/page.tsx` is the main dashboard, `app/plugins/[id]/page.tsx` is the plugin detail route, and feature pages such as `app/skills/page.tsx`, `app/agents/page.tsx`, `app/commands/page.tsx`, `app/hooks/page.tsx`, and `app/mcps/page.tsx` expose resource-specific views. Shared data access and state live in `lib/`: filesystem readers are in `lib/plugins.ts` and `lib/resources.ts`, while Zustand stores are in `lib/store.ts` and `lib/resourceStore.ts`. Global styling is in `app/globals.css`; Tailwind configuration is in `tailwind.config.ts`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local dev server on `http://localhost:3737`.
- `npm run build`: create a production Next.js build.
- `npm run start`: serve the production build on port `3737`.
- `npm run lint`: run the configured Next.js lint command.

The app reads `~/.claude/plugins/installed_plugins.json` and plugin directories on each request, so local plugin state affects rendered output.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode and the `@/*` path alias for root imports. Follow the existing style: two-space indentation, single quotes, semicolons, named exports for reusable components, and `type` aliases for object shapes. Keep Server Components as the default in route files, and add `'use client'` only when using React hooks, browser events, or Zustand. Name React components in PascalCase, hooks/stores in camelCase, and route folders in lowercase URL-oriented names.

## Testing Guidelines

No test framework or test files are currently present. For now, verify changes with `npm run lint` and `npm run build`, then smoke-test `npm run dev` in a browser. If adding tests, prefer colocated `*.test.ts` or `*.test.tsx` files near the code under test and document the new test command in `package.json` and this guide.

## Commit & Pull Request Guidelines

This checkout does not expose local Git history, so no repository-specific commit convention can be inferred. Use concise imperative commits such as `Add plugin resource filters` or `Fix manifest parsing fallback`. Pull requests should include a short description, verification commands run, linked issues when applicable, and screenshots for visible UI changes.

## Security & Configuration Tips

Treat plugin manifests and README content as untrusted local data. Avoid executing plugin files from this app. Keep filesystem access scoped to the Claude plugin directories already used by `lib/plugins.ts` and `lib/resources.ts`.
