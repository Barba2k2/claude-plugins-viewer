import { getAllSkills } from '@/entities/resource';
import { getActiveSource } from '@/entities/active-source';
import { CLAUDE_SOURCE_ID } from '@/entities/ai-source';
import { SkillsClient } from '@/widgets/skills-list/ui/SkillsClient';
import { NonClaudeStub } from '@/widgets/non-claude-stub/ui/NonClaudeStub';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  const active = await getActiveSource();
  if (active.id !== CLAUDE_SOURCE_ID) {
    return <NonClaudeStub resource="Skills" source={active} />;
  }
  const skills = await getAllSkills();
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Skills</h1>
        <p className="text-sm text-muted">
          {skills.length} skills across {new Set(skills.map((s) => s.pluginId)).size} plugins
        </p>
      </header>
      <SkillsClient skills={skills} />
    </main>
  );
}
