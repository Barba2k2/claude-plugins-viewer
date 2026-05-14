import Link from 'next/link';
import type { AgentRecord } from '@/entities/resource';
import { ResourceToggle } from '@/features/toggle-resource/ui/ResourceToggle';
import { Badge } from '@/design_system/feedback';

type Props = { agent: AgentRecord };

export function AgentCard({ agent: a }: Props) {
  return (
    <li className="relative">
      <div className="absolute right-3 top-3 z-10">
        <ResourceToggle kind="agent" id={a.id} enabled={a.enabled} />
      </div>
      <Link
        href={`/agents/${encodeURIComponent(a.id)}`}
        className={`group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition hover:border-accent ${
          a.enabled ? '' : 'opacity-60'
        }`}
      >
        <div className="flex items-start justify-between gap-3 pr-10">
          <h3 className="font-mono text-sm text-foreground group-hover:text-accent">{a.name}</h3>
          <Badge variant="outline" className="font-mono text-[10px]">
            {a.pluginName}
          </Badge>
        </div>
        <p className="line-clamp-3 text-xs text-muted-foreground">
          {a.description || <span className="italic">no description</span>}
        </p>
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          {a.model && (
            <Badge variant="secondary" className="font-mono">
              model: {a.model}
            </Badge>
          )}
          {a.color && (
            <Badge variant="secondary" className="font-mono">
              {a.color}
            </Badge>
          )}
          {a.tools && (
            <Badge variant="secondary" className="font-mono">
              tools: {a.tools.length > 32 ? a.tools.slice(0, 32) + '…' : a.tools}
            </Badge>
          )}
        </div>
      </Link>
    </li>
  );
}
