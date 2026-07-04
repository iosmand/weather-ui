type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Sweep expired buckets periodically so the map doesn't grow unbounded.
setInterval(() => {
	const now = Date.now();
	for (const [key, bucket] of buckets) {
		if (now >= bucket.resetAt) buckets.delete(key);
	}
}, 60_000).unref();

/**
	Fixed-window limiter. Returns whether the request is allowed and, if not,
	how many seconds until the window resets (for a Retry-After header).
 */
export function checkRateLimit(
	key: string,
	limit: number,
	windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
	const now = Date.now();
	const bucket = buckets.get(key);

	if (!bucket || now >= bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return { allowed: true, retryAfterSeconds: 0 };
	}

	bucket.count++;
	if (bucket.count > limit) {
		return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
	}

	return { allowed: true, retryAfterSeconds: 0 };
}
