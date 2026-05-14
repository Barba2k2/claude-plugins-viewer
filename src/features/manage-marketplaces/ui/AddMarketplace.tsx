'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addMarketplaceAction } from '@/features/manage-marketplaces/api/marketplaces';
import { useMarketplaceStore } from '@/features/manage-marketplaces/model/marketplaceStore';
import { Button } from '@/design_system/inputs';
import { Input } from '@/design_system/inputs';
import { Card } from '@/design_system/layout';

export function AddMarketplace() {
  const value = useMarketplaceStore((s) => s.addInput);
  const pending = useMarketplaceStore((s) => s.addPending);
  const error = useMarketplaceStore((s) => s.addError);
  const success = useMarketplaceStore((s) => s.addSuccess);
  const setValue = useMarketplaceStore((s) => s.setAddInput);
  const setPending = useMarketplaceStore((s) => s.setAddPending);
  const setError = useMarketplaceStore((s) => s.setAddError);
  const setSuccess = useMarketplaceStore((s) => s.setAddSuccess);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const source = value.trim();
    if (!source || pending) return;
    setError(null);
    setSuccess(null);
    setPending(true);
    startTransition(async () => {
      const result = await addMarketplaceAction(source);
      if (result.success) {
        setSuccess(`Added ${source}`);
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
          <label className="text-xs uppercase tracking-wide text-muted-foreground">
            Add marketplace
          </label>
          <span className="text-[10px] text-muted-foreground">
            GitHub repo <code className="font-mono">owner/repo</code>, URL, or local path
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. anthropics/claude-plugins-official"
            className="min-w-70 flex-1 font-mono"
            disabled={pending}
          />
          <Button type="submit" disabled={pending || !value.trim()}>
            {pending ? 'Adding…' : 'Add'}
          </Button>
        </div>
        {error && (
          <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-red-900/30 p-3 text-[11px] text-red-200">
            {error}
          </pre>
        )}
        {success && <p className="text-[11px] text-green-400">{success}</p>}
      </form>
    </Card>
  );
}
