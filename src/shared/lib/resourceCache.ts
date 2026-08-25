export type CacheTag = 'plugins' | 'skills' | 'agents' | 'commands' | 'hooks' | 'mcps' | 'sources';

type CacheEntry = {
  value: Promise<unknown>;
  tags: ReadonlySet<CacheTag>;
  expiresAt: number;
};

/**
 * Process-wide memo cache for the filesystem readers.
 *
 * The plugin readers walk thousands of files under `~/.claude/plugins`. React's
 * `cache()` only dedupes within a single request, so every navigation and every
 * server action re-walked the whole tree. This cache persists results across
 * requests in the (single, local) Node process and is invalidated explicitly by
 * each mutation, preserving freshness without the repeated I/O. A short TTL
 * covers edits made outside the app.
 */
export class ResourceCache {
  private static store = new Map<string, CacheEntry>();
  private static defaultTtlMs = 60_000;

  static async wrap<T>(
    key: string,
    tags: readonly CacheTag[],
    loader: () => Promise<T>,
    ttlMs: number = ResourceCache.defaultTtlMs,
  ): Promise<T> {
    const now = Date.now();
    const existing = ResourceCache.store.get(key);
    if (existing && existing.expiresAt > now) {
      return existing.value as Promise<T>;
    }

    const value = loader();
    ResourceCache.store.set(key, {
      value,
      tags: new Set(tags),
      expiresAt: now + ttlMs,
    });

    // Drop the entry on failure so the next call retries instead of caching a rejection.
    value.catch(() => {
      if (ResourceCache.store.get(key)?.value === value) {
        ResourceCache.store.delete(key);
      }
    });

    return value;
  }

  static invalidate(...tags: CacheTag[]): void {
    if (tags.length === 0) {
      ResourceCache.store.clear();
      return;
    }
    const targets = new Set(tags);
    for (const [key, entry] of ResourceCache.store) {
      for (const tag of entry.tags) {
        if (targets.has(tag)) {
          ResourceCache.store.delete(key);
          break;
        }
      }
    }
  }

  static invalidateAll(): void {
    ResourceCache.store.clear();
  }
}
