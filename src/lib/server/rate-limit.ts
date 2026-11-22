import 'server-only';

const buckets = new Map<string, number[]>();

/**
 * Sliding-window limiter kept in memory, so it is per server instance. Good enough to slow a script down;
 * the database constraints are the hard limit.
 */
export const isRateLimited = (key: string, limit: number, windowMs: number, now = Date.now()): boolean => {
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);

    return true;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Keep the map from growing without bound.
  if (buckets.size > 5000)
    for (const [name, times] of buckets) if (!times.some((t) => now - t < windowMs)) buckets.delete(name);

  return false;
};

/**
 * `x-real-ip` first: the reverse proxy (nginx, Vercel) overwrites it with the peer address, whereas a client can
 * prepend anything to `x-forwarded-for`.
 */
export const getClientIp = (headers: Headers): string =>
  headers.get('x-real-ip')?.trim() || headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

/** `true` when the request comes from this app (or has no `Origin`, e.g. curl and same-origin GET). */
export const isSameOrigin = (req: Request, appUrl: string): boolean => {
  const origin = req.headers.get('origin');

  if (!origin) return true;

  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');

  try {
    return origin === new URL(appUrl).origin || new URL(origin).host === host;
  } catch {
    return false;
  }
};
