import Link from 'next/link';
import { getMarketplaces } from '@/features/manage-marketplaces/api/marketplaces';
import { getActiveSource } from '@/entities/active-source';
import { CLAUDE_SOURCE_ID, getCliStatus } from '@/entities/ai-source';
import { AddMarketplace } from '@/features/manage-marketplaces/ui/AddMarketplace';
import { MarketplaceRow } from '@/features/manage-marketplaces/ui/MarketplaceRow';
import { NonClaudeStub } from '@/widgets/non-claude-stub/ui/NonClaudeStub';

export const dynamic = 'force-dynamic';

export default async function MarketplacesPage() {
  const active = await getActiveSource();
  if (active.id !== CLAUDE_SOURCE_ID) {
    return <NonClaudeStub resource="Marketplaces" source={active} />;
  }
  const [marketplaces, claudeCli] = await Promise.all([getMarketplaces(), getCliStatus('claude')]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/"
        className="text-muted mb-6 inline-flex items-center gap-2 text-sm hover:text-white"
      >
        ← Back to plugins
      </Link>

      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Marketplaces</h1>
        <p className="text-muted text-sm">
          {marketplaces.length} configured · sources for installable plugins
        </p>
      </header>

      <section className="mb-6">
        <AddMarketplace cliReady={claudeCli.found} />
      </section>

      {marketplaces.length === 0 ? (
        <p className="border-border bg-panel text-muted rounded-xl border p-8 text-center">
          No marketplaces configured.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {marketplaces.map((m) => (
            <MarketplaceRow key={m.name} entry={m} cliReady={claudeCli.found} />
          ))}
        </ul>
      )}
    </main>
  );
}
