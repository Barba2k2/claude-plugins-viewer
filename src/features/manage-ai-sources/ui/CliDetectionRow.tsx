'use client';

import type { CliStatus } from '@/entities/ai-source';
import { useCliDetectionRow } from '@/features/manage-ai-sources/model/useCliDetectionRow';
import { Button, Input } from '@/design_system/inputs';
import { Badge } from '@/design_system/feedback';

type Props = {
  toolId: string;
  displayName: string;
  status: CliStatus;
  hasOverride: boolean;
  showWslOption: boolean;
};

const SOURCE_LABEL: Record<CliStatus['source'], string> = {
  override: 'override',
  native: 'native',
  wsl: 'wsl',
  missing: 'not found',
};

export function CliDetectionRow({
  toolId,
  displayName,
  status,
  hasOverride,
  showWslOption,
}: Props) {
  const vm = useCliDetectionRow(toolId, status);

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
          {SOURCE_LABEL[status.source]}
        </Badge>
        {status.version && (
          <Badge variant="outline" className="font-mono text-[10px]">
            v{status.version}
          </Badge>
        )}
        <div className="ml-auto flex gap-2">
          {!vm.editing && (
            <Button type="button" variant="outline" size="xs" onClick={vm.startEdit}>
              {hasOverride ? 'Edit path' : 'Configure path'}
            </Button>
          )}
          {!vm.editing && hasOverride && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={vm.clear}
              disabled={vm.pending}
              title="Remove override and re-detect automatically"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {status.path && !vm.editing && (
        <code className="text-muted-foreground font-mono text-[11px] break-all">
          {status.useWsl ? `wsl ${status.path}` : status.path}
        </code>
      )}

      {!status.found && !vm.editing && (
        <p className="text-[11px] text-red-300/80">
          {displayName} binary not found in PATH. Configure its absolute path to enable plugin
          actions.
        </p>
      )}

      {vm.editing && (
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            value={vm.pathDraft}
            onChange={(e) => vm.setPathDraft(e.target.value)}
            placeholder={
              vm.useWslDraft
                ? 'binary name inside WSL (e.g. claude)'
                : 'absolute path (e.g. /usr/local/bin/claude)'
            }
            className="font-mono text-xs"
            disabled={vm.pending}
            spellCheck={false}
          />
          {showWslOption && (
            <label className="text-muted-foreground flex items-center gap-2 text-[11px]">
              <input
                type="checkbox"
                checked={vm.useWslDraft}
                onChange={(e) => vm.setUseWslDraft(e.target.checked)}
                disabled={vm.pending}
              />
              Invoke through WSL
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="xs" onClick={vm.save} disabled={vm.pending}>
              {vm.pending ? 'Validating…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={vm.cancel}
              disabled={vm.pending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {vm.error && (
        <pre className="max-h-24 overflow-auto rounded bg-red-900/30 p-2 text-[10px] whitespace-pre-wrap text-red-200">
          {vm.error}
        </pre>
      )}
    </li>
  );
}
