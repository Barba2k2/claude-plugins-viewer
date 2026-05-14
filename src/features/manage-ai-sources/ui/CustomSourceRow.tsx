'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  removeCustomSourceAction,
  renameCustomSourceAction,
} from '@/features/manage-ai-sources/api/aiSources';
import type { CustomSource } from '@/entities/ai-source';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';
import { Button } from '@/design_system/inputs';
import { Input } from '@/design_system/inputs';
import { Badge } from '@/design_system/feedback';

type Props = { source: CustomSource; exists: boolean; fileCount: number };

export function CustomSourceRow({ source, exists, fileCount }: Props) {
  const editing = useAiSourcesStore((s) => s.customEditing[source.id] ?? false);
  const draftStored = useAiSourcesStore((s) => s.customNameDraft[source.id]);
  const confirming = useAiSourcesStore((s) => s.customConfirmRemove[source.id] ?? false);
  const error = useAiSourcesStore((s) => s.customError[source.id] ?? null);
  const setEditing = useAiSourcesStore((s) => s.setCustomEditing);
  const setDraft = useAiSourcesStore((s) => s.setCustomNameDraft);
  const setConfirming = useAiSourcesStore((s) => s.setCustomConfirmRemove);
  const setError = useAiSourcesStore((s) => s.setCustomError);

  const draft = draftStored ?? source.name;

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const startEdit = () => {
    setDraft(source.id, source.name);
    setEditing(source.id, true);
  };

  const cancelEdit = () => {
    setEditing(source.id, false);
    setDraft(source.id, source.name);
  };

  const save = () => {
    if (draft.trim() === source.name) {
      setEditing(source.id, false);
      return;
    }
    setError(source.id, null);
    startTransition(async () => {
      const result = await renameCustomSourceAction(source.id, draft);
      if (!result.success) {
        setError(source.id, result.error);
        return;
      }
      setEditing(source.id, false);
      router.refresh();
    });
  };

  const remove = () => {
    if (!confirming) {
      setConfirming(source.id, true);
      return;
    }
    setError(source.id, null);
    startTransition(async () => {
      const result = await removeCustomSourceAction(source.id);
      if (!result.success) {
        setError(source.id, result.error);
        setConfirming(source.id, false);
        return;
      }
      router.refresh();
    });
  };

  return (
    <li className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        {editing ? (
          <Input
            type="text"
            value={draft}
            onChange={(e) => setDraft(source.id, e.target.value)}
            className="flex-1"
            autoFocus
          />
        ) : (
          <span className="flex-1 truncate text-sm font-medium text-foreground">{source.name}</span>
        )}
        <Badge
          variant="outline"
          className={`font-mono text-[10px] ${
            exists ? 'border-accent/40 text-accent' : 'border-red-500/40 text-red-300'
          }`}
        >
          {exists ? `${fileCount} files` : 'missing'}
        </Badge>
        {editing ? (
          <>
            <Button type="button" size="xs" onClick={save} disabled={isPending}>
              Save
            </Button>
            <Button type="button" variant="ghost" size="xs" onClick={cancelEdit}>
              Cancel
            </Button>
          </>
        ) : (
          <Button type="button" variant="outline" size="xs" onClick={startEdit}>
            Rename
          </Button>
        )}
        <Button type="button" variant="destructive" size="xs" onClick={remove} disabled={isPending}>
          {confirming ? 'Confirm?' : 'Remove'}
        </Button>
        {confirming && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setConfirming(source.id, false)}
          >
            Cancel
          </Button>
        )}
      </div>
      <p className="truncate font-mono text-[11px] text-muted-foreground">{source.path}</p>
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </li>
  );
}
