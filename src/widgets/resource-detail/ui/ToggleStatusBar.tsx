import type { ReactNode } from 'react';

type Props = {
  enabled: boolean;
  label: ReactNode;
  toggle: ReactNode;
};

export function ToggleStatusBar({ enabled, label, toggle }: Props) {
  return (
    <section className="mb-6 flex items-center justify-between rounded-xl border bg-card p-4">
      <span className={`text-sm ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
      {toggle}
    </section>
  );
}
