import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { OPENWEATHER_API_KEY } from '$env/static/private';

export const GET: RequestHandler = async ({ params }) => {
	const { layer, z, x, y } = params;
	const apiKey = env.OPENWEATHER_API_KEY || OPENWEATHER_API_KEY;

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
		return new Response(err.message || 'Failed to fetch weather tile', { status: 500 });
	}
};
