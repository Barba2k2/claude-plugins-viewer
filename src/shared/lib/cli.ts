import { runCliTool, type CliResult } from '@/entities/ai-source';

export type { CliResult };

const PLUGIN_SPEC_RE = /^[a-zA-Z0-9_.-]+(@[a-zA-Z0-9_.-]+)?$/;
const MARKETPLACE_NAME_RE = /^[a-zA-Z0-9_.-]+$/;
const MARKETPLACE_SOURCE_RE = /^[a-zA-Z0-9_.:/@~+-]+$/;

function runClaude(args: string[]): Promise<CliResult> {
  return runCliTool('claude', args);
}

export async function installPlugin(spec: string): Promise<CliResult> {
  if (!PLUGIN_SPEC_RE.test(spec)) {
    return { success: false, error: `invalid plugin spec: ${spec}` };
  }
  return runClaude(['plugin', 'install', spec, '-s', 'user']);
}

export async function uninstallPlugin(spec: string): Promise<CliResult> {
  if (!PLUGIN_SPEC_RE.test(spec)) {
    return { success: false, error: `invalid plugin spec: ${spec}` };
  }
  return runClaude(['plugin', 'uninstall', spec, '-s', 'user', '-y']);
}

export async function updatePlugin(spec: string): Promise<CliResult> {
  if (!PLUGIN_SPEC_RE.test(spec)) {
    return { success: false, error: `invalid plugin spec: ${spec}` };
  }
  return runClaude(['plugin', 'update', spec]);
}

export type MarketplaceEntry = {
  name: string;
  source: string;
  repo?: string;
  url?: string;
  installLocation?: string;
};

export async function listMarketplaces(): Promise<MarketplaceEntry[]> {
  const result = await runClaude(['plugin', 'marketplace', 'list', '--json']);
  if (!result.success) return [];
  try {
    const parsed = JSON.parse(result.stdout);
    return Array.isArray(parsed) ? (parsed as MarketplaceEntry[]) : [];
  } catch {
    return [];
  }
}

export async function addMarketplace(source: string): Promise<CliResult> {
  if (!MARKETPLACE_SOURCE_RE.test(source)) {
    return { success: false, error: `invalid marketplace source: ${source}` };
  }
  return runClaude(['plugin', 'marketplace', 'add', source, '--scope', 'user']);
}

export async function removeMarketplace(name: string): Promise<CliResult> {
  if (!MARKETPLACE_NAME_RE.test(name)) {
    return { success: false, error: `invalid marketplace name: ${name}` };
  }
  return runClaude(['plugin', 'marketplace', 'remove', name]);
}

export async function updateMarketplace(name?: string): Promise<CliResult> {
  if (name && !MARKETPLACE_NAME_RE.test(name)) {
    return { success: false, error: `invalid marketplace name: ${name}` };
  }
  const args = ['plugin', 'marketplace', 'update'];
  if (name) args.push(name);
  return runClaude(args);
}
