import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const runExecFile = promisify(execFile);

export const VERSION_TIMEOUT_MS = 5_000;
export const WSL_TIMEOUT_MS = 8_000;

export type ToolCliSpec = {
  binaries: string[];
  versionArgs: string[];
};

export type CliStatusSource = 'override' | 'native' | 'wsl' | 'missing';

export type CliStatus = {
  toolId: string;
  found: boolean;
  path: string | null;
  version: string | null;
  useWsl: boolean;
  source: CliStatusSource;
  error?: string;
};

export type CliResult =
  | { success: true; stdout: string; stderr: string }
  | { success: false; error: string };

export async function which(name: string): Promise<string | null> {
  const cmd = process.platform === 'win32' ? 'where' : 'which';
  try {
    const { stdout } = await runExecFile(cmd, [name], { timeout: VERSION_TIMEOUT_MS });
    return firstNonEmptyLine(stdout);
  } catch {
    return null;
  }
}

export async function probeVersion(
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

export async function wslAvailable(): Promise<boolean> {
  if (process.platform !== 'win32') return false;
  try {
    await runExecFile('wsl.exe', ['--status'], { timeout: WSL_TIMEOUT_MS });
    return true;
  } catch {
    return false;
  }
}

export async function wslWhich(name: string): Promise<string | null> {
  try {
    const { stdout } = await runExecFile('wsl.exe', ['which', name], { timeout: WSL_TIMEOUT_MS });
    return firstNonEmptyLine(stdout);
  } catch {
    return null;
  }
}

export async function execCli(
  binary: string,
  args: string[],
  opts: { timeoutMs: number; maxBufferBytes: number },
): Promise<CliResult> {
  try {
    const { stdout, stderr } = await runExecFile(binary, args, {
      timeout: opts.timeoutMs,
      maxBuffer: opts.maxBufferBytes,
      env: { ...process.env, CI: '1' },
    });
    return { success: true, stdout, stderr };
  } catch (e) {
    const err = e as Error & { stdout?: string; stderr?: string };
    const msg = err.stderr?.trim() || err.stdout?.trim() || err.message;
    return { success: false, error: msg };
  }
}

function firstNonEmptyLine(out: string): string | null {
  return (
    out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find((s) => s.length > 0) ?? null
  );
}
