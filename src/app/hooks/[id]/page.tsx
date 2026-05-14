import { notFound } from 'next/navigation';
import { getHookDetail } from '@/entities/resource';
import { DetailHeader } from '@/widgets/detail-header/ui/DetailHeader';
import { ToggleStatusBar } from '@/widgets/resource-detail/ui/ToggleStatusBar';
import { StatGrid } from '@/widgets/resource-detail/ui/StatGrid';
import { StatCard } from '@/widgets/resource-detail/ui/StatCard';
import { CommandSection } from '@/widgets/resource-detail/ui/CommandSection';
import { ScriptSourceSection } from '@/widgets/resource-detail/ui/ScriptSourceSection';
import { ResourceToggle } from '@/features/toggle-resource/ui/ResourceToggle';

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

      <ToggleStatusBar
        enabled={record.enabled}
        label={record.enabled ? 'Enabled' : 'Disabled (stashed in viewer shadow)'}
        toggle={<ResourceToggle kind="hook" id={record.id} enabled={record.enabled} size="md" />}
      />

      <StatGrid cols={3}>
        <StatCard label="Event" value={record.event} />
        <StatCard label="Type" value={record.type} />
        <StatCard label="Matcher" value={record.matcher ?? '(any)'} />
      </StatGrid>

      <CommandSection command={record.command} />

      {scriptSource && <ScriptSourceSection source={scriptSource} />}
    </main>
  );
}
