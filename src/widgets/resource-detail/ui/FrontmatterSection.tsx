type Props = {
  title?: string;
  entries: [string, string][];
};

export function FrontmatterSection({ title = 'Frontmatter', entries }: Props) {
  if (entries.length === 0) return null;
  return (
    <section className="mb-6 rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">{title}</h2>
      <dl className="grid grid-cols-1 gap-3 font-mono text-xs md:grid-cols-2">
        {entries.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</dt>
            <dd className="wrap-break-word text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
