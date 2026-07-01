import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCache, setCache } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const lat = url.searchParams.get('lat');
	const lon = url.searchParams.get('lon');
	const altitude = url.searchParams.get('altitude');

	if (!lat || !lon) {
		return json({ error: 'Latitude (lat) and Longitude (lon) are required' }, { status: 400 });
	}

	const formattedLat = parseFloat(lat).toFixed(4);
	const formattedLon = parseFloat(lon).toFixed(4);
	
	// Check SQLite cache
	const cacheKey = `forecast_${formattedLat}_${formattedLon}_${altitude || '0'}`;
	const cachedData = getCache(cacheKey);
	
	if (cachedData) {
		return json(cachedData);
	}

	const metUrl = new URL('https://api.met.no/weatherapi/locationforecast/2.0/compact');
	metUrl.searchParams.set('lat', formattedLat);
	metUrl.searchParams.set('lon', formattedLon);
	if (altitude) {
		metUrl.searchParams.set('altitude', parseInt(altitude).toString());
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
				{ error: `met.no API returned status ${response.status}: ${errorText}` },
				{ status: response.status }
			);
		}

		const data = await response.json();

		// Calculate TTL from met.no Expires header
		const expiresHeader = response.headers.get('expires');
		let ttlSeconds = 1800; // 30 minutes default
		
		if (expiresHeader) {
			const expiresTime = new Date(expiresHeader).getTime();
			const now = Date.now();
			if (expiresTime > now) {
				// Keep cache until expiration time (but at least 10 minutes, max 6 hours)
				ttlSeconds = Math.max(600, Math.min(21600, Math.round((expiresTime - now) / 1000)));
			}
		}

		// Save in SQLite cache
		setCache(cacheKey, data, ttlSeconds);

		return json(data);
	} catch (error: any) {
		return json({ error: error.message || 'Failed to fetch weather data' }, { status: 500 });
	}
};
