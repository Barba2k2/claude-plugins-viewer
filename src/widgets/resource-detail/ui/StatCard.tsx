type Props = { label: string; value: string; truncate?: boolean };

export function StatCard({ label, value, truncate }: Props) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-xs text-foreground ${truncate ? 'truncate' : ''}`}>
        {value}
      </div>
    </div>
  );
}
