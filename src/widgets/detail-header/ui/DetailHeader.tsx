import Link from 'next/link';
import { Badge } from '@/design_system/feedback';

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
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        ← {backLabel}
      </Link>
      <header className="mb-8 flex flex-col gap-3 border-b pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-3xl font-semibold text-foreground">{title}</h1>
          {badge && (
            <Badge className="bg-accent/10 text-accent font-mono">
              {badge}
            </Badge>
          )}
        </div>
        {description && <p className="text-base text-muted-foreground">{description}</p>}
        <div className="text-xs text-muted-foreground">
          From plugin{' '}
          <Link
            href={`/plugins/${encodeURIComponent(pluginId)}`}
            className="font-mono text-foreground hover:text-accent"
          >
            {pluginName}
          </Link>
        </div>
      </header>
    </>
  );
}
