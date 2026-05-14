type Props = { command: string; args?: string[] };

export function CommandWithArgsSection({ command, args }: Props) {
  return (
    <section className="mb-6 rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Command</h2>
      <code className="block break-all rounded-lg bg-background p-3 font-mono text-xs text-foreground">
        {command}
        {args && args.length > 0 && ' ' + args.join(' ')}
      </code>
      {args && args.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            {args.length} args
          </summary>
          <ul className="mt-2 flex flex-col gap-1">
            {args.map((a, i) => (
              <li
                key={i}
                className="rounded bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground"
              >
                [{i}] {a}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
