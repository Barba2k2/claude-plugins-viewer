'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  removeMarketplaceAction,
  updateMarketplaceAction,
} from '@/features/manage-marketplaces/api/marketplaces';
import { useMarketplaceStore } from '@/features/manage-marketplaces/model/marketplaceStore';
import type { MarketplaceEntry } from '@/shared/lib/cli';
import { Button } from '@/design_system/inputs';
import { Badge } from '@/design_system/feedback';

type Props = { entry: MarketplaceEntry; cliReady?: boolean };

export function MarketplaceRow({ entry, cliReady = true }: Props) {
  const id = entry.name;

  const removePending = useMarketplaceStore((s) => s.removePending[id] ?? false);
  const removeError = useMarketplaceStore((s) => s.removeError[id] ?? null);
  const confirming = useMarketplaceStore((s) => s.confirmingRemove[id] ?? false);
  const updatePending = useMarketplaceStore((s) => s.updatePending[id] ?? false);
  const updateError = useMarketplaceStore((s) => s.updateError[id] ?? null);
  const updateSuccess = useMarketplaceStore((s) => s.updateSuccess[id] ?? null);

  const setRemovePending = useMarketplaceStore((s) => s.setRemovePending);
  const setRemoveError = useMarketplaceStore((s) => s.setRemoveError);
  const setConfirming = useMarketplaceStore((s) => s.setConfirmingRemove);
  const setUpdatePending = useMarketplaceStore((s) => s.setUpdatePending);
  const setUpdateError = useMarketplaceStore((s) => s.setUpdateError);
  const setUpdateSuccess = useMarketplaceStore((s) => s.setUpdateSuccess);

  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = () => {
    setUpdateError(id, null);
    setUpdateSuccess(id, null);
    setUpdatePending(id, true);
    startTransition(async () => {
      const result = await updateMarketplaceAction(id);
      if (result.success) {
        setUpdateSuccess(id, 'Updated');
        router.refresh();
      } else {
        setUpdateError(id, result.error);
      }
      setUpdatePending(id, false);
    });
  };

  const handleRemove = () => {
    setRemoveError(id, null);
    setRemovePending(id, true);
    startTransition(async () => {
      const result = await removeMarketplaceAction(id);
      if (result.success) {
        setConfirming(id, false);
        router.refresh();
      } else {
        setRemoveError(id, result.error);
      }
      setRemovePending(id, false);
    });
  };

  const sourceLabel =
    entry.source === 'github' && entry.repo
      ? `GitHub: ${entry.repo}`
      : entry.url
        ? `${entry.source}: ${entry.url}`
        : entry.source;

  return (
    <li className="bg-card flex flex-col gap-2 rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-foreground font-mono text-sm">{entry.name}</h3>
        <Badge variant="outline" className="font-mono text-[10px]">
          {sourceLabel}
        </Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleUpdate}
            disabled={updatePending || !cliReady}
            title={!cliReady ? 'Configure Claude CLI in AI Sources settings first' : undefined}
            className="border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
          >
            {updatePending ? 'Updating…' : 'Update'}
          </Button>
          {!confirming ? (
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={() => setConfirming(id, true)}
              disabled={!cliReady}
              title={!cliReady ? 'Configure Claude CLI in AI Sources settings first' : undefined}
            >
              Remove
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="destructive"
                size="xs"
                onClick={handleRemove}
                disabled={removePending}
              >
                {removePending ? '…' : 'Confirm'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setConfirming(id, false)}
                disabled={removePending}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
      {entry.installLocation && (
        <div className="text-muted-foreground font-mono text-[10px] break-all">
          {entry.installLocation}
        </div>
      )}
      {updateError && (
        <pre className="max-h-24 overflow-auto rounded bg-red-900/30 p-2 text-[10px] whitespace-pre-wrap text-red-200">
          {updateError}
        </pre>
      )}
      {updateSuccess && <p className="text-[10px] text-green-400">{updateSuccess}</p>}
      {removeError && (
        <pre className="max-h-24 overflow-auto rounded bg-red-900/30 p-2 text-[10px] whitespace-pre-wrap text-red-200">
          {removeError}
        </pre>
      )}
    </li>
  );
}
