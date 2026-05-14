import Link from 'next/link';
import type { SkillRecord } from '@/entities/resource';
import { ResourceToggle } from '@/features/toggle-resource/ui/ResourceToggle';
import { Badge } from '@/design_system/feedback';

type Props = { skill: SkillRecord };

export function SkillCard({ skill: s }: Props) {
  return (
    <li className="relative">
      <div className="absolute right-3 top-3 z-10">
        <ResourceToggle kind="skill" id={s.id} enabled={s.enabled} />
      </div>
      <Link
        href={`/skills/${encodeURIComponent(s.id)}`}
        className={`group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition hover:border-accent ${
          s.enabled ? '' : 'opacity-60'
        }`}
      >
        <div className="flex items-start justify-between gap-3 pr-10">
          <h3 className="font-mono text-sm text-foreground group-hover:text-accent">{s.name}</h3>
          <Badge variant="outline" className="font-mono text-[10px]">
            {s.pluginName}
          </Badge>
        </div>
        <p className="line-clamp-3 text-xs text-muted-foreground">
          {s.description || <span className="italic">no description</span>}
        </p>
      </Link>
    </li>
  );
}
