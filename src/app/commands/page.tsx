import { getAllCommands } from '@/entities/resource';
import { getActiveSource } from '@/entities/active-source';
import { CLAUDE_SOURCE_ID } from '@/entities/ai-source';
import { CommandsClient } from '@/widgets/commands-list/ui/CommandsClient';
import { NonClaudeStub } from '@/widgets/non-claude-stub/ui/NonClaudeStub';

export const dynamic = 'force-dynamic';

export default async function CommandsPage() {
  const active = await getActiveSource();
  if (active.id !== CLAUDE_SOURCE_ID) {
    return <NonClaudeStub resource="Commands" source={active} />;
  }
  const commands = await getAllCommands();
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Slash Commands</h1>
        <p className="text-muted text-sm">
          {commands.length} commands across {new Set(commands.map((c) => c.pluginId)).size} plugins
        </p>
      </header>
      <CommandsClient commands={commands} />
    </main>
  );
}
