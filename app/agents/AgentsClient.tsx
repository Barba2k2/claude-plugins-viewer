'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useResourceFilterStore } from '@/lib/resourceStore';
import { FilterBar } from '../FilterBar';
import { ResourceToggle } from '../ResourceToggle';
import type { AgentRecord } from '@/lib/resources';

export function AgentsClient({ agents }: { agents: AgentRecord[] }) {
  const query = useResourceFilterStore((s) => s.query);
  const pluginFilter = useResourceFilterStore((s) => s.pluginFilter);
  const extraFilter = useResourceFilterStore((s) => s.extraFilter);

  const plugins = useMemo(
    () => [...new Set(agents.map((a) => a.pluginId))].sort(),
    [agents],
  );

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
        <p className="rounded-xl border border-border bg-panel p-8 text-center text-muted">
          No agents match these filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((a) => (
            <li key={a.id} className="relative">
              <div className="absolute right-3 top-3 z-10">
                <ResourceToggle kind="agent" id={a.id} enabled={a.enabled} />
              </div>
              <Link
                href={`/agents/${encodeURIComponent(a.id)}`}
                className={`group flex h-full flex-col gap-2 rounded-xl border border-border bg-panel p-4 transition hover:border-accent ${
                  a.enabled ? '' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 pr-10">
                  <h3 className="font-mono text-sm text-white group-hover:text-accent">
                    {a.name}
                  </h3>
                  <span className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
                    {a.pluginName}
                  </span>
                </div>
                <p className="line-clamp-3 text-xs text-muted">
                  {a.description || <span className="italic">no description</span>}
                </p>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-muted">
                  {a.model && (
                    <span className="rounded-full bg-bg px-2 py-0.5 font-mono">
                      model: {a.model}
                    </span>
                  )}
                  {a.color && (
                    <span className="rounded-full bg-bg px-2 py-0.5 font-mono">{a.color}</span>
                  )}
                  {a.tools && (
                    <span className="rounded-full bg-bg px-2 py-0.5 font-mono">
                      tools: {a.tools.length > 32 ? a.tools.slice(0, 32) + '…' : a.tools}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
