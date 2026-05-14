type Props = { keys: string[] };

export function EnvKeysSection({ keys }: Props) {
  if (keys.length === 0) return null;
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
        Required env vars ({keys.length})
      </h2>
      <ul className="flex flex-wrap gap-2">
        {keys.map((k) => (
          <li
            key={k}
            className="rounded-md border bg-background px-2 py-1 font-mono text-[11px] text-foreground"
          >
            {k}
          </li>
        ))}
      </ul>
    </section>
  );
}
