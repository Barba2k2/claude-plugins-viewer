import { notFound } from 'next/navigation';
import { getMcpDetail } from '@/entities/resource';
import { DetailHeader } from '@/widgets/detail-header/ui/DetailHeader';
import { McpToggle } from '@/features/toggle-mcp/ui/McpToggle';
import { StatGrid } from '@/widgets/resource-detail/ui/StatGrid';
import { StatCard } from '@/widgets/resource-detail/ui/StatCard';
import { UrlSection } from '@/widgets/resource-detail/ui/UrlSection';
import { CommandWithArgsSection } from '@/widgets/resource-detail/ui/CommandWithArgsSection';
import { EnvKeysSection } from '@/widgets/resource-detail/ui/EnvKeysSection';

export const dynamic = 'force-dynamic';

export default async function McpDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getMcpDetail(decodeURIComponent(id));
  if (!detail) return notFound();
  const { record } = detail;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <DetailHeader
        backHref="/mcps"
        backLabel="Back to MCP servers"
        pluginId={record.pluginId}
        pluginName={record.pluginName}
        title={record.name}
        badge={record.transport}
      />

      <section className="mb-6 flex items-center justify-between rounded-xl border bg-card p-4">
        <div className="flex items-center gap-3 text-sm">
          <span className={record.enabled ? 'text-foreground' : 'text-muted-foreground'}>
            {record.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <span className="text-xs text-muted-foreground">
            {record.enabled
              ? 'MCP server is active in Claude Code'
              : 'MCP server is disabled in settings.json'}
          </span>
        </div>
        <McpToggle name={record.name} enabled={record.enabled} size="md" />
      </section>

      <StatGrid cols={3}>
        <StatCard label="Transport" value={record.transport} />
        <StatCard label="Env vars" value={String(record.envKeys.length)} />
        <StatCard label="Plugin" value={record.pluginName} />
      </StatGrid>

      {record.url && <UrlSection url={record.url} />}
      {record.command && <CommandWithArgsSection command={record.command} args={record.args} />}

      <EnvKeysSection keys={record.envKeys} />
    </main>
  );
}
