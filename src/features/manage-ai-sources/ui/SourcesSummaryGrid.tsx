import type { AiSource } from '@/entities/ai-source';
import { Card } from '@/design_system/layout';
import { Badge } from '@/design_system/feedback';

type Props = { sources: AiSource[] };

export function SourcesSummaryGrid({ sources }: Props) {
  return (
    <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {sources.map((s) => (
        <Card key={s.id} className="gap-1 py-3 px-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium text-foreground">{s.name}</span>
            <Badge variant="outline" className="font-mono text-[9px]">
              {s.kind}
            </Badge>
          </div>
          <p className="truncate font-mono text-[10px] text-muted-foreground">{s.path}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {s.exists ? `${s.fileCount} file${s.fileCount === 1 ? '' : 's'}` : 'not found'}
          </p>
        </Card>
      ))}
    </section>
  );
}
