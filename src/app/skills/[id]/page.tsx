import { notFound } from 'next/navigation';
import { getSkillDetail } from '@/entities/resource';
import { DetailHeader } from '@/widgets/detail-header/ui/DetailHeader';
import { ToggleStatusBar } from '@/widgets/resource-detail/ui/ToggleStatusBar';
import { FrontmatterSection } from '@/widgets/resource-detail/ui/FrontmatterSection';
import { BodySection } from '@/widgets/resource-detail/ui/BodySection';
import { ResourceToggle } from '@/features/toggle-resource/ui/ResourceToggle';

export const dynamic = 'force-dynamic';

export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getSkillDetail(decodeURIComponent(id));
  if (!detail) return notFound();
  const { record, body, frontmatter } = detail;
  const otherFrontmatter = Object.entries(frontmatter).filter(
    ([k]) => k !== 'name' && k !== 'description',
  ) as [string, string][];

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

      <ToggleStatusBar
        enabled={record.enabled}
        label={record.enabled ? 'Enabled' : 'Disabled (SKILL.md.disabled)'}
        toggle={<ResourceToggle kind="skill" id={record.id} enabled={record.enabled} size="md" />}
      />

      <FrontmatterSection entries={otherFrontmatter} />
      <BodySection title="SKILL.md body" body={body} />

      <p className="mt-4 break-all font-mono text-[10px] text-muted-foreground">{record.path}</p>
    </main>
  );
}
