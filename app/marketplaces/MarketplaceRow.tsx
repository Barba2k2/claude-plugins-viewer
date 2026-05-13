'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { removeMarketplaceAction, updateMarketplaceAction } from '../actions/marketplaces';
import { useMarketplaceStore } from '@/lib/marketplaceStore';
import type { MarketplaceEntry } from '@/lib/cli';

type Props = { entry: MarketplaceEntry };

export function MarketplaceRow({ entry }: Props) {
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
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-mono text-sm text-white">{entry.name}</h3>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
          {sourceLabel}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={updatePending}
            className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-[11px] text-accent transition hover:bg-accent/20 disabled:opacity-50"
          >
            {updatePending ? 'Updating…' : 'Update'}
          </button>
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(id, true)}
              className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px] text-red-300 transition hover:bg-red-500/20"
            >
              Remove
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRemove}
                disabled={removePending}
                className="rounded-md bg-red-500/30 px-2 py-1 text-[11px] text-white transition hover:bg-red-500/50 disabled:opacity-50"
              >
                {removePending ? '…' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(id, false)}
                disabled={removePending}
                className="rounded-md border border-border bg-bg px-2 py-1 text-[11px] text-muted transition hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      {entry.installLocation && (
        <div className="break-all font-mono text-[10px] text-muted">{entry.installLocation}</div>
      )}
      {updateError && (
        <pre className="max-h-24 overflow-auto whitespace-pre-wrap rounded bg-red-900/30 p-2 text-[10px] text-red-200">
          {updateError}
        </pre>
      )}
      {updateSuccess && <p className="text-[10px] text-green-400">{updateSuccess}</p>}
      {removeError && (
        <pre className="max-h-24 overflow-auto whitespace-pre-wrap rounded bg-red-900/30 p-2 text-[10px] text-red-200">
          {removeError}
        </pre>
      )}
    </li>
  );
}
