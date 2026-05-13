import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export type InstalledEntry = {
  scope: string;
  installPath: string;
  version: string;
  installedAt: string;
  lastUpdated: string;
  gitCommitSha?: string;
};

export type PluginManifest = {
  name?: string;
  description?: string;
  version?: string;
  author?: { name?: string; email?: string } | string;
  homepage?: string;
  repository?: string | { url?: string };
  license?: string;
  keywords?: string[];
};

export type PluginRecord = {
  id: string;
  name: string;
  marketplace: string;
  description: string;
  version: string;
  scope: string;
  installPath: string;
  installedAt: string;
  lastUpdated: string;
  gitCommitSha?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  author?: string;
  keywords: string[];
  counts: {
    skills: number;
    agents: number;
    commands: number;
    hooks: number;
    mcps: number;
  };
  resources: {
    skills: string[];
    agents: string[];
    commands: string[];
    hooks: string[];
    mcps: string[];
  };
  hasManifest: boolean;
  hasReadme: boolean;
};

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const INSTALLED_JSON = path.join(CLAUDE_DIR, 'plugins', 'installed_plugins.json');

async function readJson<T>(p: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function listDir(p: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(p, { withFileTypes: true });
    return entries.filter((e) => !e.name.startsWith('.')).map((e) => e.name);
  } catch {
    return [];
  }
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function countMcpServers(installPath: string): Promise<{ count: number; names: string[] }> {
  const names = new Set<string>();
  const addFromFile = async (file: string) => {
    const json = await readJson<{ mcpServers?: unknown }>(file);
    if (
      json?.mcpServers &&
      typeof json.mcpServers === 'object' &&
      !Array.isArray(json.mcpServers)
    ) {
      Object.keys(json.mcpServers as Record<string, unknown>).forEach((k) => names.add(k));
    }
  };

  const manifest = await readJson<{ mcpServers?: unknown }>(
    path.join(installPath, '.claude-plugin', 'plugin.json'),
  );
  if (manifest) {
    if (typeof manifest.mcpServers === 'string') {
      await addFromFile(path.resolve(installPath, manifest.mcpServers));
    } else if (
      manifest.mcpServers &&
      typeof manifest.mcpServers === 'object' &&
      !Array.isArray(manifest.mcpServers)
    ) {
      Object.keys(manifest.mcpServers as Record<string, unknown>).forEach((k) => names.add(k));
    }
  }

  await addFromFile(path.join(installPath, '.mcp.json'));
  return { count: names.size, names: [...names] };
}

async function countHooks(installPath: string): Promise<{ count: number; names: string[] }> {
  const hooksDir = path.join(installPath, 'hooks');
  const entries = await listDir(hooksDir);
  return { count: entries.length, names: entries };
}

export async function getPlugins(): Promise<PluginRecord[]> {
  const installed = await readJson<{ plugins: Record<string, InstalledEntry[]> }>(INSTALLED_JSON);
  if (!installed?.plugins) return [];

  const records: PluginRecord[] = [];

  for (const [id, entries] of Object.entries(installed.plugins)) {
    const entry = entries[0];
    if (!entry) continue;
    const [name, marketplace] = id.split('@');
    const installPath = entry.installPath;
    const manifest = (await readJson<PluginManifest>(
      path.join(installPath, '.claude-plugin', 'plugin.json'),
    )) ?? {};

    const [skills, agents, commands, hooks, mcps, hasReadme] = await Promise.all([
      listDir(path.join(installPath, 'skills')),
      listDir(path.join(installPath, 'agents')),
      listDir(path.join(installPath, 'commands')),
      countHooks(installPath),
      countMcpServers(installPath),
      exists(path.join(installPath, 'README.md')),
    ]);

    const repository =
      typeof manifest.repository === 'string'
        ? manifest.repository
        : manifest.repository?.url;
    const author =
      typeof manifest.author === 'string'
        ? manifest.author
        : manifest.author?.name;

    records.push({
      id,
      name: manifest.name || name,
      marketplace: marketplace || 'unknown',
      description: manifest.description || '',
      version: manifest.version || entry.version,
      scope: entry.scope,
      installPath,
      installedAt: entry.installedAt,
      lastUpdated: entry.lastUpdated,
      gitCommitSha: entry.gitCommitSha,
      homepage: manifest.homepage,
      repository,
      license: manifest.license,
      author,
      keywords: manifest.keywords ?? [],
      counts: {
        skills: skills.length,
        agents: agents.length,
        commands: commands.length,
        hooks: hooks.count,
        mcps: mcps.count,
      },
      resources: {
        skills,
        agents,
        commands,
        hooks: hooks.names,
        mcps: mcps.names,
      },
      hasManifest: Object.keys(manifest).length > 0,
      hasReadme,
    });
  }

  records.sort((a, b) => a.name.localeCompare(b.name));
  return records;
}

export async function getPluginById(id: string): Promise<PluginRecord | null> {
  const all = await getPlugins();
  return all.find((p) => p.id === id) ?? null;
}

export async function readPluginReadme(installPath: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(installPath, 'README.md'), 'utf8');
  } catch {
    return null;
  }
}
