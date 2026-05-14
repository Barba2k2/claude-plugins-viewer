import { getAllAgents } from '@/entities/resource';
import { getActiveSource } from '@/entities/active-source';
import { CLAUDE_SOURCE_ID } from '@/entities/ai-source';
import { AgentsClient } from '@/widgets/agents-list/ui/AgentsClient';
import { NonClaudeStub } from '@/widgets/non-claude-stub/ui/NonClaudeStub';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const active = await getActiveSource();
  if (active.id !== CLAUDE_SOURCE_ID) {
    return <NonClaudeStub resource="Agents" source={active} />;
  }
  const agents = await getAllAgents();
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Agents</h1>
        <p className="text-muted text-sm">
          {agents.length} agents across {new Set(agents.map((a) => a.pluginId)).size} plugins
        </p>
      </header>
      <AgentsClient agents={agents} />
    </main>
  );
}
