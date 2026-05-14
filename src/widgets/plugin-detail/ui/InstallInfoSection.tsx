import { InfoPair } from './InfoPair';
import type { PluginRecord } from '@/entities/plugin';

type Props = { plugin: PluginRecord };

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function InstallInfoSection({ plugin }: Props) {
  return (
    <section className="mb-8 rounded-xl border bg-card p-5 text-sm">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Install info</h2>
      <dl className="grid grid-cols-1 gap-2 font-mono text-xs md:grid-cols-2">
        <InfoPair label="ID" value={plugin.id} />
        <InfoPair label="Installed" value={fmtDate(plugin.installedAt)} />
        <InfoPair label="Last updated" value={fmtDate(plugin.lastUpdated)} />
        {plugin.gitCommitSha && (
          <InfoPair label="Commit" value={plugin.gitCommitSha.slice(0, 12)} />
        )}
        <InfoPair label="Path" value={plugin.installPath} wide />
      </dl>
    </section>
  );
}
