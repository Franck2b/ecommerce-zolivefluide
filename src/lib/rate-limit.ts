import "server-only";

// Limiteur en mémoire, suffisant pour une instance unique.
// En multi-instance, le remplacer par un compteur partagé (Redis, table Postgres).
const attempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  if (attempts.size > 10_000) {
    for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k);
  }
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export function resetRateLimit(key: string) {
  attempts.delete(key);
}
