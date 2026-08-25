'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uninstall } from '@/features/plugin-actions/api/plugins';
import { usePluginActionStore } from '@/features/plugin-actions/model/pluginActionStore';
import { Button } from '@/design_system/inputs';

type Props = { id: string; name: string; cliReady?: boolean };

export function UninstallPlugin({ id, name, cliReady = true }: Props) {
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
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setConfirming(id, true)}
        disabled={!cliReady}
        title={!cliReady ? 'Configure Claude CLI in AI Sources settings first' : undefined}
      >
        Uninstall plugin
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
      <p className="text-xs text-red-200">
        Uninstall <span className="font-mono text-white">{name}</span>? Runs
        <code className="mx-1 font-mono">claude plugin uninstall {id}</code>.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleConfirm}
          disabled={pending}
        >
          {pending ? 'Uninstalling…' : 'Yes, uninstall'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(id, false)}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
      {error && (
        <pre className="max-h-32 overflow-auto rounded bg-red-900/40 p-2 text-[10px] whitespace-pre-wrap text-red-200">
          {error}
        </pre>
      )}
    </div>
  );
}
