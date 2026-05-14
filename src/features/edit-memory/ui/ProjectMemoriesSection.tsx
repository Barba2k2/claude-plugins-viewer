import { NewMemoryForm } from './NewMemoryForm';
import { MemoryFileRow } from './MemoryFileRow';
import type { MemoryFile } from '@/entities/memory';

type Props = { projectId: string; memories: MemoryFile[] };

export function ProjectMemoriesSection({ projectId, memories }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Auto memories ({memories.length})
        </h4>
        <NewMemoryForm
          scopeKey={`project-memory:${projectId}`}
          scope={{ kind: 'project-memory', projectId }}
          label="memory"
        />
      </div>
      {memories.length === 0 ? (
        <p className="rounded-lg border bg-background p-2 text-center text-[10px] text-muted-foreground">
          No memory files.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {memories.map((f) => (
            <MemoryFileRow key={f.path} file={f} />
          ))}
        </ul>
      )}
    </div>
  );
}
