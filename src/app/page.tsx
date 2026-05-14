import { getPlugins } from '@/entities/plugin';
import { getActiveSource } from '@/entities/active-source';
import { CLAUDE_SOURCE_ID, getCliStatus } from '@/entities/ai-source';
import { PluginGrid } from '@/widgets/plugin-grid/ui/PluginGrid';
import { InstallPlugin } from '@/features/install-plugin/ui/InstallPlugin';
import { NonClaudeStub } from '@/widgets/non-claude-stub/ui/NonClaudeStub';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const active = await getActiveSource();
  if (active.id !== CLAUDE_SOURCE_ID) {
    return <NonClaudeStub resource="Plugins" source={active} />;
  }

  const [plugins, claudeCli] = await Promise.all([getPlugins(), getCliStatus('claude')]);

  const totals = plugins.reduce(
    (acc, p) => ({
      skills: acc.skills + p.counts.skills,
      agents: acc.agents + p.counts.agents,
      commands: acc.commands + p.counts.commands,
      hooks: acc.hooks + p.counts.hooks,
      mcps: acc.mcps + p.counts.mcps,
    }),
    { skills: 0, agents: 0, commands: 0, hooks: 0, mcps: 0 },
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="bg-accent inline-block h-2 w-2 rounded-full" />
          <h1 className="text-2xl font-semibold text-white">Claude Plugins Viewer</h1>
        </div>
        <p className="text-muted text-sm">
          {plugins.length} plugins installed · {totals.skills} skills · {totals.agents} agents ·{' '}
          {totals.commands} commands · {totals.hooks} hooks · {totals.mcps} MCP servers
        </p>
      </header>

      <div className="mb-6">
        <InstallPlugin cliReady={claudeCli.found} />
      </div>

      <PluginGrid plugins={plugins} />

      <footer className="border-border text-muted mt-12 border-t pt-6 text-xs">
        Reading from <span className="font-mono">~/.claude/plugins/installed_plugins.json</span>
      </footer>
    </main>
  );
}
