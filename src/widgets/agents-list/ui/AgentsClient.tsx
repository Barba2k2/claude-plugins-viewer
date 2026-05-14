'use client';

import { useMemo } from 'react';
import { useResourceFilterStore } from '@/features/filter-resources/model/resourceStore';
import { FilterBar } from '@/widgets/filter-bar/ui/FilterBar';
import { AgentCard } from './AgentCard';
import type { AgentRecord } from '@/entities/resource';

export function AgentsClient({ agents }: { agents: AgentRecord[] }) {
  const query = useResourceFilterStore((s) => s.query);
  const pluginFilter = useResourceFilterStore((s) => s.pluginFilter);
  const extraFilter = useResourceFilterStore((s) => s.extraFilter);

  const plugins = useMemo(() => [...new Set(agents.map((a) => a.pluginId))].sort(), [agents]);

  const models = useMemo(
    () => [...new Set(agents.map((a) => a.model).filter(Boolean) as string[])].sort(),
    [agents],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter((a) => {
      if (pluginFilter && a.pluginId !== pluginFilter) return false;
      if (extraFilter && a.model !== extraFilter) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.pluginName.toLowerCase().includes(q)
      );
    });
  }, [agents, query, pluginFilter, extraFilter]);

  return (
    <>
      <FilterBar
        plugins={plugins}
        total={agents.length}
        shown={filtered.length}
        placeholder="Search agents…"
        extraLabel="models"
        extraOptions={models}
      />
      {filtered.length === 0 ? (
        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          No agents match these filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </ul>
      )}
    </>
  );
}
