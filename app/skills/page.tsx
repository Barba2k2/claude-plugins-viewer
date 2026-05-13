import { getAllSkills } from '@/lib/resources';
import { SkillsClient } from './SkillsClient';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
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
