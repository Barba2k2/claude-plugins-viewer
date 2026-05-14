'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addCustomSourceAction } from '@/features/manage-ai-sources/api/aiSources';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';
import { Button } from '@/design_system/inputs';
import { Input } from '@/design_system/inputs';
import { Card } from '@/design_system/layout';

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
    <Card asChild className="gap-2 p-4">
      <form onSubmit={submit}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name (optional)"
            className="flex-1"
          />
          <Input
            type="text"
            value={pathInput}
            onChange={(e) => setPath(e.target.value)}
            placeholder="~/.some-ai or absolute path"
            className="flex-1 font-mono"
          />
          <Button type="submit" disabled={isPending || !pathInput.trim()}>
            {isPending ? 'Adding…' : 'Add source'}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          If name is empty, folder name in UPPERCASE is used.
        </p>
        {error && <p className="text-[11px] text-red-300">{error}</p>}
      </form>
    </Card>
  );
}
