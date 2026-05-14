import Link from 'next/link';
import type { PluginRecord } from '@/entities/plugin';
import { PluginToggle } from '@/features/toggle-plugin/ui/PluginToggle';
import { Badge } from '@/design_system/feedback';

type Props = { plugin: PluginRecord };

export function PluginCard({ plugin: p }: Props) {
  return (
    <li className="relative">
      <div className="absolute right-4 top-4 z-10">
        <PluginToggle id={p.id} enabled={p.enabled} />
      </div>
      <Link
        href={`/plugins/${encodeURIComponent(p.id)}`}
        className={`group flex h-full flex-col gap-3 rounded-xl border bg-card p-5 transition hover:border-accent ${
          p.enabled ? '' : 'opacity-60'
        }`}
      >
        <div className="flex items-start justify-between gap-3 pr-12">
          <h3 className="text-base font-medium text-foreground group-hover:text-accent">
            {p.name}
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground">v{p.version}</span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {p.description || <span className="italic">no description</span>}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <Badge variant="outline" className="font-mono">
            {p.marketplace}
          </Badge>
          {p.counts.skills > 0 && (
            <Badge variant="secondary" className="font-mono">
              {p.counts.skills} skills
            </Badge>
          )}
          {p.counts.agents > 0 && (
            <Badge variant="secondary" className="font-mono">
              {p.counts.agents} agents
            </Badge>
          )}
          {p.counts.commands > 0 && (
            <Badge variant="secondary" className="font-mono">
              {p.counts.commands} cmds
            </Badge>
          )}
          {p.counts.hooks > 0 && (
            <Badge variant="secondary" className="font-mono">
              {p.counts.hooks} hooks
            </Badge>
          )}
          {p.counts.mcps > 0 && (
            <Badge variant="secondary" className="font-mono">
              {p.counts.mcps} mcp
            </Badge>
          )}
        </div>
      </Link>
    </li>
  );
}
