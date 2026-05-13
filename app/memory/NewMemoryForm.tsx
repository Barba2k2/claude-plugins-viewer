'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createMemoryAction } from '../actions/memory';
import { useMemoryStore } from '@/lib/memoryStore';
import type { CreateScope } from '@/lib/memory';

type Props = { scopeKey: string; scope: CreateScope; label: string };

export function NewMemoryForm({ scopeKey, scope, label }: Props) {
  const activeScope = useMemoryStore((s) => s.newFileScope);
  const name = useMemoryStore((s) => s.newFileName);
  const error = useMemoryStore((s) => s.newFileError);
  const pending = useMemoryStore((s) => s.newFilePending);
  const setActiveScope = useMemoryStore((s) => s.setNewFileScope);
  const setName = useMemoryStore((s) => s.setNewFileName);
  const setError = useMemoryStore((s) => s.setNewFileError);
  const setPending = useMemoryStore((s) => s.setNewFilePending);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const isActive = activeScope === scopeKey;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filename = name.trim().endsWith('.md') ? name.trim() : `${name.trim()}.md`;
    if (!filename || pending) return;
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await createMemoryAction(scope, filename);
      if (result.success) {
        setActiveScope(null);
        setName('');
        router.refresh();
      } else {
        setError(result.error);
      }
      setPending(false);
    });
  };

  if (!isActive) {
    return (
      <button
        type="button"
        onClick={() => setActiveScope(scopeKey)}
        className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs text-muted transition hover:text-white"
      >
        + New {label}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-bg p-3"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="filename.md"
        className="flex-1 min-w-[200px] rounded-md border border-border bg-panel px-2 py-1 font-mono text-xs outline-none focus:border-accent"
        disabled={pending}
      />
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="rounded-md border border-accent bg-accent/20 px-3 py-1 text-xs text-white transition hover:bg-accent/30 disabled:opacity-50"
      >
        {pending ? '…' : 'Create'}
      </button>
      <button
        type="button"
        onClick={() => {
          setActiveScope(null);
          setName('');
        }}
        disabled={pending}
        className="rounded-md border border-border px-3 py-1 text-xs text-muted transition hover:text-white"
      >
        Cancel
      </button>
      {error && (
        <pre className="w-full max-h-24 overflow-auto whitespace-pre-wrap rounded bg-red-900/30 p-2 text-[10px] text-red-200">
          {error}
        </pre>
      )}
    </form>
  );
}
