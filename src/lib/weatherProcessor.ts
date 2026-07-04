import { 
	calculateFeelsLike, 
	getWindArrow, 
	getWindDesc, 
	formatDate, 
	formatShortDate 
} from './weatherUtils';

export interface WeatherInfo {
	current: {
		temp: number;
		feelsLike: number;
		humidity: number;
		windSpeed: number;
		windDir: number;
		windArrow: string;
		windDesc: string;
		precip: number;
		symbolCode: string;
	};
	daily: DailyForecast[];
	graphData: GraphDataPoint[];
	dataSource?: string;
	fetchedAt?: number;
}

export interface DailyForecast {
	dateStr: string; // YYYY-MM-DD
	dateLabel: string; // e.g. "Friday 3 July"
	shortDateLabel: string; // e.g. "Fri. 3 July"
	tempHigh: number;
	tempLow: number;
	precip: number;
	maxWindSpeed: number;
	icons: {
		night: string;
		morning: string;
		afternoon: string;
		evening: string;
	};
	details: WeatherDetailPoint[]; // Chronological list of steps (hourly or 6-hourly)
}

export interface WeatherDetailPoint {
	timeLabel: string; // e.g. "00" or "03-09"
	symbolCode: string;
	temp: number;
	precip: number;
	windSpeed: number;
	windArrow: string;
	windDesc: string;
}

export interface GraphDataPoint {
	timeLabel: string; // "02", "04"
	dayLabel: string; // "Thur. 2 July" if boundary, or ""
	temp: number;
	precip: number;
	windSpeed: number;
	windArrow: string;
	symbolCode: string;
	timestamp: number;
}

function mapWmoToMetnoSymbol(code: number, isDay: boolean): string {
	const suffix = isDay ? '_day' : '_night';
	switch (code) {
		case 0:
			return `clearsky${suffix}`;
		case 1:
			return `mostlyclear${suffix}`;
		case 2:
			return `partlycloudy${suffix}`;
		case 3:
			return `overcast${suffix}`;
		case 45:
		case 48:
			return `fog${suffix}`;
		case 51:
		case 53:
			return 'drizzle';
		case 55:
			return `overcastdrizzle${suffix}`;
		case 56:
			return 'sleet';
		case 57:
			return `heavysleet${suffix}`;
		case 61:
			return 'lightrain';
		case 63:
			return 'rain';
		case 65:
			return `overcastrain${suffix}`;
		case 66:
			return 'sleet';
		case 67:
			return `heavysleet${suffix}`;
		case 71:
			return 'lightsnow';
		case 73:
			return 'snow';
		case 75:
			return `heavysnow${suffix}`;
		case 77:
			return 'lightsnow';
		case 80:
			return `lightrainshowers${suffix}`;
		case 81:
			return `rainshowers${suffix}`;
		case 82:
			return `heavyrainshowers${suffix}`;
		case 85:
			return `snowshowers${suffix}`;
		case 86:
			return `heavysnowshowers${suffix}`;
		case 68:
			return 'sleet';
		case 83:
		case 84:
			return `sleetshowers${suffix}`;
		case 89:
			return `heavyrainshowers${suffix}`;
		case 95:
			return `rainshowersandthunder${suffix}`;
		case 96:
			return `thunderstormshail${suffix}`;
		case 99:
			return `extremethunderstormshail${suffix}`;
		default:
			return `clearsky${suffix}`;
	}
}

function getSymbolForHours(points: any[], minHour: number, maxHour: number, targetHour: number): string {
	const matching = points.filter((p) => {
		const h = new Date(p.time).getHours();
		return h >= minHour && h < maxHour;
	});
	if (matching.length === 0) return '';
	
	// Sort by closeness to targetHour
	matching.sort((a, b) => {
		const ha = new Date(a.time).getHours();
		const hb = new Date(b.time).getHours();
		return Math.abs(ha - targetHour) - Math.abs(hb - targetHour);
	});

	const bestPoint = matching[0];
	return mapWmoToMetnoSymbol(bestPoint.weatherCode, bestPoint.isDay);
}

