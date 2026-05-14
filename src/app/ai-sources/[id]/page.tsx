import { notFound } from 'next/navigation';
import { getSourceById, getSourceFiles } from '@/entities/ai-source';
import { AiFileRow } from '@/features/manage-ai-sources/ui/AiFileRow';
import { NewFileForm } from '@/features/manage-ai-sources/ui/NewFileForm';

export const dynamic = 'force-dynamic';

type Params = { id: string };

export default async function SourcePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const source = await getSourceById(id);
  if (!source) notFound();

  const files = await getSourceFiles(id);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">{source.name}</h1>
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
            {source.kind}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
              source.exists
                ? 'border-accent/40 text-accent'
                : 'border-red-500/40 text-red-300'
            }`}
          >
            {source.exists ? 'present' : 'missing'}
          </span>
        </div>
        <p className="font-mono text-xs text-muted">{source.path}</p>
      </header>

      {!source.exists ? (
        <div className="rounded-xl border border-border bg-panel p-6 text-sm text-muted">
          Directory does not exist on disk yet. Files will appear once the tool creates them, or use
          &ldquo;New file&rdquo; to create one.
          <div className="mt-4">
            <NewFileForm sourceId={source.id} />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs uppercase tracking-wide text-muted">
              Files ({files.length})
            </h2>
            <NewFileForm sourceId={source.id} />
          </div>
          {files.length === 0 ? (
            <p className="rounded-xl border border-border bg-panel p-6 text-center text-muted">
              No .md / .json / .toml files in this source.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {files.map((f) => (
                <AiFileRow key={f.path} file={f} />
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
