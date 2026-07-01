export interface WeatherDetails {
	air_temperature: number;
	relative_humidity: number;
	wind_speed: number;
	wind_from_direction: number;
	precipitation_amount?: number;
	[key: string]: any;
}

export interface ForecastPeriod {
	time: string;
	temp: number;
	symbolCode: string;
	precip: number;
	windSpeed: number;
	windDir: number;
	windArrow: string;
	windDesc: string;
}

/**
 * Get the wind cardinal direction based on degrees.
 */
export function getWindDirectionName(deg: number): string {
	const normalized = ((deg % 360) + 360) % 360;
	if (normalized >= 337.5 || normalized < 22.5) return 'north';
	if (normalized >= 22.5 && normalized < 67.5) return 'north east';
	if (normalized >= 67.5 && normalized < 112.5) return 'east';
	if (normalized >= 112.5 && normalized < 157.5) return 'south east';
	if (normalized >= 157.5 && normalized < 202.5) return 'south';
	if (normalized >= 202.5 && normalized < 247.5) return 'south west';
	if (normalized >= 247.5 && normalized < 292.5) return 'west';
	return 'north west'; // 292.5 to 337.5
}

/**
 * Get the wind arrow representing the physical motion of the wind (pointing where it blows towards).
 */
export function getWindArrow(deg: number): string {
	const dirName = getWindDirectionName(deg);
	switch (dirName) {
		case 'north': return '↓'; // Blows from north to south
		case 'north east': return '↙';
		case 'east': return '←';
		case 'south east': return '↖';
		case 'south': return '↑';
		case 'south west': return '↗';
		case 'west': return '→';
		case 'north west': return '↘';
		default: return '↓';
	}
}

/**
 * Get Beaufort scale description for wind speed.
 */
export function getBeaufortScale(speed: number): string {
	if (speed < 0.3) return 'Calm';
	if (speed < 1.5) return 'Light air';
	if (speed < 3.3) return 'Light breeze';
	if (speed < 5.5) return 'Gentle breeze';
	if (speed < 8.0) return 'Moderate breeze';
	if (speed < 10.8) return 'Fresh breeze';
	if (speed < 13.9) return 'Strong breeze';
	if (speed < 17.2) return 'Near gale';
	if (speed < 20.7) return 'Gale';
	if (speed < 24.4) return 'Strong gale';
	if (speed < 28.4) return 'Storm';
	if (speed < 32.6) return 'Violent storm';
	return 'Hurricane';
}

/**
 * Get full wind description (e.g. "Gentle breeze from north west").
 */
export function getWindDesc(speed: number, deg: number): string {
	const scale = getBeaufortScale(speed);
	const direction = getWindDirectionName(deg);
	return `${scale} from ${direction}`;
}

/**
 * Calculates Feels-Like (Apparent) Temperature in Celsius.
 */
export function calculateFeelsLike(temp: number, humidity: number, windSpeed: number): number {
	// Wind Chill for cold weather
	if (temp <= 10 && windSpeed > 1.33) {
		const wsKmh = windSpeed * 3.6;
		return Math.round(
			13.12 +
			0.6215 * temp -
			11.37 * Math.pow(wsKmh, 0.16) +
			0.3965 * temp * Math.pow(wsKmh, 0.16)
		);
	}
	
	// Heat Index for warm weather
	if (temp >= 26) {
		const T = (temp * 9) / 5 + 32; // Convert to Fahrenheit
		const R = humidity;
		
		// Simple heat index
		let hi = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + R * 0.094);
		
		if (hi >= 80) {
			// Rothfusz regression
			hi =
				-42.379 +
				2.04901523 * T +
				10.14333127 * R -
				0.22475541 * T * R -
				0.00683783 * T * T -
				0.05481717 * R * R +
				0.00122874 * T * T * R +
				0.00085282 * T * R * R -
				0.00000199 * T * T * R * R;
		}
		
		return Math.round(((hi - 32) * 5) / 9); // Convert back to Celsius
	}
	
	// Default to air temperature for moderate weather
	return Math.round(temp);
}

/**
 * Format timestamp into standard display date (e.g., "Friday 3 July")
 */
export function formatDate(isoString: string): string {
	const date = new Date(isoString);
	const options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	};
	return date.toLocaleDateString('en-US', options);
}

/**
 * Format timestamp into short display date (e.g., "Fri. 3 July")
 */
