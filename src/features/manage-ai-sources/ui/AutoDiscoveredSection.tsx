import { DefaultSourceRow } from './DefaultSourceRow';
import type { KnownTool } from '@/entities/ai-source';

type Row = {
  tool: KnownTool;
  disabled: boolean;
  nameOverride: string | null;
  exists: boolean;
  fileCount: number;
  resolvedPath: string;
};

type Props = { rows: Row[] };

export function AutoDiscoveredSection({ rows }: Props) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
        Auto-discovered ({rows.length})
      </h2>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <DefaultSourceRow
            key={row.tool.id}
            tool={row.tool}
            disabled={row.disabled}
            nameOverride={row.nameOverride}
            exists={row.exists}
            fileCount={row.fileCount}
            resolvedPath={row.resolvedPath}
          />
        ))}
      </ul>
    </section>
  );
}
