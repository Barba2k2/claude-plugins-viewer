type Props = { url: string };

export function UrlSection({ url }: Props) {
  return (
    <section className="mb-6 rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">URL</h2>
      <code className="block break-all rounded-lg bg-background p-3 font-mono text-xs text-foreground">
        {url}
      </code>
    </section>
  );
}
