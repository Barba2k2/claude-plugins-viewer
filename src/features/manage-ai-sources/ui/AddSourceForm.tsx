'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addCustomSourceAction } from '@/features/manage-ai-sources/api/aiSources';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';

export function AddSourceForm() {
  const name = useAiSourcesStore((s) => s.addName);
  const pathInput = useAiSourcesStore((s) => s.addPath);
  const error = useAiSourcesStore((s) => s.addError);
  const setName = useAiSourcesStore((s) => s.setAddName);
  const setPath = useAiSourcesStore((s) => s.setAddPath);
  const setError = useAiSourcesStore((s) => s.setAddError);
  const reset = useAiSourcesStore((s) => s.resetAdd);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathInput.trim()) {
      setError('path required');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await addCustomSourceAction(name, pathInput);
      if (!result.success) {
        setError(result.error);
        return;
      }
      reset();
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name (optional)"
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
        <input
          type="text"
          value={pathInput}
          onChange={(e) => setPath(e.target.value)}
          placeholder="~/.some-ai or absolute path"
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-white outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending || !pathInput.trim()}
          className="rounded-lg border border-accent bg-accent/20 px-4 py-2 text-sm text-white transition hover:bg-accent/30 disabled:opacity-50"
        >
          {isPending ? 'Adding…' : 'Add source'}
        </button>
      </div>
      <p className="text-[11px] text-muted">
        If name is empty, folder name in UPPERCASE is used.
      </p>
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </form>
  );
}
