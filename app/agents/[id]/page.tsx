import { notFound } from 'next/navigation';
import { getAgentDetail } from '@/lib/resources';
import { DetailHeader } from '../../DetailHeader';
import { ResourceToggle } from '../../ResourceToggle';

export const dynamic = 'force-dynamic';

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getAgentDetail(decodeURIComponent(id));
  if (!detail) return notFound();
  const { record, body, frontmatter } = detail;
  const otherFrontmatter = Object.entries(frontmatter).filter(
    ([k]) => k !== 'name' && k !== 'description',
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <DetailHeader
        backHref="/agents"
        backLabel="Back to agents"
        pluginId={record.pluginId}
        pluginName={record.pluginName}
        title={record.name}
        badge="agent"
        description={record.description}
      />

      <section className="mb-6 flex items-center justify-between rounded-xl border border-border bg-panel p-4">
        <span className={`text-sm ${record.enabled ? 'text-white' : 'text-muted'}`}>
          {record.enabled ? 'Enabled' : 'Disabled (.md.disabled)'}
        </span>
        <ResourceToggle kind="agent" id={record.id} enabled={record.enabled} size="md" />
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {record.model && <Stat label="Model" value={record.model} />}
        {record.color && <Stat label="Color" value={record.color} />}
        {record.tools && <Stat label="Tools" value={record.tools} truncate />}
        <Stat label="Plugin" value={record.pluginName} />
      </section>

      {otherFrontmatter.length > 0 && (
        <section className="mb-6 rounded-xl border border-border bg-panel p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">All frontmatter</h2>
          <dl className="grid grid-cols-1 gap-3 font-mono text-xs">
            {otherFrontmatter.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] uppercase tracking-wide text-muted">{k}</dt>
                <dd className="break-words text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="rounded-xl border border-border bg-panel p-5">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">System prompt</h2>
        <pre className="max-h-[700px] overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">
          {body.trim() || <span className="italic">(empty)</span>}
        </pre>
      </section>

      <p className="mt-4 break-all font-mono text-[10px] text-muted">{record.path}</p>
    </main>
  );
}

function Stat({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 font-mono text-xs text-white ${truncate ? 'truncate' : ''}`}>{value}</div>
    </div>
  );
}
