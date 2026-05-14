'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { setActiveSourceAction } from '@/features/select-active-source/api/activeSource';
import type { AiSource } from '@/entities/ai-source';

type Props = { sources: AiSource[]; activeId: string };

export function Sidebar({ sources, activeId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const select = (id: string) => {
    if (id === activeId) return;
    startTransition(async () => {
      await setActiveSourceAction(id);
      router.refresh();
    });
  };

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-panel/40">
      <div className="sticky top-14.25 flex flex-col gap-1 p-4">
        <div className="mb-1 px-3 text-[10px] uppercase tracking-wide text-muted">
          Active source
        </div>
        {sources.length === 0 ? (
          <p className="px-3 text-xs text-muted">No sources.</p>
        ) : (
          sources.map((s) => {
            const active = s.id === activeId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => select(s.id)}
                disabled={isPending}
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition disabled:opacity-60 ${
                  active ? 'bg-panel text-white' : 'text-muted hover:bg-panel hover:text-white'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                      s.exists ? 'bg-accent' : 'bg-red-500/60'
                    }`}
                  />
                  <span className="truncate">{s.name}</span>
                </span>
                <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] text-muted">
                  {s.kind === 'auto' ? 'auto' : 'custom'}
                </span>
              </button>
            );
          })
        )}

        <Link
          href="/ai-sources/settings"
          className={`mt-3 rounded-lg px-3 py-2 text-sm transition ${
            pathname === '/ai-sources/settings'
              ? 'bg-panel text-white'
              : 'text-muted hover:bg-panel hover:text-white'
          }`}
        >
          Settings
        </Link>
      </div>
    </aside>
  );
}
