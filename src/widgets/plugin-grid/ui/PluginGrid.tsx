'use client';

import { useMemo } from 'react';
import { useFilterStore } from '@/features/filter-plugins/model/store';
import type { PluginRecord } from '@/entities/plugin';
import { PluginCard } from './PluginCard';
import { PluginFilterBar } from './PluginFilterBar';

type Props = {
  plugins: PluginRecord[];
};

export function PluginGrid({ plugins }: Props) {
  const query = useFilterStore((s) => s.query);
  const marketplace = useFilterStore((s) => s.marketplace);
  const sort = useFilterStore((s) => s.sort);

  const marketplaces = useMemo(() => {
    const set = new Set(plugins.map((p) => p.marketplace));
    return [...set].sort();
  }, [plugins]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = plugins.filter((p) => {
      if (marketplace && p.marketplace !== marketplace) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
    out.sort((a, b) => {
      switch (sort) {
        case 'updated':
          return b.lastUpdated.localeCompare(a.lastUpdated);
        case 'skills':
          return b.counts.skills - a.counts.skills;
        case 'agents':
          return b.counts.agents - a.counts.agents;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return out;
  }, [plugins, query, marketplace, sort]);

  return (
    <div className="flex flex-col gap-6">
      <PluginFilterBar marketplaces={marketplaces} shown={filtered.length} total={plugins.length} />

      {filtered.length === 0 ? (
        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          No plugins match these filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PluginCard key={p.id} plugin={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
