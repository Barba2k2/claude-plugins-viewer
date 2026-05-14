type Props = { title: string; items: string[] };

export function ResourceList({ title, items }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
        {title} ({items.length})
      </h3>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md border bg-background px-2 py-1 font-mono text-[11px] text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
