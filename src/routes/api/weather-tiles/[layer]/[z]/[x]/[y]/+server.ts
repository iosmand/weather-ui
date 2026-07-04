import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { createLogger } from '$lib/server/logger';

const log = createLogger('api:weather-tiles');

export const GET: RequestHandler = async ({ params }) => {
	const { layer, z, x, y } = params;
	const apiKey = env.OPENWEATHER_API_KEY;

	if (!apiKey) {
		throw error(500, 'OpenWeatherMap API key is not configured');
	}

	// Strip .png extension if present
	let cleanY = y;
	if (cleanY.endsWith('.png')) {
		cleanY = cleanY.slice(0, -4);
	}

	const targetUrl = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${cleanY}.png?appid=${apiKey}`;

	try {
		const res = await fetch(targetUrl);
		if (!res.ok) {
			log.warn({ layer, z, x, y: cleanY, status: res.status }, 'OpenWeatherMap tile request failed');
			return new Response(`OpenWeatherMap returned status ${res.status}`, { status: res.status });
		}

		// Stream the response directly to avoid buffer issues and optimize memory
		return new Response(res.body, {
			headers: {
				'Content-Type': res.headers.get('Content-Type') || 'image/png',
				'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
			}
		});
	} catch (err: any) {
		log.error({ err, layer, z, x, y: cleanY }, 'Failed to fetch weather tile');
		return new Response(err.message || 'Failed to fetch weather tile', { status: 500 });
	}
};
