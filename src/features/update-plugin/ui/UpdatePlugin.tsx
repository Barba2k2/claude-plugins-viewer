'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { update } from '@/features/plugin-actions/api/plugins';
import { usePluginActionStore } from '@/features/plugin-actions/model/pluginActionStore';
import { Button } from '@/design_system/inputs';

type Props = { id: string; cliReady?: boolean };

export function UpdatePlugin({ id, cliReady = true }: Props) {
  const pendingMap = usePluginActionStore((s) => s.updatePending);
  const errorMap = usePluginActionStore((s) => s.updateError);
  const successMap = usePluginActionStore((s) => s.updateSuccess);
  const setPending = usePluginActionStore((s) => s.setUpdatePending);
  const setError = usePluginActionStore((s) => s.setUpdateError);
  const setSuccess = usePluginActionStore((s) => s.setUpdateSuccess);

  const pending = pendingMap[id] ?? false;
  const error = errorMap[id] ?? null;
  const success = successMap[id] ?? null;
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    setError(id, null);
    setSuccess(id, null);
    setPending(id, true);
    startTransition(async () => {
      const result = await update(id);
      if (result.success) {
        setSuccess(id, 'Updated. Restart Claude Code to apply.');
        router.refresh();
      } else {
        setError(id, result.error);
      }
      setPending(id, false);
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={pending || !cliReady}
        title={!cliReady ? 'Configure Claude CLI in AI Sources settings first' : undefined}
        className="border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
      >
        {pending ? 'Updating…' : 'Update plugin'}
      </Button>
      {error && (
        <pre className="max-h-32 max-w-md overflow-auto rounded bg-red-900/30 p-2 text-[10px] whitespace-pre-wrap text-red-200">
          {error}
        </pre>
      )}
      {success && <p className="text-[10px] text-green-400">{success}</p>}
    </div>
  );
}
