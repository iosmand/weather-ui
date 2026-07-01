/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE_NAME = `weather-cache-v${version}`;

// Merge list of files to cache on install
const ASSETS = [
	...build, // SvelteKit build output (JS, CSS, chunk files)
	...files, // static directory files (logo.svg, manifest.json, robots.txt)
	'/'       // cache root page
];

self.addEventListener('install', (event: any) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS);
		})
	);
});

self.addEventListener('activate', (event: any) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', (event: any) => {
	// Skip cross-origin or non-GET requests
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	event.respondWith(
		caches.open(CACHE_NAME).then(async (cache) => {
			// For local API requests (weather data), try network first, then cache
			if (url.pathname.startsWith('/api/')) {
				try {
					const response = await fetch(event.request);
					// Cache the successful response
					if (response.status === 200) {
						cache.put(event.request, response.clone());
					}
					return response;
				} catch (error) {
					// Network failed, try cache
					const cachedResponse = await cache.match(event.request);
					if (cachedResponse) {
						return cachedResponse;
					}
					// Return offline error JSON
					return new Response(
						JSON.stringify({
							error: 'You are offline, and no cached forecast is available for this location.',
							isOffline: true
						}),
						{
							status: 503,
							headers: { 'Content-Type': 'application/json' }
						}
					);
				}
			}

			// For static assets / pages: try cache first, fallback to network
			const cachedResponse = await cache.match(event.request);
			if (cachedResponse) {
				return cachedResponse;
			}

			try {
				const response = await fetch(event.request);
				// If it's a valid get response, cache it
				if (response.status === 200) {
					cache.put(event.request, response.clone());
				}
				return response;
			} catch (error) {
				// If page navigation fails and we are offline, return cached page shell '/'
				if (event.request.mode === 'navigate') {
					const rootCache = await cache.match('/');
					if (rootCache) return rootCache;
				}
				throw error;
			}
		})
	);
});
