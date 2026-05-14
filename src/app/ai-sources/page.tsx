import { getAllFiles, getSources } from '@/entities/ai-source';
import { SourcesSummaryGrid } from '@/features/manage-ai-sources/ui/SourcesSummaryGrid';
import { AllFilesSection } from '@/features/manage-ai-sources/ui/AllFilesSection';

export const dynamic = 'force-dynamic';

export default async function AllSourcesPage() {
  const [sources, files] = await Promise.all([getSources(), getAllFiles()]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">AI Sources</h1>
        <p className="text-sm text-muted-foreground">
          Memory and config files across installed AI tools. Edits write directly to each
          tool&apos;s directory.
        </p>
      </header>
      <SourcesSummaryGrid sources={sources} />
      <AllFilesSection files={files} sources={sources} />
    </main>
  );
}
