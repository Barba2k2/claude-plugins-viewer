'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useResourceFilterStore } from '@/lib/resourceStore';
import { FilterBar } from '../FilterBar';
import type { McpRecord } from '@/lib/resources';

export function McpsClient({ mcps }: { mcps: McpRecord[] }) {
  const query = useResourceFilterStore((s) => s.query);
  const pluginFilter = useResourceFilterStore((s) => s.pluginFilter);
  const extraFilter = useResourceFilterStore((s) => s.extraFilter);

  const plugins = useMemo(
    () => [...new Set(mcps.map((m) => m.pluginId))].sort(),
    [mcps],
  );
  const transports = useMemo(
    () => [...new Set(mcps.map((m) => m.transport))].sort(),
    [mcps],
  );

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
        <p className="rounded-xl border border-border bg-panel p-8 text-center text-muted">
          No MCP servers match these filters.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((m) => (
            <li key={m.id}>
              <Link
                href={`/mcps/${encodeURIComponent(m.id)}`}
                className="group flex flex-col gap-2 rounded-xl border border-border bg-panel p-4 transition hover:border-accent"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-mono text-sm text-white group-hover:text-accent">
                    {m.name}
                  </h3>
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[11px] text-accent">
                    {m.transport}
                  </span>
                  <span className="ml-auto rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
                    {m.pluginName}
                  </span>
                </div>
                {m.url && (
                  <div className="text-xs">
                    <span className="text-muted">url: </span>
                    <span className="font-mono text-white">{m.url}</span>
                  </div>
                )}
                {m.command && (
                  <code className="break-all rounded-lg bg-bg p-3 font-mono text-xs text-white">
                    {m.command}
                    {m.args && m.args.length > 0 && ' ' + m.args.join(' ')}
                  </code>
                )}
                {m.envKeys.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="text-muted">env:</span>
                    {m.envKeys.map((k) => (
                      <span
                        key={k}
                        className="rounded-full bg-bg px-2 py-0.5 font-mono text-muted"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
