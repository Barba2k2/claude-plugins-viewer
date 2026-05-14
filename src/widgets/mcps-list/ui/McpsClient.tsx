'use client';

import { useMemo } from 'react';
import { useResourceFilterStore } from '@/features/filter-resources/model/resourceStore';
import { FilterBar } from '@/widgets/filter-bar/ui/FilterBar';
import { McpCard } from './McpCard';
import type { McpRecord } from '@/entities/resource';

export function McpsClient({ mcps }: { mcps: McpRecord[] }) {
  const query = useResourceFilterStore((s) => s.query);
  const pluginFilter = useResourceFilterStore((s) => s.pluginFilter);
  const extraFilter = useResourceFilterStore((s) => s.extraFilter);

  const plugins = useMemo(() => [...new Set(mcps.map((m) => m.pluginId))].sort(), [mcps]);
  const transports = useMemo(() => [...new Set(mcps.map((m) => m.transport))].sort(), [mcps]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mcps.filter((m) => {
      if (pluginFilter && m.pluginId !== pluginFilter) return false;
      if (extraFilter && m.transport !== extraFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        (m.command?.toLowerCase().includes(q) ?? false) ||
        (m.url?.toLowerCase().includes(q) ?? false) ||
        m.pluginName.toLowerCase().includes(q)
      );
    });
  }, [mcps, query, pluginFilter, extraFilter]);

  return (
    <>
      <FilterBar
        plugins={plugins}
        total={mcps.length}
        shown={filtered.length}
        placeholder="Search MCP servers (name, command, url)…"
        extraLabel="transports"
        extraOptions={transports}
      />
      {filtered.length === 0 ? (
        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          No MCP servers match these filters.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((m) => (
            <McpCard key={m.id} mcp={m} />
          ))}
        </ul>
      )}
    </>
  );
}
