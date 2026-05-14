import fs from 'node:fs/promises';
import path from 'node:path';

export type OsId = 'win32' | 'darwin' | 'linux';

export type PlatformInfo = {
  os: OsId;
  prettyOs: string;
  isWsl: boolean;
  shell: string;
  arch: string;
};

let platformCache: PlatformInfo | null = null;

export function rescanPlatform(): void {
  platformCache = null;
}

async function detectWsl(): Promise<boolean> {
  if (process.platform !== 'linux') return false;
  try {
    const txt = await fs.readFile('/proc/version', 'utf8');
    return /microsoft/i.test(txt);
  } catch {
    return false;
  }
}

function detectShell(): string {
  if (process.platform === 'win32') {
    if (process.env.PSModulePath) return 'pwsh';
    const comspec = process.env.COMSPEC;
    if (comspec) return path.basename(comspec).replace(/\.exe$/i, '');
    return 'cmd';
  }
  const shell = process.env.SHELL;
  if (shell) return path.basename(shell);
  return 'sh';
}

function prettyOsName(osId: OsId, isWsl: boolean): string {
  if (isWsl) return 'WSL';
  if (osId === 'win32') return 'Windows';
  if (osId === 'darwin') return 'macOS';
  return 'Linux';
}

export async function getPlatformInfo(): Promise<PlatformInfo> {
  if (platformCache) return platformCache;
  const osId = (
    process.platform === 'win32' || process.platform === 'darwin' ? process.platform : 'linux'
  ) as OsId;
  const isWsl = await detectWsl();
  const info: PlatformInfo = {
    os: osId,
    prettyOs: prettyOsName(osId, isWsl),
    isWsl,
    shell: detectShell(),
    arch: process.arch,
  };
  platformCache = info;
  return info;
}
