import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getSourcesConfig } from '@/entities/ai-source/api/aiSourcesConfig';

const runExecFile = promisify(execFile);

const VERSION_TIMEOUT_MS = 5_000;
const WSL_TIMEOUT_MS = 8_000;

export type OsId = 'win32' | 'darwin' | 'linux';

export type PlatformInfo = {
  os: OsId;
  prettyOs: string;
  isWsl: boolean;
  shell: string;
  arch: string;
};

export type ToolCliSpec = {
  binaries: string[];
  versionArgs: string[];
};

export type CliStatus = {
  toolId: string;
  found: boolean;
  path: string | null;
  version: string | null;
  useWsl: boolean;
  source: 'override' | 'native' | 'wsl' | 'missing';
  error?: string;
};

const TOOL_CLI_SPECS: Record<string, ToolCliSpec> = {
  claude: { binaries: ['claude'], versionArgs: ['--version'] },
  codex: { binaries: ['codex'], versionArgs: ['--version'] },
  gemini: { binaries: ['gemini'], versionArgs: ['--version'] },
  qwen: { binaries: ['qwen'], versionArgs: ['--version'] },
  aider: { binaries: ['aider'], versionArgs: ['--version'] },
};

export function getToolCliSpec(toolId: string): ToolCliSpec | null {
  return TOOL_CLI_SPECS[toolId] ?? null;
}

export function listCliCapableTools(): string[] {
  return Object.keys(TOOL_CLI_SPECS);
}

let platformCache: PlatformInfo | null = null;
const cliCache = new Map<string, CliStatus>();

export function rescanCli(): void {
  cliCache.clear();
}

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

async function which(name: string): Promise<string | null> {
  const cmd = process.platform === 'win32' ? 'where' : 'which';
  try {
    const { stdout } = await runExecFile(cmd, [name], { timeout: VERSION_TIMEOUT_MS });
    const first = stdout
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find((s) => s.length > 0);
    return first ?? null;
  } catch {
    return null;
  }
}

async function probeVersion(
  binary: string,
  args: string[],
  prefixArgs: string[] = [],
): Promise<string | null> {
  try {
    const finalArgs = [...prefixArgs, ...args];
    const { stdout, stderr } = await runExecFile(binary, finalArgs, {
      timeout: VERSION_TIMEOUT_MS,
      maxBuffer: 512 * 1024,
    });
    const out = (stdout || stderr || '').trim();
    if (out.length === 0) return null;
    const match = out.match(/\d+\.\d+(?:\.\d+)?/);
    return match ? match[0] : out.split(/\r?\n/)[0];
  } catch {
    return null;
  }
}

async function wslAvailable(): Promise<boolean> {
  if (process.platform !== 'win32') return false;
  try {
    await runExecFile('wsl.exe', ['--status'], { timeout: WSL_TIMEOUT_MS });
    return true;
  } catch {
    return false;
  }
}

async function wslWhich(name: string): Promise<string | null> {
  try {
    const { stdout } = await runExecFile('wsl.exe', ['which', name], { timeout: WSL_TIMEOUT_MS });
    const first = stdout
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find((s) => s.length > 0);
    return first ?? null;
  } catch {
    return null;
  }
}

async function probeNative(spec: ToolCliSpec): Promise<{ path: string; version: string } | null> {
  for (const binName of spec.binaries) {
    const found = await which(binName);
    if (!found) continue;
    const version = await probeVersion(found, spec.versionArgs);
    if (version) return { path: found, version };
  }
  return null;
}

async function probeWsl(spec: ToolCliSpec): Promise<{ version: string; wslPath: string } | null> {
  if (!(await wslAvailable())) return null;
  for (const binName of spec.binaries) {
    const wslPath = await wslWhich(binName);
    if (!wslPath) continue;
    const version = await probeVersion('wsl.exe', [...spec.versionArgs], [binName]);
    if (version) return { version, wslPath };
  }
  return null;
}

export async function getCliStatus(toolId: string): Promise<CliStatus> {
  const cached = cliCache.get(toolId);
  if (cached) return cached;
  const status = await detectCliStatus(toolId);
  cliCache.set(toolId, status);
  return status;
}

