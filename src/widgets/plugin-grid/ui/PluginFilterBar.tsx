'use client';

import { useFilterStore, type SortKey } from '@/features/filter-plugins/model/store';
import { Button } from '@/design_system/inputs';
import { Input } from '@/design_system/inputs';
import { Card } from '@/design_system/layout';

type Props = { marketplaces: string[]; shown: number; total: number };

export function PluginFilterBar({ marketplaces, shown, total }: Props) {
  const query = useFilterStore((s) => s.query);
  const marketplace = useFilterStore((s) => s.marketplace);
  const sort = useFilterStore((s) => s.sort);
  const setQuery = useFilterStore((s) => s.setQuery);
  const setMarketplace = useFilterStore((s) => s.setMarketplace);
  const setSort = useFilterStore((s) => s.setSort);
  const reset = useFilterStore((s) => s.reset);

  return (
    <Card className="flex-row flex-wrap items-center gap-3 py-3 px-4">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, description, or keyword…"
        className="min-w-60 flex-1"
      />
      <select
        value={marketplace ?? ''}
        onChange={(e) => setMarketplace(e.target.value || null)}
        className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option value="">All marketplaces</option>
        {marketplaces.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortKey)}
        className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option value="name">Sort: Name</option>
        <option value="updated">Sort: Last updated</option>
        <option value="skills">Sort: Most skills</option>
        <option value="agents">Sort: Most agents</option>
      </select>
      <Button type="button" variant="ghost" size="sm" onClick={reset}>
        Reset
      </Button>
      <span className="ml-auto text-xs text-muted-foreground">
        {shown} of {total}
      </span>
    </Card>
  );
}
