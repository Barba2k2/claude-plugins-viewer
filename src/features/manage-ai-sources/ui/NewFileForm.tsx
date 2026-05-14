'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAiFileAction } from '@/features/manage-ai-sources/api/aiSources';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';

type Props = { sourceId: string };

export function NewFileForm({ sourceId }: Props) {
  const open = useAiSourcesStore((s) => s.newFileOpen[sourceId] ?? false);
  const name = useAiSourcesStore((s) => s.newFileName[sourceId] ?? '');
  const error = useAiSourcesStore((s) => s.newFileError[sourceId] ?? null);
  const setOpen = useAiSourcesStore((s) => s.setNewFileOpen);
  const setName = useAiSourcesStore((s) => s.setNewFileName);
  const setError = useAiSourcesStore((s) => s.setNewFileError);
  const reset = useAiSourcesStore((s) => s.resetNewFile);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(sourceId, null);
    startTransition(async () => {
      const result = await createAiFileAction(sourceId, name.trim());
      if (!result.success) {
        setError(sourceId, result.error);
        return;
      }
      reset(sourceId);
      router.refresh();
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(sourceId, true)}
        className="rounded-lg border border-border bg-panel px-3 py-1.5 text-xs text-white transition hover:border-accent"
      >
        + New file
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(sourceId, e.target.value)}
        placeholder="path/to/file.md"
        className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-white outline-none focus:border-accent"
        autoFocus
      />
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="rounded-lg border border-accent bg-accent/20 px-3 py-1 text-xs text-white transition hover:bg-accent/30 disabled:opacity-50"
      >
        {isPending ? 'Creating…' : 'Create'}
      </button>
      <button
        type="button"
        onClick={() => reset(sourceId)}
        className="rounded-lg border border-border bg-panel px-3 py-1 text-xs text-muted transition hover:text-white"
      >
        Cancel
      </button>
      {error && <span className="text-[11px] text-red-300">{error}</span>}
    </form>
  );
}
