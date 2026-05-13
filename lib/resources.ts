import fs from 'node:fs/promises';
import path from 'node:path';
import { getPluginById, getPlugins, type PluginRecord } from './plugins';
import { getDisabledMcps } from './settings';
import { getShadowForPlugin, hookStableId } from './hookToggle';

export type SkillRecord = {
  id: string;
  name: string;
  description: string;
  pluginId: string;
  pluginName: string;
  marketplace: string;
  path: string;
  dirName: string;
  enabled: boolean;
};

export type AgentRecord = {
  id: string;
  name: string;
  description: string;
  model?: string;
  color?: string;
  tools?: string;
  pluginId: string;
  pluginName: string;
  marketplace: string;
  path: string;
  fileName: string;
  enabled: boolean;
};

export type CommandRecord = {
  id: string;
  name: string;
  description: string;
  argumentHint?: string;
  pluginId: string;
  pluginName: string;
  marketplace: string;
  path: string;
  fileName: string;
  enabled: boolean;
};

export type HookRecord = {
  id: string;
  event: string;
  matcher?: string;
  command: string;
  type: string;
  pluginId: string;
  pluginName: string;
  marketplace: string;
  enabled: boolean;
};

export type McpRecord = {
  id: string;
  name: string;
  transport: 'stdio' | 'http' | 'sse' | 'unknown';
  command?: string;
  args?: string[];
  url?: string;
  envKeys: string[];
  pluginId: string;
  pluginName: string;
  marketplace: string;
  enabled: boolean;
};

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  const lines = match[1].split(/\r?\n/);
  let currentKey: string | null = null;
  let buffer = '';
  for (const line of lines) {
    const m = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (m) {
      if (currentKey) data[currentKey] = unquote(buffer.trim());
      currentKey = m[1];
      buffer = m[2];
    } else if (currentKey) {
      buffer += '\n' + line;
    }
  }
  if (currentKey) data[currentKey] = unquote(buffer.trim());
  return { data, body: match[2] };
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
  }
  return trimmed;
}

async function safeRead(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return null;
  }
}

async function safeListDir(p: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(p, { withFileTypes: true });
    return entries.filter((e) => !e.name.startsWith('.')).map((e) => e.name);
  } catch {
    return [];
  }
}

async function readSkillsFromPlugin(plugin: PluginRecord): Promise<SkillRecord[]> {
  const skillsDir = path.join(plugin.installPath, 'skills');
  const names = await safeListDir(skillsDir);
  const out: SkillRecord[] = [];
  for (const name of names) {
    const enabledPath = path.join(skillsDir, name, 'SKILL.md');
    const disabledPath = path.join(skillsDir, name, 'SKILL.md.disabled');
    let raw = await safeRead(enabledPath);
    let enabled = true;
    let activePath = enabledPath;
    if (!raw) {
      raw = await safeRead(disabledPath);
      if (!raw) continue;
      enabled = false;
      activePath = disabledPath;
    }
    const { data } = parseFrontmatter(raw);
    out.push({
      id: `${plugin.id}::${name}`,
      name: data.name || name,
      description: data.description || '',
      pluginId: plugin.id,
      pluginName: plugin.name,
      marketplace: plugin.marketplace,
      path: activePath,
      dirName: name,
      enabled,
    });
  }
  return out;
}

async function readAgentsFromPlugin(plugin: PluginRecord): Promise<AgentRecord[]> {
  const agentsDir = path.join(plugin.installPath, 'agents');
  const files = (await safeListDir(agentsDir)).filter(
    (f) => f.endsWith('.md') || f.endsWith('.md.disabled'),
  );
  const out: AgentRecord[] = [];
  for (const file of files) {
    const enabled = file.endsWith('.md');
    const base = file.replace(/\.md(\.disabled)?$/, '');
    const full = path.join(agentsDir, file);
    const raw = await safeRead(full);
    if (!raw) continue;
    const { data } = parseFrontmatter(raw);
    out.push({
      id: `${plugin.id}::${base}`,
      name: data.name || base,
      description: data.description || '',
      model: data.model,
      color: data.color,
      tools: data.tools,
      pluginId: plugin.id,
      pluginName: plugin.name,
      marketplace: plugin.marketplace,
      path: full,
      fileName: file,
      enabled,
    });
  }
  return out;
}

