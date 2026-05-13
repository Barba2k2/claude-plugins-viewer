import { getAllAgents } from '@/lib/resources';
import { AgentsClient } from './AgentsClient';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const agents = await getAllAgents();
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Agents</h1>
        <p className="text-sm text-muted">
          {agents.length} agents across {new Set(agents.map((a) => a.pluginId)).size} plugins
        </p>
      </header>
      <AgentsClient agents={agents} />
    </main>
  );
}
