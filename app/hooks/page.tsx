import { getAllHooks } from '@/lib/resources';
import { HooksClient } from './HooksClient';

export const dynamic = 'force-dynamic';

export default async function HooksPage() {
  const hooks = await getAllHooks();
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Hooks</h1>
        <p className="text-sm text-muted">
          {hooks.length} hook entries · {new Set(hooks.map((h) => h.event)).size} distinct events ·{' '}
          {new Set(hooks.map((h) => h.pluginId)).size} plugins
        </p>
      </header>
      <HooksClient hooks={hooks} />
    </main>
  );
}
