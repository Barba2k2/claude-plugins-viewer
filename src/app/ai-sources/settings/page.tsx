import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import { ALL_TOOLS, KNOWN_TOOLS, getSourcesConfig } from '@/entities/ai-source';
import { AutoDiscoveredSection } from '@/features/manage-ai-sources/ui/AutoDiscoveredSection';
import { CustomSourcesSection } from '@/features/manage-ai-sources/ui/CustomSourcesSection';
import { AddSourceForm } from '@/features/manage-ai-sources/ui/AddSourceForm';
import {
  CliDetectionSection,
  type CliDetectionRowData,
} from '@/features/manage-ai-sources/ui/CliDetectionSection';
import { getCliStatus, getToolCliSpec, getPlatformInfo } from '@/shared/lib/platform';

export const dynamic = 'force-dynamic';

async function inspectDir(p: string): Promise<{ exists: boolean; fileCount: number }> {
  try {
    const stat = await fs.stat(p);
    if (!stat.isDirectory()) return { exists: false, fileCount: 0 };
    let count = 0;
    async function walk(dir: string, depth: number): Promise<void> {
      if (depth > 6) return;
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') && dir !== p) continue;
        if (
          ['node_modules', '.git', 'dist', 'build', '.next', 'cache', 'logs'].includes(entry.name)
        )
          continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(full, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (ext === '.md' || ext === '.json' || ext === '.toml') count++;
        }
      }
    }
    await walk(p, 0);
    return { exists: true, fileCount: count };
  } catch {
    return { exists: false, fileCount: 0 };
  }
}

export default async function SettingsPage() {
  const config = await getSourcesConfig();
  const home = os.homedir();
  const disabledSet = new Set(config.disabledDefaults);

  const defaultRows = await Promise.all(
    KNOWN_TOOLS.map(async (tool) => {
      const resolvedPath = path.join(home, tool.dir);
      const info = await inspectDir(resolvedPath);
      return {
        tool,
        disabled: disabledSet.has(tool.id),
        nameOverride: config.nameOverrides[tool.id] ?? null,
        resolvedPath,
        ...info,
      };
    }),
  );

  const customRows = await Promise.all(
    config.customSources.map(async (s) => {
      const info = await inspectDir(s.path);
      return { source: s, ...info };
    }),
  );

  const platform = await getPlatformInfo();
  const cliCapableTools = ALL_TOOLS.filter((tool) => getToolCliSpec(tool.id) !== null);
  const cliRows: CliDetectionRowData[] = await Promise.all(
    cliCapableTools.map(async (tool) => {
      const status = await getCliStatus(tool.id);
      const displayName = config.nameOverrides[tool.id] ?? tool.defaultName;
      return {
        toolId: tool.id,
        displayName,
        status,
        hasOverride: !!config.cliOverrides[tool.id],
      };
    }),
  );
  const showWslControls = platform.os === 'win32';

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-semibold">AI Sources Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage auto-discovered tools and add custom directories. Names default to UPPERCASE folder
          name; custom names are shown as typed.
        </p>
      </header>

      <CliDetectionSection
        rows={cliRows}
        showWslControls={showWslControls}
        preferWsl={config.preferWsl}
      />

      <AutoDiscoveredSection rows={defaultRows} />

      <section className="mb-10">
        <h2 className="text-muted-foreground mb-3 text-xs tracking-wide uppercase">
          Add custom source
        </h2>
        <AddSourceForm />
      </section>

      <CustomSourcesSection rows={customRows} />
    </main>
  );
}
