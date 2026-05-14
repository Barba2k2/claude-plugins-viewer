import { notFound } from 'next/navigation';
import { getAgentDetail } from '@/entities/resource';
import { DetailHeader } from '@/widgets/detail-header/ui/DetailHeader';
import { ToggleStatusBar } from '@/widgets/resource-detail/ui/ToggleStatusBar';
import { FrontmatterSection } from '@/widgets/resource-detail/ui/FrontmatterSection';
import { BodySection } from '@/widgets/resource-detail/ui/BodySection';
import { StatGrid } from '@/widgets/resource-detail/ui/StatGrid';
import { StatCard } from '@/widgets/resource-detail/ui/StatCard';
import { ResourceToggle } from '@/features/toggle-resource/ui/ResourceToggle';

export const dynamic = 'force-dynamic';

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAgentDetail(decodeURIComponent(id));
  if (!detail) return notFound();
  const { record, body, frontmatter } = detail;
  const otherFrontmatter = Object.entries(frontmatter).filter(
    ([k]) => k !== 'name' && k !== 'description',
  ) as [string, string][];

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

      <ToggleStatusBar
        enabled={record.enabled}
        label={record.enabled ? 'Enabled' : 'Disabled (.md.disabled)'}
        toggle={<ResourceToggle kind="agent" id={record.id} enabled={record.enabled} size="md" />}
      />

      <StatGrid>
        {record.model && <StatCard label="Model" value={record.model} />}
        {record.color && <StatCard label="Color" value={record.color} />}
        {record.tools && <StatCard label="Tools" value={record.tools} truncate />}
        <StatCard label="Plugin" value={record.pluginName} />
      </StatGrid>

      <FrontmatterSection title="All frontmatter" entries={otherFrontmatter} />
      <BodySection title="System prompt" body={body} />

      <p className="mt-4 break-all font-mono text-[10px] text-muted-foreground">{record.path}</p>
    </main>
  );
}
