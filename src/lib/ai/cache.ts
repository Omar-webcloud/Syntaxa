/**
 * Simple in-memory response cache with TTL.
 * Keyed by a normalized string (e.g. word + mode).
 * Lazy expiry cleanup on access.
 */

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

// Default TTLs
export const TTL = {
  SHORT: 60 * 60 * 1000,          // 1 hour — practice, quiz
  LONG: 24 * 60 * 60 * 1000,      // 24 hours — dictionary definitions
  DAILY: 24 * 60 * 60 * 1000,     // 24 hours — word of the day
} as const;

/**
 * Get a cached response by key. Returns null if not found or expired.
 */
export function getCached(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set a cache entry with optional TTL.
 * @param key - Cache key
 * @param value - Stringified response to cache
 * @param ttlMs - Time-to-live in ms (default: 1 hour)
 */
export function setCache(
  key: string,
  value: string,
  ttlMs: number = TTL.SHORT,
): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  // Lazy cleanup: if cache is getting large, prune expired entries
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, entry] of cache.entries()) {
      if (now > entry.expiresAt) {
        cache.delete(k);
      }
    }
  }
}

/**
 * Generate a normalized cache key from input parameters.
 * Simple but effective — avoids needing a hash library.
 */
export function cacheKey(...parts: string[]): string {
  return parts
    .map((p) => p.toLowerCase().trim())
    .join("::");
}
