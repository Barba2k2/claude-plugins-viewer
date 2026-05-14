import Link from 'next/link';
import type { AiSource } from '@/entities/ai-source';

type Props = { resource: string; source: AiSource };

export function NonClaudeStub({ resource, source }: Props) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">{resource}</h1>
        <p className="text-sm text-muted">
          Active source: <span className="font-mono text-white">{source.name}</span>
        </p>
      </header>

      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="text-sm text-white">
          <span className="font-mono">{source.name}</span> does not expose {resource.toLowerCase()}.
        </p>
        <p className="mt-2 text-sm text-muted">
          {resource} is a Claude Code concept. Browse this source&apos;s files in{' '}
          <Link className="text-accent hover:underline" href="/memory">
            Memory
          </Link>{' '}
          or open it in{' '}
          <Link className="text-accent hover:underline" href={`/ai-sources/${source.id}`}>
            Files
          </Link>
          .
        </p>
        <p className="mt-3 font-mono text-[11px] text-muted">{source.path}</p>
      </div>
    </main>
  );
}
