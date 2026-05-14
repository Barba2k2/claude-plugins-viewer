import Link from 'next/link';
import type { CommandRecord } from '@/entities/resource';
import { ResourceToggle } from '@/features/toggle-resource/ui/ResourceToggle';
import { Badge } from '@/design_system/feedback';

type Props = { command: CommandRecord };

export function CommandCard({ command: c }: Props) {
  return (
    <li className="relative">
      <div className="absolute right-3 top-3 z-10">
        <ResourceToggle kind="command" id={c.id} enabled={c.enabled} />
      </div>
      <Link
        href={`/commands/${encodeURIComponent(c.id)}`}
        className={`group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition hover:border-accent ${
          c.enabled ? '' : 'opacity-60'
        }`}
      >
        <div className="flex items-start justify-between gap-3 pr-10">
          <h3 className="font-mono text-sm text-accent">/{c.name}</h3>
          <Badge variant="outline" className="font-mono text-[10px]">
            {c.pluginName}
          </Badge>
        </div>
        <p className="line-clamp-3 text-xs text-muted-foreground">
          {c.description || <span className="italic">no description</span>}
        </p>
        {c.argumentHint && (
          <Badge variant="secondary" className="w-fit font-mono text-[10px]">
            args: {c.argumentHint}
          </Badge>
        )}
      </Link>
    </li>
  );
}
