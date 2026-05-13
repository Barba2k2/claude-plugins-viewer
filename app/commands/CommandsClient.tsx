'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useResourceFilterStore } from '@/lib/resourceStore';
import { FilterBar } from '../FilterBar';
import { ResourceToggle } from '../ResourceToggle';
import type { CommandRecord } from '@/lib/resources';

export function CommandsClient({ commands }: { commands: CommandRecord[] }) {
  const query = useResourceFilterStore((s) => s.query);
  const pluginFilter = useResourceFilterStore((s) => s.pluginFilter);

  const plugins = useMemo(
    () => [...new Set(commands.map((c) => c.pluginId))].sort(),
    [commands],
  );

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
        <p className="rounded-xl border border-border bg-panel p-8 text-center text-muted">
          No commands match these filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((c) => (
            <li key={c.id} className="relative">
              <div className="absolute right-3 top-3 z-10">
                <ResourceToggle kind="command" id={c.id} enabled={c.enabled} />
              </div>
              <Link
                href={`/commands/${encodeURIComponent(c.id)}`}
                className={`group flex h-full flex-col gap-2 rounded-xl border border-border bg-panel p-4 transition hover:border-accent ${
                  c.enabled ? '' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 pr-10">
                  <h3 className="font-mono text-sm text-accent">/{c.name}</h3>
                  <span className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
                    {c.pluginName}
                  </span>
                </div>
                <p className="line-clamp-3 text-xs text-muted">
                  {c.description || <span className="italic">no description</span>}
                </p>
                {c.argumentHint && (
                  <span className="w-fit rounded-full bg-bg px-2 py-0.5 font-mono text-[10px] text-muted">
                    args: {c.argumentHint}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
