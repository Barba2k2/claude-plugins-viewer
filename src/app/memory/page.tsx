import { getGlobalMemories, getProjects, type MemoryFile } from '@/entities/memory';
import { getActiveSource } from '@/entities/active-source';
import { CLAUDE_SOURCE_ID, getSourceFiles } from '@/entities/ai-source';
import { GlobalInstructionsSection } from '@/features/edit-memory/ui/GlobalInstructionsSection';
import { PerProjectSection } from '@/features/edit-memory/ui/PerProjectSection';
import { SourceFileBrowser } from '@/features/manage-ai-sources/ui/SourceFileBrowser';

export const dynamic = 'force-dynamic';

export default async function MemoryPage() {
  const active = await getActiveSource();

  if (active.id !== CLAUDE_SOURCE_ID) {
    const files = active.exists ? await getSourceFiles(active.id) : [];
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Memory</h1>
          <p className="text-sm text-muted-foreground">
            Active source: <span className="font-mono text-foreground">{active.name}</span>
          </p>
          <p className="font-mono text-xs text-muted-foreground">{active.path}</p>
        </header>
        <SourceFileBrowser source={active} files={files} />
      </main>
    );
  }

  const [globals, projects] = await Promise.all([getGlobalMemories(), getProjects()]);

  const claudeMd = globals.find((g) => g.scope === 'global-claude-md');
  const rules = globals.filter((g) => g.scope === 'global-rule');

  const rulesBySubdir = new Map<string, MemoryFile[]>();
  for (const r of rules) {
    const parts = r.relativePath.split('/');
    const subdir = parts[1] ?? '';
    if (!rulesBySubdir.has(subdir)) rulesBySubdir.set(subdir, []);
    rulesBySubdir.get(subdir)!.push(r);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Memory</h1>
        <p className="text-sm text-muted-foreground">
          Edit Claude Code instructions and auto-memory. Changes write directly to{' '}
          <code className="font-mono">~/.claude/</code>.
        </p>
      </header>
      <GlobalInstructionsSection claudeMd={claudeMd} rulesBySubdir={rulesBySubdir} />
      <PerProjectSection projects={projects} />
    </main>
  );
}
