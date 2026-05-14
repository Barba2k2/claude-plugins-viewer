import { notFound } from 'next/navigation';
import { getCommandDetail } from '@/entities/resource';
import { DetailHeader } from '@/widgets/detail-header/ui/DetailHeader';
import { ToggleStatusBar } from '@/widgets/resource-detail/ui/ToggleStatusBar';
import { UsageSection } from '@/widgets/resource-detail/ui/UsageSection';
import { FrontmatterSection } from '@/widgets/resource-detail/ui/FrontmatterSection';
import { BodySection } from '@/widgets/resource-detail/ui/BodySection';
import { ResourceToggle } from '@/features/toggle-resource/ui/ResourceToggle';

export const dynamic = 'force-dynamic';

export default async function CommandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getCommandDetail(decodeURIComponent(id));
  if (!detail) return notFound();
  const { record, body, frontmatter } = detail;
  const otherFrontmatter = Object.entries(frontmatter).filter(
    ([k]) => k !== 'description' && k !== 'argument-hint',
  ) as [string, string][];

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

      <ToggleStatusBar
        enabled={record.enabled}
        label={record.enabled ? 'Enabled' : 'Disabled (.md.disabled)'}
        toggle={<ResourceToggle kind="command" id={record.id} enabled={record.enabled} size="md" />}
      />

      {record.argumentHint && <UsageSection command={`/${record.name} ${record.argumentHint}`} />}

      <FrontmatterSection entries={otherFrontmatter} />
      <BodySection title="Prompt body" body={body} />

      <p className="mt-4 break-all font-mono text-[10px] text-muted-foreground">{record.path}</p>
    </main>
  );
}
