import Link from 'next/link';
import { getMarketplaces } from '../actions/marketplaces';
import { AddMarketplace } from './AddMarketplace';
import { MarketplaceRow } from './MarketplaceRow';

export const dynamic = 'force-dynamic';

export default async function MarketplacesPage() {
  const marketplaces = await getMarketplaces();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-white"
      >
        ← Back to plugins
      </Link>

      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white">Marketplaces</h1>
        <p className="text-sm text-muted">
          {marketplaces.length} configured · sources for installable plugins
        </p>
      </header>

      <section className="mb-6">
        <AddMarketplace />
      </section>

      {marketplaces.length === 0 ? (
        <p className="rounded-xl border border-border bg-panel p-8 text-center text-muted">
          No marketplaces configured.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {marketplaces.map((m) => (
            <MarketplaceRow key={m.name} entry={m} />
          ))}
        </ul>
      )}
    </main>
  );
}
