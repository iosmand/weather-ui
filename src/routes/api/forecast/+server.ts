import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCache, setCache } from '$lib/server/db';
import { createLogger } from '$lib/server/logger';

const log = createLogger('api:forecast');

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

	try {
		const openMeteoUrl = new URL('https://api.open-meteo.com/v1/forecast');
		openMeteoUrl.searchParams.set('latitude', formattedLat);
		openMeteoUrl.searchParams.set('longitude', formattedLon);
		openMeteoUrl.searchParams.set('current', [
			'temperature_2m',
			'relative_humidity_2m',
			'apparent_temperature',
			'wind_speed_10m',
			'wind_direction_10m',
			'pressure_msl',
			'weather_code',
			'precipitation',
			'is_day'
		].join(','));
		openMeteoUrl.searchParams.set('hourly', [
			'temperature_2m',
			'relative_humidity_2m',
			'apparent_temperature',
			'wind_speed_10m',
			'wind_direction_10m',
			'weather_code',
			'precipitation',
			'visibility',
			'uv_index',
			'snow_depth',
			'freezing_level_height',
			'is_day'
		].join(','));
		openMeteoUrl.searchParams.set('wind_speed_unit', 'ms');
		openMeteoUrl.searchParams.set('timezone', 'auto');

		const response = await fetch(openMeteoUrl.toString());

		if (!response.ok) {
			const errorText = await response.text();
			log.warn({ status: response.status, body: errorText }, 'Open-Meteo forecast request failed');
			return json(
				{ error: `Open-Meteo API returned status ${response.status}: ${errorText}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		data.fetchedAt = Date.now();

		// Cache in SQLite for 30 minutes (1800s)
		setCache(cacheKey, data, 1800);

		return json(data);
	} catch (error: any) {
		log.error({ err: error, lat: formattedLat, lon: formattedLon }, 'Failed to fetch Open-Meteo forecast');
		return json({ error: error.message || 'Failed to fetch Open-Meteo weather data' }, { status: 500 });
	}
};
