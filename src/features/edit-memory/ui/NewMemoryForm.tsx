'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createMemoryAction } from '@/features/edit-memory/api/memory';
import { useMemoryStore } from '@/features/edit-memory/model/memoryStore';
import type { CreateScope } from '@/entities/memory';
import { Button } from '@/design_system/inputs';
import { Input } from '@/design_system/inputs';

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
      <Button type="button" variant="outline" size="sm" onClick={() => setActiveScope(scopeKey)}>
        + New {label}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3"
    >
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="filename.md"
        className="min-w-50 flex-1 font-mono"
        disabled={pending}
      />
      <Button type="submit" size="sm" disabled={pending || !name.trim()}>
        {pending ? '…' : 'Create'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setActiveScope(null);
          setName('');
        }}
        disabled={pending}
      >
        Cancel
      </Button>
      {error && (
        <pre className="max-h-24 w-full overflow-auto whitespace-pre-wrap rounded bg-red-900/30 p-2 text-[10px] text-red-200">
          {error}
        </pre>
      )}
    </form>
  );
}
