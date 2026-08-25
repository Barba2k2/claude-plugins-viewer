import fs from 'node:fs/promises';
import {
  type CliResult,
  type CliStatus,
  type CliStatusSource,
  type ToolCliSpec,
  execCli,
  probeVersion,
  which,
  wslAvailable,
  wslWhich,
} from '@/shared/lib/cliProbe';
import { getSourcesConfig, type CliOverride } from './aiSourcesConfig';
import { getToolCliSpec, listCliCapableTools } from './cliRegistry';

export type { CliStatus, CliResult } from '@/shared/lib/cliProbe';

const DEFAULT_RUN_TIMEOUT_MS = 120_000;
const DEFAULT_RUN_BUFFER = 8 * 1024 * 1024;

const cliCache = new Map<string, CliStatus>();

export function rescanCli(): void {
  cliCache.clear();
}

export async function getCliStatus(toolId: string): Promise<CliStatus> {
  const cached = cliCache.get(toolId);
  if (cached) return cached;
  const status = await detectCliStatus(toolId);
  cliCache.set(toolId, status);
  return status;
}

export async function getAllCliStatuses(): Promise<CliStatus[]> {
  return Promise.all(listCliCapableTools().map(getCliStatus));
}

export async function runCliTool(
  toolId: string,
  args: string[],
  opts: { timeoutMs?: number; maxBufferBytes?: number } = {},
): Promise<CliResult> {
  const status = await getCliStatus(toolId);
  if (!status.found || !status.path) {
    return { success: false, error: `${toolId} CLI not configured` };
  }
  const finalBin = status.useWsl ? 'wsl.exe' : status.path;
  const finalArgs = status.useWsl ? [status.path, ...args] : args;
  return execCli(finalBin, finalArgs, {
    timeoutMs: opts.timeoutMs ?? DEFAULT_RUN_TIMEOUT_MS,
    maxBufferBytes: opts.maxBufferBytes ?? DEFAULT_RUN_BUFFER,
  });
}

export async function validateCliPath(
  toolId: string,
  candidatePath: string,
  useWsl: boolean,
): Promise<{ ok: true; version: string } | { ok: false; error: string }> {
  const spec = getToolCliSpec(toolId);
  if (!spec) return { ok: false, error: 'no cli for this tool' };
  const trimmed = candidatePath.trim();
  if (trimmed.length === 0) return { ok: false, error: 'path required' };
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

function makeFound(
  toolId: string,
  source: CliStatusSource,
  binPath: string,
  version: string,
  useWsl: boolean,
): CliStatus {
  return { toolId, found: true, path: binPath, version, useWsl, source };
}

function makeMissing(toolId: string, error: string): CliStatus {
  return { toolId, found: false, path: null, version: null, useWsl: false, source: 'missing', error };
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
    const version = await probeVersion('wsl.exe', spec.versionArgs, [binName]);
    if (version) return { version, wslPath };
  }
  return null;
}

async function probeOverride(
  spec: ToolCliSpec,
  override: CliOverride,
): Promise<{ version: string } | null> {
  const args = override.useWsl
    ? await probeVersion('wsl.exe', spec.versionArgs, [override.path])
    : await probeVersion(override.path, spec.versionArgs);
  return args ? { version: args } : null;
}

async function detectCliStatus(toolId: string): Promise<CliStatus> {
  const spec = getToolCliSpec(toolId);
  if (!spec) return makeMissing(toolId, 'no cli for this tool');

  const config = await getSourcesConfig();
  const override = config.cliOverrides?.[toolId];
  if (override?.path) {
    const result = await probeOverride(spec, override);
    if (result) {
      return makeFound(toolId, 'override', override.path, result.version, override.useWsl === true);
    }
  }

  const preferWsl = process.platform === 'win32' && config.preferWsl === true;
  if (preferWsl) {
    const wsl = await probeWsl(spec);
    if (wsl) return makeFound(toolId, 'wsl', wsl.wslPath, wsl.version, true);
  }

  const native = await probeNative(spec);
  if (native) return makeFound(toolId, 'native', native.path, native.version, false);

  if (process.platform === 'win32' && !preferWsl) {
    const wsl = await probeWsl(spec);
    if (wsl) return makeFound(toolId, 'wsl', wsl.wslPath, wsl.version, true);
  }

  return makeMissing(toolId, 'binary not found in PATH');
}