async function readCommandsFromPlugin(plugin: PluginRecord): Promise<CommandRecord[]> {
  const dir = path.join(plugin.installPath, 'commands');
  const files = (await safeListDir(dir)).filter(
    (f) => f.endsWith('.md') || f.endsWith('.md.disabled'),
  );
  const out: CommandRecord[] = [];
  for (const file of files) {
    const enabled = file.endsWith('.md');
    const base = file.replace(/\.md(\.disabled)?$/, '');
    const full = path.join(dir, file);
    const raw = await safeRead(full);
    if (!raw) continue;
    const { data } = parseFrontmatter(raw);
    out.push({
      id: `${plugin.id}::${base}`,
      name: base,
      description: data.description || '',
      argumentHint: data['argument-hint'],
      pluginId: plugin.id,
      pluginName: plugin.name,
      marketplace: plugin.marketplace,
      path: full,
      fileName: file,
      enabled,
    });
  }
  return out;
}

type HookEntry = {
  matcher?: string;
  hooks?: Array<{ type?: string; command?: string }>;
};

async function readHooksFromPlugin(plugin: PluginRecord): Promise<HookRecord[]> {
  const candidates = [
    path.join(plugin.installPath, 'hooks', 'hooks.json'),
    path.join(plugin.installPath, 'hooks.json'),
  ];
  let parsed: { hooks?: Record<string, HookEntry[]> } | null = null;
  for (const c of candidates) {
    const raw = await safeRead(c);
    if (!raw) continue;
    try {
      parsed = JSON.parse(raw);
      break;
    } catch {
      // ignore
    }
  }
  const out: HookRecord[] = [];
  if (parsed?.hooks) {
    for (const [event, entries] of Object.entries(parsed.hooks)) {
      for (const entry of entries) {
        for (const inner of entry.hooks ?? []) {
          const command = inner.command ?? '(missing)';
          out.push({
            id: hookStableId(plugin.id, event, entry.matcher, command),
            event,
            matcher: entry.matcher,
            command,
            type: inner.type ?? 'command',
            pluginId: plugin.id,
            pluginName: plugin.name,
            marketplace: plugin.marketplace,
            enabled: true,
          });
        }
      }
    }
  }

  const shadow = await getShadowForPlugin(plugin.id);
  for (const [stableId, entry] of Object.entries(shadow)) {
    out.push({
      id: stableId,
      event: entry.event,
      matcher: entry.matcher,
      command: entry.command,
      type: entry.type,
      pluginId: plugin.id,
      pluginName: plugin.name,
      marketplace: plugin.marketplace,
      enabled: false,
    });
  }
  return out;
}

type McpServerDef = {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  type?: string;
};

async function readMcpsFromPlugin(
  plugin: PluginRecord,
  disabledSet: Set<string>,
): Promise<McpRecord[]> {
  const sources: Array<Record<string, McpServerDef>> = [];
  const tryFile = async (file: string) => {
    const raw = await safeRead(file);
    if (!raw) return;
    try {
      const json = JSON.parse(raw) as { mcpServers?: unknown };
      if (json.mcpServers && typeof json.mcpServers === 'object' && !Array.isArray(json.mcpServers)) {
        sources.push(json.mcpServers as Record<string, McpServerDef>);
      }
    } catch {
      // ignore
    }
  };

  const manifestPath = path.join(plugin.installPath, '.claude-plugin', 'plugin.json');
  const manifestRaw = await safeRead(manifestPath);
  if (manifestRaw) {
    try {
      const json = JSON.parse(manifestRaw) as { mcpServers?: unknown };
      if (typeof json.mcpServers === 'string') {
        // Indirect reference: resolve path relative to plugin root
        const referenced = path.resolve(plugin.installPath, json.mcpServers);
        await tryFile(referenced);
      } else if (
        json.mcpServers &&
        typeof json.mcpServers === 'object' &&
        !Array.isArray(json.mcpServers)
      ) {
        sources.push(json.mcpServers as Record<string, McpServerDef>);
      }
    } catch {
      // ignore
    }
  }

  await tryFile(path.join(plugin.installPath, '.mcp.json'));

  const merged = new Map<string, McpServerDef>();
  for (const src of sources) {
    for (const [name, def] of Object.entries(src)) {
      if (!merged.has(name)) merged.set(name, def);
    }
  }

  const out: McpRecord[] = [];
  for (const [name, def] of merged.entries()) {
    const transport: McpRecord['transport'] = def.url
      ? def.url.startsWith('http')
        ? 'http'
        : 'sse'
      : def.command
        ? 'stdio'
        : 'unknown';
    out.push({
      id: `${plugin.id}::${name}`,
      name,
      transport,
      command: def.command,
      args: def.args,
      url: def.url,
      envKeys: def.env ? Object.keys(def.env) : [],
      pluginId: plugin.id,
      pluginName: plugin.name,
      marketplace: plugin.marketplace,
      enabled: !disabledSet.has(name),
    });
  }
  return out;
}

