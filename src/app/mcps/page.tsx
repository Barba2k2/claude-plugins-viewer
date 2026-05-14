import { getAllMcps } from '@/entities/resource';
import { getActiveSource } from '@/entities/active-source';
import { CLAUDE_SOURCE_ID } from '@/entities/ai-source';
import { McpsClient } from '@/widgets/mcps-list/ui/McpsClient';
import { NonClaudeStub } from '@/widgets/non-claude-stub/ui/NonClaudeStub';

export const dynamic = 'force-dynamic';

export default async function McpsPage() {
  const active = await getActiveSource();
  if (active.id !== CLAUDE_SOURCE_ID) {
    return <NonClaudeStub resource="MCP Servers" source={active} />;
  }
  const mcps = await getAllMcps();
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">MCP Servers</h1>
        <p className="text-muted text-sm">
          {mcps.length} servers across {new Set(mcps.map((m) => m.pluginId)).size} plugins
        </p>
      </header>
      <McpsClient mcps={mcps} />
    </main>
  );
}
