import { getAllCommands } from '@/lib/resources';
import { CommandsClient } from './CommandsClient';

export const dynamic = 'force-dynamic';

export default async function CommandsPage() {
  const commands = await getAllCommands();
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Slash Commands</h1>
        <p className="text-sm text-muted">
          {commands.length} commands across{' '}
          {new Set(commands.map((c) => c.pluginId)).size} plugins
        </p>
      </header>
      <CommandsClient commands={commands} />
    </main>
  );
}