export async function getAllSkills(): Promise<SkillRecord[]> {
  const plugins = await getPlugins();
  const all = (await Promise.all(plugins.map(readSkillsFromPlugin))).flat();
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllAgents(): Promise<AgentRecord[]> {
  const plugins = await getPlugins();
  const all = (await Promise.all(plugins.map(readAgentsFromPlugin))).flat();
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllCommands(): Promise<CommandRecord[]> {
  const plugins = await getPlugins();
  const all = (await Promise.all(plugins.map(readCommandsFromPlugin))).flat();
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllHooks(): Promise<HookRecord[]> {
  const plugins = await getPlugins();
  const all = (await Promise.all(plugins.map(readHooksFromPlugin))).flat();
  return all.sort((a, b) => a.event.localeCompare(b.event) || a.pluginName.localeCompare(b.pluginName));
}

export async function getAllMcps(): Promise<McpRecord[]> {
  const plugins = await getPlugins();
  const disabledSet = new Set(await getDisabledMcps());
  const all = (
    await Promise.all(plugins.map((p) => readMcpsFromPlugin(p, disabledSet)))
  ).flat();
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSkillDetail(
  id: string,
): Promise<{ record: SkillRecord; body: string; frontmatter: Record<string, string> } | null> {
  const all = await getAllSkills();
  const record = all.find((s) => s.id === id);
  if (!record) return null;
  const raw = (await safeRead(record.path)) ?? '';
  const { data, body } = parseFrontmatter(raw);
  return { record, body, frontmatter: data };
}

export async function getAgentDetail(
  id: string,
): Promise<{ record: AgentRecord; body: string; frontmatter: Record<string, string> } | null> {
  const all = await getAllAgents();
  const record = all.find((a) => a.id === id);
  if (!record) return null;
  const raw = (await safeRead(record.path)) ?? '';
  const { data, body } = parseFrontmatter(raw);
  return { record, body, frontmatter: data };
}

export async function getCommandDetail(
  id: string,
): Promise<{ record: CommandRecord; body: string; frontmatter: Record<string, string> } | null> {
  const all = await getAllCommands();
  const record = all.find((c) => c.id === id);
  if (!record) return null;
  const raw = (await safeRead(record.path)) ?? '';
  const { data, body } = parseFrontmatter(raw);
  return { record, body, frontmatter: data };
}

export async function getHookDetail(
  id: string,
): Promise<{ record: HookRecord; scriptSource: string | null } | null> {
  const all = await getAllHooks();
  const record = all.find((h) => h.id === id);
  if (!record) return null;
  // If the hook command references a script via ${CLAUDE_PLUGIN_ROOT}, try to resolve it
  const plugin = await getPluginById(record.pluginId);
  let scriptSource: string | null = null;
  if (plugin) {
    const m = record.command.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/(\S+)/);
    if (m) {
      const candidate = `${plugin.installPath}/${m[1]}`;
      scriptSource = await safeRead(candidate);
    }
  }
  return { record, scriptSource };
}

export async function getMcpDetail(id: string): Promise<{ record: McpRecord } | null> {
  const all = await getAllMcps();
  const record = all.find((m) => m.id === id);
  if (!record) return null;
  return { record };
}
