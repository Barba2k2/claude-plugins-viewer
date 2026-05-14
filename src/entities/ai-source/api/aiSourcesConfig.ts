import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const CONFIG_DIR = path.join(os.homedir(), '.claude-plugins-viewer');
const CONFIG_FILE = path.join(CONFIG_DIR, 'sources.json');

export type CustomSource = {
  id: string;
  name: string;
  path: string;
};

export type CliOverride = {
  path: string;
  useWsl?: boolean;
};

export type SourcesConfig = {
  customSources: CustomSource[];
  disabledDefaults: string[];
  nameOverrides: Record<string, string>;
  cliOverrides: Record<string, CliOverride>;
  preferWsl: boolean;
};

const EMPTY: SourcesConfig = {
  customSources: [],
  disabledDefaults: [],
  nameOverrides: {},
  cliOverrides: {},
  preferWsl: false,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isValidConfig(value: unknown): value is Partial<SourcesConfig> {
  if (!isObject(value)) return false;
  return (
    Array.isArray(value.customSources) &&
    Array.isArray(value.disabledDefaults) &&
    isObject(value.nameOverrides)
  );
}

function readCliOverrides(raw: unknown): Record<string, CliOverride> {
  if (!isObject(raw)) return {};
  const out: Record<string, CliOverride> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isObject(value)) continue;
    if (typeof value.path !== 'string' || value.path.length === 0) continue;
    out[key] = {
      path: value.path,
      useWsl: value.useWsl === true,
    };
  }
  return out;
}

export async function getSourcesConfig(): Promise<SourcesConfig> {
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!isValidConfig(parsed)) return EMPTY;
    const parsedObj = parsed as Record<string, unknown>;
    return {
      customSources: (parsed.customSources ?? []).filter(
        (s): s is CustomSource =>
          !!s &&
          typeof s === 'object' &&
          typeof (s as CustomSource).id === 'string' &&
          typeof (s as CustomSource).name === 'string' &&
          typeof (s as CustomSource).path === 'string',
      ),
      disabledDefaults: (parsed.disabledDefaults ?? []).filter(
        (s): s is string => typeof s === 'string',
      ),
      nameOverrides: Object.fromEntries(
        Object.entries(parsed.nameOverrides ?? {}).filter(([, v]) => typeof v === 'string'),
      ) as Record<string, string>,
      cliOverrides: readCliOverrides(parsedObj.cliOverrides),
      preferWsl: parsedObj.preferWsl === true,
    };
  } catch {
    return EMPTY;
  }
}

async function saveSourcesConfig(config: SourcesConfig): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  const tmp = `${CONFIG_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(config, null, 2), 'utf8');
  await fs.rename(tmp, CONFIG_FILE);
}

function normalizePath(input: string): string {
  let p = input.trim();
  if (p.startsWith('~')) {
    p = path.join(os.homedir(), p.slice(1));
  }
  return path.resolve(p);
}

export async function addCustomSource(input: {
  name: string;
  path: string;
}): Promise<CustomSource> {
  const trimmedName = input.name.trim();
  const normalizedPath = normalizePath(input.path);
  if (!normalizedPath) throw new Error('path required');
  const config = await getSourcesConfig();
  const duplicate = config.customSources.find((s) => path.resolve(s.path) === normalizedPath);
  if (duplicate) throw new Error('path already added');
  const fallback = path.basename(normalizedPath).replace(/^\./, '').toUpperCase() || 'CUSTOM';
  const source: CustomSource = {
    id: `custom-${crypto.randomUUID()}`,
    name: trimmedName.length > 0 ? trimmedName : fallback,
    path: normalizedPath,
  };
  await saveSourcesConfig({
    ...config,
    customSources: [...config.customSources, source],
  });
  return source;
}

export async function removeCustomSource(id: string): Promise<void> {
  const config = await getSourcesConfig();
  await saveSourcesConfig({
    ...config,
    customSources: config.customSources.filter((s) => s.id !== id),
  });
}

export async function renameCustomSource(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (trimmed.length === 0) throw new Error('name required');
  const config = await getSourcesConfig();
  await saveSourcesConfig({
    ...config,
    customSources: config.customSources.map((s) => (s.id === id ? { ...s, name: trimmed } : s)),
  });
}

export async function setDefaultDisabled(id: string, disabled: boolean): Promise<void> {
  const config = await getSourcesConfig();
  const current = new Set(config.disabledDefaults);
  if (disabled) current.add(id);
  else current.delete(id);
  await saveSourcesConfig({
    ...config,
    disabledDefaults: [...current],
  });
}

export async function setCliOverride(toolId: string, override: CliOverride | null): Promise<void> {
  const config = await getSourcesConfig();
  const next = { ...config.cliOverrides };
  if (override === null) {
    delete next[toolId];
  } else {
    next[toolId] = { path: override.path, useWsl: override.useWsl === true };
  }
  await saveSourcesConfig({ ...config, cliOverrides: next });
}

export async function setPreferWsl(value: boolean): Promise<void> {
  const config = await getSourcesConfig();
  await saveSourcesConfig({ ...config, preferWsl: value });
}

export async function setDefaultName(id: string, name: string | null): Promise<void> {
  const config = await getSourcesConfig();
  const nameOverrides = { ...config.nameOverrides };
  if (name === null || name.trim().length === 0) {
    delete nameOverrides[id];
  } else {
    nameOverrides[id] = name.trim();
  }
  await saveSourcesConfig({ ...config, nameOverrides });
}
