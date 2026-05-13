import { notFound } from 'next/navigation';
import { getCommandDetail } from '@/lib/resources';
import { DetailHeader } from '../../DetailHeader';
import { ResourceToggle } from '../../ResourceToggle';

export const dynamic = 'force-dynamic';

export default async function CommandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCommandDetail(decodeURIComponent(id));
  if (!detail) return notFound();
  const { record, body, frontmatter } = detail;
  const otherFrontmatter = Object.entries(frontmatter).filter(
    ([k]) => k !== 'description' && k !== 'argument-hint',
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <DetailHeader
        backHref="/commands"
        backLabel="Back to commands"
        pluginId={record.pluginId}
        pluginName={record.pluginName}
        title={`/${record.name}`}
        badge="command"
        description={record.description}
      />

      <section className="mb-6 flex items-center justify-between rounded-xl border border-border bg-panel p-4">
        <span className={`text-sm ${record.enabled ? 'text-white' : 'text-muted'}`}>
          {record.enabled ? 'Enabled' : 'Disabled (.md.disabled)'}
        </span>
        <ResourceToggle kind="command" id={record.id} enabled={record.enabled} size="md" />
      </section>

      {record.argumentHint && (
        <section className="mb-6 rounded-xl border border-border bg-panel p-4">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-muted">Usage</h2>
          <code className="rounded bg-bg px-2 py-1 font-mono text-sm text-accent">
            /{record.name} {record.argumentHint}
          </code>
        </section>
      )}

      {otherFrontmatter.length > 0 && (
        <section className="mb-6 rounded-xl border border-border bg-panel p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">Frontmatter</h2>
          <dl className="grid grid-cols-1 gap-3 font-mono text-xs md:grid-cols-2">
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
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">Prompt body</h2>
        <pre className="max-h-[700px] overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">
          {body.trim() || <span className="italic">(empty)</span>}
        </pre>
      </section>

      <p className="mt-4 break-all font-mono text-[10px] text-muted">{record.path}</p>
    </main>
  );
}
