type Props = { readme: string };

export function ReadmeSection({ readme }: Props) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">README.md</h2>
      <pre className="max-h-150 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
        {readme}
      </pre>
    </section>
  );
}
