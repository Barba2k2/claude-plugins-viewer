'use client';

import { useMemo } from 'react';
import { useResourceFilterStore } from '@/features/filter-resources/model/resourceStore';
import { FilterBar } from '@/widgets/filter-bar/ui/FilterBar';
import { SkillCard } from './SkillCard';
import type { SkillRecord } from '@/entities/resource';

export function SkillsClient({ skills }: { skills: SkillRecord[] }) {
  const query = useResourceFilterStore((s) => s.query);
  const pluginFilter = useResourceFilterStore((s) => s.pluginFilter);

  const plugins = useMemo(() => [...new Set(skills.map((s) => s.pluginId))].sort(), [skills]);

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
        <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          No skills match these filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </ul>
      )}
    </>
  );
}
