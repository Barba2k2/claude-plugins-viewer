import { CountStat } from './CountStat';
import type { PluginRecord } from '@/entities/plugin';

type Props = { counts: PluginRecord['counts'] };

export function PluginCountsGrid({ counts }: Props) {
  return (
    <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
      <CountStat label="Skills" value={counts.skills} />
      <CountStat label="Agents" value={counts.agents} />
      <CountStat label="Commands" value={counts.commands} />
      <CountStat label="Hooks" value={counts.hooks} />
      <CountStat label="MCP Servers" value={counts.mcps} />
    </section>
  );
}
