import type { ToolCliSpec } from '@/shared/lib/cliProbe';

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
