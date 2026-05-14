'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { install } from '@/features/plugin-actions/api/plugins';
import { usePluginActionStore } from '@/features/plugin-actions/model/pluginActionStore';
import { Button } from '@/design_system/inputs';
import { Input } from '@/design_system/inputs';
import { Card } from '@/design_system/layout';

type Props = { cliReady?: boolean };

export function InstallPlugin({ cliReady = true }: Props = {}) {
  const value = usePluginActionStore((s) => s.installInput);
  const pending = usePluginActionStore((s) => s.installPending);
  const error = usePluginActionStore((s) => s.installError);
  const success = usePluginActionStore((s) => s.installSuccess);
  const setValue = usePluginActionStore((s) => s.setInstallInput);
  const setPending = usePluginActionStore((s) => s.setInstallPending);
  const setError = usePluginActionStore((s) => s.setInstallError);
  const setSuccess = usePluginActionStore((s) => s.setInstallSuccess);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const spec = value.trim();
    if (!spec || pending) return;
    setError(null);
    setSuccess(null);
    setPending(true);
    startTransition(async () => {
      const result = await install(spec);
      if (result.success) {
        setSuccess(`Installed ${spec}`);
        setValue('');
        router.refresh();
      } else {
        setError(result.error);
      }
      setPending(false);
    });
  };

  return (
    <Card asChild className="gap-2 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-muted-foreground text-xs tracking-wide uppercase">
            Install plugin
          </label>
          <span className="text-muted-foreground text-[10px]">
            format: <code className="font-mono">name@marketplace</code>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. context7@claude-plugins-official"
            className="min-w-60 flex-1 font-mono"
            disabled={pending || !cliReady}
          />
          <Button
            type="submit"
            disabled={pending || !value.trim() || !cliReady}
            title={!cliReady ? 'Configure Claude CLI in AI Sources settings first' : undefined}
          >
            {pending ? 'Installing…' : 'Install'}
          </Button>
        </div>
        {!cliReady && (
          <p className="text-[11px] text-red-300/80">
            Claude CLI not configured. Configure its path in AI Sources settings.
          </p>
        )}
        {error && (
          <pre className="max-h-32 overflow-auto rounded-lg bg-red-900/30 p-3 text-[11px] whitespace-pre-wrap text-red-200">
            {error}
          </pre>
        )}
        {success && <p className="text-[11px] text-green-400">{success}</p>}
      </form>
    </Card>
  );
}
