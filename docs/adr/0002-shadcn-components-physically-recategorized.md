# ADR 0002 — shadcn components are physically moved into category folders

**Status:** Accepted
**Date:** 2026-05-13

## Context

shadcn CLI generates components into a single flat `aliases.ui` folder
(default: `components/ui/`). We chose to organize the design system by
**category** (`inputs/`, `layout/`, `feedback/`, `overlay/`) instead of a
flat dump.

Three options were considered:

1. **Re-export** from category barrels, files stay in `ui/`
2. **Physically move** each generated file into its category, rename to
   PascalCase, fix internal cross-imports
3. **Hand-copy** from the shadcn registry without using the CLI

## Decision

We physically move the generated files (option 2) and rename to PascalCase
to match the project rule "components are PascalCase, one per file".

Examples:

| shadcn output | Final location |
| --- | --- |
| `src/design_system/ui/button.tsx` | `src/design_system/inputs/Button.tsx` |
| `src/design_system/ui/card.tsx` | `src/design_system/layout/Card.tsx` (+ split per-subcomponent) |
| `src/design_system/ui/dialog.tsx` | `src/design_system/overlay/Dialog{,Trigger,Portal,…}.tsx` |

Multi-component files from shadcn (Card, Dialog, Tooltip) are additionally
split so each subcomponent lives in its own file, per the project's strict
"one component per file" rule.

## Consequences

- Categorized imports work cleanly: `import { Button } from '@/design_system/inputs'`.
- Subsequent `shadcn add` commands will land in a fresh `ui/` landing zone
  and must be moved manually. The `components.json` `aliases.ui` is kept
  pointing at `@/design_system/ui` solely to keep the CLI working for
  future additions.
- `shadcn add --overwrite` for an already-categorized component will NOT
  overwrite our customized files — instead it would recreate the file in
  `ui/` and we'd have to manually reconcile changes. Updates from upstream
  shadcn are therefore manual.
- We accept this in exchange for the structural clarity of category folders
  and per-file components.

## Alternatives considered

- **Re-export barrels**: less work upfront but defeats the project's
  one-component-per-file rule for multi-subcomponent shadcn files (Card,
  Dialog, Tooltip).
- **Hand-copy from registry**: gives full control but loses CLI tooling and
  forces manual tracking of shadcn versions.
