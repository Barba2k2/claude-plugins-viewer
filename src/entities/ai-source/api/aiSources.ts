import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { cache } from 'react';
import { getSourcesConfig, type SourcesConfig } from './aiSourcesConfig';

const HOME = os.homedir();

export type KnownTool = {
  id: string;
  dir: string;
  defaultName: string;
};

export const KNOWN_TOOLS: KnownTool[] = [
  { id: 'gemini', dir: '.gemini', defaultName: 'GEMINI' },
  { id: 'codex', dir: '.codex', defaultName: 'CODEX' },
  { id: 'qwen', dir: '.qwen', defaultName: 'QWEN' },
  { id: 'cursor', dir: '.cursor', defaultName: 'CURSOR' },
  { id: 'continue', dir: '.continue', defaultName: 'CONTINUE' },
  { id: 'aider', dir: '.aider', defaultName: 'AIDER' },
];

const CLAUDE_TOOL: KnownTool = { id: 'claude', dir: '.claude', defaultName: 'CLAUDE' };

export const CLAUDE_SOURCE_ID = 'claude';

export type AiSource = {
  id: string;
  name: string;
  path: string;
  kind: 'auto' | 'custom';
  exists: boolean;
  fileCount: number;
};

export type AiFile = {
  path: string;
  relativePath: string;
  name: string;
  ext: '.md' | '.json' | '.toml';
  sourceId: string;
  size: number;
  mtime: string;
};

const ALLOWED_EXT = new Set(['.md', '.json', '.toml']);
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.next',
  '.cache',
  'cache',
  'tmp',
  'logs',
]);

const SAFE_FILENAME = /^[a-zA-Z0-9_.-]+\.(md|json|toml)$/;

async function statSafe(p: string): Promise<{ size: number; mtime: string } | null> {
  try {
    const s = await fs.stat(p);
    return { size: s.size, mtime: s.mtime.toISOString() };
  } catch {
    return null;
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

async function listFilesRecursive(root: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > 6) return;
    let entries: { name: string; isDirectory(): boolean; isFile(): boolean }[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith('.') && dir !== root) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full, depth + 1);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ALLOWED_EXT.has(ext)) out.push(full);
      }
    }
  }

  await walk(root, 0);
  return out;
}

function resolveSource(
  config: SourcesConfig,
  tool: KnownTool | null,
  override?: { id: string; name: string; path: string },
): { id: string; name: string; path: string; kind: 'auto' | 'custom' } {
  if (tool) {
    const customName = config.nameOverrides?.[tool.id];
    return {
      id: tool.id,
      name: customName && customName.trim().length > 0 ? customName : tool.defaultName,
      path: path.join(HOME, tool.dir),
      kind: 'auto',
    };
  }
  if (!override) throw new Error('resolveSource: missing override');
  return { id: override.id, name: override.name, path: override.path, kind: 'custom' };
}

export const getSources = cache(_getSources);

async function _getSources(): Promise<AiSource[]> {
  const config = await getSourcesConfig();
  const disabled = new Set(config.disabledDefaults ?? []);

  const claude = resolveSource(config, CLAUDE_TOOL);
  const auto = KNOWN_TOOLS.filter((t) => !disabled.has(t.id)).map((t) => resolveSource(config, t));
  const custom = (config.customSources ?? []).map((s) =>
    resolveSource(config, null, { id: s.id, name: s.name, path: s.path }),
  );

  const all = [claude, ...auto, ...custom];

  const enriched = await Promise.all(
    all.map(async (s) => {
      const present = await exists(s.path);
      const files = present ? await listFilesRecursive(s.path) : [];
      return {
        id: s.id,
        name: s.name,
        path: s.path,
        kind: s.kind,
        exists: present,
        fileCount: files.length,
      } satisfies AiSource;
    }),
  );

  return enriched.sort((a, b) => {
    if (a.id === CLAUDE_SOURCE_ID) return -1;
    if (b.id === CLAUDE_SOURCE_ID) return 1;
    if (a.kind !== b.kind) return a.kind === 'auto' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getSourceById(id: string): Promise<AiSource | null> {
  const all = await getSources();
  return all.find((s) => s.id === id) ?? null;
}

export const getSourceFiles = cache(_getSourceFiles);

async function _getSourceFiles(sourceId: string): Promise<AiFile[]> {
  const source = await getSourceById(sourceId);
  if (!source || !source.exists) return [];
  const files = await listFilesRecursive(source.path);
  const results = await Promise.all(
    files.map(async (full) => {
      const stat = await statSafe(full);
      if (!stat) return null;
      const ext = path.extname(full).toLowerCase() as AiFile['ext'];
      return {
        path: full,
        relativePath: path.relative(source.path, full),
        name: path.basename(full),
        ext,
        sourceId: source.id,
        size: stat.size,
        mtime: stat.mtime,
      } satisfies AiFile;
    }),
  );
  return results
    .filter((r): r is AiFile => r !== null)
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

export async function getAllFiles(): Promise<AiFile[]> {
  const sources = await getSources();
  const groups = await Promise.all(sources.map((s) => getSourceFiles(s.id)));
  return groups.flat();
}

async function ensureWithinSource(absPath: string, sourceId: string): Promise<string> {
  const source = await getSourceById(sourceId);
  if (!source) throw new Error(`unknown source: ${sourceId}`);
  const resolved = path.resolve(absPath);
  const root = path.resolve(source.path);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error('path escapes source root');
  }
  const ext = path.extname(resolved).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) throw new Error('file type not allowed');
  return resolved;
}

export async function readAiFile(sourceId: string, absPath: string): Promise<string> {
  const resolved = await ensureWithinSource(absPath, sourceId);
  return fs.readFile(resolved, 'utf8');
}

export async function writeAiFile(
  sourceId: string,
  absPath: string,
  content: string,
): Promise<void> {
  const resolved = await ensureWithinSource(absPath, sourceId);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  const tmp = `${resolved}.tmp`;
  await fs.writeFile(tmp, content, 'utf8');
  await fs.rename(tmp, resolved);
}

export async function deleteAiFile(sourceId: string, absPath: string): Promise<void> {
  const resolved = await ensureWithinSource(absPath, sourceId);
  await fs.unlink(resolved);
}

export async function createAiFile(sourceId: string, relativePath: string): Promise<string> {
  if (!relativePath || relativePath.length === 0) throw new Error('empty filename');
  const parts = relativePath.split('/').filter((p) => p.length > 0);
  for (const part of parts.slice(0, -1)) {
    if (!/^[a-zA-Z0-9_.-]+$/.test(part)) throw new Error(`invalid path segment: ${part}`);
  }
  const filename = parts[parts.length - 1];
  if (!SAFE_FILENAME.test(filename)) throw new Error(`invalid filename: ${filename}`);
  const source = await getSourceById(sourceId);
  if (!source) throw new Error(`unknown source: ${sourceId}`);
  const target = path.join(source.path, ...parts);
  const resolved = await ensureWithinSource(target, sourceId);
  if (await exists(resolved)) throw new Error(`file already exists: ${relativePath}`);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, '', 'utf8');
  return resolved;
}
