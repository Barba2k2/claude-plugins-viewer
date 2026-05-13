'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useResourceFilterStore } from '@/lib/resourceStore';
import { FilterBar } from '../FilterBar';
import type { SkillRecord } from '@/lib/resources';

export function SkillsClient({ skills }: { skills: SkillRecord[] }) {
  const query = useResourceFilterStore((s) => s.query);
  const pluginFilter = useResourceFilterStore((s) => s.pluginFilter);

  const plugins = useMemo(
    () => [...new Set(skills.map((s) => s.pluginId))].sort(),
    [skills],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      if (pluginFilter && s.pluginId !== pluginFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.pluginName.toLowerCase().includes(q)
      );
    });
  }, [skills, query, pluginFilter]);

  return (
    <>
      <FilterBar
        plugins={plugins}
        total={skills.length}
        shown={filtered.length}
        placeholder="Search skills…"
      />
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-panel p-8 text-center text-muted">
          No skills match these filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-mono text-sm text-white">{s.name}</h3>
                <Link
                  href={`/plugins/${encodeURIComponent(s.pluginId)}`}
                  className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted hover:text-accent"
                >
                  {s.pluginName}
                </Link>
              </div>
              <p className="line-clamp-3 text-xs text-muted">
                {s.description || <span className="italic">no description</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
