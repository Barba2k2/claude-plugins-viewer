import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPluginById, readPluginReadme } from '@/entities/plugin';
import { getCliStatus } from '@/entities/ai-source';
import { UninstallPlugin } from '@/features/uninstall-plugin/ui/UninstallPlugin';
import { UpdatePlugin } from '@/features/update-plugin/ui/UpdatePlugin';
import { PluginHeader } from '@/widgets/plugin-detail/ui/PluginHeader';
import { PluginCountsGrid } from '@/widgets/plugin-detail/ui/PluginCountsGrid';
import { PluginResourcesGrid } from '@/widgets/plugin-detail/ui/PluginResourcesGrid';
import { InstallInfoSection } from '@/widgets/plugin-detail/ui/InstallInfoSection';
import { ReadmeSection } from '@/widgets/plugin-detail/ui/ReadmeSection';

export const dynamic = 'force-dynamic';

type Params = { id: string };

export default async function PluginDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const plugin = await getPluginById(decoded);
  if (!plugin) return notFound();

  const [readme, claudeCli] = await Promise.all([
    plugin.hasReadme ? readPluginReadme(plugin.installPath) : Promise.resolve(null),
    getCliStatus('claude'),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
      >
        ← Back to all plugins
      </Link>

      <PluginHeader plugin={plugin} />

      <section className="mb-8 flex flex-wrap justify-end gap-3">
        <UpdatePlugin id={plugin.id} cliReady={claudeCli.found} />
        <UninstallPlugin id={plugin.id} name={plugin.name} cliReady={claudeCli.found} />
      </section>

      <PluginCountsGrid counts={plugin.counts} />
      <PluginResourcesGrid resources={plugin.resources} keywords={plugin.keywords} />
      <InstallInfoSection plugin={plugin} />
      {readme && <ReadmeSection readme={readme} />}
    </main>
  );
}
