import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectMemories, getProjects } from '@/entities/memory';
import { ProjectInstructionSection } from '@/features/edit-memory/ui/ProjectInstructionSection';
import { ProjectMemoriesSection } from '@/features/edit-memory/ui/ProjectMemoriesSection';

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
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to memory
      </Link>

      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Project memory</h1>
        <p className="break-all font-mono text-xs text-muted-foreground">{project.displayPath}</p>
      </header>

      <div className="mb-8">
        <ProjectInstructionSection projectId={id} instruction={instruction} />
      </div>

      <ProjectMemoriesSection projectId={id} memories={memories} />
    </main>
  );
}
