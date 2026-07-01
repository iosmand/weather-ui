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

/**
 * Gets the symbol code for a given local hour range in a list of timeseries points.
 */
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
	return (
		bestPoint.data.next_1_hours?.summary?.symbol_code ||
		bestPoint.data.next_6_hours?.summary?.symbol_code ||
		bestPoint.data.next_12_hours?.summary?.symbol_code ||
		''
	);
}

export function processWeatherData(data: any): WeatherInfo {
	if (!data || !data.properties || !data.properties.timeseries) {
		throw new Error('Invalid met.no weather data structure');
	}

	const timeseries = data.properties.timeseries;
	
	// 1. Process Current Conditions
	const currentPoint = timeseries[0];
	const currentInstant = currentPoint.data.instant.details;
	const currentTemp = Math.round(currentInstant.air_temperature);
	const currentHumidity = Math.round(currentInstant.relative_humidity);
	const currentWindSpeed = currentInstant.wind_speed;
	const currentWindDir = currentInstant.wind_from_direction;
	
	const currentPrecip = 
		currentPoint.data.next_1_hours?.details?.precipitation_amount ?? 
		currentPoint.data.next_6_hours?.details?.precipitation_amount ?? 
		0;
		
	const currentSymbol = 
		currentPoint.data.next_1_hours?.summary?.symbol_code ?? 
		currentPoint.data.next_6_hours?.summary?.symbol_code ?? 
		'clearsky_day';

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

	// 2. Group timeseries by local date
	const daysMap = new Map<string, any[]>();
	for (const point of timeseries) {
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

	// 3. Process each day
	const dailyForecasts: DailyForecast[] = [];
	const sortedDates = Array.from(daysMap.keys()).sort();

	// We only show up to 10 days of forecast
	const datesToProcess = sortedDates.slice(0, 10);

	for (const dateStr of datesToProcess) {
		const points = daysMap.get(dateStr)!;
		
		// Temperature High/Low
		const temps = points.map(p => p.data.instant.details.air_temperature);
		const tempHigh = Math.round(Math.max(...temps));
		const tempLow = Math.round(Math.min(...temps));

		// Max Wind Speed
		const windSpeeds = points.map(p => p.data.instant.details.wind_speed);
		const maxWindSpeed = Math.max(...windSpeeds);

		// Total Precipitation
		let dayPrecip = 0;
		for (const p of points) {
			if (p.data.next_1_hours) {
				dayPrecip += p.data.next_1_hours.details.precipitation_amount ?? 0;
			} else if (p.data.next_6_hours) {
				dayPrecip += p.data.next_6_hours.details.precipitation_amount ?? 0;
			}
		}
		// Round to 1 decimal place
		dayPrecip = Math.round(dayPrecip * 10) / 10;

		// Local date representation labels
		const firstPointTime = points[0].time;
		const dateLabel = formatDate(firstPointTime);
		const shortDateLabel = formatShortDate(firstPointTime);

		// Determine 4-column weather icons: Night (00-06), Morning (06-12), Afternoon (12-18), Evening (18-24)
		const icons = {
			night: getSymbolForHours(points, 0, 6, 3),
			morning: getSymbolForHours(points, 6, 12, 9),
			afternoon: getSymbolForHours(points, 12, 18, 15),
			evening: getSymbolForHours(points, 18, 24, 21)
		};

		// If some icons are blank, fallback to available values
		const fallbackSymbol = 
			points[0].data.next_1_hours?.summary?.symbol_code || 
			points[0].data.next_6_hours?.summary?.symbol_code || 
			'clearsky_day';

		if (!icons.night) icons.night = fallbackSymbol;
		if (!icons.morning) icons.morning = fallbackSymbol;
		if (!icons.afternoon) icons.afternoon = fallbackSymbol;
		if (!icons.evening) icons.evening = fallbackSymbol;

		// Process day forecast details (Chronological list of steps)
		const details: WeatherDetailPoint[] = points.map(p => {
			const pDate = new Date(p.time);
			const localHour = pDate.getHours();
			
			let timeLabel = '';
			let symbol = '';
			let precipVal = 0;

			// Check if hourly or 6-hourly
			if (p.data.next_1_hours) {
				// Hourly step
				timeLabel = String(localHour).padStart(2, '0');
				symbol = p.data.next_1_hours.summary.symbol_code;
				precipVal = p.data.next_1_hours.details.precipitation_amount ?? 0;
			} else if (p.data.next_6_hours) {
				// 6-hourly step
				const startHourStr = String(localHour).padStart(2, '0');
				const endHourStr = String((localHour + 6) % 24).padStart(2, '0');
				timeLabel = `${startHourStr}-${endHourStr}`;
				symbol = p.data.next_6_hours.summary.symbol_code;
				precipVal = p.data.next_6_hours.details.precipitation_amount ?? 0;
			} else if (p.data.next_12_hours) {
				// 12-hourly step
				const startHourStr = String(localHour).padStart(2, '0');
				const endHourStr = String((localHour + 12) % 24).padStart(2, '0');
				timeLabel = `${startHourStr}-${endHourStr}`;
				symbol = p.data.next_12_hours.summary.symbol_code;
				precipVal = p.data.next_12_hours.details.precipitation_amount ?? 0;
			} else {
				// Fallback
				timeLabel = String(localHour).padStart(2, '0');
				symbol = fallbackSymbol;
				precipVal = 0;
			}

			const inst = p.data.instant.details;
			return {
				timeLabel,
				symbolCode: symbol,
				temp: Math.round(inst.air_temperature),
				precip: Math.round(precipVal * 10) / 10,
				windSpeed: Math.round(inst.wind_speed * 10) / 10,
				windArrow: getWindArrow(inst.wind_from_direction),
				windDesc: getWindDesc(inst.wind_speed, inst.wind_from_direction)
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

	// 4. Process Graph Data (all points for the first ~3 days)
	const first3Days = sortedDates.slice(0, 3);
	const graphPointsRaw = timeseries.filter((p: any) => {
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
		
		// If hourly data is present: filter to even hours to avoid overcrowding the X axis (02, 04, 06, etc.)
		if (p.data.next_1_hours && localHour % 2 !== 0) {
			continue;
		}

		// Calculate date label if we cross day boundaries
		const dayLabelStr = formatShortDate(p.time);
		let dayLabel = '';
		if (dayLabelStr !== lastDayLabel) {
			dayLabel = dayLabelStr;
			lastDayLabel = dayLabelStr;
		}

		const inst = p.data.instant.details;
		const symbol = p.data.next_1_hours?.summary?.symbol_code ??
			p.data.next_6_hours?.summary?.symbol_code ??
			'clearsky_day';
			
		const precip = p.data.next_1_hours?.details?.precipitation_amount ??
			p.data.next_6_hours?.details?.precipitation_amount ??
			0;

		graphData.push({
			timeLabel: String(localHour).padStart(2, '0'),
			dayLabel,
			temp: Math.round(inst.air_temperature),
			precip: Math.round(precip * 10) / 10,
			windSpeed: Math.round(inst.wind_speed * 10) / 10,
			windArrow: getWindArrow(inst.wind_from_direction),
			symbolCode: symbol,
			timestamp: pDate.getTime()
		});
	}

	return {
		current: currentInfo,
		daily: dailyForecasts,
		graphData
	};
}
