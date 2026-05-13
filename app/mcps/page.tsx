import { getAllMcps } from '@/lib/resources';
import { McpsClient } from './McpsClient';

export const dynamic = 'force-dynamic';

export default async function McpsPage() {
  const mcps = await getAllMcps();
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">MCP Servers</h1>
        <p className="text-sm text-muted">
          {mcps.length} servers across {new Set(mcps.map((m) => m.pluginId)).size} plugins
        </p>
      </header>
      <McpsClient mcps={mcps} />
    </main>
  );
}
