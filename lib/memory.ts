import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { cache } from 'react';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const GLOBAL_CLAUDE_MD = path.join(CLAUDE_DIR, 'CLAUDE.md');
const RULES_DIR = path.join(CLAUDE_DIR, 'rules');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');

export type MemoryScope =
  | 'global-claude-md'
  | 'global-rule'
  | 'project-instruction'
  | 'project-memory';

export type MemoryFile = {
  path: string;
  relativePath: string;
  name: string;
  scope: MemoryScope;
  projectId?: string;
  size: number;
  mtime: string;
};

export type MemoryProject = {
  id: string;
  displayPath: string;
  hasInstruction: boolean;
  memoryFileCount: number;
};

const SAFE_FILENAME = /^[a-zA-Z0-9_.-]+\.md$/;
const SAFE_PROJECT_ID = /^[a-zA-Z0-9_.-]+$/;

function ensureWithinClaude(p: string): void {
  const resolved = path.resolve(p);
  const root = path.resolve(CLAUDE_DIR);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error('path escapes ~/.claude');
  }
  if (!resolved.endsWith('.md')) {
    throw new Error('only .md files allowed');
  }
}

async function statSafe(p: string): Promise<{ size: number; mtime: string } | null> {
  try {
    const s = await fs.stat(p);
    return { size: s.size, mtime: s.mtime.toISOString() };
  } catch {
    return null;
  }
}

