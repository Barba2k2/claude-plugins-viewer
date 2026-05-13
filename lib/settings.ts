import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');

export type ClaudeSettings = {
  enabledPlugins?: Record<string, boolean>;
  disabledMcpjsonServers?: string[];
  [key: string]: unknown;
};

export async function readSettings(): Promise<ClaudeSettings> {
  const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
  return JSON.parse(raw) as ClaudeSettings;
}

export async function getEnabledMap(): Promise<Record<string, boolean>> {
  try {
    const settings = await readSettings();
    return settings.enabledPlugins ?? {};
  } catch {
    return {};
  }
}

async function backupOnce(): Promise<void> {
  const backup = `${SETTINGS_PATH}.bak`;
  try {
    await fs.access(backup);
    return;
  } catch {
    try {
      const data = await fs.readFile(SETTINGS_PATH);
      await fs.writeFile(backup, data);
    } catch {
      // settings file missing — nothing to back up
    }
  }
}

const PLUGIN_ID_RE = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+$/;
const MCP_NAME_RE = /^[a-zA-Z0-9_.-]+$/;

async function writeSettings(next: ClaudeSettings): Promise<void> {
  const tmp = `${SETTINGS_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf8');
  await fs.rename(tmp, SETTINGS_PATH);
}

export async function getDisabledMcps(): Promise<string[]> {
  try {
    const settings = await readSettings();
    return Array.isArray(settings.disabledMcpjsonServers)
      ? settings.disabledMcpjsonServers
      : [];
  } catch {
    return [];
  }
}

export async function setMcpEnabled(name: string, enabled: boolean): Promise<void> {
  if (!MCP_NAME_RE.test(name)) {
    throw new Error(`invalid mcp name: ${name}`);
  }

  await backupOnce();

  let settings: ClaudeSettings;
  try {
    settings = await readSettings();
  } catch {
    settings = {};
  }

  const current = Array.isArray(settings.disabledMcpjsonServers)
    ? settings.disabledMcpjsonServers
    : [];
  const set = new Set(current);
  if (enabled) set.delete(name);
  else set.add(name);

  const next: ClaudeSettings = {
    ...settings,
    disabledMcpjsonServers: [...set].sort(),
  };
  await writeSettings(next);
}

export async function setPluginEnabled(id: string, enabled: boolean): Promise<void> {
  if (!PLUGIN_ID_RE.test(id)) {
    throw new Error(`invalid plugin id: ${id}`);
  }

  await backupOnce();

  let settings: ClaudeSettings;
  try {
    settings = await readSettings();
  } catch {
    settings = {};
  }

  const next: ClaudeSettings = {
    ...settings,
    enabledPlugins: {
      ...(settings.enabledPlugins ?? {}),
      [id]: enabled,
    },
  };
  await writeSettings(next);
}
