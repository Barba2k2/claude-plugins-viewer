import { AiFileRow } from './AiFileRow';
import type { AiFile, AiSource } from '@/entities/ai-source';

type Props = { files: AiFile[]; sources: AiSource[] };

export function AllFilesSection({ files, sources }: Props) {
  const nameById = new Map(sources.map((s) => [s.id, s.name] as const));
  return (
    <section>
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
        All files ({files.length})
      </h2>
      {files.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
          No files found across configured sources.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {files.map((f) => (
            <AiFileRow
              key={f.path}
              file={f}
              showSource={nameById.get(f.sourceId) ?? f.sourceId}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
