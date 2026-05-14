'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { loadProjectMemoriesAction } from '@/features/edit-memory/api/memory';
import { useMemoryStore } from '@/features/edit-memory/model/memoryStore';
import type { MemoryProject } from '@/entities/memory';
import { ProjectInstructionSection } from './ProjectInstructionSection';
import { ProjectMemoriesSection } from './ProjectMemoriesSection';
import { Chevron } from '@/shared/ui/Chevron';
import { Badge } from '@/design_system/feedback';

type Props = { project: MemoryProject };

export function ProjectMemoryRow({ project }: Props) {
  const key = `project:${project.id}`;
  const collapsed = useMemoryStore((s) => s.sectionCollapsed);
  const setCollapsed = useMemoryStore((s) => s.setSectionCollapsed);
  const filesMap = useMemoryStore((s) => s.projectMemories);
  const pendingMap = useMemoryStore((s) => s.projectMemoryPending);
  const errorMap = useMemoryStore((s) => s.projectMemoryError);
  const setFiles = useMemoryStore((s) => s.setProjectMemories);
  const setPending = useMemoryStore((s) => s.setProjectMemoryPending);
  const setError = useMemoryStore((s) => s.setProjectMemoryError);

  const stored = collapsed[key];
  const open = stored === undefined ? false : !stored;
  const files = filesMap[project.id];
  const pending = pendingMap[project.id] ?? false;
  const error = errorMap[project.id] ?? null;
  const [, startTransition] = useTransition();

  const toggle = () => {
    const willOpen = !open;
    setCollapsed(key, !willOpen);
    if (willOpen && !files) {
      setPending(project.id, true);
      setError(project.id, null);
      startTransition(async () => {
        const result = await loadProjectMemoriesAction(project.id);
        if (result.success) {
          setFiles(project.id, result.data);
        } else {
          setError(project.id, result.error);
        }
        setPending(project.id, false);
      });
    }
  };

  const instruction = files?.find((f) => f.scope === 'project-instruction');
  const memories = files?.filter((f) => f.scope === 'project-memory') ?? [];

  return (
    <li className="flex flex-col gap-2 rounded-xl border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="group flex flex-1 items-center gap-2 text-left"
        >
          <Chevron open={open} />
          <span className="flex-1 truncate font-mono text-xs text-foreground group-hover:text-accent">
            {project.displayPath}
          </span>
        </button>
        {project.hasInstruction && (
          <Badge className="bg-accent/10 text-accent font-mono text-[10px]">CLAUDE.md</Badge>
        )}
        <Badge variant="outline" className="font-mono text-[10px]">
          {project.memoryFileCount} memories
        </Badge>
        <Link
          href={`/memory/projects/${encodeURIComponent(project.id)}`}
          className="rounded-md border bg-background px-2 py-1 text-[10px] text-muted-foreground transition hover:text-foreground"
        >
          Open ↗
        </Link>
      </div>

      {open && (
        <div className="flex flex-col gap-3 pl-5">
          {pending && !files ? (
            <p className="text-[11px] text-muted-foreground">Loading…</p>
          ) : error ? (
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded bg-red-900/30 p-2 text-[10px] text-red-200">
              {error}
            </pre>
          ) : files ? (
            <>
              <ProjectInstructionSection projectId={project.id} instruction={instruction} />
              <ProjectMemoriesSection projectId={project.id} memories={memories} />
            </>
          ) : null}
        </div>
      )}
    </li>
  );
}
