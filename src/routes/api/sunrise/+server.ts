import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCache, setCache } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const lat = url.searchParams.get('lat');
	const lon = url.searchParams.get('lon');
	const date = url.searchParams.get('date');
	const offset = url.searchParams.get('offset');

	if (!lat || !lon) {
		return json({ error: 'Latitude (lat) and Longitude (lon) are required' }, { status: 400 });
	}

	const formattedLat = parseFloat(lat).toFixed(4);
	const formattedLon = parseFloat(lon).toFixed(4);
	
	// Format date, default to today
	let dateStr = date;
	if (!dateStr) {
		const today = new Date();
		dateStr = today.toISOString().split('T')[0];
	}

	// Check SQLite cache
	const cacheKey = `sunrise_${formattedLat}_${formattedLon}_${dateStr}_${offset || '0'}`;
	const cachedData = getCache(cacheKey);
	
	if (cachedData) {
		return json(cachedData);
	}

	const metUrl = new URL('https://api.met.no/weatherapi/sunrise/3.0/sun');
	metUrl.searchParams.set('lat', formattedLat);
	metUrl.searchParams.set('lon', formattedLon);
	metUrl.searchParams.set('date', dateStr);
	if (offset) {
		metUrl.searchParams.set('offset', offset);
	}

	try {
		const response = await fetch(metUrl.toString(), {
			headers: {
				'User-Agent': 'WeatherAppUI/1.0 (https://github.com/i0s/weather-ui; contact: weatherapi-adm@met.no)'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			return json(
				{ error: `met.no Sunrise API returned status ${response.status}: ${errorText}` },
				{ status: response.status }
			);
		}

		const data = await response.json();

		// Sunrise/sunset for a specific date is fixed, cache for 24 hours (86400 seconds)
		setCache(cacheKey, data, 86400);

		return json(data);
	} catch (error: any) {
		return json({ error: error.message || 'Failed to fetch sunrise data' }, { status: 500 });
	}
};
