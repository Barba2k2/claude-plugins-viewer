import { AiFileRow } from './AiFileRow';
import { NewFileForm } from './NewFileForm';
import type { AiFile, AiSource } from '@/entities/ai-source';

type Props = { source: AiSource; files: AiFile[] };

export function SourceFileBrowser({ source, files }: Props) {
  if (!source.exists) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Directory does not exist on disk yet.
        <div className="mt-4">
          <NewFileForm sourceId={source.id} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs uppercase tracking-wide text-muted-foreground">
          Files ({files.length})
        </h2>
        <NewFileForm sourceId={source.id} />
      </div>
      {files.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
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
  );
}
