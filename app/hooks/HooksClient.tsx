'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useResourceFilterStore } from '@/lib/resourceStore';
import { FilterBar } from '../FilterBar';
import { ResourceToggle } from '../ResourceToggle';
import type { HookRecord } from '@/lib/resources';

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
        <p className="rounded-xl border border-border bg-panel p-8 text-center text-muted">
          No hooks match these filters.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((h) => (
            <li key={h.id} className="relative">
              <div className="absolute right-3 top-3 z-10">
                <ResourceToggle kind="hook" id={h.id} enabled={h.enabled} />
              </div>
              <Link
                href={`/hooks/${encodeURIComponent(h.id)}`}
                className={`group flex flex-col gap-2 rounded-xl border border-border bg-panel p-4 transition hover:border-accent ${
                  h.enabled ? '' : 'opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 pr-10">
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
                    {h.event}
                  </span>
                  {h.matcher && (
                    <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted">
                      matcher: {h.matcher}
                    </span>
                  )}
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted">
                    type: {h.type}
                  </span>
                  <span className="ml-auto rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
                    {h.pluginName}
                  </span>
                </div>
                <code className="break-all rounded-lg bg-bg p-3 font-mono text-xs text-white">
                  {h.command}
                </code>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
