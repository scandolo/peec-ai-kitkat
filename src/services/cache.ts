/**
 * Hot cache for pre-computed Tavily/Gemini results.
 *
 * Demo strategy: ship a snapshot of "what discovery returned" inside the bundle
 * so the UI opens instantly. Live calls fall through to the cache only when
 * the underlying API is unreachable (key missing or network error).
 */

const memory = new Map<string, unknown>();

export function cacheGet<T>(key: string): T | undefined {
  return memory.get(key) as T | undefined;
}

export function cacheSet<T>(key: string, value: T): void {
  memory.set(key, value);
}

export function cacheKey(parts: Array<string | number | undefined | null>): string {
  return parts.filter(Boolean).join('::');
}

export async function withCache<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== undefined) return cached;
  const value = await loader();
  cacheSet(key, value);
  return value;
}
