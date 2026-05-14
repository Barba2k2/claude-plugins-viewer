import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPluginById, readPluginReadme } from '@/entities/plugin';
import { PluginToggle } from '@/features/toggle-plugin/ui/PluginToggle';
import { UninstallPlugin } from '@/features/uninstall-plugin/ui/UninstallPlugin';
import { UpdatePlugin } from '@/features/update-plugin/ui/UpdatePlugin';

export const dynamic = 'force-dynamic';

type Params = { id: string };

export default async function PluginDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const plugin = await getPluginById(decoded);
  if (!plugin) return notFound();

  const readme = plugin.hasReadme ? await readPluginReadme(plugin.installPath) : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-white"
      >
        ← Back to all plugins
      </Link>

      <header className="mb-8 flex flex-col gap-3 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-white">{plugin.name}</h1>
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted">
            v{plugin.version}
          </span>
          <span className="ml-auto flex items-center gap-2 text-xs text-muted">
            {plugin.enabled ? 'Enabled' : 'Disabled'}
            <PluginToggle id={plugin.id} enabled={plugin.enabled} size="md" />
          </span>
        </div>
        {plugin.description && <p className="text-base text-muted">{plugin.description}</p>}
        <div className="flex flex-wrap gap-2 text-[11px] text-muted">
          <Badge>marketplace: {plugin.marketplace}</Badge>
          <Badge>scope: {plugin.scope}</Badge>
          {plugin.license && <Badge>{plugin.license}</Badge>}
          {plugin.author && <Badge>by {plugin.author}</Badge>}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted">
          {plugin.homepage && (
            <a
              href={plugin.homepage}
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent"
            >
              Homepage ↗
            </a>
          )}
          {plugin.repository && (
            <a
              href={plugin.repository}
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent"
            >
              Repository ↗
            </a>
          )}
        </div>
      </header>

      <section className="mb-8 flex flex-wrap justify-end gap-3">
        <UpdatePlugin id={plugin.id} />
        <UninstallPlugin id={plugin.id} name={plugin.name} />
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Skills" value={plugin.counts.skills} />
        <StatCard label="Agents" value={plugin.counts.agents} />
        <StatCard label="Commands" value={plugin.counts.commands} />
        <StatCard label="Hooks" value={plugin.counts.hooks} />
        <StatCard label="MCP Servers" value={plugin.counts.mcps} />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ResourceList title="Skills" items={plugin.resources.skills} />
        <ResourceList title="Agents" items={plugin.resources.agents} />
        <ResourceList title="Commands" items={plugin.resources.commands} />
        <ResourceList title="Hooks" items={plugin.resources.hooks} />
        <ResourceList title="MCP Servers" items={plugin.resources.mcps} />
        {plugin.keywords.length > 0 && <ResourceList title="Keywords" items={plugin.keywords} />}
      </section>

      <section className="mb-8 rounded-xl border border-border bg-panel p-5 text-sm">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">Install info</h2>
        <dl className="grid grid-cols-1 gap-2 font-mono text-xs md:grid-cols-2">
          <Info label="ID" value={plugin.id} />
          <Info label="Installed" value={fmtDate(plugin.installedAt)} />
          <Info label="Last updated" value={fmtDate(plugin.lastUpdated)} />
          {plugin.gitCommitSha && <Info label="Commit" value={plugin.gitCommitSha.slice(0, 12)} />}
          <Info label="Path" value={plugin.installPath} wide />
        </dl>
      </section>

      {readme && (
        <section className="rounded-xl border border-border bg-panel p-5">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">README.md</h2>
          <pre className="max-h-150 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">
            {readme}
          </pre>
        </section>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

function ResourceList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <h3 className="mb-2 text-xs uppercase tracking-wide text-muted">
        {title} ({items.length})
      </h3>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md border border-border bg-bg px-2 py-1 font-mono text-[11px] text-white"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border px-2 py-0.5 font-mono">{children}</span>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <dt className="text-[10px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="break-all text-white">{value}</dd>
    </div>
  );
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
