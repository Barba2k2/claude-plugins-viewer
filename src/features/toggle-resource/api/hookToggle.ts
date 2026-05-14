import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { getPluginById } from '@/entities/plugin';

type HookInner = { type?: string; command?: string };
type HookEntry = { matcher?: string; hooks?: HookInner[] };
type HooksFile = { hooks?: Record<string, HookEntry[]>; [k: string]: unknown };

const SHADOW_PATH = path.join(os.homedir(), '.claude', '.viewer-hook-overrides.json');

type ShadowEntry = {
  event: string;
  matcher?: string;
  type: string;
  command: string;
};
type Shadow = Record<string, Record<string, ShadowEntry>>;

export function hookStableId(
  pluginId: string,
  event: string,
  matcher: string | undefined,
  command: string,
): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${event}\n${matcher ?? ''}\n${command}`)
    .digest('hex')
    .slice(0, 12);
  return `${pluginId}::${event}::${hash}`;
}

async function readShadow(): Promise<Shadow> {
  try {
    const raw = await fs.readFile(SHADOW_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Shadow) : {};
  } catch {
    return {};
  }
}

async function writeShadow(s: Shadow): Promise<void> {
  const tmp = `${SHADOW_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(s, null, 2), 'utf8');
  await fs.rename(tmp, SHADOW_PATH);
}

export async function getShadowForPlugin(pluginId: string): Promise<Record<string, ShadowEntry>> {
  const shadow = await readShadow();
  return shadow[pluginId] ?? {};
}

async function locateHooksFile(installPath: string): Promise<string> {
  const candidates = [
    path.join(installPath, 'hooks', 'hooks.json'),
    path.join(installPath, 'hooks.json'),
  ];
  for (const c of candidates) {
    try {
      await fs.access(c);
      return c;
    } catch {
      // try next
    }
  }
  return candidates[0];
}

async function readHooksFile(file: string): Promise<HooksFile> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as HooksFile) : {};
  } catch {
    return {};
  }
}

async function writeHooksFile(file: string, data: HooksFile): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const backup = `${file}.viewer-bak`;
  try {
    await fs.access(backup);
  } catch {
    try {
      await fs.copyFile(file, backup);
    } catch {
      // original may not exist
    }
  }
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

function ensureWithin(parent: string, child: string): void {
  const resolvedParent = path.resolve(parent) + path.sep;
  const resolvedChild = path.resolve(child);
  if (!resolvedChild.startsWith(resolvedParent)) {
    throw new Error('path escapes plugin root');
  }
}

export async function disableHook(pluginId: string, stableId: string): Promise<void> {
  const plugin = await getPluginById(pluginId);
  if (!plugin) throw new Error(`plugin not found: ${pluginId}`);
  const hooksFile = await locateHooksFile(plugin.installPath);
  ensureWithin(plugin.installPath, hooksFile);

  const data = await readHooksFile(hooksFile);
  if (!data.hooks) return;

  let found: ShadowEntry | null = null;
  for (const [event, entries] of Object.entries(data.hooks)) {
    const newEntries: HookEntry[] = [];
    for (const entry of entries) {
      const remainingInner: HookInner[] = [];
      for (const inner of entry.hooks ?? []) {
        const id = hookStableId(pluginId, event, entry.matcher, inner.command ?? '');
        if (id === stableId && !found) {
          found = {
            event,
            matcher: entry.matcher,
            type: inner.type ?? 'command',
            command: inner.command ?? '',
          };
          continue;
        }
        remainingInner.push(inner);
      }
      if (remainingInner.length > 0) {
        newEntries.push({ ...entry, hooks: remainingInner });
      }
    }
    if (newEntries.length > 0) data.hooks[event] = newEntries;
    else delete data.hooks[event];
  }

  if (!found) return;

  await writeHooksFile(hooksFile, data);

  const shadow = await readShadow();
  if (!shadow[pluginId]) shadow[pluginId] = {};
  shadow[pluginId][stableId] = found;
  await writeShadow(shadow);
}

export async function enableHook(pluginId: string, stableId: string): Promise<void> {
  const plugin = await getPluginById(pluginId);
  if (!plugin) throw new Error(`plugin not found: ${pluginId}`);

  const shadow = await readShadow();
  const entry = shadow[pluginId]?.[stableId];
  if (!entry) return;

  const hooksFile = await locateHooksFile(plugin.installPath);
  ensureWithin(plugin.installPath, hooksFile);
  const data = await readHooksFile(hooksFile);
  data.hooks ??= {};
  data.hooks[entry.event] ??= [];
  const existing = data.hooks[entry.event].find((e) => (e.matcher ?? '') === (entry.matcher ?? ''));
  const inner: HookInner = { type: entry.type, command: entry.command };
  if (existing) {
    existing.hooks ??= [];
    existing.hooks.push(inner);
  } else {
    data.hooks[entry.event].push({ matcher: entry.matcher, hooks: [inner] });
  }
  await writeHooksFile(hooksFile, data);

  delete shadow[pluginId][stableId];
  if (Object.keys(shadow[pluginId]).length === 0) delete shadow[pluginId];
  await writeShadow(shadow);
}

export function parseHookId(id: string): { pluginId: string } | null {
  const idx = id.indexOf('::');
  if (idx < 0) return null;
  return { pluginId: id.slice(0, idx) };
}
