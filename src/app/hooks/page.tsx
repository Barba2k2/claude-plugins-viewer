import { getAllHooks } from '@/entities/resource';
import { getActiveSource } from '@/entities/active-source';
import { CLAUDE_SOURCE_ID } from '@/entities/ai-source';
import { HooksClient } from '@/widgets/hooks-list/ui/HooksClient';
import { NonClaudeStub } from '@/widgets/non-claude-stub/ui/NonClaudeStub';

export const dynamic = 'force-dynamic';

export default async function HooksPage() {
  const active = await getActiveSource();
  if (active.id !== CLAUDE_SOURCE_ID) {
    return <NonClaudeStub resource="Hooks" source={active} />;
  }
  const hooks = await getAllHooks();
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Hooks</h1>
        <p className="text-muted text-sm">
          {hooks.length} hook entries · {new Set(hooks.map((h) => h.event)).size} distinct events ·{' '}
          {new Set(hooks.map((h) => h.pluginId)).size} plugins
        </p>
      </header>
      <HooksClient hooks={hooks} />
    </main>
  );
}
