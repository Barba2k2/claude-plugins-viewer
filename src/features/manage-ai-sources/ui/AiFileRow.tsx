'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  readAiFileAction,
  saveAiFileAction,
  deleteAiFileAction,
} from '@/features/manage-ai-sources/api/aiSources';
import { useAiSourcesStore } from '@/features/manage-ai-sources/model/aiSourcesStore';
import type { AiFile } from '@/entities/ai-source';
import { Chevron } from '@/shared/ui/Chevron';
import { Button } from '@/design_system/inputs';
import { Badge } from '@/design_system/feedback';

type Props = { file: AiFile; showSource?: string };

export function AiFileRow({ file, showSource }: Props) {
  const key = file.path;
  const drafts = useAiSourcesStore((s) => s.drafts);
  const pending = useAiSourcesStore((s) => s.pending);
  const errors = useAiSourcesStore((s) => s.errors);
  const expanded = useAiSourcesStore((s) => s.expanded);
  const setDraft = useAiSourcesStore((s) => s.setDraft);
  const clearDraft = useAiSourcesStore((s) => s.clearDraft);
  const setPending = useAiSourcesStore((s) => s.setPending);
  const setError = useAiSourcesStore((s) => s.setError);
  const setExpanded = useAiSourcesStore((s) => s.setExpanded);

  const draft = drafts[key];
  const isPending = pending[key] ?? false;
  const error = errors[key] ?? null;
  const isOpen = expanded[key] ?? false;

  const [, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    if (isOpen) {
      setExpanded(key, false);
      return;
    }
    setExpanded(key, true);
    if (draft !== undefined) return;
    setPending(key, true);
    setError(key, null);
    startTransition(async () => {
      const result = await readAiFileAction(file.sourceId, key);
      if (result.success) {
        setDraft(key, result.data);
      } else {
        setError(key, result.error);
      }
      setPending(key, false);
    });
  };

  const save = () => {
    if (draft === undefined) return;
    setPending(key, true);
    setError(key, null);
    startTransition(async () => {
      const result = await saveAiFileAction(file.sourceId, key, draft);
      if (!result.success) {
        setError(key, result.error);
      }
      setPending(key, false);
      router.refresh();
    });
  };

  const remove = () => {
    setPending(key, true);
    setError(key, null);
    startTransition(async () => {
      const result = await deleteAiFileAction(file.sourceId, key);
      if (!result.success) {
        setError(key, result.error);
        setPending(key, false);
        return;
      }
      clearDraft(key);
      setExpanded(key, false);
      setPending(key, false);
      router.refresh();
    });
  };

  return (
    <li className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          className="group flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          <span className="mt-0.5 shrink-0">
            <Chevron open={isOpen} size={16} />
          </span>
          <span className="min-w-0 font-mono text-sm break-all text-foreground group-hover:text-accent">
            {file.relativePath}
          </span>
        </button>
        {showSource && (
          <Badge variant="outline" className="font-mono text-[10px]">
            {showSource}
          </Badge>
        )}
        <Badge variant="outline" className="font-mono text-[10px]">
          {file.ext.slice(1)}
        </Badge>
        <span className="font-mono text-[10px] text-muted-foreground">{formatBytes(file.size)}</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {new Date(file.mtime).toLocaleString()}
        </span>
        <Button type="button" variant="destructive" size="xs" onClick={remove} disabled={isPending}>
          Delete
        </Button>
      </div>
      {isOpen && (
        <div className="flex flex-col gap-2">
          {isPending && draft === undefined ? (
            <p className="text-[11px] text-muted-foreground">Loading…</p>
          ) : (
            <textarea
              value={draft ?? ''}
              onChange={(e) => setDraft(key, e.target.value)}
              spellCheck={false}
              rows={Math.min(30, Math.max(8, (draft ?? '').split('\n').length + 2))}
              className="w-full resize-y rounded-lg border bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-accent"
            />
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={save} disabled={isPending || draft === undefined}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      )}
      {error && (
        <pre className="max-h-32 overflow-auto rounded bg-red-900/30 p-2 text-[10px] whitespace-pre-wrap text-red-200">
          {error}
        </pre>
      )}
    </li>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
