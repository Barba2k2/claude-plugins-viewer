type Props = { source: string };

export function ScriptSourceSection({ source }: Props) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
        Script source ({source.split('\n').length} lines)
      </h2>
      <pre className="max-h-175 overflow-auto whitespace-pre-wrap rounded-lg bg-background p-3 font-mono text-xs text-muted-foreground">
        {source}
      </pre>
    </section>
  );
}
