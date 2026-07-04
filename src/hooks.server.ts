import type { Handle } from '@sveltejs/kit';
import { createLogger } from '$lib/server/logger';
import { getCfMeta } from '$lib/server/geo';
import { checkRateLimit } from '$lib/server/rateLimit';

const log = createLogger('http');
const rateLog = createLogger('ratelimit');

const WINDOW_MS = 10_000;

// Same per-endpoint limits originally sized for a Cloudflare WAF rate limiting rule;
// enforced here instead since the free CF plan only allows a single such rule.
const RATE_LIMITS: { prefix: string; limit: number }[] = [
	{ prefix: '/api/weather-tiles/', limit: 50 },
	{ prefix: '/api/forecast', limit: 5 },
	{ prefix: '/api/sunrise', limit: 4 },
	{ prefix: '/api/geocode', limit: 2 }
];

function getClientIp(event: Parameters<Handle>[0]['event']): string {
	return event.request.headers.get('cf-connecting-ip') || event.getClientAddress();
}

export const handle: Handle = async ({ event, resolve }) => {
	const rule = RATE_LIMITS.find((r) => event.url.pathname.startsWith(r.prefix));

	if (rule) {
		const ip = getClientIp(event);
		const { allowed, retryAfterSeconds } = checkRateLimit(`${ip}:${rule.prefix}`, rule.limit, WINDOW_MS);

		if (!allowed) {
			rateLog.warn(
				{ path: event.url.pathname, ip, limit: rule.limit, cf: getCfMeta(event.request.headers) },
				'Rate limit exceeded'
			);
			return new Response(JSON.stringify({ error: 'Too many requests' }), {
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': String(retryAfterSeconds)
				}
			});
		}
	}

	const start = Date.now();
	const response = await resolve(event);
	const durationMs = Date.now() - start;

	log.info(
		{
			method: event.request.method,
			path: event.url.pathname,
			query: event.url.search || undefined,
			status: response.status,
			durationMs,
			userAgent: event.request.headers.get('user-agent') || undefined,
			cf: getCfMeta(event.request.headers)
		},
		`${event.request.method} ${event.url.pathname}`
	);

	return response;
};
