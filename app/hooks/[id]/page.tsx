import { notFound } from 'next/navigation';
import { getHookDetail } from '@/lib/resources';
import { DetailHeader } from '../../DetailHeader';
import { ResourceToggle } from '../../ResourceToggle';

export const dynamic = 'force-dynamic';

export default async function HookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getHookDetail(decodeURIComponent(id));
  if (!detail) return notFound();
  const { record, scriptSource } = detail;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <DetailHeader
        backHref="/hooks"
        backLabel="Back to hooks"
        pluginId={record.pluginId}
        pluginName={record.pluginName}
        title={record.event}
        badge="hook"
        description={record.matcher ? `Triggered when matcher = "${record.matcher}"` : undefined}
      />

      <section className="mb-6 flex items-center justify-between rounded-xl border border-border bg-panel p-4">
        <span className={`text-sm ${record.enabled ? 'text-white' : 'text-muted'}`}>
          {record.enabled ? 'Enabled' : 'Disabled (stashed in viewer shadow)'}
        </span>
        <ResourceToggle kind="hook" id={record.id} enabled={record.enabled} size="md" />
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Event" value={record.event} />
        <Stat label="Type" value={record.type} />
        <Stat label="Matcher" value={record.matcher ?? '(any)'} />
      </section>

      <section className="mb-6 rounded-xl border border-border bg-panel p-5">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">Command</h2>
        <code className="block break-all rounded-lg bg-bg p-3 font-mono text-xs text-white">
          {record.command}
        </code>
      </section>

      {scriptSource && (
        <section className="rounded-xl border border-border bg-panel p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">
            Script source ({scriptSource.split('\n').length} lines)
          </h2>
          <pre className="max-h-[700px] overflow-auto whitespace-pre-wrap rounded-lg bg-bg p-3 font-mono text-xs text-muted">
            {scriptSource}
          </pre>
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
