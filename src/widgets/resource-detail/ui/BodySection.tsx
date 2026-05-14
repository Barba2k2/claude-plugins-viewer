type Props = {
  title: string;
  body: string;
  maxH?: string;
};

export function BodySection({ title, body, maxH = 'max-h-175' }: Props) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">{title}</h2>
      <pre
        className={`${maxH} overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground`}
      >
        {body.trim() || <span className="italic">(empty)</span>}
      </pre>
    </section>
  );
}
