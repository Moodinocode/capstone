import { LRUCache } from 'lru-cache';

// One process-local LRU. Bounded so a runaway key explosion can't OOM Node.
// `ttl` is the default TTL; per-call ttl overrides it.
const store = new LRUCache({
  max: 1000,
  ttl: 60_000, // 60s default
});

let hits = 0;
let misses = 0;

export const cache = {
  /**
   * Get a value or compute & cache it.
   * @param {string} key
   * @param {number} ttlMs
   * @param {() => Promise<any>} loader
   */
  async getOrSet(key, ttlMs, loader) {
    const cached = store.get(key);
    if (cached !== undefined) {
      hits++;
      return cached;
    }
    misses++;
    const fresh = await loader();
    store.set(key, fresh, { ttl: ttlMs });
    return fresh;
  },
  invalidate(prefix) {
    for (const k of store.keys()) {
      if (typeof k === 'string' && k.startsWith(prefix)) store.delete(k);
    }
  },
  stats() {
    return { size: store.size, hits, misses, hitRate: hits / (hits + misses || 1) };
  },
  clear() {
    store.clear();
    hits = 0;
    misses = 0;
  },
};

export default cache;
