'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useFilterStore, type SortKey } from '@/lib/store';
import type { PluginRecord } from '@/lib/plugins';
import { PluginToggle } from './PluginToggle';

type Props = {
  plugins: PluginRecord[];
};

export function PluginGrid({ plugins }: Props) {
  const query = useFilterStore((s) => s.query);
  const marketplace = useFilterStore((s) => s.marketplace);
  const sort = useFilterStore((s) => s.sort);
  const setQuery = useFilterStore((s) => s.setQuery);
  const setMarketplace = useFilterStore((s) => s.setMarketplace);
  const setSort = useFilterStore((s) => s.setSort);
  const reset = useFilterStore((s) => s.reset);

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
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-panel p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, description, or keyword…"
          className="min-w-[240px] flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <select
          value={marketplace ?? ''}
          onChange={(e) => setMarketplace(e.target.value || null)}
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
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
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="name">Sort: Name</option>
          <option value="updated">Sort: Last updated</option>
          <option value="skills">Sort: Most skills</option>
          <option value="agents">Sort: Most agents</option>
        </select>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-muted hover:text-white"
        >
          Reset
        </button>
        <span className="ml-auto text-xs text-muted">
          {filtered.length} of {plugins.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-panel p-8 text-center text-muted">
          No plugins match these filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id} className="relative">
              <div className="absolute right-4 top-4 z-10">
                <PluginToggle id={p.id} enabled={p.enabled} />
              </div>
              <Link
                href={`/plugins/${encodeURIComponent(p.id)}`}
                className={`group flex h-full flex-col gap-3 rounded-xl border border-border bg-panel p-5 transition hover:border-accent ${
                  p.enabled ? '' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 pr-12">
                  <h3 className="text-base font-medium text-white group-hover:text-accent">
                    {p.name}
                  </h3>
                  <span className="font-mono text-[10px] text-muted">v{p.version}</span>
                </div>
                <p className="line-clamp-2 text-sm text-muted">
                  {p.description || <span className="italic">no description</span>}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2 text-[11px] text-muted">
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono">
                    {p.marketplace}
                  </span>
                  {p.counts.skills > 0 && <Pill label="skills" value={p.counts.skills} />}
                  {p.counts.agents > 0 && <Pill label="agents" value={p.counts.agents} />}
                  {p.counts.commands > 0 && <Pill label="cmds" value={p.counts.commands} />}
                  {p.counts.hooks > 0 && <Pill label="hooks" value={p.counts.hooks} />}
                  {p.counts.mcps > 0 && <Pill label="mcp" value={p.counts.mcps} />}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Pill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full bg-bg px-2 py-0.5 font-mono">
      {value} {label}
    </span>
  );
}
