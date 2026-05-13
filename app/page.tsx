import { getPlugins } from '@/lib/plugins';
import { PluginGrid } from './PluginGrid';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const plugins = await getPlugins();

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
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          <h1 className="text-2xl font-semibold text-white">Claude Plugins Viewer</h1>
        </div>
        <p className="text-sm text-muted">
          {plugins.length} plugins installed · {totals.skills} skills · {totals.agents} agents ·{' '}
          {totals.commands} commands · {totals.hooks} hooks · {totals.mcps} MCP servers
        </p>
      </header>

      <PluginGrid plugins={plugins} />

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted">
        Reading from <span className="font-mono">~/.claude/plugins/installed_plugins.json</span>
      </footer>
    </main>
  );
}