async function listMdRecursive(dir: string, base: string): Promise<string[]> {
  let out: string[] = [];
  let entries: { name: string; isDirectory(): boolean; isFile(): boolean }[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(await listMdRecursive(full, base));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

export const getGlobalMemories = cache(_getGlobalMemories);

async function _getGlobalMemories(): Promise<MemoryFile[]> {
  const out: MemoryFile[] = [];

  const rootStat = await statSafe(GLOBAL_CLAUDE_MD);
  if (rootStat) {
    out.push({
      path: GLOBAL_CLAUDE_MD,
      relativePath: 'CLAUDE.md',
      name: 'CLAUDE.md',
      scope: 'global-claude-md',
      size: rootStat.size,
      mtime: rootStat.mtime,
    });
  }

  const rules = await listMdRecursive(RULES_DIR, RULES_DIR);
  for (const file of rules) {
    const stat = await statSafe(file);
    if (!stat) continue;
    out.push({
      path: file,
      relativePath: path.relative(CLAUDE_DIR, file),
      name: path.basename(file),
      scope: 'global-rule',
      size: stat.size,
      mtime: stat.mtime,
    });
  }

  return out.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function decodeProjectPath(id: string): string {
  // Claude Code encodes paths like `/Volumes/KINGSTON/...` as `-Volumes-KINGSTON-...`
  if (!id.startsWith('-')) return id;
  return id.replace(/-/g, '/');
}

export const getProjects = cache(_getProjects);

async function _getProjects(): Promise<MemoryProject[]> {
  let entries: { name: string; isDirectory(): boolean }[];
  try {
    entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const candidates = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name);

  const results = await Promise.all(
    candidates.map(async (id) => {
      const projectDir = path.join(PROJECTS_DIR, id);
      const memoryDir = path.join(projectDir, 'memory');
      const instructionFile = path.join(projectDir, 'CLAUDE.md');
      const [memoryFiles, instructionStat] = await Promise.all([
        listMdRecursive(memoryDir, memoryDir),
        statSafe(instructionFile),
      ]);
      if (memoryFiles.length === 0 && !instructionStat) return null;
      return {
        id,
        displayPath: decodeProjectPath(id),
        hasInstruction: !!instructionStat,
        memoryFileCount: memoryFiles.length,
      };
    }),
  );

  return results
    .filter((r): r is MemoryProject => r !== null)
    .sort((a, b) => a.displayPath.localeCompare(b.displayPath));
}

export const getProjectMemories = cache(_getProjectMemories);

async function _getProjectMemories(projectId: string): Promise<MemoryFile[]> {
  if (!SAFE_PROJECT_ID.test(projectId)) throw new Error(`invalid project id: ${projectId}`);
  const projectDir = path.join(PROJECTS_DIR, projectId);
  const memoryDir = path.join(projectDir, 'memory');
  const instructionFile = path.join(projectDir, 'CLAUDE.md');

  const out: MemoryFile[] = [];

  const instructionStat = await statSafe(instructionFile);
  if (instructionStat) {
    out.push({
      path: instructionFile,
      relativePath: path.relative(CLAUDE_DIR, instructionFile),
      name: 'CLAUDE.md',
      scope: 'project-instruction',
      projectId,
      size: instructionStat.size,
      mtime: instructionStat.mtime,
    });
  }

  const memoryFiles = await listMdRecursive(memoryDir, memoryDir);
  for (const file of memoryFiles) {
    const stat = await statSafe(file);
    if (!stat) continue;
    out.push({
      path: file,
      relativePath: path.relative(CLAUDE_DIR, file),
      name: path.basename(file),
      scope: 'project-memory',
      projectId,
      size: stat.size,
      mtime: stat.mtime,
    });
  }

  return out;
}

export async function findMemoryByRelative(rel: string): Promise<MemoryFile | null> {
  const all = [
    ...(await getGlobalMemories()),
    ...(await Promise.all((await getProjects()).map((p) => getProjectMemories(p.id)))).flat(),
  ];
  return all.find((m) => m.relativePath === rel) ?? null;
}

export async function readMemoryFile(absPath: string): Promise<string> {
  ensureWithinClaude(absPath);
  return fs.readFile(absPath, 'utf8');
}

export async function writeMemoryFile(absPath: string, content: string): Promise<void> {
  ensureWithinClaude(absPath);
  await fs.mkdir(path.dirname(absPath), { recursive: true });
  const tmp = `${absPath}.tmp`;
  await fs.writeFile(tmp, content, 'utf8');
  await fs.rename(tmp, absPath);
}

export async function deleteMemoryFile(absPath: string): Promise<void> {
  ensureWithinClaude(absPath);
  // Never allow deleting the global CLAUDE.md
  if (path.resolve(absPath) === path.resolve(GLOBAL_CLAUDE_MD)) {
    throw new Error('global CLAUDE.md cannot be deleted; edit instead');
  }
  await fs.unlink(absPath);
}

export type CreateScope =
  | { kind: 'global-rule'; subdir: string }
  | { kind: 'project-memory'; projectId: string }
  | { kind: 'project-instruction'; projectId: string };

export async function createMemoryFile(scope: CreateScope, filename: string): Promise<string> {
  if (!SAFE_FILENAME.test(filename)) {
    throw new Error(`invalid filename: ${filename}`);
  }
  let dir: string;
  if (scope.kind === 'global-rule') {
    if (!SAFE_PROJECT_ID.test(scope.subdir)) {
      throw new Error(`invalid rule subdir: ${scope.subdir}`);
    }
    dir = path.join(RULES_DIR, scope.subdir);
  } else if (scope.kind === 'project-memory') {
    if (!SAFE_PROJECT_ID.test(scope.projectId)) {
      throw new Error(`invalid project id: ${scope.projectId}`);
    }
    dir = path.join(PROJECTS_DIR, scope.projectId, 'memory');
  } else {
    if (!SAFE_PROJECT_ID.test(scope.projectId)) {
      throw new Error(`invalid project id: ${scope.projectId}`);
    }
    if (filename !== 'CLAUDE.md') {
      throw new Error('project-instruction file must be CLAUDE.md');
    }
    dir = path.join(PROJECTS_DIR, scope.projectId);
  }
  const target = path.join(dir, filename);
  ensureWithinClaude(target);
  try {
    await fs.access(target);
    throw new Error(`file already exists: ${path.relative(CLAUDE_DIR, target)}`);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('file already exists')) throw e;
    // does not exist — proceed
  }
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(target, '', 'utf8');
  return target;
}