export function formatShortDate(isoString: string): string {
	const date = new Date(isoString);
	const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
	const day = date.getDate();
	const month = date.toLocaleDateString('en-US', { month: 'long' });
	return `${weekday}. ${day} ${month}`;
}

/**
 * Maps met.no symbol_code values to Bas Milius Meteocons filenames.
 */
export function getMeteoconFilename(symbolCode: string): string {
	let code = symbolCode.replace('.svg', '');
	if (!code) return 'not-available.svg';

	switch (code) {
		case 'clearsky_day':
		case 'clearsky_polartwilight':
			return 'clear-day.svg';
		case 'clearsky_night':
			return 'clear-night.svg';
		
		case 'fair_day':
		case 'fair_polartwilight':
		case 'partlycloudy_day':
		case 'partlycloudy_polartwilight':
			return 'partly-cloudy-day.svg';
		
		case 'fair_night':
		case 'partlycloudy_night':
			return 'partly-cloudy-night.svg';
		
		case 'cloudy':
			return 'cloudy.svg';
		
		case 'fog':
			return 'fog.svg';
		
		// Rain
		case 'lightrain':
			return 'drizzle.svg';
		case 'rain':
			return 'rain.svg';
		case 'heavyrain':
			return 'extreme-rain.svg';
		
		// Rain Showers
		case 'lightrainshowers_day':
		case 'lightrainshowers_polartwilight':
			return 'partly-cloudy-day-drizzle.svg';
		case 'lightrainshowers_night':
			return 'partly-cloudy-night-drizzle.svg';
		case 'rainshowers_day':
		case 'rainshowers_polartwilight':
			return 'partly-cloudy-day-rain.svg';
		case 'rainshowers_night':
			return 'partly-cloudy-night-rain.svg';
		case 'heavyrainshowers_day':
		case 'heavyrainshowers_polartwilight':
			return 'extreme-day-rain.svg';
		case 'heavyrainshowers_night':
			return 'extreme-night-rain.svg';
		
		// Sleet
		case 'lightsleet':
		case 'sleet':
			return 'sleet.svg';
		case 'heavysleet':
			return 'extreme-sleet.svg';
		
		// Sleet Showers
		case 'lightsleetshowers_day':
		case 'lightsleetshowers_polartwilight':
		case 'sleetshowers_day':
		case 'sleetshowers_polartwilight':
			return 'partly-cloudy-day-sleet.svg';
		case 'lightsleetshowers_night':
		case 'sleetshowers_night':
			return 'partly-cloudy-night-sleet.svg';
		case 'heavysleetshowers_day':
		case 'heavysleetshowers_polartwilight':
			return 'extreme-day-sleet.svg';
		case 'heavysleetshowers_night':
			return 'extreme-night-sleet.svg';
		
		// Snow
		case 'lightsnow':
		case 'snow':
			return 'snow.svg';
		case 'heavysnow':
			return 'extreme-snow.svg';
		
		// Snow Showers
		case 'lightsnowshowers_day':
		case 'lightsnowshowers_polartwilight':
		case 'snowshowers_day':
		case 'snowshowers_polartwilight':
			return 'partly-cloudy-day-snow.svg';
		case 'lightsnowshowers_night':
		case 'snowshowers_night':
			return 'partly-cloudy-night-snow.svg';
		case 'heavysnowshowers_day':
		case 'heavysnowshowers_polartwilight':
			return 'extreme-day-snow.svg';
		case 'heavysnowshowers_night':
			return 'extreme-night-snow.svg';
		
		// Thunderstorms
		case 'rainandthunder':
			return 'thunderstorms-rain.svg';
		case 'heavyrainandthunder':
			return 'extreme-thunderstorms-rain.svg';
		case 'lightrainandthunder':
			return 'thunderstorms-drizzle.svg';
		
		case 'snowandthunder':
		case 'lightsnowandthunder':
			return 'thunderstorms-snow.svg';
		case 'heavysnowandthunder':
			return 'extreme-thunderstorms-snow.svg';
		
		case 'sleetandthunder':
		case 'lightsleetandthunder':
			return 'thunderstorms-sleet.svg';
		case 'heavysleetandthunder':
			return 'extreme-thunderstorms-sleet.svg';
		
		// Thunderstorm Showers
		case 'lightrainshowersandthunder_day':
		case 'lightrainshowersandthunder_polartwilight':
			return 'thunderstorms-day-drizzle.svg';
		case 'lightrainshowersandthunder_night':
			return 'thunderstorms-night-drizzle.svg';
		case 'rainshowersandthunder_day':
		case 'rainshowersandthunder_polartwilight':
			return 'thunderstorms-day-rain.svg';
		case 'rainshowersandthunder_night':
			return 'thunderstorms-night-rain.svg';
		case 'heavyrainshowersandthunder_day':
		case 'heavyrainshowersandthunder_polartwilight':
			return 'extreme-thunderstorms-day-rain.svg';
		case 'heavyrainshowersandthunder_night':
			return 'extreme-thunderstorms-extreme-night-rain.svg';
		
		case 'lightsnowshowersandthunder_day':
		case 'lightsnowshowersandthunder_polartwilight':
			return 'thunderstorms-day-snow.svg';
		case 'lightsnowshowersandthunder_night':
			return 'thunderstorms-night-snow.svg';
		case 'heavysnowshowersandthunder_day':
		case 'heavysnowshowersandthunder_polartwilight':
			return 'extreme-thunderstorms-day-snow.svg';
		case 'heavysnowshowersandthunder_night':
			return 'extreme-thunderstorms-extreme-night-snow.svg';
		
		case 'lightsleetshowersandthunder_day':
		case 'lightsleetshowersandthunder_polartwilight':
		case 'sleetshowersandthunder_day':
		case 'sleetshowersandthunder_polartwilight':
			return 'thunderstorms-day-sleet.svg';
		case 'lightsleetshowersandthunder_night':
		case 'sleetshowersandthunder_night':
			return 'thunderstorms-night-sleet.svg';
		case 'heavysleetshowersandthunder_day':
		case 'heavysleetshowersandthunder_polartwilight':
			return 'extreme-thunderstorms-day-sleet.svg';
		case 'heavysleetshowersandthunder_night':
			return 'extreme-thunderstorms-extreme-night-sleet.svg';
		
		default:
			// Fallbacks
			if (code.includes('thunder')) {
				if (code.includes('snow')) return 'thunderstorms-snow.svg';
				if (code.includes('sleet')) return 'thunderstorms-sleet.svg';
				return 'thunderstorms.svg';
			}
			if (code.includes('snow')) {
				if (code.includes('day')) return 'partly-cloudy-day-snow.svg';
				if (code.includes('night')) return 'partly-cloudy-night-snow.svg';
				return 'snow.svg';
			}
			if (code.includes('sleet')) {
				if (code.includes('day')) return 'partly-cloudy-day-sleet.svg';
				if (code.includes('night')) return 'partly-cloudy-night-sleet.svg';
				return 'sleet.svg';
			}
			if (code.includes('rain') || code.includes('drizzle')) {
				if (code.includes('day')) return 'partly-cloudy-day-rain.svg';
				if (code.includes('night')) return 'partly-cloudy-night-rain.svg';
				return 'rain.svg';
			}
			if (code.includes('cloud')) {
				if (code.includes('day')) return 'partly-cloudy-day.svg';
				if (code.includes('night')) return 'partly-cloudy-night.svg';
				return 'cloudy.svg';
			}
			if (code.includes('clear') || code.includes('sun')) {
				return code.includes('night') ? 'clear-night.svg' : 'clear-day.svg';
			}
			return 'not-available.svg';
	}
}

