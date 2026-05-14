'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uninstall } from '@/features/plugin-actions/api/plugins';
import { usePluginActionStore } from '@/features/plugin-actions/model/pluginActionStore';

type Props = { id: string; name: string };

export function UninstallPlugin({ id, name }: Props) {
  const pendingMap = usePluginActionStore((s) => s.uninstallPending);
  const errorMap = usePluginActionStore((s) => s.uninstallError);
  const confirmingMap = usePluginActionStore((s) => s.confirmingUninstall);
  const setPending = usePluginActionStore((s) => s.setUninstallPending);
  const setError = usePluginActionStore((s) => s.setUninstallError);
  const setConfirming = usePluginActionStore((s) => s.setConfirmingUninstall);

  const pending = pendingMap[id] ?? false;
  const error = errorMap[id] ?? null;
  const confirming = confirmingMap[id] ?? false;
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = () => {
    setError(id, null);
    setPending(id, true);
    startTransition(async () => {
      const result = await uninstall(id);
      if (!result.success) {
        setError(id, result.error);
        setPending(id, false);
        return;
      }
      setConfirming(id, false);
      setPending(id, false);
      router.replace('/');
      router.refresh();
    });
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(id, true)}
        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20"
      >
        Uninstall plugin
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
      <p className="text-xs text-red-200">
        Uninstall <span className="font-mono text-white">{name}</span>? Runs
        <code className="mx-1 font-mono">claude plugin uninstall {id}</code>.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={pending}
          className="rounded-md bg-red-500/30 px-3 py-1 text-xs text-white transition hover:bg-red-500/50 disabled:opacity-50"
        >
          {pending ? 'Uninstalling…' : 'Yes, uninstall'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(id, false)}
          disabled={pending}
          className="rounded-md border border-border bg-bg px-3 py-1 text-xs text-muted transition hover:text-white"
        >
          Cancel
        </button>
      </div>
      {error && (
        <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded bg-red-900/40 p-2 text-[10px] text-red-200">
          {error}
        </pre>
      )}
    </div>
  );
}
