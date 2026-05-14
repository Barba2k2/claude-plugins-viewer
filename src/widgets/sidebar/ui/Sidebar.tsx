'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { setActiveSourceAction } from '@/features/select-active-source/api/activeSource';
import type { AiSource } from '@/entities/ai-source';
import { Badge } from '@/design_system/feedback';

export type PlatformBadgeInfo = {
  prettyOs: string;
  shell: string;
  arch: string;
};

type Props = { sources: AiSource[]; activeId: string; platform: PlatformBadgeInfo };

export function Sidebar({ sources, activeId, platform }: Props) {
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
    <aside className="bg-card/40 w-60 shrink-0 border-r">
      <div className="sticky top-14.25 flex flex-col gap-1 p-4">
        <div className="text-muted-foreground mb-1 px-3 text-[10px] tracking-wide uppercase">
          Active source
        </div>
        {sources.length === 0 ? (
          <p className="text-muted-foreground px-3 text-xs">No sources.</p>
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
                  active
                    ? 'bg-card text-foreground'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground'
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
                <Badge variant="outline" className="font-mono text-[9px]">
                  {s.kind === 'auto' ? 'auto' : 'custom'}
                </Badge>
              </button>
            );
          })
        )}

        <Link
          href="/ai-sources/settings"
          className={`mt-3 rounded-lg px-3 py-2 text-sm transition ${
            pathname === '/ai-sources/settings'
              ? 'bg-card text-foreground'
              : 'text-muted-foreground hover:bg-card hover:text-foreground'
          }`}
        >
          Settings
        </Link>

        <div
          className="text-muted-foreground/70 mt-4 px-3 font-mono text-[10px] tracking-wide"
          title={`${platform.prettyOs} · ${platform.shell} · ${platform.arch}`}
        >
          {platform.prettyOs} · {platform.shell} · {platform.arch}
        </div>
      </div>
    </aside>
  );
}
