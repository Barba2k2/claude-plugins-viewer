'use client';

import { useMemo } from 'react';
import { useResourceFilterStore } from '@/features/filter-resources/model/resourceStore';
import { FilterBar } from '@/widgets/filter-bar/ui/FilterBar';
import { HookCard } from './HookCard';
import type { HookRecord } from '@/entities/resource';

export function HooksClient({ hooks }: { hooks: HookRecord[] }) {
  const query = useResourceFilterStore((s) => s.query);
  const pluginFilter = useResourceFilterStore((s) => s.pluginFilter);
  const extraFilter = useResourceFilterStore((s) => s.extraFilter);

  const plugins = useMemo(() => [...new Set(hooks.map((h) => h.pluginId))].sort(), [hooks]);
  const events = useMemo(() => [...new Set(hooks.map((h) => h.event))].sort(), [hooks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hooks.filter((h) => {
      if (pluginFilter && h.pluginId !== pluginFilter) return false;
      if (extraFilter && h.event !== extraFilter) return false;
      if (!q) return true;
      return (
        h.event.toLowerCase().includes(q) ||
        h.command.toLowerCase().includes(q) ||
        (h.matcher?.toLowerCase().includes(q) ?? false) ||
        h.pluginName.toLowerCase().includes(q)
      );
    });
  }, [hooks, query, pluginFilter, extraFilter]);

  return (
    <>
      <FilterBar
        plugins={plugins}
        total={hooks.length}
        shown={filtered.length}
        placeholder="Search hooks (event, command, matcher)…"
        extraLabel="events"
        extraOptions={events}
      />
      {filtered.length === 0 ? (
        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          No hooks match these filters.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((h) => (
            <HookCard key={h.id} hook={h} />
          ))}
        </ul>
      )}
    </>
  );
}
