import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCache, setCache } from '$lib/server/db';
import { createLogger } from '$lib/server/logger';

const log = createLogger('api:sunrise');

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

	const openMeteoUrl = new URL('https://api.open-meteo.com/v1/forecast');
	openMeteoUrl.searchParams.set('latitude', formattedLat);
	openMeteoUrl.searchParams.set('longitude', formattedLon);
	openMeteoUrl.searchParams.set('daily', 'sunrise,sunset');
	openMeteoUrl.searchParams.set('timezone', 'auto');
	openMeteoUrl.searchParams.set('start_date', dateStr);
	openMeteoUrl.searchParams.set('end_date', dateStr);

	try {
		const response = await fetch(openMeteoUrl.toString());

		if (!response.ok) {
			const errorText = await response.text();
			log.warn({ status: response.status, body: errorText }, 'Open-Meteo sunrise request failed');
			return json(
				{ error: `Open-Meteo Sunrise API returned status ${response.status}: ${errorText}` },
				{ status: response.status }
			);
		}

		const data = await response.json();

		const utcOffsetSeconds = data.utc_offset_seconds || 0;
		const offsetSign = utcOffsetSeconds >= 0 ? '+' : '-';
		const absOffsetSeconds = Math.abs(utcOffsetSeconds);
		const offsetHours = Math.floor(absOffsetSeconds / 3600);
		const offsetMinutes = Math.floor((absOffsetSeconds % 3600) / 60);
		const offsetStr = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

		const rawSunrise = data.daily?.sunrise?.[0];
		const rawSunset = data.daily?.sunset?.[0];

		const sunriseTime = rawSunrise ? `${rawSunrise}${offsetStr}` : null;
		const sunsetTime = rawSunset ? `${rawSunset}${offsetStr}` : null;

		const mappedData = {
			properties: {
				sunrise: {
					time: sunriseTime
				},
				sunset: {
					time: sunsetTime
				}
			}
		};

		// Sunrise/sunset for a specific date is fixed, cache for 24 hours (86400 seconds)
		setCache(cacheKey, mappedData, 86400);

		return json(mappedData);
	} catch (error: any) {
		log.error({ err: error, lat: formattedLat, lon: formattedLon, date: dateStr }, 'Failed to fetch sunrise data');
		return json({ error: error.message || 'Failed to fetch sunrise data' }, { status: 500 });
	}
};
