import { ProjectMemoryRow } from './ProjectMemoryRow';
import type { MemoryProject } from '@/entities/memory';

type Props = { projects: MemoryProject[] };

export function PerProjectSection({ projects }: Props) {
  return (
    <section>
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
        Per-project ({projects.length})
      </h2>
      {projects.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
          No projects with memory or CLAUDE.md found.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((p) => (
            <ProjectMemoryRow key={p.id} project={p} />
          ))}
        </ul>
      )}
    </section>
  );
}
