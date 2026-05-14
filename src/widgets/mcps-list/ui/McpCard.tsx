import Link from 'next/link';
import type { McpRecord } from '@/entities/resource';
import { McpToggle } from '@/features/toggle-mcp/ui/McpToggle';
import { Badge } from '@/design_system/feedback';

type Props = { mcp: McpRecord };

export function McpCard({ mcp: m }: Props) {
  return (
    <li className="relative">
      <div className="absolute right-4 top-4 z-10">
        <McpToggle name={m.name} enabled={m.enabled} />
      </div>
      <Link
        href={`/mcps/${encodeURIComponent(m.id)}`}
        className={`group flex flex-col gap-2 rounded-xl border bg-card p-4 transition hover:border-accent ${
          m.enabled ? '' : 'opacity-60'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 pr-12">
          <h3 className="font-mono text-sm text-foreground group-hover:text-accent">{m.name}</h3>
          <Badge className="bg-accent/10 text-accent font-mono text-[11px]">{m.transport}</Badge>
          <Badge variant="outline" className="font-mono text-[10px]">
            {m.pluginName}
          </Badge>
        </div>
        {m.url && (
          <div className="text-xs">
            <span className="text-muted-foreground">url: </span>
            <span className="font-mono text-foreground">{m.url}</span>
          </div>
        )}
        {m.command && (
          <code className="break-all rounded-lg bg-background p-3 font-mono text-xs text-foreground">
            {m.command}
            {m.args && m.args.length > 0 && ' ' + m.args.join(' ')}
          </code>
        )}
        {m.envKeys.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <span className="text-muted-foreground">env:</span>
            {m.envKeys.map((k) => (
              <Badge key={k} variant="secondary" className="font-mono">
                {k}
              </Badge>
            ))}
          </div>
        )}
      </Link>
    </li>
  );
}
