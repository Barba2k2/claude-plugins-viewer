'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  removeCustomSourceAction,
  renameCustomSourceAction,
} from '@/features/manage-ai-sources/api/aiSources';
import type { CustomSource } from '@/entities/ai-source';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';

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
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4">
      <div className="flex flex-wrap items-center gap-2">
        {editing ? (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(source.id, e.target.value)}
            className="flex-1 rounded-lg border border-border bg-bg px-2 py-1 text-sm text-white outline-none focus:border-accent"
            autoFocus
          />
        ) : (
          <span className="flex-1 truncate text-sm font-medium text-white">{source.name}</span>
        )}
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
            exists ? 'border-accent/40 text-accent' : 'border-red-500/40 text-red-300'
          }`}
        >
          {exists ? `${fileCount} files` : 'missing'}
        </span>
        {editing ? (
          <>
            <button
              type="button"
              onClick={save}
              disabled={isPending}
              className="rounded-md border border-accent bg-accent/20 px-2 py-1 text-[11px] text-white transition hover:bg-accent/30 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md border border-border bg-panel px-2 py-1 text-[11px] text-muted transition hover:text-white"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="rounded-md border border-border bg-panel px-2 py-1 text-[11px] text-white transition hover:border-accent"
          >
            Rename
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px] text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          {confirming ? 'Confirm?' : 'Remove'}
        </button>
        {confirming && (
          <button
            type="button"
            onClick={() => setConfirming(source.id, false)}
            className="rounded-md border border-border bg-panel px-2 py-1 text-[11px] text-muted transition hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>
      <p className="truncate font-mono text-[11px] text-muted">{source.path}</p>
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </li>
  );
}
