import type { Handle } from '@sveltejs/kit';
import { createLogger } from '$lib/server/logger';

const log = createLogger('http');

export const handle: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const response = await resolve(event);
	const durationMs = Date.now() - start;

	log.info(`${event.request.method} ${event.url.pathname}`, {
		status: response.status,
		durationMs
	});

	return response;
};
