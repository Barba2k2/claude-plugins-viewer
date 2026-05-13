import { getGlobalMemories, getProjects } from '@/lib/memory';
import { MemoryFileRow } from './MemoryFileRow';
import { NewMemoryForm } from './NewMemoryForm';
import { CollapsibleSection } from './CollapsibleSection';
import { ProjectMemoryRow } from './ProjectMemoryRow';

export const dynamic = 'force-dynamic';

export default async function MemoryPage() {
  const [globals, projects] = await Promise.all([getGlobalMemories(), getProjects()]);

  const claudeMd = globals.find((g) => g.scope === 'global-claude-md');
  const rules = globals.filter((g) => g.scope === 'global-rule');

  const rulesBySubdir = new Map<string, typeof rules>();
  for (const r of rules) {
    const parts = r.relativePath.split('/');
    const subdir = parts[1] ?? '';
    if (!rulesBySubdir.has(subdir)) rulesBySubdir.set(subdir, []);
    rulesBySubdir.get(subdir)!.push(r);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Memory</h1>
        <p className="text-sm text-muted">
          Edit Claude Code instructions and auto-memory. Changes write directly to{' '}
          <code className="font-mono">~/.claude/</code>.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">Global instructions</h2>
        {claudeMd && (
          <ul className="mb-4">
            <MemoryFileRow file={claudeMd} canDelete={false} />
          </ul>
        )}
        {[...rulesBySubdir.entries()].map(([subdir, files]) => (
          <CollapsibleSection
            key={subdir}
            sectionKey={`rules:${subdir}`}
            title={`rules/${subdir}/ (${files.length})`}
            trailing={
              <NewMemoryForm
                scopeKey={`global-rule:${subdir}`}
                scope={{ kind: 'global-rule', subdir }}
                label={`rule in ${subdir}`}
              />
            }
          >
            <ul className="flex flex-col gap-2">
              {files.map((f) => (
                <MemoryFileRow key={f.path} file={f} />
              ))}
            </ul>
          </CollapsibleSection>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">
          Per-project ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <p className="rounded-xl border border-border bg-panel p-6 text-center text-muted">
            No projects with memory or CLAUDE.md found.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {projects.map((p) => (
              <ProjectMemoryRow key={p.id} project={p} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
