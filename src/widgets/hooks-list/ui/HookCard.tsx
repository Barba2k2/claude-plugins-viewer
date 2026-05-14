import Link from 'next/link';
import type { HookRecord } from '@/entities/resource';
import { ResourceToggle } from '@/features/toggle-resource/ui/ResourceToggle';
import { Badge } from '@/design_system/feedback';

type Props = { hook: HookRecord };

export function HookCard({ hook: h }: Props) {
  return (
    <li className="relative">
      <div className="absolute right-3 top-3 z-10">
        <ResourceToggle kind="hook" id={h.id} enabled={h.enabled} />
      </div>
      <Link
        href={`/hooks/${encodeURIComponent(h.id)}`}
        className={`group flex flex-col gap-2 rounded-xl border bg-card p-4 transition hover:border-accent ${
          h.enabled ? '' : 'opacity-60'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 pr-10">
          <Badge className="bg-accent/10 text-accent font-mono">{h.event}</Badge>
          {h.matcher && (
            <Badge variant="outline" className="font-mono text-[11px]">
              matcher: {h.matcher}
            </Badge>
          )}
          <Badge variant="outline" className="font-mono text-[11px]">
            type: {h.type}
          </Badge>
          <Badge variant="outline" className="ml-auto font-mono text-[10px]">
            {h.pluginName}
          </Badge>
        </div>
        <code className="break-all rounded-lg bg-background p-3 font-mono text-xs text-foreground">
          {h.command}
        </code>
      </Link>
    </li>
  );
}