export function processWeatherData(data: any): WeatherInfo {
	if (!data || !data.current || !data.hourly) {
		throw new Error('Invalid Open-Meteo weather data structure');
	}

	const utcOffset = data.utc_offset_seconds || 0;
	const offsetSign = utcOffset >= 0 ? '+' : '-';
	const absOffset = Math.abs(utcOffset);
	const offsetHours = Math.floor(absOffset / 3600);
	const offsetMinutes = Math.floor((absOffset % 3600) / 60);
	const offsetStr = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

	// Process Current Conditions
	const currentTemp = Math.round(data.current.temperature_2m);
	const currentHumidity = Math.round(data.current.relative_humidity_2m);
	const currentWindSpeed = Math.round(data.current.wind_speed_10m * 10) / 10;
	const currentWindDir = data.current.wind_direction_10m;
	const currentPrecip = Math.round(data.current.precipitation * 10) / 10;
	const currentSymbol = mapWmoToMetnoSymbol(data.current.weather_code, data.current.is_day === 1);

	const currentInfo = {
		temp: currentTemp,
		feelsLike: calculateFeelsLike(currentTemp, currentHumidity, currentWindSpeed),
		humidity: currentHumidity,
		windSpeed: currentWindSpeed,
		windDir: currentWindDir,
		windArrow: getWindArrow(currentWindDir),
		windDesc: getWindDesc(currentWindSpeed, currentWindDir),
		precip: currentPrecip,
		symbolCode: currentSymbol
	};

	// Convert parallel hourly arrays to array of objects
	const hourly = data.hourly;
	const hourlyLength = hourly.time?.length || 0;
	const hourlyPoints: any[] = [];

	for (let i = 0; i < hourlyLength; i++) {
		const rawTime = hourly.time[i];
		const isoTime = new Date(`${rawTime}${offsetStr}`).toISOString();
		hourlyPoints.push({
			time: isoTime,
			temp: hourly.temperature_2m[i],
			humidity: hourly.relative_humidity_2m[i],
			apparentTemp: hourly.apparent_temperature[i],
			windSpeed: hourly.wind_speed_10m[i],
			windDir: hourly.wind_direction_10m[i],
			weatherCode: hourly.weather_code[i],
			precip: hourly.precipitation[i],
			visibility: hourly.visibility[i],
			uvIndex: hourly.uv_index[i],
			snowDepth: hourly.snow_depth[i],
			freezingLevel: hourly.freezing_level_height[i],
			isDay: hourly.is_day[i] === 1
		});
	}

	// Group hourly points by local date
	const daysMap = new Map<string, any[]>();
	for (const point of hourlyPoints) {
		const dateObj = new Date(point.time);
		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, '0');
		const day = String(dateObj.getDate()).padStart(2, '0');
		const localDateStr = `${year}-${month}-${day}`;
		
		if (!daysMap.has(localDateStr)) {
			daysMap.set(localDateStr, []);
		}
		daysMap.get(localDateStr)!.push(point);
	}

	const dailyForecasts: DailyForecast[] = [];
	const sortedDates = Array.from(daysMap.keys()).sort();

	const todayObj = new Date();
	const yearToday = todayObj.getFullYear();
	const monthToday = String(todayObj.getMonth() + 1).padStart(2, '0');
	const dayToday = String(todayObj.getDate()).padStart(2, '0');
	const todayStr = `${yearToday}-${monthToday}-${dayToday}`;

	const datesToProcess = sortedDates.slice(0, 10);

	for (const dateStr of datesToProcess) {
		const points = daysMap.get(dateStr)!;
		
		// Temperature High/Low
		const temps = points.map(p => p.temp);
		const tempHigh = Math.round(Math.max(...temps));
		const tempLow = Math.round(Math.min(...temps));

		// Max Wind Speed
		const windSpeeds = points.map(p => p.windSpeed);
		const maxWindSpeed = Math.max(...windSpeeds);

		// Total Precipitation
		let dayPrecip = 0;
		for (const p of points) {
			dayPrecip += p.precip ?? 0;
		}
		dayPrecip = Math.round(dayPrecip * 10) / 10;

		// Local date representation labels
		const firstPointTime = points[0].time;
		const dateLabel = formatDate(firstPointTime);
		const shortDateLabel = formatShortDate(firstPointTime);

		// Determine 4-column weather icons
		const icons = {
			night: getSymbolForHours(points, 0, 6, 3),
			morning: getSymbolForHours(points, 6, 12, 9),
			afternoon: getSymbolForHours(points, 12, 18, 15),
			evening: getSymbolForHours(points, 18, 24, 21)
		};

		const fallbackSymbol = mapWmoToMetnoSymbol(points[0].weatherCode, points[0].isDay);
		if (!icons.night) icons.night = fallbackSymbol;
		if (!icons.morning) icons.morning = fallbackSymbol;
		if (!icons.afternoon) icons.afternoon = fallbackSymbol;
		if (!icons.evening) icons.evening = fallbackSymbol;

		// Process day forecast details
		let detailPoints = points;
		if (dateStr === todayStr) {
			const startOfCurrentHour = new Date();
			startOfCurrentHour.setMinutes(0, 0, 0);
			detailPoints = points.filter(p => new Date(p.time).getTime() >= startOfCurrentHour.getTime());
		}

		const details: WeatherDetailPoint[] = detailPoints.map(p => {
			const pDate = new Date(p.time);
			const localHour = pDate.getHours();
			const timeLabel = String(localHour).padStart(2, '0');
			const symbol = mapWmoToMetnoSymbol(p.weatherCode, p.isDay);

			return {
				timeLabel,
				symbolCode: symbol,
				temp: Math.round(p.temp),
				precip: Math.round(p.precip * 10) / 10,
				windSpeed: Math.round(p.windSpeed * 10) / 10,
				windArrow: getWindArrow(p.windDir),
				windDesc: getWindDesc(p.windSpeed, p.windDir)
			};
		});

		dailyForecasts.push({
			dateStr,
			dateLabel,
			shortDateLabel,
			tempHigh,
			tempLow,
			precip: dayPrecip,
			maxWindSpeed: Math.round(maxWindSpeed * 10) / 10,
			icons,
			details
		});
	}

	// Process Graph Data (all points for the first ~3 days)
	const first3Days = sortedDates.slice(0, 3);
	const graphPointsRaw = hourlyPoints.filter((p: any) => {
		const dateObj = new Date(p.time);
		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, '0');
		const day = String(dateObj.getDate()).padStart(2, '0');
		const localDateStr = `${year}-${month}-${day}`;
		return first3Days.includes(localDateStr);
	});

	const graphData: GraphDataPoint[] = [];
	let lastDayLabel = '';
	
	for (const p of graphPointsRaw) {
		const pDate = new Date(p.time);
		const localHour = pDate.getHours();
		


		const dayLabelStr = formatShortDate(p.time);
		let dayLabel = '';
		if (dayLabelStr !== lastDayLabel) {
			dayLabel = dayLabelStr;
			lastDayLabel = dayLabelStr;
		}

		const symbol = mapWmoToMetnoSymbol(p.weatherCode, p.isDay);

		graphData.push({
			timeLabel: String(localHour).padStart(2, '0'),
			dayLabel,
			temp: Math.round(p.temp),
			precip: Math.round(p.precip * 10) / 10,
			windSpeed: Math.round(p.windSpeed * 10) / 10,
			windArrow: getWindArrow(p.windDir),
			symbolCode: symbol,
			timestamp: pDate.getTime()
		});
	}

	return {
		current: currentInfo,
		daily: dailyForecasts,
		graphData,
		dataSource: 'Open-Meteo',
		fetchedAt: data.fetchedAt
	};
}
