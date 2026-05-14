'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  setDefaultDisabledAction,
  setDefaultNameAction,
} from '@/features/manage-ai-sources/api/aiSources';
import type { KnownTool } from '@/entities/ai-source';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';

type Props = {
  tool: KnownTool;
  disabled: boolean;
  nameOverride: string | null;
  exists: boolean;
  fileCount: number;
  resolvedPath: string;
};

export function DefaultSourceRow({
  tool,
  disabled,
  nameOverride,
  exists,
  fileCount,
  resolvedPath,
}: Props) {
  const editing = useAiSourcesStore((s) => s.defaultEditing[tool.id] ?? false);
  const draftStored = useAiSourcesStore((s) => s.defaultNameDraft[tool.id]);
  const error = useAiSourcesStore((s) => s.defaultError[tool.id] ?? null);
  const setEditing = useAiSourcesStore((s) => s.setDefaultEditing);
  const setDraft = useAiSourcesStore((s) => s.setDefaultNameDraft);
  const setError = useAiSourcesStore((s) => s.setDefaultError);

  const nameInput = draftStored ?? nameOverride ?? '';

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const displayName = nameOverride && nameOverride.length > 0 ? nameOverride : tool.defaultName;

  const startEdit = () => {
    setDraft(tool.id, nameOverride ?? '');
    setEditing(tool.id, true);
  };

  const cancelEdit = () => {
    setEditing(tool.id, false);
    setDraft(tool.id, nameOverride ?? '');
  };

  const toggle = () => {
    setError(tool.id, null);
    startTransition(async () => {
      const result = await setDefaultDisabledAction(tool.id, !disabled);
      if (!result.success) {
        setError(tool.id, result.error);
        return;
      }
      router.refresh();
    });
  };

  const saveName = (next: string | null) => {
    setError(tool.id, null);
    startTransition(async () => {
      const result = await setDefaultNameAction(tool.id, next);
      if (!result.success) {
        setError(tool.id, result.error);
        return;
      }
      setEditing(tool.id, false);
      router.refresh();
    });
  };

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4">
      <div className="flex flex-wrap items-center gap-2">
        {editing ? (
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setDraft(tool.id, e.target.value)}
            placeholder={tool.defaultName}
            className="flex-1 rounded-lg border border-border bg-bg px-2 py-1 text-sm text-white outline-none focus:border-accent"
            autoFocus
          />
        ) : (
          <span className="flex-1 truncate text-sm font-medium text-white">
            {displayName}
            {nameOverride && (
              <span className="ml-2 text-[10px] text-muted">(was {tool.defaultName})</span>
            )}
          </span>
        )}
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
            disabled
              ? 'border-border text-muted'
              : exists
                ? 'border-accent/40 text-accent'
                : 'border-red-500/40 text-red-300'
          }`}
        >
          {disabled ? 'disabled' : exists ? `${fileCount} files` : 'missing'}
        </span>
        {editing ? (
          <>
            <button
              type="button"
              onClick={() => saveName(nameInput.trim() === '' ? null : nameInput)}
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
            {nameOverride && (
              <button
                type="button"
                onClick={() => saveName(null)}
                disabled={isPending}
                className="rounded-md border border-border bg-panel px-2 py-1 text-[11px] text-muted transition hover:text-white disabled:opacity-50"
              >
                Reset
              </button>
            )}
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
          onClick={toggle}
          disabled={isPending}
          className={`rounded-md border px-2 py-1 text-[11px] transition disabled:opacity-50 ${
            disabled
              ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
              : 'border-border bg-panel text-muted hover:text-white'
          }`}
        >
          {disabled ? 'Enable' : 'Disable'}
        </button>
      </div>
      <p className="truncate font-mono text-[11px] text-muted">{resolvedPath}</p>
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </li>
  );
}
