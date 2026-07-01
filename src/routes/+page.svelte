<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		MapPin, 
		Wind, 
		Droplets, 
		Sunrise as SunriseIcon, 
		Sunset as SunsetIcon, 
		Download, 
		AlertTriangle,
		Search,
		Compass,
		Loader,
		CloudRain
	} from '@lucide/svelte';
	
	import WeatherIcon from '$lib/components/WeatherIcon.svelte';
	import { processWeatherData, type WeatherInfo, type DailyForecast } from '$lib/weatherProcessor';
	import { getHighTempColor } from '$lib/weatherUtils';

	// Predefined locations
	const PRESETS = [
		{ name: 'Oslo', lat: 59.9139, lon: 10.7522 },
		{ name: 'London', lat: 51.5074, lon: -0.1278 },
		{ name: 'New York', lat: 40.7128, lon: -74.0060 },
		{ name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
		{ name: 'Cairo', lat: 30.0444, lon: 31.2357 }
	];

	// Translations dictionary for English, Turkish, German, Spanish, French, and Italian
	const translations = {
		en: {
			selectLocation: "Select Location",
			locateMe: "Locate Me",
			latitude: "Latitude",
			longitude: "Longitude",
			queryCoordinates: "Query Coordinates",
			activeLocation: "Active location",
			feelsLike: "Feels like",
			humidity: "Humidity",
			rain: "Rain",
			windSpeedDirection: "Wind speed & direction",
			dailyForecast: "Daily Forecast",
			interactiveGraph: "Interactive Graph",
			date: "Date",
			night: "Night",
			morning: "Morning",
			afternoon: "Afternoon",
			evening: "Evening",
			highLow: "High/Low",
			precip: "Precip.",
			wind: "Wind",
			time: "Time",
			condition: "Condition",
			temp: "Temp.",
			windSpeed: "Wind speed",
			windDescription: "Wind description",
			sunrise: "Sunrise",
			sunset: "Sunset",
			dataSourced: "Data sourced from met.no",
			updatedRecently: "Updated recently.",
			syncing: "Syncing weather data...",
			locating: "Locating...",
			resolving: "Resolving Location...",
			solarTrajectory: "Calculating solar trajectory...",
			solarUnavailable: "Solar schedule unavailable",
			latError: "Latitude must be between -90 and 90",
			lonError: "Longitude must be between -180 and 180",
			offlineMode: "Offline Mode",
			installPwa: "Install PWA",
			temperatureLegend: "Temperature",
			precipitationLegend: "Precipitation",
			windSpeedLegend: "Wind speed",
			hourLabel: "Hour",
			todayLabel: "Today"
		},
		tr: {
			selectLocation: "Konum Seçin",
			locateMe: "Beni Bul",
			latitude: "Enlem",
			longitude: "Boylam",
			queryCoordinates: "Koordinat Sorgula",
			activeLocation: "Aktif konum",
			feelsLike: "Hissedilen",
			humidity: "Nem",
			rain: "Yağış",
			windSpeedDirection: "Rüzgar Hızı ve Yönü",
			dailyForecast: "Günlük Tahmin",
			interactiveGraph: "Etkileşimli Grafik",
			date: "Tarih",
			night: "Gece",
			morning: "Sabah",
			afternoon: "Öğleden Sonra",
			evening: "Akşam",
			highLow: "En Yüksek / En Düşük",
			precip: "Yağış",
			wind: "Rüzgar",
			time: "Saat",
			condition: "Durum",
			temp: "Sıcaklık",
			windSpeed: "Rüzgar hızı",
			windDescription: "Rüzgar açıklaması",
			sunrise: "Gün Doğumu",
			sunset: "Gün Batımı",
			dataSourced: "Veriler met.no'dan alınmıştır",
			updatedRecently: "Yakın zamanda güncellendi.",
			syncing: "Hava durumu senkronize ediliyor...",
			locating: "Konum bulunuyor...",
			resolving: "Konum çözümleniyor...",
			solarTrajectory: "Güneş yörüngesi hesaplanıyor...",
			solarUnavailable: "Güneş saatleri mevcut değil",
			latError: "Enlem -90 ile 90 arasında olmalıdır",
			lonError: "Boylam -180 ile 180 arasında olmalıdır",
			offlineMode: "Çevrimdışı Mod",
			installPwa: "PWA Kur",
			temperatureLegend: "Sıcaklık",
			precipitationLegend: "Yağış",
			windSpeedLegend: "Rüzgar Hızı",
			hourLabel: "Saat",
			todayLabel: "Bugün"
		},
		de: {
			selectLocation: "Ort auswählen",
			locateMe: "Ort bestimmen",
			latitude: "Breitengrad",
			longitude: "Längengrad",
			queryCoordinates: "Koordinaten abfragen",
			activeLocation: "Aktiver Ort",
			feelsLike: "Gefühlt",
			humidity: "Luftfeuchtigkeit",
			rain: "Regen",
			windSpeedDirection: "Windgeschwindigkeit & Richtung",
			dailyForecast: "Tägliche Vorhersage",
			interactiveGraph: "Interaktive Grafik",
			date: "Datum",
			night: "Nacht",
			morning: "Morgen",
			afternoon: "Nachmittag",
			evening: "Abend",
			highLow: "Max / Min",
			precip: "Niederschlag",
			wind: "Wind",
			time: "Zeit",
			condition: "Bedingung",
			temp: "Temp.",
			windSpeed: "Windgeschw.",
			windDescription: "Windbeschreibung",
			sunrise: "Sonnenaufgang",
			sunset: "Sonnenuntergang",
			dataSourced: "Daten von met.no",
			updatedRecently: "Kürzlich aktualisiert.",
			syncing: "Wetterdaten werden synchronisiert...",
			locating: "Ortung...",
			resolving: "Ort wird aufgelöst...",
			solarTrajectory: "Sonnenverlauf wird berechnet...",
			solarUnavailable: "Sonnenverlauf nicht verfügbar",
			latError: "Breitengrad muss zwischen -90 und 90 liegen",
			lonError: "Längengrad muss zwischen -180 und 180 liegen",
			offlineMode: "Offline-Modus",
			installPwa: "PWA installieren",
			temperatureLegend: "Temperatur",
			precipitationLegend: "Niederschlag",
			windSpeedLegend: "Windgeschwindigkeit",
			hourLabel: "Stunde",
			todayLabel: "Heute"
		},
		es: {
			selectLocation: "Seleccionar ubicación",
			locateMe: "Localizarme",
			latitude: "Latitud",
			longitude: "Longitud",
			queryCoordinates: "Consultar coordenadas",
			activeLocation: "Ubicación activa",
			feelsLike: "Sensación térmica",
			humidity: "Humedad",
			rain: "Lluvia",
			windSpeedDirection: "Velocidad y dirección del viento",
			dailyForecast: "Pronóstico diario",
			interactiveGraph: "Gráfico interactivo",
			date: "Fecha",
			night: "Noche",
			morning: "Mañana",
			afternoon: "Tarde",
			evening: "Noche",
			highLow: "Máx / Mín",
			precip: "Precip.",
			wind: "Viento",
			time: "Hora",
			condition: "Condición",
			temp: "Temp.",
			windSpeed: "Vel. del viento",
			windDescription: "Descripción del viento",
			sunrise: "Amanecer",
			sunset: "Atardecer",
			dataSourced: "Datos obtenidos de met.no",
			updatedRecently: "Actualizado recientemente.",
			syncing: "Sincronizando clima...",
			locating: "Localizando...",
			resolving: "Resolviendo ubicación...",
			solarTrajectory: "Calculando trayectoria solar...",
			solarUnavailable: "Horario solar no disponible",
			latError: "La latitud debe estar entre -90 y 90",
			lonError: "La longitud debe estar entre -180 y 180",
			offlineMode: "Modo sin conexión",
			installPwa: "Instalar PWA",
			temperatureLegend: "Temperatura",
			precipitationLegend: "Precipitación",
			windSpeedLegend: "Velocidad del viento",
			hourLabel: "Hora",
			todayLabel: "Hoy"
		},
		fr: {
			selectLocation: "Sélectionner l'emplacement",
			locateMe: "Me localiser",
			latitude: "Latitude",
			longitude: "Longitude",
			queryCoordinates: "Rechercher les coordonnées",
			activeLocation: "Emplacement actif",
			feelsLike: "Ressenti",
			humidity: "Humidité",
			rain: "Pluie",
			windSpeedDirection: "Vitesse & direction du vent",
			dailyForecast: "Prévisions quotidiennes",
			interactiveGraph: "Graphique interactif",
			date: "Date",
			night: "Nuit",
			morning: "Matin",
			afternoon: "Après-midi",
			evening: "Soirée",
			highLow: "Max / Min",
			precip: "Précip.",
			wind: "Vent",
			time: "Heure",
			condition: "Condition",
			temp: "Temp.",
			windSpeed: "Vitesse du vent",
			windDescription: "Description du vent",
			sunrise: "Lever du soleil",
			sunset: "Coucher du soleil",
			dataSourced: "Données fournies par met.no",
			updatedRecently: "Mis à jour récemment.",
			syncing: "Synchronisation de la météo...",
			locating: "Localisation...",
			resolving: "Résolution de l'adresse...",
			solarTrajectory: "Calcul de la trajectoire solaire...",
			solarUnavailable: "Horaires solaires indisponibles",
			latError: "La latitude doit être comprise entre -90 et 90",
			lonError: "La longitude doit être comprise entre -180 et 180",
			offlineMode: "Mode hors ligne",
			installPwa: "Installer la PWA",
			temperatureLegend: "Température",
			precipitationLegend: "Précipitations",
			windSpeedLegend: "Vitesse du vent",
			hourLabel: "Heure",
			todayLabel: "Aujourd'hui"
		},
		it: {
			selectLocation: "Seleziona posizione",
			locateMe: "Trovami",
			latitude: "Latitudine",
			longitude: "Longitudine",
			queryCoordinates: "Cerca coordinate",
			activeLocation: "Posizione attiva",
			feelsLike: "Percepita",
			humidity: "Umidità",
			rain: "Pioggia",
			windSpeedDirection: "Velocità e direzione del vento",
			dailyForecast: "Previsioni giornaliere",
			interactiveGraph: "Grafico interattivo",
			date: "Data",
			night: "Notte",
			morning: "Mattina",
			afternoon: "Pomeriggio",
			evening: "Sera",
			highLow: "Max / Min",
			precip: "Precip.",
			wind: "Vento",
			time: "Ora",
			condition: "Condizione",
			temp: "Temp.",
			windSpeed: "Velocità del vento",
			windDescription: "Descrizione del vento",
			sunrise: "Alba",
			sunset: "Tramonto",
			dataSourced: "Dati estratti da met.no",
			updatedRecently: "Aggiornato di recente.",
			syncing: "Sincronizzazione meteo...",
			locating: "Localizzazione...",
			resolving: "Risoluzione posizione...",
			solarTrajectory: "Calcolo traiettoria solare...",
			solarUnavailable: "Orario solare non disponibile",
			latError: "La latitudine deve essere compresa tra -90 e 90",
			lonError: "La longitudine deve essere compresa tra -180 e 180",
			offlineMode: "Modalità offline",
			installPwa: "Installa PWA",
			temperatureLegend: "Temperatura",
			precipitationLegend: "Precipitazioni",
			windSpeedLegend: "Velocità del vento",
			hourLabel: "Ora",
			todayLabel: "Oggi"
		}
	};

	// Wind descriptors dictionary for precise grammar translation
	const windTerms = {
		en: {
			calm: 'Calm',
			lightAir: 'Light air',
			lightBreeze: 'Light breeze',
			gentleBreeze: 'Gentle breeze',
			moderateBreeze: 'Moderate breeze',
			freshBreeze: 'Fresh breeze',
			strongBreeze: 'Strong breeze',
			highWind: 'High wind',
			gale: 'Gale',
			strongGale: 'Strong gale',
			storm: 'Storm',
			violentStorm: 'Violent storm',
			hurricane: 'Hurricane',
			from: 'from',
			north: 'North',
			northEast: 'North-East',
			east: 'East',
			southEast: 'South-East',
			south: 'South',
			southWest: 'South-West',
			west: 'West',
			northWest: 'North-West'
		},
		tr: {
			calm: 'Sakin',
			lightAir: 'Hafif esinti',
			lightBreeze: 'Hafif rüzgar',
			gentleBreeze: 'Tatlı rüzgar',
			moderateBreeze: 'Orta esinti',
			freshBreeze: 'Sert esinti',
			strongBreeze: 'Kuvvetli esinti',
			highWind: 'Kuvvetli rüzgar',
			gale: 'Fırtına',
			strongGale: 'Kuvvetli fırtına',
			storm: 'Fırtına',
			violentStorm: 'Şiddetli fırtına',
			hurricane: 'Kasırga',
			from: 'yönünden',
			north: 'Kuzey',
			northEast: 'Kuzeydoğu',
			east: 'Doğu',
			southEast: 'Güneydoğu',
			south: 'Güney',
			southWest: 'Güneybatı',
			west: 'Batı',
			northWest: 'Kuzeybatı'
		},
		de: {
			calm: 'Windstille',
			lightAir: 'Leiser Zug',
			lightBreeze: 'Leichte Brise',
			gentleBreeze: 'Schwache Brise',
			moderateBreeze: 'Mäßige Brise',
			freshBreeze: 'Frische Brise',
			strongBreeze: 'Starker Wind',
			highWind: 'Steifer Wind',
			gale: 'Sturm',
			strongGale: 'Schwerer Sturm',
			storm: 'Sturm',
			violentStorm: 'Orkanartiger Sturm',
			hurricane: 'Orkan',
			from: 'aus',
			north: 'Norden',
			northEast: 'Nordost',
			east: 'Osten',
			southEast: 'Südost',
			south: 'Süden',
			southWest: 'Südwest',
			west: 'Westen',
			northWest: 'Nordwest'
		},
		es: {
			calm: 'Calma',
			lightAir: 'Ventolina',
			lightBreeze: 'Brisa muy débil',
			gentleBreeze: 'Brisa débil',
			moderateBreeze: 'Brisa moderada',
			freshBreeze: 'Brisa fresca',
			strongBreeze: 'Brisa fuerte',
			highWind: 'Viento fuerte',
			gale: 'Vendaval',
			strongGale: 'Temporal fuerte',
			storm: 'Temporal',
			violentStorm: 'Temporal duro',
			hurricane: 'Huracán',
			from: 'del',
			north: 'Norte',
			northEast: 'Noreste',
			east: 'Este',
			southEast: 'Sureste',
			south: 'Sur',
			southWest: 'Suroeste',
			west: 'Oeste',
			northWest: 'Noroeste'
		},
		fr: {
			calm: 'Calme',
			lightAir: 'Très légère brise',
			lightBreeze: 'Légère brise',
			gentleBreeze: 'Petite brise',
			moderateBreeze: 'Jolie brise',
			freshBreeze: 'Bonne brise',
			strongBreeze: 'Frais vent',
			highWind: 'Grand frais',
			gale: 'Coup de vent',
			strongGale: 'Fort coup de vent',
			storm: 'Tempête',
			violentStorm: 'Violente tempête',
			hurricane: 'Ouragan',
			from: 'du',
			north: 'Nord',
			northEast: 'Nord-Est',
			east: 'Est',
			southEast: 'Sud-Est',
			south: 'Sud',
			southWest: 'Sud-Ouest',
			west: 'Ouest',
			northWest: 'Nord-Ouest'
		},
		it: {
			calm: 'Calma',
			lightAir: 'Bava di vento',
			lightBreeze: 'Brezza leggera',
			gentleBreeze: 'Brezza tesa',
			moderateBreeze: 'Brezza moderata',
			freshBreeze: 'Vento fresco',
			strongBreeze: 'Vento forte',
			highWind: 'Burrasca leggera',
			gale: 'Burrasca',
			strongGale: 'Burrasca forte',
			storm: 'Tempesta',
			violentStorm: 'Fortunale',
			hurricane: 'Uragano',
			from: 'da',
			north: 'Nord',
			northEast: 'Nord-Est',
			east: 'Est',
			southEast: 'Sud-Est',
			south: 'Sud',
			southWest: 'Sud-Ouest',
			west: 'Ovest',
			northWest: 'Nord-Ovest'
		}
	};

	// Locale mapping for standard JS Internationalization API
	const localeMap = {
		en: 'en-US',
		tr: 'tr-TR',
		de: 'de-DE',
		es: 'es-ES',
		fr: 'fr-FR',
		it: 'it-IT'
	};

	// 1. REACTIVE RUNES (States) declared first at the top of the script
	let lang = $state<'en' | 'tr' | 'de' | 'es' | 'fr' | 'it'>('en');
	let activeTab = $state<'table' | 'graph'>('table');
	let weatherData = $state<WeatherInfo | null>(null);
	let loading = $state<boolean>(false);
	let error = $state<string | null>(null);
	
	let lat = $state<string>('');
	let lon = $state<string>('');
	let currentCity = $state<string>('Locating...');
	
	let expandedDayIndex = $state<number | null>(null);
	let daySunEvents = $state<{ [date: string]: { sunrise: string; sunset: string } }>({});
	let sunLoading = $state<boolean>(false);

	let hoveredPoint = $state<any | null>(null);
	let tooltipX = $state<number>(0);
	
	let deferredPrompt = $state<any>(null);
	let showInstallBtn = $state<boolean>(false);
	let isOffline = $state<boolean>(false);

	// Leaflet map instance & marker references (non-reactive)
	let map: any = null;
	let marker: any = null;

	// 2. DERIVED RUNES declared right after states to prevent Temporal Dead Zone (TDZ) reference errors
	let svgPoints = $derived.by(() => {
		if (!weatherData || !weatherData.graphData || weatherData.graphData.length === 0) {
			return { 
				path: '', 
				windPath: '', 
				filledPath: '', 
				points: [], 
				minTemp: 0, 
				maxTemp: 0, 
				maxPrecip: 1, 
				minWind: 0, 
				maxWind: 0, 
				width: 900, 
				height: 280, 
				paddingLeft: 50, 
				paddingTop: 45, 
				drawWidth: 810, 
				drawHeight: 195 
			};
		}
		
		const data = weatherData.graphData;
		const width = 900;
		const height = 280;
		const paddingLeft = 50;
		const paddingRight = 40;
		const paddingTop = 45;
		const paddingBottom = 40;

		const drawWidth = width - paddingLeft - paddingRight;
		const drawHeight = height - paddingTop - paddingBottom;

		const temps = data.map(d => d.temp);
		const minTemp = Math.min(...temps);
		const maxTemp = Math.max(...temps);
		const tempRange = maxTemp - minTemp || 1;

		const winds = data.map(d => d.windSpeed);
		const minWind = Math.min(...winds);
		const maxWind = Math.max(...winds);
		const windRange = maxWind - minWind || 1;

		const precips = data.map(d => d.precip);
		const maxPrecip = Math.max(...precips) || 1;

		const points = data.map((d, i) => {
			const x = paddingLeft + (i / (data.length - 1)) * drawWidth;
			const yTemp = paddingTop + 90 - ((d.temp - minTemp) / tempRange) * 90;
			const yWind = paddingTop + 210 - ((d.windSpeed - minWind) / windRange) * 50;
			const precipHeight = (d.precip / maxPrecip) * 40;

			return { x, yTemp, yWind, precipHeight, raw: d };
		});

		// Build Temperature cubic line path
		let path = '';
		if (points.length > 0) {
			path = `M ${points[0].x} ${points[0].yTemp}`;
			for (let i = 0; i < points.length - 1; i++) {
				const p0 = points[i];
				const p1 = points[i + 1];
				const cpX1 = p0.x + (p1.x - p0.x) / 3;
				const cpY1 = p0.yTemp;
				const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
				const cpY2 = p1.yTemp;
				path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.yTemp}`;
			}
		}

		// Build Wind line path
		let windPath = '';
		if (points.length > 0) {
			windPath = `M ${points[0].x} ${points[0].yWind}`;
			for (let i = 0; i < points.length - 1; i++) {
				const p0 = points[i];
				const p1 = points[i + 1];
				const cpX1 = p0.x + (p1.x - p0.x) / 3;
				const cpY1 = p0.yWind;
				const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
				const cpY2 = p1.yWind;
				windPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.yWind}`;
			}
		}

		// Build temperature gradient filled path
		let filledPath = '';
		if (points.length > 0) {
			filledPath = `${path} L ${points[points.length - 1].x} 145 L ${points[0].x} 145 Z`;
		}

		return {
			points,
			path,
			windPath,
			filledPath,
			minTemp,
			maxTemp,
			maxPrecip,
			minWind,
			maxWind,
			width,
			height,
			paddingLeft,
			paddingTop,
			drawWidth,
			drawHeight
		};
	});

	let maxTempIdx = $derived.by(() => {
		if (!weatherData || !weatherData.graphData || weatherData.graphData.length === 0) return -1;
		const temps = weatherData.graphData.map(d => d.temp);
		const maxVal = Math.max(...temps);
		return weatherData.graphData.findIndex(d => d.temp === maxVal);
	});
	
	let minTempIdx = $derived.by(() => {
		if (!weatherData || !weatherData.graphData || weatherData.graphData.length === 0) return -1;
		const temps = weatherData.graphData.map(d => d.temp);
		const minVal = Math.min(...temps);
		return weatherData.graphData.findIndex(d => d.temp === minVal);
	});

	let lastUpdatedTime = $derived.by(() => {
		const cached = localStorage.getItem('aura_weather_cache');
		if (!cached) return '';
		return translations[lang].updatedRecently;
	});

	// Load cached weather or request location on mount
	onMount(async () => {
		// Set language based on browser preference (default to en)
		const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
		if (browserLang.startsWith('tr')) {
			lang = 'tr';
		} else if (browserLang.startsWith('de')) {
			lang = 'de';
		} else if (browserLang.startsWith('es')) {
			lang = 'es';
		} else if (browserLang.startsWith('fr')) {
			lang = 'fr';
		} else if (browserLang.startsWith('it')) {
			lang = 'it';
		} else {
			lang = 'en';
		}

		currentCity = translations[lang].locating;

		// PWA install prompt handler
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			showInstallBtn = true;
		});

		window.addEventListener('appinstalled', () => {
			showInstallBtn = false;
			deferredPrompt = null;
		});

		// Check offline status
		isOffline = !navigator.onLine;
		window.addEventListener('online', () => { isOffline = false; });
		window.addEventListener('offline', () => { isOffline = true; });

		// Import Leaflet dynamically to avoid SSR errors
		const L = (await import('leaflet')).default;
		
		// If map already exists (HMR), clean it up first
		if (map) {
			map.remove();
			map = null;
			marker = null;
		}

		// Initialize Map: default London
		map = L.map('map', { zoomControl: false }).setView([51.5074, -0.1278], 5);
		
		// Styled Dark Matter tile layer
		L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
		}).addTo(map);

		// Glowing custom SVG marker icon
		const customIcon = L.divIcon({
			className: 'custom-map-marker',
			html: `<div class="w-4.5 h-4.5 rounded-full bg-sky-400 border-2 border-white animate-pulse shadow-[0_0_12px_#38bdf8]"></div>`,
			iconSize: [18, 18],
			iconAnchor: [9, 9]
		});

		// Listen for map clicks
		map.on('click', async (e: any) => {
			const { lat: clickLat, lng: clickLng } = e.latlng;
			lat = clickLat.toFixed(4);
			lon = clickLng.toFixed(4);

			if (marker) {
				marker.setLatLng(e.latlng);
			} else {
				marker = L.marker(e.latlng, { icon: customIcon }).addTo(map);
			}

			currentCity = translations[lang].resolving;
			await resolveLocationName(clickLat, clickLng);
			
			localStorage.setItem('aura_weather_coords', JSON.stringify({
				lat: clickLat,
				lon: clickLng,
				name: currentCity
			}));
			fetchWeather(clickLat, clickLng);
		});

		// Attempt to load from localStorage first
		const cached = localStorage.getItem('aura_weather_cache');
		const cachedCoords = localStorage.getItem('aura_weather_coords');
		
		if (cachedCoords) {
			const coords = JSON.parse(cachedCoords);
			lat = coords.lat.toString();
			lon = coords.lon.toString();
			currentCity = coords.name || 'Last Location';
			
			// Position map and marker at cached coordinates
			const latlng = L.latLng(coords.lat, coords.lon);
			map.setView(latlng, 8);
			marker = L.marker(latlng, { icon: customIcon }).addTo(map);
		}

		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				if (parsed.daily && parsed.daily.length > 0 && parsed.daily[0].details && parsed.graphData && parsed.graphData.length > 0 && parsed.graphData[0].timestamp) {
					weatherData = parsed;
				} else {
					console.warn('Cached weather structure is outdated, ignoring');
					localStorage.removeItem('aura_weather_cache');
				}
			} catch (e) {
				console.error('Failed to parse cached weather', e);
			}
		}

		// Always fetch fresh weather on mount
		if (lat && lon) {
			resolveLocationName(parseFloat(lat), parseFloat(lon));
			fetchWeather(parseFloat(lat), parseFloat(lon));
		} else {
			requestGeolocation();
		}
	});

	// Dynamic map centering update
	async function updateMapLocation(latitude: number, longitude: number) {
		if (!map) return;
		const L = (await import('leaflet')).default;
		const latlng = L.latLng(latitude, longitude);
		
		map.setView(latlng, 8);

		const customIcon = L.divIcon({
			className: 'custom-map-marker',
			html: `<div class="w-4.5 h-4.5 rounded-full bg-sky-400 border-2 border-white animate-pulse shadow-[0_0_12px_#38bdf8]"></div>`,
			iconSize: [18, 18],
			iconAnchor: [9, 9]
		});

		if (marker) {
			marker.setLatLng(latlng);
		} else {
			marker = L.marker(latlng, { icon: customIcon }).addTo(map);
		}
	}

	// Trigger PWA installation
	async function installApp() {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === 'accepted') {
			showInstallBtn = false;
			deferredPrompt = null;
		}
	}

	// Geolocation fetcher
	function requestGeolocation() {
		if (navigator.geolocation) {
			loading = true;
			error = null;
			currentCity = translations[lang].locating;
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const latitude = position.coords.latitude;
					const longitude = position.coords.longitude;
					lat = latitude.toFixed(4);
					lon = longitude.toFixed(4);
					
					// Resolve city name first
					await resolveLocationName(latitude, longitude);
					
					// Center map on user coordinates
					updateMapLocation(latitude, longitude);
					
					localStorage.setItem('aura_weather_coords', JSON.stringify({
						lat: latitude,
						lon: longitude,
						name: currentCity
					}));

					fetchWeather(latitude, longitude);
				},
				(geoError) => {
					console.warn('Geolocation failed or denied', geoError);
					// Default to London if failed
					lat = '51.5074';
					lon = '-0.1278';
					currentCity = lang === 'tr' ? 'Londra' : 'London';
					updateMapLocation(51.5074, -0.1278);
					fetchWeather(51.5074, -0.1278);
				},
				{ enableHighAccuracy: true, timeout: 10000 }
			);
		} else {
			// Fallback if not supported
			lat = '51.5074';
			lon = '-0.1278';
			currentCity = lang === 'tr' ? 'Londra' : 'London';
			updateMapLocation(51.5074, -0.1278);
			fetchWeather(51.5074, -0.1278);
		}
	}

	// Resolves coordinate to place name via our geocode proxy endpoint
	async function resolveLocationName(latitude: number, longitude: number) {
		try {
			const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
			if (res.ok) {
				const data = await res.json();
				
				// Translate default fallback name if needed
				if (data.name === 'Detected Location') {
					if (lang === 'tr') currentCity = 'Tespit Edilen Konum';
					else if (lang === 'de') currentCity = 'Erkannter Standort';
					else if (lang === 'es') currentCity = 'Ubicación Detectada';
					else if (lang === 'fr') currentCity = 'Emplacement Détecté';
					else if (lang === 'it') currentCity = 'Posizione Rilevata';
					else currentCity = 'Detected Location';
				} else if (data.name === 'London' && lang === 'tr') {
					currentCity = 'Londra';
				} else if (data.name === 'Cairo' && lang === 'tr') {
					currentCity = 'Kahire';
				} else {
					currentCity = data.name || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
				}
				
				const storedCoords = localStorage.getItem('aura_weather_coords');
				if (storedCoords) {
					const coords = JSON.parse(storedCoords);
					coords.name = currentCity;
					localStorage.setItem('aura_weather_coords', JSON.stringify(coords));
				}
			}
		} catch (err) {
			console.error('Failed to resolve city name', err);
			currentCity = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
		}
	}

	// Preset selector
	function selectPreset(preset: typeof PRESETS[0]) {
		lat = preset.lat.toFixed(4);
		lon = preset.lon.toFixed(4);
		
		// Localize preset names on the fly
		let resolvedName = preset.name;
		if (preset.name === 'London' && lang === 'tr') resolvedName = 'Londra';
		if (preset.name === 'Cairo' && lang === 'tr') resolvedName = 'Kahire';
		
		currentCity = resolvedName;
		
		updateMapLocation(preset.lat, preset.lon);
		localStorage.setItem('aura_weather_coords', JSON.stringify({
			...preset,
			name: resolvedName
		}));
		fetchWeather(preset.lat, preset.lon);
	}

	// Coordinate submit handler
	async function handleManualSubmit(e: SubmitEvent) {
		e.preventDefault();
		const latitude = parseFloat(lat);
		const longitude = parseFloat(lon);

		if (isNaN(latitude) || latitude < -90 || latitude > 90) {
			error = translations[lang].latError;
			return;
		}
		if (isNaN(longitude) || longitude < -180 || longitude > 180) {
			error = translations[lang].lonError;
			return;
		}

		currentCity = translations[lang].resolving;
		loading = true;
		
		await resolveLocationName(latitude, longitude);
		updateMapLocation(latitude, longitude);
		
		localStorage.setItem('aura_weather_coords', JSON.stringify({
			lat: latitude,
			lon: longitude,
			name: currentCity
		}));
		
		fetchWeather(latitude, longitude);
	}

	// Fetch weather forecast from server API proxy
	async function fetchWeather(latitude: number, longitude: number) {
		loading = true;
		error = null;
		expandedDayIndex = null; // reset expanded row
		
		try {
			const response = await fetch(`/api/forecast?lat=${latitude}&lon=${longitude}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || `Server error ${response.status}`);
			}

			const processed = processWeatherData(data);
			weatherData = processed;

			// Save to cache for offline availability
			localStorage.setItem('aura_weather_cache', JSON.stringify(processed));
		} catch (err: any) {
			console.error(err);
			const cached = localStorage.getItem('aura_weather_cache');
			if (cached) {
				weatherData = JSON.parse(cached);
				error = lang === 'tr' 
					? `Hava durumu güncellenemedi: ${err.message}. Önbellekteki veriler gösteriliyor.` 
					: `Failed to update weather: ${err.message}. Showing cached data.`;
			} else {
				error = err.message || (lang === 'tr' ? 'Hava durumu verileri alınamadı.' : 'Failed to retrieve weather data.');
			}
		} finally {
			loading = false;
		}
	}

	// Expand/Collapse a row in the daily table and fetch sun events if needed
	function toggleRow(index: number, dateStr: string) {
		if (expandedDayIndex === index) {
			expandedDayIndex = null;
		} else {
			expandedDayIndex = index;
			fetchSunriseSunset(dateStr);
		}
	}

	// Fetch Sunrise/Sunset info for a specific date
	async function fetchSunriseSunset(dateStr: string) {
		if (daySunEvents[dateStr]) return;

		const latitude = parseFloat(lat);
		const longitude = parseFloat(lon);
		if (isNaN(latitude) || isNaN(longitude)) return;

		sunLoading = true;
		try {
			const offsetMinutes = new Date().getTimezoneOffset();
			const offsetHours = -offsetMinutes / 60;
			const sign = offsetHours >= 0 ? '+' : '-';
			const absHours = Math.abs(Math.floor(offsetHours));
			const absMinutes = Math.abs(offsetMinutes % 60);
			const offsetStr = `${sign}${String(absHours).padStart(2, '0')}:${String(absMinutes).padStart(2, '0')}`;

			const response = await fetch(`/api/sunrise?lat=${latitude}&lon=${longitude}&date=${dateStr}&offset=${encodeURIComponent(offsetStr)}`);
			const data = await response.json();

			if (response.ok && data.properties) {
				const sunriseTime = data.properties.sunrise?.time;
				const sunsetTime = data.properties.sunset?.time;
				
				const formatTime = (isoString: string) => {
					if (!isoString) return '--:--';
					const d = new Date(isoString);
					return d.toLocaleTimeString(localeMap[lang], { hour: '2-digit', minute: '2-digit', hour12: false });
				};

				daySunEvents = {
					...daySunEvents,
					[dateStr]: {
						sunrise: formatTime(sunriseTime),
						sunset: formatTime(sunsetTime)
					}
				};
			}
		} catch (err) {
			console.error('Failed to fetch sunrise/sunset', err);
		} finally {
			sunLoading = false;
		}
	}

	// Helper to format days dynamically in English, Turkish, German, Spanish, French, and Italian
	function getDayLabel(dateStr: string, index: number, currentLang: typeof lang): string {
		const date = new Date(dateStr);
		const label = date.toLocaleDateString(localeMap[currentLang], { 
			weekday: 'long', 
			day: 'numeric', 
			month: 'long' 
		});
		if (index === 0) {
			const todayText = translations[currentLang].todayLabel;
			if (currentLang === 'tr') {
				return `${todayText}, ${date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`;
			} else if (currentLang === 'de') {
				return `${todayText}, ${date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}`;
			} else {
				return `${todayText}, ${date.toLocaleDateString(localeMap[currentLang], { month: 'long', day: 'numeric' })}`;
			}
		}
		return label;
	}

	// Grammar-aware wind description translation engine
	function getTranslatedWindDesc(desc: string, currentLang: typeof lang): string {
		const langTerms = windTerms[currentLang] || windTerms.en;
		const normalized = desc.toLowerCase().trim();
		
		const directions = ['north east', 'north west', 'south east', 'south west', 'north', 'south', 'east', 'west'];
		let speedPart = '';
		let dirPart = '';
		
		for (const dir of directions) {
			if (normalized.endsWith('from ' + dir)) {
				dirPart = dir;
				speedPart = normalized.substring(0, normalized.length - ('from ' + dir).length).trim();
				break;
			}
		}
		
		if (!dirPart) {
			if (normalized === 'calm') return langTerms.calm;
			return desc; // fallback
		}
		
		// Map Beaufort terms
		let speedKey: keyof typeof langTerms = 'gentleBreeze';
		if (speedPart.includes('calm')) speedKey = 'calm';
		else if (speedPart.includes('light air')) speedKey = 'lightAir';
		else if (speedPart.includes('light breeze')) speedKey = 'lightBreeze';
		else if (speedPart.includes('gentle breeze')) speedKey = 'gentleBreeze';
		else if (speedPart.includes('moderate breeze')) speedKey = 'moderateBreeze';
		else if (speedPart.includes('fresh breeze')) speedKey = 'freshBreeze';
		else if (speedPart.includes('strong breeze')) speedKey = 'strongBreeze';
		else if (speedPart.includes('high wind')) speedKey = 'highWind';
		else if (speedPart.includes('near gale') || speedPart.includes('gale')) speedKey = 'gale';
		else if (speedPart.includes('strong gale')) speedKey = 'strongGale';
		else if (speedPart.includes('violent storm')) speedKey = 'violentStorm';
		else if (speedPart.includes('storm')) speedKey = 'storm';
		else if (speedPart.includes('hurricane')) speedKey = 'hurricane';
		
		// Map directions
		let dirKey: keyof typeof langTerms = 'north';
		if (dirPart === 'north east') dirKey = 'northEast';
		else if (dirPart === 'north west') dirKey = 'northWest';
		else if (dirPart === 'south east') dirKey = 'southEast';
		else if (dirPart === 'south west') dirKey = 'southWest';
		else if (dirPart === 'north') dirKey = 'north';
		else if (dirPart === 'south') dirKey = 'south';
		else if (dirPart === 'east') dirKey = 'east';
		else if (dirPart === 'west') dirKey = 'west';
		
		const speedVal = langTerms[speedKey];
		const dirVal = langTerms[dirKey];
		
		// Map word order grammatically
		if (currentLang === 'tr') {
			return `${dirVal} ${langTerms.from} ${speedVal}`; // e.g. "Kuzey yönünden Hafif rüzgar"
		}
		if (currentLang === 'de') {
			return `${speedVal} ${langTerms.from} ${dirVal}`; // e.g. "Leichte Brise aus Norden"
		}
		if (currentLang === 'es') {
			return `${speedVal} ${langTerms.from} ${dirVal}`; // e.g. "Brisa débil del Norte"
		}
		if (currentLang === 'fr') {
			return `${speedVal} ${langTerms.from} ${dirVal}`; // e.g. "Petite brise du Nord"
		}
		if (currentLang === 'it') {
			return `${speedVal} ${langTerms.from} ${dirVal}`; // e.g. "Brezza leggera da Nord"
		}
		
		return `${speedVal} ${langTerms.from} ${dirVal}`;
	}

	// Get weekday names formatted based on current language
	function getWeekdayShort(timestamp: number): string {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		if (isNaN(date.getTime())) return '';
		return date.toLocaleDateString(localeMap[lang], { weekday: 'short' });
	}

	// Get full weekday names formatted based on current language
	function getWeekdayFull(timestamp: number): string {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		if (isNaN(date.getTime())) return '';
		return date.toLocaleDateString(localeMap[lang], { weekday: 'long' });
	}

	// Chart Mousemove tracker to show tooltip
	function handleMouseMove(e: MouseEvent) {
		if (!weatherData || !weatherData.graphData || weatherData.graphData.length === 0) return;
		const svg = e.currentTarget as SVGElement;
		const rect = svg.getBoundingClientRect();
		
		const mouseXRelative = e.clientX - rect.left;
		const svgX = (mouseXRelative / rect.width) * 900;
		
		const points = svgPoints.points;
		if (!points || points.length === 0) return;
		
		let closest = points[0];
		let minDiff = Math.abs(points[0].x - svgX);
		
		for (let i = 1; i < points.length; i++) {
			const diff = Math.abs(points[i].x - svgX);
			if (diff < minDiff) {
				minDiff = diff;
				closest = points[i];
			}
		}
		
		hoveredPoint = closest;
		tooltipX = mouseXRelative;
	}
	
	function handleMouseLeave() {
		hoveredPoint = null;
	}
</script>

<!-- Header & PWA status banner -->
<header class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
	<div class="flex items-center gap-3">
		<!-- Apple Glassmorphism Styled Icon -->
		<div class="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] p-2.5 flex items-center justify-center">
			<img src="/logo.svg" alt="Weather logo" class="w-full h-full" />
		</div>
		<div>
			<h1 class="text-3.5xl font-extrabold font-display tracking-tight bg-gradient-to-r from-slate-50 via-slate-100 to-slate-300 bg-clip-text text-transparent">Weather</h1>
		</div>
	</div>

	<div class="flex items-center gap-3">
		<!-- Language Selection Test Switch Dropdown -->
		<div class="relative">
			<select 
				bind:value={lang}
				class="bg-white/5 text-text-primary border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-pointer hover:bg-white/10 transition-all"
			>
				<option value="en" class="bg-slate-900 text-text-primary">English (EN)</option>
				<option value="tr" class="bg-slate-900 text-text-primary">Türkçe (TR)</option>
				<option value="de" class="bg-slate-900 text-text-primary">Deutsch (DE)</option>
				<option value="es" class="bg-slate-900 text-text-primary">Español (ES)</option>
				<option value="fr" class="bg-slate-900 text-text-primary">Français (FR)</option>
				<option value="it" class="bg-slate-900 text-text-primary">Italiano (IT)</option>
			</select>
		</div>

		{#if isOffline}
			<span class="px-3.5 py-1.5 text-xs font-bold bg-red-950/40 backdrop-blur-md border border-red-500/25 text-red-200 rounded-full flex items-center gap-2">
				<AlertTriangle class="w-3.5 h-3.5 text-red-400" /> {translations[lang].offlineMode}
			</span>
		{/if}

		{#if showInstallBtn}
			<button 
				onclick={installApp}
				class="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-white/20 text-white rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
			>
				<Download class="w-3.5 h-3.5" />
				{translations[lang].installPwa}
			</button>
		{/if}
	</div>
</header>

<!-- Search and Preset Section (Apple Glassmorphism style with Leaflet map) -->
<div class="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl p-6 mb-8 transition-all duration-300">
	<h2 class="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
		<MapPin class="w-4.5 h-4.5 text-sky-400" />
		{translations[lang].selectLocation}
	</h2>
	
	<!-- Interactive Leaflet Map -->
	<div id="map" class="w-full h-[320px] rounded-2xl border border-white/10 shadow-lg shadow-black/30 overflow-hidden mb-6 relative z-0"></div>

	<!-- Presets row -->
	<div class="flex flex-wrap gap-2.5 mb-5 border-t border-white/5 pt-5">
		<button 
			onclick={requestGeolocation}
			class="px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 hover:border-sky-500/30 text-sky-400 flex items-center gap-1.5"
		>
			<Compass class="w-3.5 h-3.5" />
			{translations[lang].locateMe}
		</button>
		{#each PRESETS as preset}
			<button 
				onclick={() => selectPreset(preset)}
				class="px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 {currentCity === preset.name || (preset.name === 'London' && currentCity === 'Londra') || (preset.name === 'Cairo' && currentCity === 'Kahire') ? 'bg-sky-500 text-white border border-sky-400/30 shadow-[0_4px_12px_rgba(14,165,233,0.3)]' : 'bg-white/5 hover:bg-white/10 text-text-secondary border border-white/5 hover:border-white/10'}"
			>
				{preset.name === 'London' && lang === 'tr' ? 'Londra' : preset.name === 'Cairo' && lang === 'tr' ? 'Kahire' : preset.name}
			</button>
		{/each}
	</div>

	<!-- Coordinates form -->
	<form onsubmit={handleManualSubmit} class="flex flex-col sm:flex-row gap-4 items-end">
		<div class="w-full sm:w-1/3">
			<label for="latitude" class="block text-[11px] text-text-muted mb-1.5 font-bold uppercase tracking-wider">{translations[lang].latitude}</label>
			<input 
				id="latitude"
				type="number" 
				step="any"
				placeholder="e.g. 51.5074" 
				bind:value={lat}
				class="w-full bg-black/35 border border-white/5 focus:border-sky-500/50 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all font-medium"
			/>
		</div>
		<div class="w-full sm:w-1/3">
			<label for="longitude" class="block text-[11px] text-text-muted mb-1.5 font-bold uppercase tracking-wider">{translations[lang].longitude}</label>
			<input 
				id="longitude"
				type="number" 
				step="any"
				placeholder="e.g. -0.1278" 
				bind:value={lon}
				class="w-full bg-black/35 border border-white/5 focus:border-sky-500/50 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-sky-500/10 transition-all font-medium"
			/>
		</div>
		<button 
			type="submit" 
			class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-text-primary text-sm font-bold border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-1.5"
		>
			<Search class="w-4 h-4" />
			{translations[lang].queryCoordinates}
		</button>
	</form>
</div>

{#if error}
	<div class="p-4 bg-red-950/20 backdrop-blur-md border border-red-500/20 text-red-200 text-sm rounded-2xl mb-8 flex gap-3 items-center">
		<AlertTriangle class="flex-shrink-0 text-red-400 w-5 h-5" />
		<span>{error}</span>
	</div>
{/if}

{#if loading}
	<div class="flex flex-col items-center justify-center py-24 gap-4">
		<div class="relative w-16 h-16 flex items-center justify-center">
			<Loader class="w-10 h-10 text-sky-400 animate-spin" />
		</div>
		<p class="text-sm font-semibold text-text-secondary animate-pulse tracking-wide">{translations[lang].syncing}</p>
	</div>
{:else if weatherData}
	<!-- Current Conditions Card -->
	<section class="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
		<!-- Ambient background subtle light glow -->
		<div class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
		
		<div class="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest mb-6">
			<span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
			{translations[lang].activeLocation}: <span class="text-text-primary ml-1">{currentCity}</span>
		</div>

		<div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
			<div class="flex items-center gap-6">
				<!-- Big Meteocon icon -->
				<WeatherIcon symbolCode={weatherData.current.symbolCode} size="xl" />
				<div>
					<div class="flex items-baseline gap-4">
						<span class="text-6xl sm:text-7xl font-extrabold font-display leading-none tracking-tighter">{weatherData.current.temp}°</span>
						<span class="text-text-secondary text-sm sm:text-base font-bold bg-white/5 border border-white/5 px-3 py-1 rounded-full">{translations[lang].feelsLike} {weatherData.current.feelsLike}°</span>
					</div>
					<p class="text-base font-bold text-text-primary mt-2 capitalize tracking-wide flex items-center gap-1.5">
						{getTranslatedWindDesc(weatherData.current.symbolCode.replace(/_/g, ' ').replace(/day|night/g, ''), lang)}
					</p>
				</div>
			</div>

			<!-- Additional metrics grid (Frosted sub-container) -->
			<div class="grid grid-cols-2 gap-x-8 gap-y-5 w-full md:w-auto p-5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/5">
				<!-- Humidity -->
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-sky-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
						<Droplets class="w-5 h-5" />
					</div>
					<div>
						<div class="text-xs text-text-muted font-semibold uppercase tracking-wider">{translations[lang].humidity}</div>
						<div class="text-base font-bold">{weatherData.current.humidity}%</div>
					</div>
				</div>

				<!-- Precipitation -->
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-sky-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
						<CloudRain class="w-5 h-5" />
					</div>
					<div>
						<div class="text-xs text-text-muted font-semibold uppercase tracking-wider">{translations[lang].rain}</div>
						<div class="text-base font-bold">{weatherData.current.precip} mm</div>
					</div>
				</div>

				<!-- Wind speed & direction -->
				<div class="flex items-center gap-4 col-span-2">
					<div class="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-purple-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
						<Wind class="w-5 h-5" />
					</div>
					<div>
						<div class="text-xs text-text-muted font-semibold uppercase tracking-wider">{translations[lang].windSpeedDirection}</div>
						<div class="text-base font-bold flex items-center gap-2">
							{weatherData.current.windSpeed} m/s
							<span class="inline-flex font-black text-xs text-purple-200 w-5 h-5 bg-purple-500/20 border border-purple-500/20 rounded-full flex items-center justify-center shadow-inner" title="Direction: {weatherData.current.windDir}°">
								{weatherData.current.windArrow}
							</span>
							<span class="text-xs text-text-muted font-bold capitalize">({getTranslatedWindDesc(weatherData.current.windDesc, lang).split(' yönünden')[0].split(' aus')[0].split(' del')[0].split(' du')[0].split(' da')[0].split(' from')[0]})</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- View Tab Toggles (Table vs Graph) -->
	<div class="flex justify-center mb-8">
		<div class="bg-black/35 p-1 rounded-2xl border border-white/5 flex">
			<button 
				onclick={() => { activeTab = 'table'; }}
				class="px-8 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 {activeTab === 'table' ? 'bg-white/10 text-text-primary shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/5' : 'text-text-muted hover:text-text-secondary'}"
			>
				{translations[lang].dailyForecast}
			</button>
			<button 
				onclick={() => { activeTab = 'graph'; }}
				class="px-8 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 {activeTab === 'graph' ? 'bg-white/10 text-text-primary shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/5' : 'text-text-muted hover:text-text-secondary'}"
			>
				{translations[lang].interactiveGraph}
			</button>
		</div>
	</div>

	<!-- TAB CONTENT -->
	{#if activeTab === 'table'}
		<!-- DAILY TABLE VIEW (Frosted card) -->
		<div class="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-left border-collapse min-w-[750px]">
					<thead>
						<tr class="border-b border-white/5 text-[10px] font-bold text-text-muted uppercase tracking-widest bg-black/10">
							<th class="py-5 px-6 w-1/4">{translations[lang].date}</th>
							<th class="py-5 px-2 text-center">{translations[lang].night}</th>
							<th class="py-5 px-2 text-center">{translations[lang].morning}</th>
							<th class="py-5 px-2 text-center">{translations[lang].afternoon}</th>
							<th class="py-5 px-2 text-center">{translations[lang].evening}</th>
							<th class="py-5 px-4 text-center">{translations[lang].highLow}</th>
							<th class="py-5 px-4 text-center">{translations[lang].precip}</th>
							<th class="py-5 px-6 text-center">{translations[lang].wind}</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each weatherData.daily as day, index}
							<!-- Row Header -->
							<tr 
								onclick={() => toggleRow(index, day.dateStr)}
								class="hover:bg-white/5 cursor-pointer transition-colors duration-250 {expandedDayIndex === index ? 'bg-white/5' : ''}"
							>
								<!-- Day Label -->
								<td class="py-5 px-6 font-bold text-text-primary text-sm sm:text-base">
									{getDayLabel(day.dateStr, index, lang)}
								</td>
								
								<!-- Night Icon -->
								<td class="py-3 px-2 text-center">
									<div class="flex justify-center"><WeatherIcon symbolCode={day.icons.night} size="md" /></div>
								</td>
								
								<!-- Morning Icon -->
								<td class="py-3 px-2 text-center">
									<div class="flex justify-center"><WeatherIcon symbolCode={day.icons.morning} size="md" /></div>
								</td>
								
								<!-- Afternoon Icon -->
								<td class="py-3 px-2 text-center">
									<div class="flex justify-center"><WeatherIcon symbolCode={day.icons.afternoon} size="md" /></div>
								</td>
								
								<!-- Evening Icon -->
								<td class="py-3 px-2 text-center">
									<div class="flex justify-center"><WeatherIcon symbolCode={day.icons.evening} size="md" /></div>
								</td>
								
								<!-- Temp Range (with Heated High Temp Colors & CSS Outline) -->
								<td class="py-5 px-4 text-center whitespace-nowrap text-sm sm:text-base font-bold">
									<span style="color: {getHighTempColor(day.tempHigh)}; text-shadow: 0 0 3px rgba(255, 255, 255, 0.25);" class="font-extrabold">{day.tempHigh}°</span>
									<span class="text-text-muted/65 mx-1.5 font-normal">/</span>
									<span class="text-temp-low">{day.tempLow}°</span>
								</td>
								
								<!-- Precip -->
								<td class="py-5 px-4 text-center text-xs sm:text-sm font-bold text-sky-400">
									{day.precip > 0 ? `${day.precip} mm` : ''}
								</td>
								
								<!-- Wind -->
								<td class="py-5 px-6 text-center text-xs sm:text-sm font-bold text-text-secondary whitespace-nowrap">
									{day.maxWindSpeed} m/s
								</td>
							</tr>

							<!-- Expanded Row Detail (Automatically listing steps, NO switches) -->
							{#if expandedDayIndex === index}
								<tr>
									<td colspan="8" class="p-0 bg-black/20">
										<div class="border-t border-b border-white/5 p-6 flex flex-col gap-5">
											
											<!-- Detailed Listing -->
											<div class="overflow-hidden rounded-2xl border border-white/5 bg-black/30 shadow-inner">
												<table class="w-full text-left text-xs sm:text-sm">
													<thead>
														<tr class="text-[10px] text-text-muted border-b border-white/5 bg-black/40 font-bold uppercase tracking-wider">
															<th class="py-3 px-5">{translations[lang].time}</th>
															<th class="py-3 px-4">{translations[lang].condition}</th>
															<th class="py-3 px-4">{translations[lang].temp}</th>
															<th class="py-3 px-4 text-center">{translations[lang].precip}</th>
															<th class="py-3 px-4">{translations[lang].windSpeed}</th>
															<th class="py-3 px-5">{translations[lang].windDescription}</th>
														</tr>
													</thead>
													<tbody class="divide-y divide-white/5 font-semibold">
														{#each day.details as step}
															<tr class="hover:bg-white/5 transition-all">
																<!-- Time hour or interval -->
																<td class="py-2.5 px-5 text-text-secondary tracking-wide text-xs sm:text-sm">
																	{step.timeLabel}
																</td>
																<!-- Weather Icon -->
																<td class="py-1 px-4">
																	<WeatherIcon symbolCode={step.symbolCode} size="md" />
																</td>
																<!-- Temp with outline -->
																<td class="py-2.5 px-4 text-sm sm:text-base">
																	<span style="color: {getHighTempColor(step.temp)}; text-shadow: 0 0 3px rgba(255, 255, 255, 0.25);" class="font-extrabold">{step.temp}°</span>
																</td>
																<!-- Precipitation -->
																<td class="py-2.5 px-4 text-center text-sky-400 font-bold">
																	{step.precip > 0 ? `${step.precip} mm` : ''}
																</td>
																<!-- Wind speed & arrow -->
																<td class="py-2.5 px-4 text-text-secondary">
																	<span class="inline-flex items-center gap-1.5 font-bold">
																		{step.windSpeed} m/s
																		<span class="text-purple-300 font-bold text-xs bg-purple-500/20 w-4 h-4 rounded-full flex items-center justify-center shadow-inner">{step.windArrow}</span>
																	</span>
																</td>
																<!-- Wind desc -->
																<td class="py-2.5 px-5 text-[11px] text-text-muted capitalize">
																	{getTranslatedWindDesc(step.windDesc, lang)}
																</td>
															</tr>
														{/each}
													</tbody>
												</table>
											</div>

											<!-- Sunrise/Sunset Footer details -->
											<div class="flex items-center gap-6 justify-center text-xs border-t border-white/5 pt-4 font-bold text-text-secondary uppercase tracking-wider">
												{#if sunLoading}
													<span class="text-[10px] text-text-muted animate-pulse">{translations[lang].solarTrajectory}</span>
												{:else if daySunEvents[day.dateStr]}
													<span class="flex items-center gap-2">
														<SunriseIcon class="w-4 h-4 text-accent-gold" />
														{translations[lang].sunrise} <span class="text-accent-gold font-extrabold">{daySunEvents[day.dateStr].sunrise}</span>
													</span>
													<span class="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
													<span class="flex items-center gap-2">
														<SunsetIcon class="w-4 h-4 text-orange-400" />
														{translations[lang].sunset} <span class="text-orange-400 font-extrabold">{daySunEvents[day.dateStr].sunset}</span>
													</span>
												{:else}
													<span class="text-[10px] text-text-muted">{translations[lang].solarUnavailable}</span>
												{/if}
											</div>

										</div>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
			<!-- Footer update info -->
			<div class="py-4.5 px-6 text-[10px] text-text-muted font-bold uppercase tracking-widest bg-black/20 border-t border-white/5 flex justify-between">
				<span>{translations[lang].dataSourced}</span>
				<span>{lastUpdatedTime}</span>
			</div>
		</div>
	{:else}
		<!-- GRAPH VIEW (Frosted card) -->
		<div class="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl p-6 overflow-x-auto relative">
			<div class="min-w-[800px] relative">
				<!-- SVG Canvas -->
				<svg 
					viewBox="0 0 {svgPoints.width} {svgPoints.height}" 
					width="100%" 
					class="overflow-visible select-none cursor-crosshair"
					onmousemove={handleMouseMove}
					onmouseleave={handleMouseLeave}
					role="img"
					aria-label="Interactive weather forecast graph"
				>
					<defs>
						<!-- Area under Temperature curve gradient -->
						<linearGradient id="tempFillGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stop-color="#ea580c" stop-opacity="0.15" />
							<stop offset="100%" stop-color="#ea580c" stop-opacity="0.0" />
						</linearGradient>

						<!-- Area under Wind curve gradient -->
						<linearGradient id="windLineGrad" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0%" stop-color="#c084fc" />
							<stop offset="100%" stop-color="#a855f7" />
						</linearGradient>
					</defs>

					<!-- Grid Lines (Horizontal & Vertical) -->
					<g stroke="rgba(255,255,255,0.03)" stroke-width="1">
						<!-- Horizontal divisions -->
						<line x1="{svgPoints.paddingLeft}" y1="45" x2="{svgPoints.width - 40}" y2="45" />
						<line x1="{svgPoints.paddingLeft}" y1="90" x2="{svgPoints.width - 40}" y2="90" />
						<line x1="{svgPoints.paddingLeft}" y1="135" x2="{svgPoints.width - 40}" y2="135" />
						<line x1="{svgPoints.paddingLeft}" y1="205" x2="{svgPoints.width - 40}" y2="205" />
						<line x1="{svgPoints.paddingLeft}" y1="255" x2="{svgPoints.width - 40}" y2="255" />
					</g>

					<!-- separating line dividing temp graph and precipitation graph -->
					<line 
						x1={svgPoints.paddingLeft} 
						y1="165" 
						x2={svgPoints.width - 40} 
						y2="165" 
						stroke="rgba(255,255,255,0.18)" 
						stroke-width="1.5" 
					/>

					<!-- vertical dashed guides & day borders -->
					{#each svgPoints.points as p}
						{#if p.raw.dayLabel}
							<!-- Vertical day separator line -->
							<line 
								x1={p.x} 
								y1="25" 
								x2={p.x} 
								y2="280" 
								stroke="rgba(255,255,255,0.12)" 
								stroke-dasharray="4,4" 
								stroke-width="1.5" 
							/>
							<!-- Day label at top -->
							<text 
								x={p.x + 8} 
								y="15" 
								fill="#94a3b8" 
								class="text-[10px] font-bold uppercase tracking-wider"
							>
								{getWeekdayFull(p.raw.timestamp)}
							</text>
						{/if}
					{/each}

					<!-- Precipitation bars (drawn behind curves) -->
					{#each svgPoints.points as p}
						{#if p.precipHeight > 0}
							<!-- Draw vertical bar from bottom baseline of precipitation (Y = 255) up -->
							<rect 
								x={p.x - 5} 
								y={255 - p.precipHeight} 
								width="10" 
								height={p.precipHeight} 
								fill="#38bdf8" 
								opacity="0.45" 
								rx="1.5"
							/>
						{/if}
					{/each}

					<!-- Filled Temperature Gradient -->
					<path d={svgPoints.filledPath} fill="url(#tempFillGrad)" />

					<!-- Temperature Curve Line -->
					<path d={svgPoints.path} fill="none" stroke="#f97316" stroke-width="3" stroke-linecap="round" />

					<!-- Wind Speed Curve Line -->
					<path d={svgPoints.windPath} fill="none" stroke="url(#windLineGrad)" stroke-width="2" stroke-linecap="round" />

					<!-- Left Y-Axis Labels (Temperature & Wind) -->
					<g fill="#64748b" font-size="9" font-weight="bold" text-anchor="end">
						<text x="{svgPoints.paddingLeft - 12}" y="48">{svgPoints.maxTemp}°</text>
						<text x="{svgPoints.paddingLeft - 12}" y="93">{Math.round((svgPoints.maxTemp + svgPoints.minTemp) / 2)}°</text>
						<text x="{svgPoints.paddingLeft - 12}" y="138">{svgPoints.minTemp}°</text>
						
						<!-- Wind axis on lower section -->
						<text x="{svgPoints.paddingLeft - 12}" y="209">{Math.round(svgPoints.maxWind)}m/s</text>
						<text x="{svgPoints.paddingLeft - 12}" y="259">{Math.round(svgPoints.minWind)}m/s</text>
					</g>

					<!-- Interactive Dot coordinates, wind arrows, and ONLY max/min temp icons -->
					{#each svgPoints.points as p, i}
						<!-- Temperature dots (subtle dots for all) -->
						<circle cx={p.x} cy={p.yTemp} r="2.5" fill="#f97316" opacity="0.6" />

						<!-- Show ONLY Max & Min Temperature values and icons -->
						{#if i === maxTempIdx || i === minTempIdx}
							<!-- Glow background for labels -->
							<circle cx={p.x} cy={p.yTemp} r="5" fill="#ffffff" stroke="#f97316" stroke-width="2" />
							
							<!-- Temperature text labels above the dot -->
							<text 
								x={p.x} 
								y={p.yTemp - 14} 
								fill="#f8fafc" 
								font-size="11" 
								font-weight="black" 
								text-anchor="middle"
								class="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
							>
								{p.raw.temp}°
							</text>

							<!-- Weather Icon plotted above temperature line using foreignObject -->
							<foreignObject x={p.x - 14} y={p.yTemp - 52} width="28" height="28">
								<WeatherIcon symbolCode={p.raw.symbolCode} size="sm" />
							</foreignObject>
						{/if}

						<!-- Wind Speed dots -->
						<circle cx={p.x} cy={p.yWind} r="2" fill="#a855f7" opacity="0.5" />

						<!-- Wind direction arrows at bottom -->
						<text 
							x={p.x} 
							y="272" 
							fill="#cbd5e1" 
							font-size="11" 
							font-weight="bold"
							text-anchor="middle"
						>
							{p.raw.windArrow}
						</text>

						<!-- Time hour labels at bottom -->
						<text 
							x={p.x} 
							y="290" 
							fill="#64748b" 
							font-size="9" 
							font-weight="bold"
							text-anchor="middle"
						>
							{p.raw.timeLabel}
						</text>
					{/each}

					<!-- Active Vertical Hover Guide Line -->
					{#if hoveredPoint}
						<line 
							x1={hoveredPoint.x} 
							y1="25" 
							x2={hoveredPoint.x} 
							y2="280" 
							stroke="rgba(255,255,255,0.25)" 
							stroke-dasharray="3,3" 
							stroke-width="1.5" 
							pointer-events="none"
						/>
						<!-- Hover dots highlighter -->
						<circle cx={hoveredPoint.x} cy={hoveredPoint.yTemp} r="6" fill="#f97316" stroke="#ffffff" stroke-width="2" pointer-events="none" />
						<circle cx={hoveredPoint.x} cy={hoveredPoint.yWind} r="5" fill="#a855f7" stroke="#ffffff" stroke-width="1.5" pointer-events="none" />
					{/if}
				</svg>
			</div>

			<!-- Dynamic Floating Apple-Style Tooltip -->
			{#if hoveredPoint}
				<div 
					style="left: {tooltipX < 450 ? tooltipX + 24 : tooltipX - 176}px; top: 70px;"
					class="absolute z-10 w-44 p-3.5 bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-none transition-all duration-150 flex flex-col gap-2 text-xs font-semibold text-text-primary"
				>
					<div class="text-[10px] text-sky-400 uppercase tracking-widest font-black border-b border-white/5 pb-1 flex justify-between">
						<span>{getWeekdayFull(hoveredPoint.raw.timestamp)}</span>
						<span class="text-text-muted">{hoveredPoint.raw.timeLabel}:00</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-text-secondary text-[11px]">{translations[lang].temperatureLegend}:</span>
						<span class="text-temp-high font-black text-sm">{hoveredPoint.raw.temp}°C</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-text-secondary text-[11px]">{translations[lang].precipitationLegend}:</span>
						<span class="text-sky-400 font-bold">{hoveredPoint.raw.precip} mm</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-text-secondary text-[11px]">{translations[lang].windSpeedLegend}:</span>
						<span class="text-purple-400 font-bold">{hoveredPoint.raw.windSpeed} m/s</span>
					</div>
				</div>
			{/if}

			<!-- Graph Legend -->
			<div class="flex justify-center gap-6 mt-6 border-t border-white/5 pt-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
				<span class="flex items-center gap-2">
					<span class="w-3.5 h-0.5 bg-orange-500 rounded-full inline-block"></span> {translations[lang].temperatureLegend}
				</span>
				<span class="flex items-center gap-2">
					<span class="w-3.5 h-3.5 bg-sky-500/40 rounded inline-block"></span> {translations[lang].precipitationLegend}
				</span>
				<span class="flex items-center gap-2">
					<span class="w-3.5 h-0.5 bg-purple-500 rounded-full inline-block"></span> {translations[lang].windSpeedLegend}
				</span>
			</div>
		</div>
	{/if}
{/if}
