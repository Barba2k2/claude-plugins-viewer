type Props = { label: string; value: number };

export function CountStat({ label, value }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
