import { CustomSourceRow } from './CustomSourceRow';
import type { CustomSource } from '@/entities/ai-source';

type Row = { source: CustomSource; exists: boolean; fileCount: number };

type Props = { rows: Row[] };

export function CustomSourcesSection({ rows }: Props) {
  return (
    <section>
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
        Custom sources ({rows.length})
      </h2>
      {rows.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
          No custom sources yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <CustomSourceRow
              key={row.source.id}
              source={row.source}
              exists={row.exists}
              fileCount={row.fileCount}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
