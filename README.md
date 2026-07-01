# Weather Web App (PWA)

A premium, glassmorphic **Weather Web Application** built with **SvelteKit**, **Svelte 5 (Runes)**, and **Tailwind CSS**. It is fully responsive, optimized for mobile devices, and configured as a Progressive Web App (PWA) for seamless offline access.

---

## 🌟 Key Features

* **Real-time Weather Data**: Consumes the official `met.no` location forecast API with custom caching.
* **Interactive Leaflet Map**: Centered at your location (or default London) where cities can be clicked to query weather coordinates automatically.
* **Interactive Svelte Charts**: Detailed hour-by-hour visualisations of temperature, precipitation, and wind speeds.
* **Grammar-Aware Multi-Language Support**: Complete translations for English, Türkçe, Deutsch, Español, Français, and Italiano, including dynamic word ordering for wind directions.
* **Persistent SQLite Cache**: Mitigates API rate limits via a server-side caching database with dynamic TTL controls.
* **PWA & Offline Capability**: Installs directly on mobile or desktop devices and caches templates and forecasts for offline viewing.
* **Dockerized Deployment**: Clean multi-stage build running on lightweight Alpine Linux with externalized port and volume mappings.

---

## 🚀 Running Locally (Development)

To spin up the project on your local machine:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev -- --open
   ```

3. **Build the production build**:
   ```bash
   npm run build
   ```

---

## 🐳 Docker Deployment

The application includes native Docker and Docker Compose configurations utilizing a `node:lts-alpine` image base.

### 1. Configuration (`.env` File)
Create a `.env` file (copied from `.env.example`) to configure the host port:
```env
# The external port the application will be exposed on
APP_PORT=3000
```

### 2. Launching with Docker Compose
To build and start the containerized application:
```bash
docker compose up -d --build
```

### 3. Volume Persistence
The `compose.yaml` file defines a named volume `weather-data` that maps to `/app/data` inside the container. This ensures that the cached SQLite database (`weather_cache.db`) is preserved across container restarts and updates.
