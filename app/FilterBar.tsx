'use client';

import { useResourceFilterStore } from '@/lib/resourceStore';

type Props = {
  plugins: string[];
  total: number;
  shown: number;
  extraLabel?: string;
  extraOptions?: string[];
  placeholder?: string;
};

export function FilterBar({
  plugins,
  total,
  shown,
  extraLabel,
  extraOptions,
  placeholder,
}: Props) {
  const query = useResourceFilterStore((s) => s.query);
  const pluginFilter = useResourceFilterStore((s) => s.pluginFilter);
  const extraFilter = useResourceFilterStore((s) => s.extraFilter);
  const setQuery = useResourceFilterStore((s) => s.setQuery);
  const setPluginFilter = useResourceFilterStore((s) => s.setPluginFilter);
  const setExtraFilter = useResourceFilterStore((s) => s.setExtraFilter);
  const reset = useResourceFilterStore((s) => s.reset);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-panel p-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder ?? 'Search name or description…'}
        className="flex-1 min-w-[240px] rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <select
        value={pluginFilter ?? ''}
        onChange={(e) => setPluginFilter(e.target.value || null)}
        className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option value="">All plugins</option>
        {plugins.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      {extraOptions && extraOptions.length > 0 && (
        <select
          value={extraFilter ?? ''}
          onChange={(e) => setExtraFilter(e.target.value || null)}
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">All {extraLabel ?? 'extras'}</option>
          {extraOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        onClick={reset}
        className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-muted hover:text-white"
      >
        Reset
      </button>
      <span className="ml-auto text-xs text-muted">
        {shown} of {total}
      </span>
    </div>
  );
}