/**
 * Calculates a heated color interpolation for high temperatures:
 * - <= 15: cold blue
 * - 20: warm orange
 * - 30: bright red
 * - >= 40: blackish-red
 */
export function getHighTempColor(temp: number): string {
	if (temp <= 15) return 'rgb(56, 189, 248)';
	if (temp >= 40) return 'rgb(30, 8, 8)';

	if (temp > 15 && temp <= 20) {
		const pct = (temp - 15) / 5;
		const r = Math.round(56 + (249 - 56) * pct);
		const g = Math.round(189 + (115 - 189) * pct);
		const b = Math.round(248 + (22 - 248) * pct);
		return `rgb(${r}, ${g}, ${b})`;
	} else if (temp > 20 && temp <= 30) {
		const pct = (temp - 20) / 10;
		const r = Math.round(249 + (220 - 249) * pct);
		const g = Math.round(115 + (38 - 115) * pct);
		const b = Math.round(22 + (38 - 22) * pct);
		return `rgb(${r}, ${g}, ${b})`;
	} else {
		const pct = (temp - 30) / 10;
		const r = Math.round(220 + (30 - 220) * pct);
		const g = Math.round(38 + (8 - 38) * pct);
		const b = Math.round(38 + (8 - 38) * pct);
		return `rgb(${r}, ${g}, ${b})`;
	}
}


