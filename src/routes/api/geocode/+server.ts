import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCache, setCache } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const lat = url.searchParams.get('lat');
	const lon = url.searchParams.get('lon');

	if (!lat || !lon) {
		return json({ error: 'Latitude (lat) and Longitude (lon) are required' }, { status: 400 });
	}

	const formattedLat = parseFloat(lat).toFixed(4);
	const formattedLon = parseFloat(lon).toFixed(4);

	// Check SQLite cache
	const cacheKey = `geocode_${formattedLat}_${formattedLon}`;
	const cachedData = getCache(cacheKey);

	if (cachedData) {
		return json(cachedData);
	}

	const geocodeUrl = new URL('https://nominatim.openstreetmap.org/reverse');
	geocodeUrl.searchParams.set('format', 'json');
	geocodeUrl.searchParams.set('lat', formattedLat);
	geocodeUrl.searchParams.set('lon', formattedLon);
	geocodeUrl.searchParams.set('zoom', '12');

	try {
		const response = await fetch(geocodeUrl.toString(), {
			headers: {
				'User-Agent': 'WeatherAppUI/1.0 (https://github.com/i0s/weather-ui; contact: weatherapi-adm@met.no)'
			}
		});

		if (!response.ok) {
			return json({ name: 'Detected Location' });
		}

		const data = await response.json();
		let result = { name: 'Detected Location', country: '' };
		
		if (data && data.address) {
			const addr = data.address;
			const name = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.neighbourhood || addr.county || addr.state || 'Detected Location';
			result = { name, country: addr.country || '' };
		}

		// Geocode result for coordinates changes extremely rarely, cache for 7 days (604800 seconds)
		setCache(cacheKey, result, 604800);

		return json(result);
	} catch (error) {
		console.error('Geocoding error:', error);
		return json({ name: 'Detected Location' });
	}
};
