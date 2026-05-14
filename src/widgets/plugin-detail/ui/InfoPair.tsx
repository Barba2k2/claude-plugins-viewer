type Props = { label: string; value: string; wide?: boolean };

export function InfoPair({ label, value, wide }: Props) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="break-all text-foreground">{value}</dd>
    </div>
  );
}
