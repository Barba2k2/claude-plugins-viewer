'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  setCliOverrideAction,
  clearCliOverrideAction,
} from '@/features/manage-ai-sources/api/aiSources';
import type { CliStatus } from '@/entities/ai-source';
import { useAiSourcesStore } from './aiSourcesStore';

export type CliDetectionRowVm = {
  editing: boolean;
  pathDraft: string;
  useWslDraft: boolean;
  error: string | null;
  pending: boolean;
  startEdit: () => void;
  cancel: () => void;
  save: () => void;
  clear: () => void;
  setPathDraft: (value: string) => void;
  setUseWslDraft: (value: boolean) => void;
};

export function useCliDetectionRow(toolId: string, status: CliStatus): CliDetectionRowVm {
  const editing = useAiSourcesStore((s) => s.cliEditing[toolId] ?? false);
  const pathDraft = useAiSourcesStore((s) => s.cliPathDraft[toolId] ?? '');
  const useWslDraft = useAiSourcesStore((s) => s.cliUseWslDraft[toolId] ?? false);
  const error = useAiSourcesStore((s) => s.cliError[toolId] ?? null);
  const pending = useAiSourcesStore((s) => s.cliPending[toolId] ?? false);
  const setEditing = useAiSourcesStore((s) => s.setCliEditing);
  const setPathDraft = useAiSourcesStore((s) => s.setCliPathDraft);
  const setUseWslDraft = useAiSourcesStore((s) => s.setCliUseWslDraft);
  const setError = useAiSourcesStore((s) => s.setCliError);
  const setPending = useAiSourcesStore((s) => s.setCliPending);

  const [, startTransition] = useTransition();
  const router = useRouter();

  const runAction = (action: () => Promise<{ success: true } | { success: false; error: string }>) => {
    setError(toolId, null);
    setPending(toolId, true);
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        setEditing(toolId, false);
        router.refresh();
      } else {
        setError(toolId, result.error);
      }
      setPending(toolId, false);
    });
  };

  return {
    editing,
    pathDraft,
    useWslDraft,
    error,
    pending,
    setPathDraft: (value) => setPathDraft(toolId, value),
    setUseWslDraft: (value) => setUseWslDraft(toolId, value),
    startEdit: () => {
      setPathDraft(toolId, status.path ?? '');
      setUseWslDraft(toolId, status.useWsl);
      setError(toolId, null);
      setEditing(toolId, true);
    },
    cancel: () => {
      setEditing(toolId, false);
      setError(toolId, null);
    },
    save: () => {
      const trimmed = pathDraft.trim();
      if (trimmed.length === 0) {
        setError(toolId, 'path required');
        return;
      }
      runAction(() => setCliOverrideAction(toolId, trimmed, useWslDraft));
    },
    clear: () => runAction(() => clearCliOverrideAction(toolId)),
  };
}
