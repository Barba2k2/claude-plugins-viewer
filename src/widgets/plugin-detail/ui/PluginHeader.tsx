import Link from 'next/link';
import type { PluginRecord } from '@/entities/plugin';
import { PluginToggle } from '@/features/toggle-plugin/ui/PluginToggle';
import { Badge } from '@/design_system/feedback';

type Props = { plugin: PluginRecord };

export function PluginHeader({ plugin }: Props) {
  return (
    <header className="mb-8 flex flex-col gap-3 border-b pb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold text-foreground">{plugin.name}</h1>
        <Badge variant="outline" className="font-mono">
          v{plugin.version}
        </Badge>
        <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          {plugin.enabled ? 'Enabled' : 'Disabled'}
          <PluginToggle id={plugin.id} enabled={plugin.enabled} size="md" />
        </span>
      </div>
      {plugin.description && (
        <p className="text-base text-muted-foreground">{plugin.description}</p>
      )}
      <div className="flex flex-wrap gap-2 text-[11px]">
        <Badge variant="outline" className="font-mono">
          marketplace: {plugin.marketplace}
        </Badge>
        <Badge variant="outline" className="font-mono">
          scope: {plugin.scope}
        </Badge>
        {plugin.license && (
          <Badge variant="outline" className="font-mono">
            {plugin.license}
          </Badge>
        )}
        {plugin.author && (
          <Badge variant="outline" className="font-mono">
            by {plugin.author}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {plugin.homepage && (
          <Link
            href={plugin.homepage}
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent"
          >
            Homepage ↗
          </Link>
        )}
        {plugin.repository && (
          <Link
            href={plugin.repository}
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent"
          >
            Repository ↗
          </Link>
        )}
      </div>
    </header>
  );
}
