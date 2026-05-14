import Link from 'next/link';

type Props = {
  backHref: string;
  backLabel: string;
  pluginId: string;
  pluginName: string;
  title: string;
  badge?: string;
  description?: string;
};

export function DetailHeader({
  backHref,
  backLabel,
  pluginId,
  pluginName,
  title,
  badge,
  description,
}: Props) {
  return (
    <>
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-white"
      >
        ← {backLabel}
      </Link>
      <header className="mb-8 flex flex-col gap-3 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-3xl font-semibold text-white">{title}</h1>
          {badge && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-base text-muted">{description}</p>}
        <div className="text-xs text-muted">
          From plugin{' '}
          <Link
            href={`/plugins/${encodeURIComponent(pluginId)}`}
            className="font-mono text-white hover:text-accent"
          >
            {pluginName}
          </Link>
        </div>
      </header>
    </>
  );
}
