'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { install } from './actions/plugins';
import { usePluginActionStore } from '@/lib/pluginActionStore';

export function InstallPlugin() {
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs uppercase tracking-wide text-muted">Install plugin</label>
        <span className="text-[10px] text-muted">
          format: <code className="font-mono">name@marketplace</code>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. context7@claude-plugins-official"
          className="min-w-[240px] flex-1 rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm outline-none focus:border-accent"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="rounded-lg border border-accent bg-accent/20 px-4 py-2 text-sm text-white transition hover:bg-accent/30 disabled:opacity-50"
        >
          {pending ? 'Installing…' : 'Install'}
        </button>
      </div>
      {error && (
        <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-red-900/30 p-3 text-[11px] text-red-200">
          {error}
        </pre>
      )}
      {success && <p className="text-[11px] text-green-400">{success}</p>}
    </form>
  );
}
