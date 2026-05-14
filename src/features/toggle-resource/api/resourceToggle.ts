import fs from 'node:fs/promises';
import path from 'node:path';
import { getPluginById } from '@/entities/plugin';

const SAFE_SEGMENT = /^[a-zA-Z0-9_.-]+$/;

function ensureWithin(parent: string, child: string): void {
  const resolvedParent = path.resolve(parent) + path.sep;
  const resolvedChild = path.resolve(child);
  if (!resolvedChild.startsWith(resolvedParent)) {
    throw new Error('path escapes plugin root');
  }
}

async function renameIfExists(from: string, to: string): Promise<void> {
  try {
    await fs.access(from);
  } catch {
    // already in target state or missing — no-op
    return;
  }
  await fs.rename(from, to);
}

export async function setSkillEnabled(
  pluginId: string,
  dirName: string,
  enabled: boolean,
): Promise<void> {
  if (!SAFE_SEGMENT.test(dirName)) {
    throw new Error(`invalid skill dir: ${dirName}`);
  }
  const plugin = await getPluginById(pluginId);
  if (!plugin) throw new Error(`plugin not found: ${pluginId}`);

  const skillDir = path.join(plugin.installPath, 'skills', dirName);
  ensureWithin(plugin.installPath, skillDir);

  const enabledPath = path.join(skillDir, 'SKILL.md');
  const disabledPath = path.join(skillDir, 'SKILL.md.disabled');
  if (enabled) {
    await renameIfExists(disabledPath, enabledPath);
  } else {
    await renameIfExists(enabledPath, disabledPath);
  }
}

async function setMdFileEnabled(
  pluginId: string,
  subdir: 'agents' | 'commands',
  baseName: string,
  enabled: boolean,
): Promise<void> {
  if (!SAFE_SEGMENT.test(baseName)) {
    throw new Error(`invalid ${subdir} name: ${baseName}`);
  }
  const plugin = await getPluginById(pluginId);
  if (!plugin) throw new Error(`plugin not found: ${pluginId}`);

  const dir = path.join(plugin.installPath, subdir);
  const enabledPath = path.join(dir, `${baseName}.md`);
  const disabledPath = path.join(dir, `${baseName}.md.disabled`);
  ensureWithin(plugin.installPath, enabledPath);
  ensureWithin(plugin.installPath, disabledPath);

  if (enabled) {
    await renameIfExists(disabledPath, enabledPath);
  } else {
    await renameIfExists(enabledPath, disabledPath);
  }
}

export function setAgentEnabled(
  pluginId: string,
  baseName: string,
  enabled: boolean,
): Promise<void> {
  return setMdFileEnabled(pluginId, 'agents', baseName, enabled);
}

export function setCommandEnabled(
  pluginId: string,
  baseName: string,
  enabled: boolean,
): Promise<void> {
  return setMdFileEnabled(pluginId, 'commands', baseName, enabled);
}

export function parseResourceId(id: string): { pluginId: string; resourceName: string } | null {
  const idx = id.indexOf('::');
  if (idx < 0) return null;
  const pluginId = id.slice(0, idx);
  const resourceName = id.slice(idx + 2);
  if (!resourceName) return null;
  return { pluginId, resourceName };
}
