import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-white">Plugin not found</h1>
      <p className="text-sm text-muted">It may have been uninstalled or the URL is malformed.</p>
      <Link
        href="/"
        className="rounded-lg border border-border bg-panel px-4 py-2 text-sm hover:border-accent"
      >
        ← Back to dashboard
      </Link>
    </main>
  );
}
