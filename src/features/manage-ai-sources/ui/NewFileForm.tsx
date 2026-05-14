'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAiFileAction } from '@/features/manage-ai-sources/api/aiSources';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';
import { Button } from '@/design_system/inputs';
import { Input } from '@/design_system/inputs';

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
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(sourceId, true)}>
        + New file
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(sourceId, e.target.value)}
        placeholder="path/to/file.md"
        className="h-8 text-xs"
        autoFocus
      />
      <Button type="submit" size="sm" disabled={isPending || !name.trim()}>
        {isPending ? 'Creating…' : 'Create'}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => reset(sourceId)}>
        Cancel
      </Button>
      {error && <span className="text-[11px] text-red-300">{error}</span>}
    </form>
  );
}
