import { getAllFiles, getSources } from '@/entities/ai-source';
import { AiFileRow } from '@/features/manage-ai-sources/ui/AiFileRow';

export const dynamic = 'force-dynamic';

export default async function AllSourcesPage() {
  const [sources, files] = await Promise.all([getSources(), getAllFiles()]);
  const nameById = new Map(sources.map((s) => [s.id, s.name] as const));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">AI Sources</h1>
        <p className="text-sm text-muted">
          Memory and config files across installed AI tools. Edits write directly to each tool&apos;s
          directory.
        </p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {sources.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-border bg-panel p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium text-white">{s.name}</span>
              <span className="rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] text-muted">
                {s.kind}
              </span>
            </div>
            <p className="mt-1 truncate font-mono text-[10px] text-muted">{s.path}</p>
            <p className="mt-2 text-xs text-muted">
              {s.exists ? `${s.fileCount} file${s.fileCount === 1 ? '' : 's'}` : 'not found'}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">
          All files ({files.length})
        </h2>
        {files.length === 0 ? (
          <p className="rounded-xl border border-border bg-panel p-6 text-center text-muted">
            No files found across configured sources.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {files.map((f) => (
              <AiFileRow key={f.path} file={f} showSource={nameById.get(f.sourceId) ?? f.sourceId} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
