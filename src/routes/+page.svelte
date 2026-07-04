<script lang="ts">
	import { onMount } from 'svelte';
	let pollInterval: any;
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
	import { getHighTempColor, getMeteoconFilename } from '$lib/weatherUtils';

	// Predefined locations
	const PRESETS = [
		{ name: 'İstanbul', lat: 41.0082, lon: 28.9784 },
		{ name: 'Ankara', lat: 39.9334, lon: 32.8597 },
		{ name: 'İzmir', lat: 38.4192, lon: 27.1287 },
		{ name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
		{ name: 'London', lat: 51.5074, lon: -0.1278 },
		{ name: 'New York', lat: 40.7128, lon: -74.0060 },
		{ name: 'Paris', lat: 48.8566, lon: 2.3522 },
		{ name: 'Sydney', lat: -33.8688, lon: 151.2093 },
		{ name: 'Cairo', lat: 30.0444, lon: 31.2357 },
		{ name: 'Moscow', lat: 55.7558, lon: 37.6173 },
		{ name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 }
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
			conditionDesc: "Description",
			temp: "Temp.",
			windSpeed: "Wind speed",
			windDescription: "Wind description",
			sunrise: "Sunrise",
			sunset: "Sunset",
			dataSourced: "Data sourced from Open-Meteo",
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
			todayLabel: "Today",
			windWarningLabel: "WARNING:",
			windWarningSevereStorm: "Severe Storm",
			windWarningStorm: "Gale / Storm",
			windWarningStrongWind: "Strong Wind"
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
			conditionDesc: "Açıklama",
			temp: "Sıcaklık",
			windSpeed: "Rüzgar hızı",
			windDescription: "Rüzgar açıklaması",
			sunrise: "Gün Doğumu",
			sunset: "Gün Batımı",
			dataSourced: "Veriler Open-Meteo'dan alınmıştır",
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
			todayLabel: "Bugün",
			windWarningLabel: "UYARI:",
			windWarningSevereStorm: "Kuvvetli Fırtına",
			windWarningStorm: "Fırtına",
			windWarningStrongWind: "Kuvvetli Rüzgar"
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
			conditionDesc: "Beschreibung",
			temp: "Temp.",
			windSpeed: "Windgeschw.",
			windDescription: "Windbeschreibung",
			sunrise: "Sonnenaufgang",
			sunset: "Sonnenuntergang",
			dataSourced: "Daten von Open-Meteo",
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
			todayLabel: "Heute",
			windWarningLabel: "WARNUNG:",
			windWarningSevereStorm: "Schwerer Sturm",
			windWarningStorm: "Sturm",
			windWarningStrongWind: "Starker Wind"
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
			conditionDesc: "Descripción",
			temp: "Temp.",
			windSpeed: "Vel. del viento",
			windDescription: "Descripción del viento",
			sunrise: "Amanecer",
			sunset: "Atardecer",
			dataSourced: "Datos obtenidos de Open-Meteo",
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
			todayLabel: "Hoy",
			windWarningLabel: "AVISO:",
			windWarningSevereStorm: "Tormenta Severa",
			windWarningStorm: "Vendaval / Tormenta",
			windWarningStrongWind: "Viento Fuerte"
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
			conditionDesc: "Description",
			temp: "Temp.",
			windSpeed: "Vitesse du vent",
			windDescription: "Description du vent",
			sunrise: "Lever du soleil",
			sunset: "Coucher du soleil",
			dataSourced: "Données fournies par Open-Meteo",
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
			todayLabel: "Aujourd'hui",
			windWarningLabel: "ALERTE :",
			windWarningSevereStorm: "Tempête Violente",
			windWarningStorm: "Coup de vent / Tempête",
			windWarningStrongWind: "Vent Fort"
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
			conditionDesc: "Descrizione",
			temp: "Temp.",
			windSpeed: "Velocità del vento",
			windDescription: "Descrizione del vento",
			sunrise: "Alba",
			sunset: "Tramonto",
			dataSourced: "Dati estratti da Open-Meteo",
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
			todayLabel: "Oggi",
			windWarningLabel: "AVVISO:",
			windWarningSevereStorm: "Tempesta Severa",
			windWarningStorm: "Burrasca / Tempesta",
			windWarningStrongWind: "Vento Forte"
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

	// Weather condition descriptions for multilingual condition text
	const conditionDescriptions: Record<string, Record<string, string>> = {
		en: {
			clearsky: 'Clear sky',
			mostlyclear: 'Mostly clear',
			partlycloudy: 'Partly cloudy',
			overcast: 'Overcast',
			fog: 'Fog',
			drizzle: 'Drizzle',
			overcastdrizzle: 'Overcast, drizzle',
			lightrain: 'Light rain',
			rain: 'Rain',
			overcastrain: 'Overcast, rain',
			lightrainshowers: 'Light rain showers',
			rainshowers: 'Rain showers',
			heavyrainshowers: 'Heavy rain showers',
			sleet: 'Sleet',
			heavysleet: 'Heavy sleet',
			lightsnow: 'Light snow',
			snow: 'Snow',
			heavysnow: 'Heavy snow',
			snowshowers: 'Snow showers',
			heavysnowshowers: 'Heavy snow showers',
			sleetshowers: 'Sleet showers',
			rainshowersandthunder: 'Thunderstorm with rain',
			thunderstormshail: 'Thunderstorm with hail',
			extremethunderstormshail: 'Severe thunderstorm'
		},
		tr: {
			clearsky: 'Açık',
			mostlyclear: 'Çoğunlukla açık',
			partlycloudy: 'Parçalı bulutlu',
			overcast: 'Kapalı',
			fog: 'Sisli',
			drizzle: 'Çisenti',
			overcastdrizzle: 'Kapalı, çisenti',
			lightrain: 'Hafif yağmur',
			rain: 'Yağmur',
			overcastrain: 'Kapalı, yağmurlu',
			lightrainshowers: 'Hafif sağanak',
			rainshowers: 'Sağanak yağış',
			heavyrainshowers: 'Kuvvetli sağanak',
			sleet: 'Karla karışık yağmur',
			heavysleet: 'Kuvvetli sulu kar',
			lightsnow: 'Hafif kar',
			snow: 'Kar yağışı',
			heavysnow: 'Yoğun kar',
			snowshowers: 'Kar sağanağı',
			heavysnowshowers: 'Kuvvetli kar sağanağı',
			sleetshowers: 'Karla karışık sağanak',
			rainshowersandthunder: 'Gök gürültülü sağanak',
			thunderstormshail: 'Dolu ile fırtına',
			extremethunderstormshail: 'Şiddetli fırtına'
		},
		de: {
			clearsky: 'Klarer Himmel',
			mostlyclear: 'Überwiegend klar',
			partlycloudy: 'Teilweise bewölkt',
			overcast: 'Bedeckt',
			fog: 'Nebel',
			drizzle: 'Nieselregen',
			overcastdrizzle: 'Bedeckt, Nieselregen',
			lightrain: 'Leichter Regen',
			rain: 'Regen',
			overcastrain: 'Bedeckt, Regen',
			lightrainshowers: 'Leichte Regenschauer',
			rainshowers: 'Regenschauer',
			heavyrainshowers: 'Starke Regenschauer',
			sleet: 'Schneeregen',
			heavysleet: 'Starker Schneeregen',
			lightsnow: 'Leichter Schneefall',
			snow: 'Schneefall',
			heavysnow: 'Starker Schneefall',
			snowshowers: 'Schneeschauer',
			heavysnowshowers: 'Starke Schneeschauer',
			sleetshowers: 'Schneeregenschauer',
			rainshowersandthunder: 'Gewitter mit Regen',
			thunderstormshail: 'Gewitter mit Hagel',
			extremethunderstormshail: 'Schweres Gewitter'
		},
		es: {
			clearsky: 'Cielo despejado',
			mostlyclear: 'Mayormente despejado',
			partlycloudy: 'Parcialmente nublado',
			overcast: 'Nublado',
			fog: 'Niebla',
			drizzle: 'Llovizna',
			overcastdrizzle: 'Nublado, llovizna',
			lightrain: 'Lluvia ligera',
			rain: 'Lluvia',
			overcastrain: 'Nublado, lluvia',
			lightrainshowers: 'Chubascos ligeros',
			rainshowers: 'Chubascos',
			heavyrainshowers: 'Chubascos fuertes',
			sleet: 'Aguanieve',
			heavysleet: 'Aguanieve fuerte',
			lightsnow: 'Nevada ligera',
			snow: 'Nevada',
			heavysnow: 'Nevada intensa',
			snowshowers: 'Chubascos de nieve',
			heavysnowshowers: 'Fuertes chubascos de nieve',
			sleetshowers: 'Chubascos de aguanieve',
			rainshowersandthunder: 'Tormenta con lluvia',
			thunderstormshail: 'Tormenta con granizo',
			extremethunderstormshail: 'Tormenta severa'
		},
		fr: {
			clearsky: 'Ciel dégagé',
			mostlyclear: 'Majoritairement dégagé',
			partlycloudy: 'Partiellement nuageux',
			overcast: 'Couvert',
			fog: 'Brouillard',
			drizzle: 'Bruine',
			overcastdrizzle: 'Couvert, bruine',
			lightrain: 'Pluie légère',
			rain: 'Pluie',
			overcastrain: 'Couvert, pluie',
			lightrainshowers: 'Averses légères',
			rainshowers: 'Averses',
			heavyrainshowers: 'Fortes averses',
			sleet: 'Grésil',
			heavysleet: 'Fort grésil',
			lightsnow: 'Neige légère',
			snow: 'Neige',
			heavysnow: 'Fortes chutes de neige',
			snowshowers: 'Averses de neige',
			heavysnowshowers: 'Fortes averses de neige',
			sleetshowers: 'Averses de grésil',
			rainshowersandthunder: 'Orage avec pluie',
			thunderstormshail: 'Orage avec grêle',
			extremethunderstormshail: 'Orage violent'
		},
		it: {
			clearsky: 'Cielo sereno',
			mostlyclear: 'Prevalentemente sereno',
			partlycloudy: 'Parzialmente nuvoloso',
			overcast: 'Coperto',
			fog: 'Nebbia',
			drizzle: 'Pioggerella',
			overcastdrizzle: 'Coperto, pioggerella',
			lightrain: 'Pioggia leggera',
			rain: 'Pioggia',
			overcastrain: 'Coperto, pioggia',
			lightrainshowers: 'Rovesci leggeri',
			rainshowers: 'Rovesci',
			heavyrainshowers: 'Forti rovesci',
			sleet: 'Nevischio',
			heavysleet: 'Forte nevischio',
			lightsnow: 'Neve leggera',
			snow: 'Neve',
			heavysnow: 'Forte nevicata',
			snowshowers: 'Rovesci di neve',
			heavysnowshowers: 'Forti rovesci di neve',
			sleetshowers: 'Rovesci di nevischio',
			rainshowersandthunder: 'Temporale con pioggia',
			thunderstormshail: 'Temporale con grandine',
			extremethunderstormshail: 'Temporale violento'
		}
	};

	// Get localized weather condition description from symbolCode
	function getConditionDescription(symbolCode: string, currentLang: typeof lang): string {
		const base = symbolCode.replace(/_day$|_night$|_polartwilight$/, '');
		const langDescs = conditionDescriptions[currentLang] || conditionDescriptions.en;
		return langDescs[base] || conditionDescriptions.en[base] || base;
	}

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
	let showCoordsForm = $state<boolean>(false);
	let tabLoaded = false;
	let weatherData = $state<WeatherInfo | null>(null);
	let loading = $state<boolean>(false);
	let error = $state<string | null>(null);
	let geoWarning = $state<string | null>(null);
	
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
	let L: any = null;

	// RainViewer & OpenWeatherMap Overlays State
	let rainviewerData = $state<any>(null);
	let activeLayerType = $state<'none' | 'radar' | 'clouds' | 'temp' | 'wind'>('temp');
	let isPlaying = $state<boolean>(false);
	let currentFrameIndex = $state<number>(0);
	let isMapFullscreen = $state<boolean>(false);
	
	let timestamps = $derived(rainviewerData?.radar?.past || []);
	
	let currentFrameTimeLabel = $derived.by(() => {
		if (activeLayerType !== 'radar') return '';
		const frame = timestamps[currentFrameIndex];
		return frame ? formatFrameTime(frame.time) : '';
	});
	
	let radarLayers: any[] = [];
	let tempLayer: any = null;
	let windLayer: any = null;
	let cloudsLayer: any = null;
	let animationInterval: any = null;

	function formatFrameTime(time: number): string {
		if (!time) return '';
		const date = new Date(time * 1000);
		return date.toLocaleTimeString(localeMap[lang], { hour: '2-digit', minute: '2-digit', hour12: false });
	}

	async function initRainViewer() {
		try {
			const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
			if (!res.ok) throw new Error('Failed to fetch RainViewer config');
			rainviewerData = await res.json();
			
			if (map && L) {
				const host = rainviewerData.host;
				
				// Create radar layers
				radarLayers = timestamps.map((frame: any) => {
					return L.tileLayer(`${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`, {
						opacity: 0,
						zIndex: 500,
						attribution: '© <a href="https://www.rainviewer.com/" target="_blank">RainViewer</a>'
					});
				});
			}
		} catch (err) {
			console.error('RainViewer initialization failed:', err);
		}
	}

	async function initWeatherLayers() {
		clearLayers();

		await initRainViewer();

		if (L) {
			tempLayer = L.tileLayer('/api/weather-tiles/temp/{z}/{x}/{y}.png', {
				opacity: 0.6,
				zIndex: 480,
				attribution: '© <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>'
			});

			windLayer = L.tileLayer('/api/weather-tiles/wind/{z}/{x}/{y}.png', {
				opacity: 0.6,
				zIndex: 485,
				attribution: '© <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>'
			});

			cloudsLayer = L.tileLayer('/api/weather-tiles/clouds/{z}/{x}/{y}.png', {
				opacity: 0.6,
				zIndex: 490,
				attribution: '© <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a>'
			});

			if (activeLayerType === 'temp' && map) {
				tempLayer.addTo(map);
			}
		}
	}

	function clearLayers() {
		stopAnimation();
		radarLayers.forEach(l => { if (map && map.hasLayer(l)) map.removeLayer(l); });
		if (map) {
			if (tempLayer && map.hasLayer(tempLayer)) map.removeLayer(tempLayer);
			if (windLayer && map.hasLayer(windLayer)) map.removeLayer(windLayer);
			if (cloudsLayer && map.hasLayer(cloudsLayer)) map.removeLayer(cloudsLayer);
		}
		radarLayers = [];
		tempLayer = null;
		windLayer = null;
		cloudsLayer = null;
	}

	function setLayerType(type: 'none' | 'radar' | 'clouds' | 'temp' | 'wind') {
		if (activeLayerType === type) return;
		
		const wasPlaying = isPlaying;
		stopAnimation();
		
		if (map) {
			if (activeLayerType === 'radar') {
				radarLayers.forEach(l => { if (map.hasLayer(l)) map.removeLayer(l); });
			} else if (activeLayerType === 'temp' && tempLayer && map.hasLayer(tempLayer)) {
				map.removeLayer(tempLayer);
			} else if (activeLayerType === 'wind' && windLayer && map.hasLayer(windLayer)) {
				map.removeLayer(windLayer);
			} else if (activeLayerType === 'clouds' && cloudsLayer && map.hasLayer(cloudsLayer)) {
				map.removeLayer(cloudsLayer);
			}
		}
		
		activeLayerType = type;
		currentFrameIndex = 0;
		
		if (map) {
			if (activeLayerType === 'radar') {
				radarLayers.forEach(l => {
					l.setOpacity(0);
					l.addTo(map);
				});
				showFrame(0);
				if (wasPlaying) {
					startAnimation();
				}
			} else if (activeLayerType === 'temp' && tempLayer) {
				tempLayer.addTo(map);
			} else if (activeLayerType === 'wind' && windLayer) {
				windLayer.addTo(map);
			} else if (activeLayerType === 'clouds' && cloudsLayer) {
				cloudsLayer.addTo(map);
			}
		}
	}

	// Clean up layers when component is destroyed
	import { onDestroy } from 'svelte';
	onDestroy(() => {
		if (pollInterval) clearInterval(pollInterval);
		clearLayers();
		if (typeof document !== 'undefined') {
			const mapWrapper = document.getElementById('map-wrapper');
			if (mapWrapper && mapWrapper.parentNode === document.body) {
				document.body.removeChild(mapWrapper);
			}
		}
	});

	function showFrame(index: number) {
		if (activeLayerType !== 'radar' || radarLayers.length === 0) return;
		if (index < 0 || index >= radarLayers.length) return;
		
		const prevLayer = radarLayers[currentFrameIndex];
		const nextLayer = radarLayers[index];
		
		if (prevLayer && prevLayer !== nextLayer) {
			prevLayer.setOpacity(0);
		}
		if (nextLayer) {
			nextLayer.setOpacity(0.65);
		}
		currentFrameIndex = index;
	}

	function startAnimation() {
		if (isPlaying) return;
		if (activeLayerType !== 'radar' || radarLayers.length === 0) return;
		isPlaying = true;
		
		animationInterval = setInterval(() => {
			let nextIndex = currentFrameIndex + 1;
			if (nextIndex >= radarLayers.length) {
				nextIndex = 0;
			}
			showFrame(nextIndex);
		}, 800);
	}
	
	function stopAnimation() {
		isPlaying = false;
		if (animationInterval) {
			clearInterval(animationInterval);
			animationInterval = null;
		}
	}
	
	function togglePlay() {
		if (isPlaying) {
			stopAnimation();
		} else {
			startAnimation();
		}
	}

	function toggleMapFullscreen() {
		isMapFullscreen = !isMapFullscreen;
		
		if (typeof document !== 'undefined') {
			const mapWrapper = document.getElementById('map-wrapper');
			const placeholder = document.getElementById('map-placeholder');
			
			if (mapWrapper && placeholder) {
				if (isMapFullscreen) {
					document.body.appendChild(mapWrapper);
				} else {
					placeholder.appendChild(mapWrapper);
				}
			}
		}
		
		// Invalidate map size after DOM adjustments
		setTimeout(() => {
			if (map) {
				map.invalidateSize();
			}
		}, 150);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isMapFullscreen) {
			toggleMapFullscreen();
		}
	}

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
				maxPrecipVal: 1,
				minWind: 0, 
				maxWind: 0, 
				width: 900, 
				height: 280, 
				paddingLeft: 50, 
				paddingTop: 45, 
				drawWidth: 810, 
				drawHeight: 195,
				iconGroups: []
			};
		}
		
		const rawData = weatherData.graphData;
		const data = rawData.map((d, i) => {
			const speed = d.windSpeed;
			
			let windWarningLevel = null;
			let windWarningColor = '';
			let windWarningDesc = '';
			let windWarningIcon = '';
			
			if (speed >= 17.2) {
				windWarningLevel = 'red';
				windWarningColor = '#ef4444';
				windWarningDesc = translations[lang].windWarningSevereStorm;
				windWarningIcon = 'flag-storm-warning.svg';
			} else if (speed >= 13.9) {
				windWarningLevel = 'orange';
				windWarningColor = '#f97316';
				windWarningDesc = translations[lang].windWarningStorm;
				windWarningIcon = 'windsock.svg';
			} else if (speed >= 10.8) {
				windWarningLevel = 'yellow';
				windWarningColor = '#eab308';
				windWarningDesc = translations[lang].windWarningStrongWind;
				windWarningIcon = 'windsock-moderate.svg';
			}

			return { 
				...d, 
				windSpeed: speed,
				windWarningLevel,
				windWarningColor,
				windWarningDesc,
				windWarningIcon
			};
		});

		const colWidth = 42; // Width in pixels per hour (24 hours is ~1000px, perfect for desktop)
		const paddingLeft = 50;
		const paddingRight = 40;
		const drawWidth = (data.length - 1) * colWidth;
		const width = paddingLeft + paddingRight + drawWidth;
		
		const height = 310; // Increased height to prevent scrollbar overlapping X-axis labels
		const paddingTop = 45;
		const paddingBottom = 70; // extra padding at the bottom for X-axis labels and scrollbar clearance
		const drawHeight = 195; // Keep drawHeight exactly 195 to preserve Y-axis scaling coordinates

		const temps = data.map(d => d.temp);
		const minTemp = Math.min(...temps);
		const maxTemp = Math.max(...temps);
		const tempRange = maxTemp - minTemp || 1;

		const winds = data.map(d => d.windSpeed);
		const minWind = Math.min(...winds);
		const maxWind = Math.max(...winds);
		const windRange = maxWind - minWind || 1;

		const precips = data.map(d => d.precip);
		const maxPrecipRaw = Math.max(...precips);
		const maxPrecipVal = Math.max(1.0, maxPrecipRaw > 0 ? Math.round((maxPrecipRaw * 1.2) * 10) / 10 : 1.0);

		const points = data.map((d, i) => {
			const x = paddingLeft + (i / (data.length - 1)) * drawWidth;
			const yTemp = paddingTop + 90 - ((d.temp - minTemp) / tempRange) * 90;
			const yWind = paddingTop + 210 - ((d.windSpeed - minWind) / windRange) * 50;
			const precipHeight = (d.precip / maxPrecipVal) * 90;

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

		// Grouping consecutive identical icons
		const iconGroups: {
			symbolCode: string;
			centerX: number;
			centerY: number;
			sizeLabel: 'sm';
			sizePx: number;
			offset: number;
		}[] = [];

		let currentGroup: typeof points = [];
		for (let i = 0; i < points.length; i++) {
			const p = points[i];
			if (currentGroup.length === 0) {
				currentGroup.push(p);
			} else {
				const firstInGroup = currentGroup[0];
				if (p.raw.symbolCode === firstInGroup.raw.symbolCode && currentGroup.length < 4) {
					currentGroup.push(p);
				} else {
					iconGroups.push(buildIconGroup(currentGroup));
					currentGroup = [p];
				}
			}
		}
		if (currentGroup.length > 0) {
			iconGroups.push(buildIconGroup(currentGroup));
		}

		function buildIconGroup(groupPoints: typeof points) {
			const symbolCode = groupPoints[0].raw.symbolCode;
			const xs = groupPoints.map(p => p.x);
			const ys = groupPoints.map(p => p.yTemp);
			const centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
			const centerY = ys.reduce((a, b) => a + b, 0) / ys.length;
			
			const sizeLabel: 'sm' = 'sm';
			const sizePx = 24;
			const offset = 26; // position closer to points for smaller icons

			return {
				symbolCode,
				centerX,
				centerY,
				sizeLabel,
				sizePx,
				offset
			};
		}

		return {
			points,
			path,
			windPath,
			filledPath,
			minTemp,
			maxTemp,
			maxPrecip: maxPrecipRaw,
			maxPrecipVal,
			minWind,
			maxWind,
			width,
			height,
			paddingLeft,
			paddingTop,
			drawWidth,
			drawHeight,
			iconGroups
		};
	});

	let dailyMinMaxIndices = $derived.by(() => {
		if (!weatherData || !weatherData.graphData || weatherData.graphData.length === 0) return new Set();
		const data = weatherData.graphData;
		
		const groups = new Map();
		data.forEach((d, i) => {
			const dateStr = new Date(d.timestamp).toDateString();
			if (!groups.has(dateStr)) {
				groups.set(dateStr, []);
			}
			groups.get(dateStr).push(i);
		});

		const indices = new Set();
		for (const [_, idxs] of groups) {
			if (idxs.length === 0) continue;
			
			let maxIdx = idxs[0];
			let maxVal = data[maxIdx].temp;
			
			let minIdx = idxs[0];
			let minVal = data[minIdx].temp;
			
			for (const idx of idxs) {
				if (data[idx].temp > maxVal) {
					maxVal = data[idx].temp;
					maxIdx = idx;
				}
				if (data[idx].temp < minVal) {
					minVal = data[idx].temp;
					minIdx = idx;
				}
			}
			
			indices.add(maxIdx);
			indices.add(minIdx);
		}
		
		return indices;
	});

	let lastUpdatedTime = $derived.by(() => {
		if (!weatherData) return '';
		if (!weatherData.fetchedAt) {
			return translations[lang].updatedRecently;
		}
		
		const diffMs = Date.now() - weatherData.fetchedAt;
		const diffMins = Math.max(0, Math.floor(diffMs / 60000));
		
		if (diffMins < 1) {
			return lang === 'tr' ? 'Son güncelleme: Az önce' :
			       lang === 'de' ? 'Aktualisiert: Gerade eben' :
			       lang === 'es' ? 'Actualizado: Recién' :
			       lang === 'fr' ? 'Mis à jour : À l\'instant' :
			       lang === 'it' ? 'Aggiornato: Proprio ora' :
			       'Updated: Just now';
		} else {
			return lang === 'tr' ? `Son güncelleme: ${diffMins} dakika önce` :
			       lang === 'de' ? `Aktualisiert: vor ${diffMins} Minuten` :
			       lang === 'es' ? `Actualizado hace ${diffMins} minutos` :
			       lang === 'fr' ? `Mis à jour il y a ${diffMins} min` :
			       lang === 'it' ? `Aggiornato ${diffMins} minuti fa` :
			       `Updated: ${diffMins} mins ago`;
		}
	});

	let currentHourIndex = $derived.by(() => {
		if (!svgPoints || !svgPoints.points || svgPoints.points.length === 0) return -1;
		const now = Date.now();
		let minDiff = Infinity;
		let closestIdx = -1;
		for (let i = 0; i < svgPoints.points.length; i++) {
			const diff = Math.abs(svgPoints.points[i].raw.timestamp - now);
			if (diff < minDiff) {
				minDiff = diff;
				closestIdx = i;
			}
		}
		// If the closest point is more than 3 hours away (e.g. data is old/different day), don't draw marker
		if (minDiff > 3 * 3600 * 1000) return -1;
		return closestIdx;
	});

	function scrollToNow(smooth = true) {
		const container = document.querySelector('.chart-scroll-container');
		if (container && currentHourIndex !== -1 && svgPoints.points && svgPoints.points.length > 0) {
			const curPoint = svgPoints.points[currentHourIndex];
			if (curPoint) {
				const targetScrollLeft = curPoint.x - (container.clientWidth * 0.33);
				container.scrollTo({
					left: targetScrollLeft,
					behavior: smooth ? 'smooth' : 'auto'
				});
			}
		}
	}

	$effect(() => {
		if (activeTab === 'graph' && weatherData && currentHourIndex !== -1) {
			setTimeout(() => scrollToNow(true), 150);
		}
	});

	$effect(() => {
		if (tabLoaded && typeof window !== 'undefined') {
			localStorage.setItem('aura_weather_active_tab', activeTab);
		}
	});

	// Load cached weather or request location on mount
	onMount(async () => {
		// Load cached active tab
		const cachedTab = localStorage.getItem('aura_weather_active_tab');
		if (cachedTab === 'table' || cachedTab === 'graph') {
			activeTab = cachedTab;
		}
		// Allow saving tab state to localStorage now that it has been loaded
		tabLoaded = true;

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
		L = (await import('leaflet')).default;
		
		// If map already exists (HMR), clean it up first
		if (map) {
			clearLayers();
			map.remove();
			map = null;
			marker = null;
		}

		// Initialize Map: default London
		map = L.map('map', { zoomControl: false }).setView([51.5074, -0.1278], 2);
		
		// Determine system theme preference for Map tiles
		const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
		const tileUrl = prefersLight 
			? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
			: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

		L.tileLayer(tileUrl, {
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
			map.setView(latlng, 6);
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

		// Initialize Weather Overlays
		await initWeatherLayers();

		// Repoll weather data every 5 minutes (300000ms) to keep data fresh and update cache age
		pollInterval = setInterval(() => {
			if (lat && lon && typeof navigator !== 'undefined' && navigator.onLine) {
				fetchWeather(parseFloat(lat), parseFloat(lon));
			}
		}, 300000);
	});

	// Dynamic map centering update
	async function updateMapLocation(latitude: number, longitude: number) {
		if (!map) return;
		if (!L) L = (await import('leaflet')).default;
		const latlng = L.latLng(latitude, longitude);
		
		map.setView(latlng, 6);

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
		// Check for unsecure context over non-localhost local IP (e.g. http://192.168.x.x)
		if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
			loading = false;
			geoWarning = lang === 'tr' 
				? 'Tarayıcılar yerel ağ üzerindeki HTTP bağlantılarında (192.168.x.x) konum erişimini engeller. Lütfen HTTPS bağlantısı kullanın veya koordinatları manuel girin.' 
				: 'Safari/Chrome block Geolocation on HTTP connections over the local network. Please use HTTPS or enter coordinates manually.';
			
			// Default to London if blocked
			lat = '51.5074';
			lon = '-0.1278';
			currentCity = lang === 'tr' ? 'Londra' : 'London';
			updateMapLocation(51.5074, -0.1278);
			fetchWeather(51.5074, -0.1278);
			return;
		}

		if (navigator.geolocation) {
			loading = true;
			geoWarning = null;
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
					loading = false;
					
					let errMsg = '';
					if (geoError.code === geoError.PERMISSION_DENIED) {
						errMsg = lang === 'tr' 
							? 'Konum erişim izni reddedildi. Lütfen tarayıcı/cihaz ayarlarından izin verin.' 
							: 'Geolocation permission denied. Please enable location services in your browser/device settings.';
					} else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
						errMsg = lang === 'tr'
							? 'Konum bilgisi alınamadı. Cihazınızın konum servislerinin açık olduğundan emin olun.'
							: 'Location information unavailable. Ensure your device location services are enabled.';
					} else if (geoError.code === geoError.TIMEOUT) {
						errMsg = lang === 'tr'
							? 'Konum alma isteği zaman aşımına uğradı. Lütfen tekrar deneyin.'
							: 'Location request timed out. Please try again.';
					} else {
						errMsg = lang === 'tr'
							? 'Konum belirlenirken bir hata oluştu.'
							: 'An error occurred while retrieving location.';
					}

					geoWarning = errMsg;

					// Default to London if failed
					lat = '51.5074';
					lon = '-0.1278';
					currentCity = lang === 'tr' ? 'Londra' : 'London';
					updateMapLocation(51.5074, -0.1278);
					fetchWeather(51.5074, -0.1278);
				},
				{ enableHighAccuracy: false, timeout: 15000 }
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
	async function selectPreset(preset: typeof PRESETS[0]) {
		lat = preset.lat.toFixed(4);
		lon = preset.lon.toFixed(4);
		
		currentCity = translations[lang].resolving;
		updateMapLocation(preset.lat, preset.lon);
		
		await resolveLocationName(preset.lat, preset.lon);
		
		localStorage.setItem('aura_weather_coords', JSON.stringify({
			lat: preset.lat,
			lon: preset.lon,
			name: currentCity
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
		const svgX = (mouseXRelative / rect.width) * svgPoints.width;
		
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

	function handleWheel(e: WheelEvent) {
		if (e.deltaY !== 0) {
			e.preventDefault();
			const container = e.currentTarget as HTMLDivElement;
			container.scrollLeft += e.deltaY;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- Header & PWA status banner -->
<header class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
	<div class="flex items-center gap-3">
		<!-- Apple Glassmorphism Styled Icon -->
		<div class="w-14 h-14 rounded-2xl bg-white/5 glass-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] p-2.5 flex items-center justify-center">
			<img src="/logo.svg" alt="Weather logo" class="w-full h-full" />
		</div>
		<div>
			<h1 class="text-3.5xl font-extrabold font-display tracking-tight bg-gradient-to-r from-[var(--title-gradient-from)] to-[var(--title-gradient-to)] bg-clip-text text-transparent">Weather</h1>
		</div>
	</div>

	<div class="flex items-center gap-3">
		{#if isOffline}
			<span class="px-3.5 py-1.5 text-xs font-bold bg-red-950/40 glass-blur-md border border-red-500/25 text-red-200 rounded-full flex items-center gap-2">
				<AlertTriangle class="w-3.5 h-3.5 text-red-400" /> {translations[lang].offlineMode}
			</span>
		{/if}

		{#if showInstallBtn}
			<button 
				onclick={installApp}
				class="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 glass-blur-md border border-white/15 hover:border-white/20 text-white rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
			>
				<Download class="w-3.5 h-3.5" />
				{translations[lang].installPwa}
			</button>
		{/if}
	</div>
</header>

<!-- Search and Preset Section (Apple Glassmorphism style with Leaflet map) -->
<div class="bg-white/5 glass-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl p-6 mb-8 transition-all duration-300">
	<h2 class="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
		<MapPin class="w-4.5 h-4.5 text-sky-400" />
		{translations[lang].selectLocation}
	</h2>
	
	{#if isMapFullscreen}
		<!-- Backdrop overlay for modal viewport-fullscreen -->
		<div 
			onclick={toggleMapFullscreen}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleMapFullscreen(); }}
			role="button"
			tabindex="0"
			aria-label="Close map overlay"
			class="fixed inset-0 bg-black/75 glass-blur-sm z-[99998] transition-all duration-300 cursor-pointer"
		></div>
	{/if}

	<!-- Map Placeholder to keep layout spacing and host map DOM element -->
	<div id="map-placeholder" class="w-full mb-6">
		<div id="map-wrapper" class="relative w-full rounded-2xl border border-white/10 shadow-lg shadow-black/30 overflow-hidden group transition-all duration-300 z-10
			{isMapFullscreen ? 'fullscreen-modal' : 'h-[320px]'}"
		>
			<div id="map" class="w-full h-full z-0"></div>

			<!-- Fullscreen Toggle Button -->
			<button 
				onclick={toggleMapFullscreen}
				class="absolute top-3 right-3 z-[1000] p-2 bg-black/60 glass-blur-md border border-white/10 hover:bg-black/80 rounded-xl text-white transition-all duration-200 shadow-md cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
				title={lang === 'tr' ? 'Tam Ekran' : 'Fullscreen'}
			>
				{#if isMapFullscreen}
					<svg class="w-3.5 h-3.5 text-sky-400 fill-current" viewBox="0 0 24 24">
						<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
					</svg>
				{:else}
					<svg class="w-3.5 h-3.5 text-sky-400 fill-current" viewBox="0 0 24 24">
						<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
					</svg>
				{/if}
			</button>

			<!-- Custom Glassmorphic Overlay Controls -->
			<div class="absolute bottom-3 left-3 right-3 z-[1000] bg-black/60 glass-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-2 transition-all duration-300 opacity-90 group-hover:opacity-100 shadow-xl">
				<!-- Layer selection row -->
				<div class="flex items-center justify-between">
					<span class="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
						{lang === 'tr' ? 'Harita Katmanları' : 'Map Layers'}
					</span>
					
					<div class="flex gap-1 flex-wrap justify-end max-w-[70%]">
						<button 
							onclick={() => setLayerType('none')}
							class="px-2 py-0.5 text-[9px] font-bold rounded transition-all border {activeLayerType === 'none' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-white/5 text-text-secondary border-transparent hover:bg-white/10'}"
						>
							{lang === 'tr' ? 'Sade' : 'None'}
						</button>
						<button 
							onclick={() => setLayerType('radar')}
							class="px-2 py-0.5 text-[9px] font-bold rounded transition-all border {activeLayerType === 'radar' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-white/5 text-text-secondary border-transparent hover:bg-white/10'}"
						>
							{lang === 'tr' ? 'Yağış' : 'Rain'}
						</button>
						<button 
							onclick={() => setLayerType('clouds')}
							class="px-2 py-0.5 text-[9px] font-bold rounded transition-all border {activeLayerType === 'clouds' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-white/5 text-text-secondary border-transparent hover:bg-white/10'}"
						>
							{lang === 'tr' ? 'Bulut' : 'Clouds'}
						</button>
						<button 
							onclick={() => setLayerType('temp')}
							class="px-2 py-0.5 text-[9px] font-bold rounded transition-all border {activeLayerType === 'temp' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-white/5 text-text-secondary border-transparent hover:bg-white/10'}"
						>
							{lang === 'tr' ? 'Sıcaklık' : 'Temp'}
						</button>
						<button 
							onclick={() => setLayerType('wind')}
							class="px-2 py-0.5 text-[9px] font-bold rounded transition-all border {activeLayerType === 'wind' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-white/5 text-text-secondary border-transparent hover:bg-white/10'}"
						>
							{translations[lang].wind}
						</button>
					</div>
				</div>

				<!-- Animation playback controls (only visible if an animated layer is active) -->
				{#if activeLayerType === 'radar'}
					<div class="flex items-center gap-2 border-t border-white/5 pt-2 mt-1">
						<!-- Play/Pause Button -->
						<button 
							onclick={togglePlay}
							class="w-6.5 h-6.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center transition-all duration-200 shadow-md shadow-sky-500/10 cursor-pointer border-none outline-none"
						>
							{#if isPlaying}
								<svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
							{:else}
								<svg class="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
							{/if}
						</button>

						<!-- Progress Slider -->
						<div class="flex-1 flex items-center gap-2">
							<input 
								type="range" 
								min="0" 
								max="{timestamps.length - 1}"
								value={currentFrameIndex}
								oninput={(e) => { stopAnimation(); showFrame(parseInt(e.currentTarget.value)); }}
								class="w-full accent-sky-400 h-1 rounded-lg bg-white/10 border-none appearance-none outline-none cursor-pointer"
							/>
							
							<!-- Frame Time -->
							<span class="text-[9px] font-extrabold font-mono text-sky-400 min-w-[32px] text-right">
								{currentFrameTimeLabel}
							</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Presets row -->
	<div 
		onwheel={handleWheel}
		class="flex overflow-x-auto flex-nowrap gap-2.5 mb-5 border-t border-white/5 pt-5 pb-2.5 scrollbar-none presets-container"
	>
		<button 
			onclick={requestGeolocation}
			class="flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 hover:border-sky-500/30 text-sky-400 flex items-center gap-1.5"
		>
			<Compass class="w-3.5 h-3.5" />
			{translations[lang].locateMe}
		</button>

		<button 
			onclick={() => showCoordsForm = !showCoordsForm}
			class="flex-shrink-0 px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 {showCoordsForm ? 'bg-sky-500 text-white' : 'bg-white/5 hover:bg-white/10 text-text-secondary border border-white/5'} flex items-center gap-1.5"
		>
			<Search class="w-3.5 h-3.5" />
			{lang === 'tr' ? 'Koordinat Gir/Ara' : 'Enter Coordinates'}
		</button>

		{#each PRESETS as preset}
			<button 
				onclick={() => selectPreset(preset)}
				class="flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 {parseFloat(lat).toFixed(2) === preset.lat.toFixed(2) && parseFloat(lon).toFixed(2) === preset.lon.toFixed(2) ? 'bg-sky-500 text-white border border-sky-400/30 shadow-[0_4px_12px_rgba(14,165,233,0.3)]' : 'bg-white/5 hover:bg-white/10 text-text-secondary border border-white/5 hover:border-white/10'}"
			>
				{preset.name === 'London' && lang === 'tr' ? 'Londra' : preset.name === 'Cairo' && lang === 'tr' ? 'Kahire' : preset.name}
			</button>
		{/each}
	</div>

	<!-- Coordinates form (collapsible) -->
	{#if showCoordsForm}
		<form 
			onsubmit={(e) => { showCoordsForm = false; handleManualSubmit(e); }} 
			class="flex flex-col sm:flex-row gap-4 items-end bg-black/20 border border-white/5 rounded-2xl p-5 mb-5 transition-all duration-300"
		>
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
	{/if}
</div>

{#if geoWarning}
	<div class="p-4 bg-amber-950/20 glass-blur-md border border-amber-500/30 text-amber-200 text-sm rounded-2xl mb-8 flex gap-3 items-center">
		<AlertTriangle class="flex-shrink-0 text-amber-400 w-5 h-5" />
		<span>{geoWarning}</span>
	</div>
{/if}

{#if error}
	<div class="p-4 bg-red-950/20 glass-blur-md border border-red-500/20 text-red-200 text-sm rounded-2xl mb-8 flex gap-3 items-center">
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
	<section class="bg-white/5 glass-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
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
			<div class="grid grid-cols-2 gap-x-8 gap-y-5 w-full md:w-auto p-5 rounded-2xl bg-black/20 glass-blur-md border border-white/5">
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
		<div class="bg-white/5 glass-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl overflow-hidden">
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
									<span style="color: {getHighTempColor(day.tempHigh)}; text-shadow: 0 0 6px rgba(255, 255, 255, 0.25);" class="font-extrabold">{day.tempHigh}°</span>
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
															<th class="py-3 px-4">{translations[lang].conditionDesc}</th>
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
																<!-- Condition Description -->
																<td class="py-2.5 px-4 text-[11px] sm:text-xs text-text-secondary capitalize">
																	{getConditionDescription(step.symbolCode, lang)}
																</td>
																<!-- Temp with outline -->
																<td class="py-2.5 px-4 text-sm sm:text-base">
																	<span style="color: {getHighTempColor(step.temp)}; text-shadow: 0 0 6px rgba(255, 255, 255, 0.25);" class="font-extrabold">{step.temp}°</span>
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
		</div>
	{:else}
		<!-- GRAPH VIEW (Frosted card) -->
		<div class="bg-white/5 glass-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-3xl p-6 relative overflow-hidden">
			
			<!-- Left Fixed Y-Axis Glass Overlay -->
			<div class="absolute left-0 top-0 h-[304px] w-14 bg-[var(--bg-card)] dark:bg-[#0f0f0f]/50 glass-blur-md border-r border-[var(--border-card)] rounded-tl-3xl rounded-bl-2xl glass-sidebar-left pointer-events-none z-10 flex flex-col font-bold text-[9px] text-text-muted text-right pr-4 select-none">
				<span style="position: absolute; top: 65px; right: 16px;">{svgPoints.maxTemp}°</span>
				<span style="position: absolute; top: 110px; right: 16px;">{Math.round((svgPoints.maxTemp + svgPoints.minTemp) / 2)}°</span>
				<span style="position: absolute; top: 155px; right: 16px;">{svgPoints.minTemp}°</span>
				
				<span style="position: absolute; top: 226px; right: 16px;">{Math.round(svgPoints.maxWind)}m/s</span>
				<span style="position: absolute; top: 276px; right: 16px;">{Math.round(svgPoints.minWind)}m/s</span>
			</div>

			<!-- Right Fixed Y-Axis Glass Overlay -->
			<div class="absolute right-0 top-0 h-[304px] w-14 bg-[var(--bg-card)] dark:bg-[#0f0f0f]/50 glass-blur-md border-l border-[var(--border-card)] rounded-tr-3xl rounded-br-2xl glass-sidebar-right pointer-events-none z-10 flex flex-col font-bold text-[9px] text-text-muted text-left pl-4 select-none">
				<span style="position: absolute; top: 65px; left: 16px;">{svgPoints.maxPrecipVal.toFixed(1)}mm</span>
				<span style="position: absolute; top: 110px; left: 16px;">{(svgPoints.maxPrecipVal / 2).toFixed(1)}mm</span>
				<span style="position: absolute; top: 155px; left: 16px;">0.0mm</span>
			</div>

			<!-- Scrollable inner container -->
			<div 
				onwheel={handleWheel}
				class="overflow-x-auto w-full relative chart-scroll-container"
			>
				<!-- SVG Canvas -->
				<svg 
					viewBox="0 0 {svgPoints.width} {svgPoints.height}" 
					width="{svgPoints.width}px" 
					height="{svgPoints.height}px" 
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
					<g stroke="var(--graph-grid-color)" stroke-width="1">
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
						stroke="var(--graph-line-color)" 
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
								stroke="var(--graph-border-color)" 
								stroke-dasharray="4,4" 
								stroke-width="1.5" 
							/>
							<!-- Day label at top -->
							<text 
								x={p.x + 8} 
								y="15" 
								fill="var(--text-secondary)" 
								class="text-[10px] font-bold uppercase tracking-wider"
							>
								{getWeekdayFull(p.raw.timestamp)}
							</text>
						{/if}
					{/each}

					<!-- Precipitation bars (drawn behind curves in the top temperature graph) -->
					{#each svgPoints.points as p}
						{#if p.precipHeight > 0}
							<!-- Draw vertical bar from bottom baseline of temperature graph (Y = 135) up -->
							<rect 
								x={p.x - 4} 
								y={135 - p.precipHeight} 
								width="8" 
								height={p.precipHeight} 
								fill="#38bdf8" 
								opacity="0.3" 
								rx="1"
							/>
						{/if}
					{/each}

					<!-- Filled Temperature Gradient -->
					<path d={svgPoints.filledPath} fill="url(#tempFillGrad)" />

					<!-- Temperature Curve Line -->
					<path d={svgPoints.path} fill="none" stroke="#f97316" stroke-width="3" stroke-linecap="round" />

					<!-- Wind Speed Curve Line -->
					<path d={svgPoints.windPath} fill="none" stroke="url(#windLineGrad)" stroke-width="2" stroke-linecap="round" />

					<!-- Interactive Dot coordinates and wind arrows -->
					{#each svgPoints.points as p, i}
						<!-- Temperature dots (subtle dots for all) -->
						<circle cx={p.x} cy={p.yTemp} r="2.5" fill="#f97316" opacity="0.6" />

						<!-- Show ONLY Max & Min Temperature values per day -->
						{#if dailyMinMaxIndices.has(i)}
							<!-- Glow background for labels -->
							<circle cx={p.x} cy={p.yTemp} r="5" fill="#ffffff" stroke="#f97316" stroke-width="2" />
							
							<!-- Temperature text labels above the dot -->
							<text 
								x={p.x} 
								y={p.yTemp - 14} 
								fill="var(--text-primary)" 
								font-size="11" 
								font-weight="black" 
								text-anchor="middle"
								class="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
							>
								{p.raw.temp}°
							</text>
						{/if}

						<!-- Wind Speed dots -->
						<circle cx={p.x} cy={p.yWind} r="2" fill="#a855f7" opacity="0.5" />

						<!-- Wind Warning Indicator Flag -->
						{#if p.raw.windWarningLevel}
							<g>
								<!-- Alert flag/windsock icon from Meteocons (scaled up for high legibility) -->
								<image 
									href="/weather-icons/{p.raw.windWarningIcon}" 
									x={p.x - 16} 
									y={p.yWind - 34} 
									width="32" 
									height="32"
									class="select-none pointer-events-none"
								/>
							</g>
						{/if}

						<!-- Wind direction arrows at bottom -->
						<text 
							x={p.x} 
							y="276" 
							fill="var(--text-secondary)" 
							font-size="11" 
							font-weight="bold"
							text-anchor="middle"
						>
							{p.raw.windArrow}
						</text>

						<!-- Time hour labels at bottom -->
						<text 
							x={p.x} 
							y="294" 
							fill="var(--text-muted)" 
							font-size="9" 
							font-weight="bold"
							text-anchor="middle"
						>
							{p.raw.timeLabel}
						</text>

						<!-- Weather Icon below each temperature point -->
						<foreignObject 
							x={p.x - 12} 
							y={p.yTemp + 14} 
							width="24" 
							height="24"
						>
							<WeatherIcon symbolCode={p.raw.symbolCode} size="sm" />
						</foreignObject>
					{/each}

					<!-- Current Hour Marker (Now indicator) -->
					{#if currentHourIndex !== -1 && svgPoints.points[currentHourIndex]}
						{@const curPoint = svgPoints.points[currentHourIndex]}
						<!-- Vertical dashed marker line -->
						<line 
							x1={curPoint.x} 
							y1="25" 
							x2={curPoint.x} 
							y2="280" 
							stroke="#38bdf8" 
							stroke-dasharray="3,3" 
							stroke-width="1.5" 
							opacity="0.8"
						/>
						<!-- Pulsing highlight circle on temperature path -->
						<circle 
							cx={curPoint.x} 
							cy={curPoint.yTemp} 
							r="6.5" 
							fill="none" 
							stroke="#38bdf8" 
							stroke-width="2.5" 
							opacity="0.9"
						/>
						<!-- Small text label above current hour dot -->
						<text 
							x={curPoint.x} 
							y="23" 
							fill="#38bdf8" 
							font-size="8" 
							font-weight="black" 
							text-anchor="middle"
							class="uppercase tracking-widest font-mono select-none"
						>
							{lang === 'tr' ? 'Şimdi' : 'Now'}
						</text>
					{/if}

					<!-- Active Vertical Hover Guide Line -->
					{#if hoveredPoint}
						<line 
							x1={hoveredPoint.x} 
							y1="25" 
							x2={hoveredPoint.x} 
							y2="280" 
							stroke="var(--graph-line-color)" 
							stroke-dasharray="3,3" 
							stroke-width="1.5" 
							pointer-events="none"
						/>
						<!-- Hover dots highlighter -->
						<circle cx={hoveredPoint.x} cy={hoveredPoint.yTemp} r="6" fill="#f97316" stroke="#ffffff" stroke-width="2" pointer-events="none" />
						<circle cx={hoveredPoint.x} cy={hoveredPoint.yWind} r="5" fill="#a855f7" stroke="#ffffff" stroke-width="1.5" pointer-events="none" />
					{/if}
				</svg>

				<!-- Dynamic Floating Apple-Style Tooltip -->
				{#if hoveredPoint}
					<div 
						style="left: {tooltipX < (svgPoints.width - 200) ? tooltipX + 24 : tooltipX - 176}px; top: 70px;"
						class="absolute z-10 w-44 p-3.5 bg-slate-950/85 glass-blur-xl border border-white/10 rounded-2xl shadow-2xl pointer-events-none transition-all duration-150 flex flex-col gap-2 text-xs font-semibold text-text-primary"
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
						{#if hoveredPoint.raw.windWarningLevel}
							<div class="flex justify-between items-center text-[10px] font-black border-t border-white/5 pt-1.5 mt-0.5" style="color: {hoveredPoint.raw.windWarningColor}">
								<span>{translations[lang].windWarningLabel}</span>
								<span>{hoveredPoint.raw.windWarningDesc}</span>
							</div>
						{/if}
					</div>
				{/if}
			</div>

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

<!-- Footer -->
{#if weatherData}
	<footer class="mt-8 mb-4 text-center text-[10px] text-text-muted font-bold uppercase tracking-widest flex flex-col sm:flex-row justify-between gap-4 border-t border-white/5 pt-6 select-none">
		<span>
			{lang === 'tr' ? `Veriler ${weatherData.dataSource || 'Open-Meteo'}'dan alınmıştır` :
			 lang === 'de' ? `Daten von ${weatherData.dataSource || 'Open-Meteo'}` :
			 lang === 'es' ? `Datos obtenidos de ${weatherData.dataSource || 'Open-Meteo'}` :
			 lang === 'fr' ? `Données fournies par ${weatherData.dataSource || 'Open-Meteo'}` :
			 lang === 'it' ? `Dati estratti da ${weatherData.dataSource || 'Open-Meteo'}` :
			 `Data sourced from ${weatherData.dataSource || 'Open-Meteo'}`}
		</span>
		<span>{lastUpdatedTime}</span>
	</footer>
{/if}

<style>
	:global(#map-wrapper.fullscreen-modal) {
		position: fixed !important;
		top: 50% !important;
		left: 50% !important;
		transform: translate(-50%, -50%) !important;
		width: 90vw !important;
		height: 80vh !important;
		max-width: 1200px !important;
		z-index: 99999 !important;
		border-radius: 1.5rem !important;
		border: 1px solid rgba(255, 255, 255, 0.15) !important;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
	}
	:global(#map-wrapper.fullscreen-modal #map) {
		height: 100% !important;
		width: 100% !important;
	}
	.chart-scroll-container::-webkit-scrollbar {
		height: 6px;
	}
	.chart-scroll-container::-webkit-scrollbar-track {
		background: transparent;
	}
	.chart-scroll-container::-webkit-scrollbar-thumb {
		background: rgba(148, 163, 184, 0.3);
		border-radius: 99px;
	}
	.chart-scroll-container::-webkit-scrollbar-thumb:hover {
		background: rgba(148, 163, 184, 0.5);
	}
	.chart-scroll-container {
		scrollbar-width: thin;
		scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
	}
	.presets-container {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.presets-container::-webkit-scrollbar {
		display: none;
	}
	.glass-sidebar-left {
		mask-image: linear-gradient(to bottom, black 278px, transparent 304px);
		-webkit-mask-image: linear-gradient(to bottom, black 278px, transparent 304px);
	}
	.glass-sidebar-right {
		mask-image: linear-gradient(to bottom, black 278px, transparent 304px);
		-webkit-mask-image: linear-gradient(to bottom, black 278px, transparent 304px);
	}
</style>
