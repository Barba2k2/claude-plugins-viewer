'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Plugins' },
  { href: '/skills', label: 'Skills' },
  { href: '/agents', label: 'Agents' },
  { href: '/commands', label: 'Commands' },
  { href: '/hooks', label: 'Hooks' },
  { href: '/mcps', label: 'MCP Servers' },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6 py-3">
        <div className="mr-4 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          <span className="text-sm font-medium text-white">Plugins Viewer</span>
        </div>
        {TABS.map((tab) => {
          const active =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                active
                  ? 'bg-panel text-white'
                  : 'text-muted hover:bg-panel hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