async function detectCliStatus(toolId: string): Promise<CliStatus> {
  const spec = getToolCliSpec(toolId);
  if (!spec) {
    return {
      toolId,
      found: false,
      path: null,
      version: null,
      useWsl: false,
      source: 'missing',
      error: 'no cli for this tool',
    };
  }
  const config = await getSourcesConfig();
  const override = config.cliOverrides?.[toolId];
  if (override && override.path) {
    if (override.useWsl) {
      const version = await probeVersion('wsl.exe', spec.versionArgs, [override.path]);
      if (version) {
        return {
          toolId,
          found: true,
          path: override.path,
          version,
          useWsl: true,
          source: 'override',
        };
      }
    } else {
      const version = await probeVersion(override.path, spec.versionArgs);
      if (version) {
        return {
          toolId,
          found: true,
          path: override.path,
          version,
          useWsl: false,
          source: 'override',
        };
      }
    }
  }

  const preferWsl = process.platform === 'win32' && config.preferWsl === true;
  if (preferWsl) {
    const wsl = await probeWsl(spec);
    if (wsl) {
      return {
        toolId,
        found: true,
        path: wsl.wslPath,
        version: wsl.version,
        useWsl: true,
        source: 'wsl',
      };
    }
  }

  const native = await probeNative(spec);
  if (native) {
    return {
      toolId,
      found: true,
      path: native.path,
      version: native.version,
      useWsl: false,
      source: 'native',
    };
  }

  if (process.platform === 'win32' && !preferWsl) {
    const wsl = await probeWsl(spec);
    if (wsl) {
      return {
        toolId,
        found: true,
        path: wsl.wslPath,
        version: wsl.version,
        useWsl: true,
        source: 'wsl',
      };
    }
  }

  return {
    toolId,
    found: false,
    path: null,
    version: null,
    useWsl: false,
    source: 'missing',
    error: 'binary not found in PATH',
  };
}

export async function getAllCliStatuses(): Promise<CliStatus[]> {
  return Promise.all(listCliCapableTools().map(getCliStatus));
}

export type CliResult =
  | { success: true; stdout: string; stderr: string }
  | { success: false; error: string };

export async function runCliTool(
  toolId: string,
  args: string[],
  opts: { timeoutMs?: number; maxBufferBytes?: number } = {},
): Promise<CliResult> {
  const status = await getCliStatus(toolId);
  if (!status.found || !status.path) {
    return { success: false, error: `${toolId} CLI not configured` };
  }
  const timeout = opts.timeoutMs ?? 120_000;
  const maxBuffer = opts.maxBufferBytes ?? 8 * 1024 * 1024;
  const env = { ...process.env, CI: '1' };
  try {
    const finalBin = status.useWsl ? 'wsl.exe' : status.path;
    const finalArgs = status.useWsl ? [status.path, ...args] : args;
    const { stdout, stderr } = await runExecFile(finalBin, finalArgs, {
      timeout,
      maxBuffer,
      env,
    });
    return { success: true, stdout, stderr };
  } catch (e) {
    const err = e as Error & { stdout?: string; stderr?: string };
    const msg = err.stderr?.trim() || err.stdout?.trim() || err.message;
    return { success: false, error: msg };
  }
}

export async function validateCliPath(
  toolId: string,
  candidatePath: string,
  useWsl: boolean,
): Promise<{ ok: true; version: string } | { ok: false; error: string }> {
  const spec = getToolCliSpec(toolId);
  if (!spec) return { ok: false, error: 'no cli for this tool' };
  if (!candidatePath || candidatePath.trim().length === 0) {
    return { ok: false, error: 'path required' };
  }
  const trimmed = candidatePath.trim();
  if (useWsl) {
    const version = await probeVersion('wsl.exe', spec.versionArgs, [trimmed]);
    if (!version) return { ok: false, error: 'no response from wsl binary' };
    return { ok: true, version };
  }
  try {
    await fs.access(trimmed);
  } catch {
    return { ok: false, error: 'file not found' };
  }
  const version = await probeVersion(trimmed, spec.versionArgs);
  if (!version) return { ok: false, error: 'binary did not respond to --version' };
  return { ok: true, version };
}
