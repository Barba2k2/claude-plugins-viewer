'use client';

import { useMemoryStore } from '@/lib/memoryStore';

type Props = {
  sectionKey: string;
  title: React.ReactNode;
  trailing?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function CollapsibleSection({
  sectionKey,
  title,
  trailing,
  defaultOpen = true,
  children,
}: Props) {
  const collapsed = useMemoryStore((s) => s.sectionCollapsed);
  const setCollapsed = useMemoryStore((s) => s.setSectionCollapsed);

  const stored = collapsed[sectionKey];
  const open = stored === undefined ? defaultOpen : !stored;

  const toggle = () => setCollapsed(sectionKey, open);

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={toggle}
          className="group flex flex-1 items-center gap-2 text-left"
          aria-expanded={open}
        >
          <Chevron open={open} />
          <span className="font-mono text-xs text-muted group-hover:text-white">{title}</span>
        </button>
        {trailing}
      </div>
      {open && children}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-muted transition-transform duration-200 ${open ? 'rotate-90' : 'rotate-0'}`}
      aria-hidden="true"
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}
