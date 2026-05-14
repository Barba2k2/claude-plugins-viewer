'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  setDefaultDisabledAction,
  setDefaultNameAction,
} from '@/features/manage-ai-sources/api/aiSources';
import type { KnownTool } from '@/entities/ai-source';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';
import { Button } from '@/design_system/inputs';
import { Input } from '@/design_system/inputs';
import { Badge } from '@/design_system/feedback';

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
    <li className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        {editing ? (
          <Input
            type="text"
            value={nameInput}
            onChange={(e) => setDraft(tool.id, e.target.value)}
            placeholder={tool.defaultName}
            className="flex-1"
            autoFocus
          />
        ) : (
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            {displayName}
            {nameOverride && (
              <span className="ml-2 text-[10px] text-muted-foreground">
                (was {tool.defaultName})
              </span>
            )}
          </span>
        )}
        <Badge
          variant="outline"
          className={`font-mono text-[10px] ${
            disabled
              ? 'border-border text-muted-foreground'
              : exists
                ? 'border-accent/40 text-accent'
                : 'border-red-500/40 text-red-300'
          }`}
        >
          {disabled ? 'disabled' : exists ? `${fileCount} files` : 'missing'}
        </Badge>
        {editing ? (
          <>
            <Button
              type="button"
              size="xs"
              onClick={() => saveName(nameInput.trim() === '' ? null : nameInput)}
              disabled={isPending}
            >
              Save
            </Button>
            <Button type="button" variant="ghost" size="xs" onClick={cancelEdit}>
              Cancel
            </Button>
            {nameOverride && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => saveName(null)}
                disabled={isPending}
              >
                Reset
              </Button>
            )}
          </>
        ) : (
          <Button type="button" variant="outline" size="xs" onClick={startEdit}>
            Rename
          </Button>
        )}
        <Button
          type="button"
          variant={disabled ? 'outline' : 'ghost'}
          size="xs"
          onClick={toggle}
          disabled={isPending}
          className={
            disabled
              ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
              : undefined
          }
        >
          {disabled ? 'Enable' : 'Disable'}
        </Button>
      </div>
      <p className="truncate font-mono text-[11px] text-muted-foreground">{resolvedPath}</p>
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </li>
  );
}
