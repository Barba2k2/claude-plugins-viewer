type Props = { title?: string; command: string };

export function CommandSection({ title = 'Command', command }: Props) {
  return (
    <section className="mb-6 rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">{title}</h2>
      <code className="block break-all rounded-lg bg-background p-3 font-mono text-xs text-foreground">
        {command}
      </code>
    </section>
  );
}
