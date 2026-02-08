// Simple client-side cache utility
// Stores data in localStorage for instant loading

const CACHE_PREFIX = 'ccms_cache_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

// Get cached data
export function getCache<T>(key: string): T | null {
    try {
        const cached = localStorage.getItem(CACHE_PREFIX + key);
        if (!cached) return null;

        const entry: CacheEntry<T> = JSON.parse(cached);
        const now = Date.now();

        // Return data even if expired (we'll update in background)
        // But mark as stale if older than cache duration
        if (now - entry.timestamp < CACHE_DURATION) {
            return entry.data;
        }

        // Still return stale data for instant display
        return entry.data;
    } catch {
        return null;
    }
}

// Check if cache is fresh
export function isCacheFresh(key: string): boolean {
    try {
        const cached = localStorage.getItem(CACHE_PREFIX + key);
        if (!cached) return false;

        const entry = JSON.parse(cached);
        return Date.now() - entry.timestamp < CACHE_DURATION;
    } catch {
        return false;
    }
}

// Set cache data
export function setCache<T>(key: string, data: T): void {
    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
        // localStorage might be full, ignore
    }
}

// Clear specific cache
export function clearCache(key: string): void {
    try {
        localStorage.removeItem(CACHE_PREFIX + key);
    } catch {
        // Ignore errors
    }
}

// Clear all cache
export function clearAllCache(): void {
    try {
        Object.keys(localStorage)
            .filter(k => k.startsWith(CACHE_PREFIX))
            .forEach(k => localStorage.removeItem(k));
    } catch {
        // Ignore errors
    }
}
