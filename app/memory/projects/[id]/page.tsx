import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectMemories, getProjects } from '@/lib/memory';
import { MemoryFileRow } from '../../MemoryFileRow';
import { NewMemoryForm } from '../../NewMemoryForm';

export const dynamic = 'force-dynamic';

export default async function ProjectMemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  const projects = await getProjects();
  const project = projects.find((p) => p.id === id);
  if (!project) return notFound();

  const files = await getProjectMemories(id);
  const instruction = files.find((f) => f.scope === 'project-instruction');
  const memories = files.filter((f) => f.scope === 'project-memory');

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/memory"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-white"
      >
        ← Back to memory
      </Link>

      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-white">Project memory</h1>
        <p className="break-all font-mono text-xs text-muted">{project.displayPath}</p>
      </header>

      <section className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wide text-muted">Project instruction</h2>
          {!instruction && (
            <NewMemoryForm
              scopeKey={`project-instruction:${id}`}
              scope={{ kind: 'project-instruction', projectId: id }}
              label="CLAUDE.md"
            />
          )}
        </div>
        {instruction ? (
          <ul>
            <MemoryFileRow file={instruction} />
          </ul>
        ) : (
          <p className="rounded-xl border border-border bg-panel p-4 text-center text-xs text-muted">
            No project CLAUDE.md.
          </p>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wide text-muted">
            Auto memories ({memories.length})
          </h2>
          <NewMemoryForm
            scopeKey={`project-memory:${id}`}
            scope={{ kind: 'project-memory', projectId: id }}
            label="memory"
          />
        </div>
        {memories.length === 0 ? (
          <p className="rounded-xl border border-border bg-panel p-4 text-center text-xs text-muted">
            No memory files.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {memories.map((f) => (
              <MemoryFileRow key={f.path} file={f} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
