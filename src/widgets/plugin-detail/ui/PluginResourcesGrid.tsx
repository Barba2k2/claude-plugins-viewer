import { ResourceList } from './ResourceList';
import type { PluginRecord } from '@/entities/plugin';

type Props = { resources: PluginRecord['resources']; keywords: string[] };

export function PluginResourcesGrid({ resources, keywords }: Props) {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      <ResourceList title="Skills" items={resources.skills} />
      <ResourceList title="Agents" items={resources.agents} />
      <ResourceList title="Commands" items={resources.commands} />
      <ResourceList title="Hooks" items={resources.hooks} />
      <ResourceList title="MCP Servers" items={resources.mcps} />
      {keywords.length > 0 && <ResourceList title="Keywords" items={keywords} />}
    </section>
  );
}
