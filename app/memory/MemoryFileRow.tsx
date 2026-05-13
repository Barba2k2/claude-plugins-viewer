'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { readMemoryAction, saveMemoryAction, deleteMemoryAction } from '../actions/memory';
import { useMemoryStore } from '@/lib/memoryStore';
import type { MemoryFile } from '@/lib/memory';
import { Chevron } from './Chevron';

type Props = { file: MemoryFile; canDelete?: boolean };

export function MemoryFileRow({ file, canDelete = true }: Props) {
  const key = file.path;
  const drafts = useMemoryStore((s) => s.drafts);
  const pending = useMemoryStore((s) => s.pending);
  const errors = useMemoryStore((s) => s.errors);
  const expanded = useMemoryStore((s) => s.expanded);
  const setDraft = useMemoryStore((s) => s.setDraft);
  const clearDraft = useMemoryStore((s) => s.clearDraft);
  const setPending = useMemoryStore((s) => s.setPending);
  const setError = useMemoryStore((s) => s.setError);
  const setExpanded = useMemoryStore((s) => s.setExpanded);

  const draft = drafts[key];
  const isPending = pending[key] ?? false;
  const error = errors[key] ?? null;
  const isOpen = expanded[key] ?? false;

  const [, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    if (isOpen) {
      setExpanded(key, false);
      return;
    }
    setExpanded(key, true);
    if (draft !== undefined) return;
    setPending(key, true);
    setError(key, null);
    startTransition(async () => {
      const result = await readMemoryAction(key);
      if (result.success) {
        setDraft(key, result.data);
      } else {
        setError(key, result.error);
      }
      setPending(key, false);
    });
  };

  const save = () => {
    if (draft === undefined) return;
    setPending(key, true);
    setError(key, null);
    startTransition(async () => {
      const result = await saveMemoryAction(key, draft);
      if (!result.success) {
        setError(key, result.error);
      }
      setPending(key, false);
      router.refresh();
    });
  };

  const remove = () => {
    setPending(key, true);
    setError(key, null);
    startTransition(async () => {
      const result = await deleteMemoryAction(key);
      if (!result.success) {
        setError(key, result.error);
        setPending(key, false);
        return;
      }
      clearDraft(key);
      setExpanded(key, false);
      setPending(key, false);
      router.refresh();
    });
  };

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          className="group flex flex-1 items-center gap-2 text-left"
        >
          <Chevron open={isOpen} size={16} />
          <span className="truncate font-mono text-sm text-white group-hover:text-accent">
            {file.relativePath}
          </span>
        </button>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
          {file.scope}
        </span>
        <span className="font-mono text-[10px] text-muted">{formatBytes(file.size)}</span>
        <span className="font-mono text-[10px] text-muted">
          {new Date(file.mtime).toLocaleString()}
        </span>
        {canDelete && (
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px] text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
      {isOpen && (
        <div className="flex flex-col gap-2">
          {isPending && draft === undefined ? (
            <p className="text-[11px] text-muted">Loading…</p>
          ) : (
            <textarea
              value={draft ?? ''}
              onChange={(e) => setDraft(key, e.target.value)}
              spellCheck={false}
              rows={Math.min(30, Math.max(8, (draft ?? '').split('\n').length + 2))}
              className="w-full resize-y rounded-lg border border-border bg-bg p-3 font-mono text-xs text-white outline-none focus:border-accent"
            />
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={isPending || draft === undefined}
              className="rounded-lg border border-accent bg-accent/20 px-3 py-1.5 text-xs text-white transition hover:bg-accent/30 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
      {error && (
        <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded bg-red-900/30 p-2 text-[10px] text-red-200">
          {error}
        </pre>
      )}
    </li>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
