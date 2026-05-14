# ADR 0001 — Bridge existing theme tokens to shadcn variable names

**Status:** Accepted
**Date:** 2026-05-13

## Context

The project uses Tailwind v4's `@theme` directive with custom color tokens
(`--color-bg`, `--color-panel`, `--color-accent`, `--color-border`,
`--color-muted`). When introducing shadcn/ui (new-york style), shadcn's
components reference a different set of CSS variables (`--background`,
`--foreground`, `--card`, `--primary`, `--border`, `--muted-foreground`,
`--ring`, etc.).

Two viable paths existed:

1. **Replace** the existing palette with shadcn's defaults
2. **Bridge** by declaring shadcn variables that alias the existing tokens

## Decision

Bridge. In `src/app/globals.css` we keep all `--color-*` tokens and add
shadcn-named variables that reference them, e.g.:

```css
--color-background: var(--color-bg);
--color-card:       var(--color-panel);
--color-primary:    var(--color-accent);
--color-muted-foreground: var(--color-muted);
```

## Consequences

- No visual regression — pre-existing widgets/features styled with `bg-panel`,
  `text-muted`, `border-border`, etc. continue to render identically.
- Migration of legacy code can be incremental: each migrated file can swap to
  the canonical token (`bg-card`, `text-muted-foreground`) and the value stays
  the same.
- New shadcn components work out-of-the-box without editing their source.
- Trade-off: two parallel token names exist (`--color-panel` and `--color-card`
  both resolve to the same color). The eventual cleanup target is to migrate
  all usages to the shadcn-named tokens and drop the originals, but that is
  not blocking.

## Alternatives considered

- **Replace palette**: would force a global find/replace of every legacy class
  in the same PR, vastly increasing diff size and risk of regression.
- **Dual systems in parallel**: rejected because it would grow technical debt
  without an end state.
