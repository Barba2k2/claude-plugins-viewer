import { NewMemoryForm } from './NewMemoryForm';
import { MemoryFileRow } from './MemoryFileRow';
import type { MemoryFile } from '@/entities/memory';

type Props = { projectId: string; instruction?: MemoryFile };

export function ProjectInstructionSection({ projectId, instruction }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Project instruction
        </h4>
        {!instruction && (
          <NewMemoryForm
            scopeKey={`project-instruction:${projectId}`}
            scope={{ kind: 'project-instruction', projectId }}
            label="CLAUDE.md"
          />
        )}
      </div>
      {instruction ? (
        <ul>
          <MemoryFileRow file={instruction} />
        </ul>
      ) : (
        <p className="rounded-lg border bg-background p-2 text-center text-[10px] text-muted-foreground">
          No project CLAUDE.md.
        </p>
      )}
    </div>
  );
}
