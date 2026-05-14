'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  rescanCliAction,
  setPreferWslAction,
} from '@/features/manage-ai-sources/api/aiSources';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';
import type { CliStatus } from '@/shared/lib/platform';
import { Button } from '@/design_system/inputs';
import { CliDetectionRow } from './CliDetectionRow';

export type CliDetectionRowData = {
  toolId: string;
  displayName: string;
  status: CliStatus;
  hasOverride: boolean;
};

type Props = {
  rows: CliDetectionRowData[];
  showWslControls: boolean;
  preferWsl: boolean;
};

export function CliDetectionSection({ rows, showWslControls, preferWsl }: Props) {
  const rescanPending = useAiSourcesStore((s) => s.cliRescanPending);
  const setRescanPending = useAiSourcesStore((s) => s.setCliRescanPending);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleRescan = () => {
    setRescanPending(true);
    startTransition(async () => {
      await rescanCliAction();
      router.refresh();
      setRescanPending(false);
    });
  };

  const handleTogglePreferWsl = (value: boolean) => {
    startTransition(async () => {
      await setPreferWslAction(value);
      router.refresh();
    });
  };

  return (
    <section className="mb-10">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-muted-foreground text-xs tracking-wide uppercase">CLI detection</h2>
        <span className="text-muted-foreground text-[10px]">
          Required for plugin install, update and uninstall.
        </span>
        <div className="ml-auto flex items-center gap-2">
          {showWslControls && (
            <label className="text-muted-foreground flex items-center gap-2 text-[11px]">
              <input
                type="checkbox"
                checked={preferWsl}
                onChange={(e) => handleTogglePreferWsl(e.target.checked)}
              />
              Prefer WSL
            </label>
          )}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleRescan}
            disabled={rescanPending}
          >
            {rescanPending ? 'Rescanning…' : 'Rescan'}
          </Button>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <CliDetectionRow
            key={row.toolId}
            toolId={row.toolId}
            displayName={row.displayName}
            status={row.status}
            hasOverride={row.hasOverride}
            showWslOption={showWslControls}
          />
        ))}
      </ul>
    </section>
  );
}
