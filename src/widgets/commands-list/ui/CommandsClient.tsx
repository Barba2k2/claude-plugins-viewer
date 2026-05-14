'use client';

import { useMemo } from 'react';
import { useResourceFilterStore } from '@/features/filter-resources/model/resourceStore';
import { FilterBar } from '@/widgets/filter-bar/ui/FilterBar';
import { CommandCard } from './CommandCard';
import type { CommandRecord } from '@/entities/resource';

export function CommandsClient({ commands }: { commands: CommandRecord[] }) {
  const query = useResourceFilterStore((s) => s.query);
  const pluginFilter = useResourceFilterStore((s) => s.pluginFilter);

  const plugins = useMemo(() => [...new Set(commands.map((c) => c.pluginId))].sort(), [commands]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return commands.filter((c) => {
      if (pluginFilter && c.pluginId !== pluginFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.pluginName.toLowerCase().includes(q)
      );
    });
  }, [commands, query, pluginFilter]);

  return (
    <>
      <FilterBar
        plugins={plugins}
        total={commands.length}
        shown={filtered.length}
        placeholder="Search commands…"
      />
      {filtered.length === 0 ? (
        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          No commands match these filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((c) => (
            <CommandCard key={c.id} command={c} />
          ))}
        </ul>
      )}
    </>
  );
}
