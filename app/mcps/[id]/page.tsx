import { notFound } from 'next/navigation';
import { getMcpDetail } from '@/lib/resources';
import { DetailHeader } from '../../DetailHeader';
import { McpToggle } from '../../McpToggle';

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

      <section className="mb-6 flex items-center justify-between rounded-xl border border-border bg-panel p-4">
        <div className="flex items-center gap-3 text-sm">
          <span className={record.enabled ? 'text-white' : 'text-muted'}>
            {record.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <span className="text-xs text-muted">
            {record.enabled
              ? 'MCP server is active in Claude Code'
              : 'MCP server is disabled in settings.json'}
          </span>
        </div>
        <McpToggle name={record.name} enabled={record.enabled} size="md" />
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Transport" value={record.transport} />
        <Stat label="Env vars" value={String(record.envKeys.length)} />
        <Stat label="Plugin" value={record.pluginName} />
      </section>

      {record.url && (
        <section className="mb-6 rounded-xl border border-border bg-panel p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">URL</h2>
          <code className="block break-all rounded-lg bg-bg p-3 font-mono text-xs text-white">
            {record.url}
          </code>
        </section>
      )}

      {record.command && (
        <section className="mb-6 rounded-xl border border-border bg-panel p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">Command</h2>
          <code className="block break-all rounded-lg bg-bg p-3 font-mono text-xs text-white">
            {record.command}
            {record.args && record.args.length > 0 && ' ' + record.args.join(' ')}
          </code>
          {record.args && record.args.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-muted hover:text-white">
                {record.args.length} args
              </summary>
              <ul className="mt-2 flex flex-col gap-1">
                {record.args.map((a, i) => (
                  <li key={i} className="rounded bg-bg px-2 py-1 font-mono text-[11px] text-muted">
                    [{i}] {a}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {record.envKeys.length > 0 && (
        <section className="rounded-xl border border-border bg-panel p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">
            Required env vars ({record.envKeys.length})
          </h2>
          <ul className="flex flex-wrap gap-2">
            {record.envKeys.map((k) => (
              <li
                key={k}
                className="rounded-md border border-border bg-bg px-2 py-1 font-mono text-[11px] text-white"
              >
                {k}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-mono text-xs text-white">{value}</div>
    </div>
  );
}
