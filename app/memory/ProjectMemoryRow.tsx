'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { loadProjectMemoriesAction } from '../actions/memory';
import { useMemoryStore } from '@/lib/memoryStore';
import type { MemoryProject } from '@/lib/memory';
import { MemoryFileRow } from './MemoryFileRow';
import { NewMemoryForm } from './NewMemoryForm';
import { Chevron } from './Chevron';

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
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="group flex flex-1 items-center gap-2 text-left"
        >
          <Chevron open={open} />
          <span className="flex-1 truncate font-mono text-xs text-white group-hover:text-accent">
            {project.displayPath}
          </span>
        </button>
        {project.hasInstruction && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
            CLAUDE.md
          </span>
        )}
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
          {project.memoryFileCount} memories
        </span>
        <Link
          href={`/memory/projects/${encodeURIComponent(project.id)}`}
          className="rounded-md border border-border bg-bg px-2 py-1 text-[10px] text-muted transition hover:text-white"
        >
          Open ↗
        </Link>
      </div>

      {open && (
        <div className="flex flex-col gap-3 pl-5">
          {pending && !files ? (
            <p className="text-[11px] text-muted">Loading…</p>
          ) : error ? (
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded bg-red-900/30 p-2 text-[10px] text-red-200">
              {error}
            </pre>
          ) : files ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[10px] uppercase tracking-wide text-muted">
                    Project instruction
                  </h4>
                  {!instruction && (
                    <NewMemoryForm
                      scopeKey={`project-instruction:${project.id}`}
                      scope={{ kind: 'project-instruction', projectId: project.id }}
                      label="CLAUDE.md"
                    />
                  )}
                </div>
                {instruction ? (
                  <ul>
                    <MemoryFileRow file={instruction} />
                  </ul>
                ) : (
                  <p className="rounded-lg border border-border bg-bg p-2 text-center text-[10px] text-muted">
                    No project CLAUDE.md.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[10px] uppercase tracking-wide text-muted">
                    Auto memories ({memories.length})
                  </h4>
                  <NewMemoryForm
                    scopeKey={`project-memory:${project.id}`}
                    scope={{ kind: 'project-memory', projectId: project.id }}
                    label="memory"
                  />
                </div>
                {memories.length === 0 ? (
                  <p className="rounded-lg border border-border bg-bg p-2 text-center text-[10px] text-muted">
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
            </>
          ) : null}
        </div>
      )}
    </li>
  );
}
