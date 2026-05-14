import { notFound } from 'next/navigation';
import { getSkillDetail } from '@/entities/resource';
import { DetailHeader } from '@/widgets/detail-header/ui/DetailHeader';
import { ResourceToggle } from '@/features/toggle-resource/ui/ResourceToggle';

export const dynamic = 'force-dynamic';

export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getSkillDetail(decodeURIComponent(id));
  if (!detail) return notFound();
  const { record, body, frontmatter } = detail;
  const otherFrontmatter = Object.entries(frontmatter).filter(
    ([k]) => k !== 'name' && k !== 'description',
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <DetailHeader
        backHref="/skills"
        backLabel="Back to skills"
        pluginId={record.pluginId}
        pluginName={record.pluginName}
        title={record.name}
        badge="skill"
        description={record.description}
      />

      <section className="mb-6 flex items-center justify-between rounded-xl border border-border bg-panel p-4">
        <span className={`text-sm ${record.enabled ? 'text-white' : 'text-muted'}`}>
          {record.enabled ? 'Enabled' : 'Disabled (SKILL.md.disabled)'}
        </span>
        <ResourceToggle kind="skill" id={record.id} enabled={record.enabled} size="md" />
      </section>

      {otherFrontmatter.length > 0 && (
        <section className="mb-6 rounded-xl border border-border bg-panel p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">Frontmatter</h2>
          <dl className="grid grid-cols-1 gap-3 font-mono text-xs md:grid-cols-2">
            {otherFrontmatter.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] uppercase tracking-wide text-muted">{k}</dt>
                <dd className="wrap-break-word text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="rounded-xl border border-border bg-panel p-5">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">SKILL.md body</h2>
        <pre className="max-h-175 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">
          {body.trim() || <span className="italic">(empty)</span>}
        </pre>
      </section>

      <p className="mt-4 break-all font-mono text-[10px] text-muted">{record.path}</p>
    </main>
  );
}
