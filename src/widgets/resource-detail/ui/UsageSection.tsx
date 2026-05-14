type Props = { command: string };

export function UsageSection({ command }: Props) {
  return (
    <section className="mb-6 rounded-xl border bg-card p-4">
      <h2 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Usage</h2>
      <code className="rounded bg-background px-2 py-1 font-mono text-sm text-accent">
        {command}
      </code>
    </section>
  );
}
