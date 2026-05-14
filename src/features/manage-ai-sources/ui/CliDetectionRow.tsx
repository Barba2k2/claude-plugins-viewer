'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  setCliOverrideAction,
  clearCliOverrideAction,
} from '@/features/manage-ai-sources/api/aiSources';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';
import type { CliStatus } from '@/shared/lib/platform';
import { Button } from '@/design_system/inputs';
import { Input } from '@/design_system/inputs';
import { Badge } from '@/design_system/feedback';

type Props = {
  toolId: string;
  displayName: string;
  status: CliStatus;
  hasOverride: boolean;
  showWslOption: boolean;
};

export function CliDetectionRow({
  toolId,
  displayName,
  status,
  hasOverride,
  showWslOption,
}: Props) {
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

  const startEdit = () => {
    setPathDraft(toolId, status.path ?? '');
    setUseWslDraft(toolId, status.useWsl);
    setError(toolId, null);
    setEditing(toolId, true);
  };

  const cancel = () => {
    setEditing(toolId, false);
    setError(toolId, null);
  };

  const save = () => {
    const trimmed = pathDraft.trim();
    if (trimmed.length === 0) {
      setError(toolId, 'path required');
      return;
    }
    setError(toolId, null);
    setPending(toolId, true);
    startTransition(async () => {
      const result = await setCliOverrideAction(toolId, trimmed, useWslDraft);
      if (result.success) {
        setEditing(toolId, false);
        router.refresh();
      } else {
        setError(toolId, result.error);
      }
      setPending(toolId, false);
    });
  };

  const clear = () => {
    setError(toolId, null);
    setPending(toolId, true);
    startTransition(async () => {
      const result = await clearCliOverrideAction(toolId);
      if (result.success) {
        setEditing(toolId, false);
        router.refresh();
      } else {
        setError(toolId, result.error);
      }
      setPending(toolId, false);
    });
  };

  const sourceLabel: Record<CliStatus['source'], string> = {
    override: 'override',
    native: 'native',
    wsl: 'wsl',
    missing: 'not found',
  };

  return (
    <li className="bg-card flex flex-col gap-2 rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          aria-hidden
          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
            status.found ? 'bg-accent' : 'bg-red-500/60'
          }`}
        />
        <h3 className="text-foreground text-sm font-medium">{displayName}</h3>
        <Badge variant="outline" className="font-mono text-[10px]">
          {toolId}
        </Badge>
        <Badge variant="outline" className="font-mono text-[10px]">
          {sourceLabel[status.source]}
        </Badge>
        {status.version && (
          <Badge variant="outline" className="font-mono text-[10px]">
            v{status.version}
          </Badge>
        )}
        <div className="ml-auto flex gap-2">
          {!editing && (
            <Button type="button" variant="outline" size="xs" onClick={startEdit}>
              {hasOverride ? 'Edit path' : 'Configure path'}
            </Button>
          )}
          {!editing && hasOverride && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={clear}
              disabled={pending}
              title="Remove override and re-detect automatically"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {status.path && !editing && (
        <code className="text-muted-foreground font-mono text-[11px] break-all">
          {status.useWsl ? `wsl ${status.path}` : status.path}
        </code>
      )}

      {!status.found && !editing && (
        <p className="text-[11px] text-red-300/80">
          {displayName} binary not found in PATH. Configure its absolute path to enable
          plugin actions.
        </p>
      )}

      {editing && (
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            value={pathDraft}
            onChange={(e) => setPathDraft(toolId, e.target.value)}
            placeholder={
              useWslDraft
                ? 'binary name inside WSL (e.g. claude)'
                : 'absolute path (e.g. /usr/local/bin/claude)'
            }
            className="font-mono text-xs"
            disabled={pending}
            spellCheck={false}
          />
          {showWslOption && (
            <label className="text-muted-foreground flex items-center gap-2 text-[11px]">
              <input
                type="checkbox"
                checked={useWslDraft}
                onChange={(e) => setUseWslDraft(toolId, e.target.checked)}
                disabled={pending}
              />
              Invoke through WSL
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="xs" onClick={save} disabled={pending}>
              {pending ? 'Validating…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={cancel}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && (
        <pre className="max-h-24 overflow-auto rounded bg-red-900/30 p-2 text-[10px] whitespace-pre-wrap text-red-200">
          {error}
        </pre>
      )}
    </li>
  );
}
