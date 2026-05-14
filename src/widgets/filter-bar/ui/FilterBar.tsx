'use client';

import { useResourceFilterStore } from '@/features/filter-resources/model/resourceStore';
import { Button } from '@/design_system/inputs';
import { Input } from '@/design_system/inputs';
import { Card } from '@/design_system/layout';

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
    <Card className="mb-6 flex-row flex-wrap items-center gap-3 py-3 px-4">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder ?? 'Search name or description…'}
        className="min-w-60 flex-1"
      />
      <select
        value={pluginFilter ?? ''}
        onChange={(e) => setPluginFilter(e.target.value || null)}
        className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
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
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">All {extraLabel ?? 'extras'}</option>
          {extraOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
      <Button type="button" variant="ghost" size="sm" onClick={reset}>
        Reset
      </Button>
      <span className="ml-auto text-xs text-muted-foreground">
        {shown} of {total}
      </span>
    </Card>
  );
}
