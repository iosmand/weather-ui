import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import { createLogger } from '$lib/server/logger';

const log = createLogger('db');
const dbPath = env.DATABASE_PATH || 'weather_cache.db';
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
	CREATE TABLE IF NOT EXISTS weather_cache (
		key TEXT PRIMARY KEY,
		data TEXT NOT NULL,
		expires_at INTEGER NOT NULL
	);
`);

/**
	Retrieves a cached JSON object if it exists and is not expired.
 */
export function getCache(key: string): any | null {
	try {
		const stmt = db.prepare('SELECT data, expires_at FROM weather_cache WHERE key = ?');
		const row = stmt.get(key) as { data: string; expires_at: number } | undefined;

		if (!row) return null;

		const now = Date.now();
		if (now > row.expires_at) {
			// Cache expired, remove it in background
			deleteCache(key);
			return null;
		}

		return JSON.parse(row.data);
	} catch (error) {
		log.error(`Error reading cache for key ${key}`, error);
		return null;
	}
}

/**
	Saves a JSON object to cache with a given expiration duration in seconds.
 */
export function setCache(key: string, data: any, ttlSeconds: number): void {
	try {
		const expiresAt = Date.now() + ttlSeconds * 1000;
		const dataStr = JSON.stringify(data);

		const stmt = db.prepare(`
			INSERT INTO weather_cache (key, data, expires_at)
			VALUES (?, ?, ?)
			ON CONFLICT(key) DO UPDATE SET
				data = excluded.data,
				expires_at = excluded.expires_at
		`);
		stmt.run(key, dataStr, expiresAt);
		
		// Periodically prune expired entries
		pruneCache();
	} catch (error) {
		log.error(`Error writing cache for key ${key}`, error);
	}
}

/**
	Removes a specific cache entry.
 */
export function deleteCache(key: string): void {
	try {
		const stmt = db.prepare('DELETE FROM weather_cache WHERE key = ?');
		stmt.run(key);
	} catch (error) {
		log.error(`Error deleting cache for key ${key}`, error);
	}
}

/**
	Deletes all expired cache entries from the database.
 */
function pruneCache(): void {
	try {
		const now = Date.now();
		const stmt = db.prepare('DELETE FROM weather_cache WHERE expires_at < ?');
		stmt.run(now);
	} catch (error) {
		log.error('Error pruning cache', error);
	}
}
