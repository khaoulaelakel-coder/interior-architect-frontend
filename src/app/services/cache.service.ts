import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
    lastAccess: number; // Last access time for LRU-like behavior
    accessCount: number; // Access count for usage analytics
}

export interface CacheConfig {
    ttl: number;
    backgroundRefresh: boolean;
    refreshThreshold: number; // Percentage of TTL before background refresh
}

export interface CacheSizes {
    thumbnails: number;
    medium: number;
    full: number;
    other: number;
}

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private cache = new Map<string, CacheItem<any>>();
    private defaultTTL = 5 * 60 * 1000; // 5 minutes default
    private maxCacheSize = 100; // Maximum number of cache items

    // Cache configurations for different data types with size-based strategies
    private cacheConfigs: { [key: string]: CacheConfig } = {
        categories: {
            ttl: 10 * 60 * 1000, // 10 minutes
            backgroundRefresh: true,
            refreshThreshold: 0.7 // Refresh when 70% of TTL has passed
        },
        projects: {
            ttl: 8 * 60 * 1000, // 8 minutes
            backgroundRefresh: true,
            refreshThreshold: 0.6 // Refresh when 60% of TTL has passed
        },
        recent_projects: {
            ttl: 5 * 60 * 1000, // 5 minutes
            backgroundRefresh: true,
            refreshThreshold: 0.5 // Refresh when 50% of TTL has passed
        },
        category_projects: {
            ttl: 6 * 60 * 1000, // 6 minutes
            backgroundRefresh: true,
            refreshThreshold: 0.6
        },
        skills: {
            ttl: 15 * 60 * 1000, // 15 minutes (skills don't change often)
            backgroundRefresh: true,
            refreshThreshold: 0.8 // Refresh when 80% of TTL has passed
        },
        // Image-specific caching strategies
        thumbnails: {
            ttl: 30 * 60 * 1000, // 30 minutes (thumbnails are stable)
            backgroundRefresh: false,
            refreshThreshold: 0.9
        },
        medium_images: {
            ttl: 20 * 60 * 1000, // 20 minutes
            backgroundRefresh: false,
            refreshThreshold: 0.8
        },
        full_images: {
            ttl: 10 * 60 * 1000, // 10 minutes (less caching for large images)
            backgroundRefresh: false,
            refreshThreshold: 0.7
        }
    };

    // BehaviorSubjects for reactive updates
    private categoriesSubject = new BehaviorSubject<any[]>([]);
    private projectsSubject = new BehaviorSubject<any[]>([]);
    private recentProjectsSubject = new BehaviorSubject<any[]>([]);
    private skillsSubject = new BehaviorSubject<any[]>([]);

    constructor() {
        // Clean up expired cache items every 30 seconds
        setInterval(() => this.cleanupExpiredItems(), 30000);

        // Background refresh check every minute
        setInterval(() => this.checkBackgroundRefresh(), 60000);
    }

    // Get data from cache with enhanced access tracking
    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        // Check if expired
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        // Update access tracking
        item.lastAccess = Date.now();
        item.accessCount++;

        // Move to end for LRU behavior
        this.cache.delete(key);
        this.cache.set(key, item);

        return item.data;
    }

    // Set data in cache with smart TTL management
    set<T>(key: string, data: T, ttl?: number): void {
        // Determine TTL based on key pattern
        const config = this.getCacheConfig(key);
        const finalTTL = ttl || config.ttl;

        // Check cache size limit
        if (this.cache.size >= this.maxCacheSize) {
            this.evictLeastUsed();
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: finalTTL,
            lastAccess: Date.now(),
            accessCount: 0
        });
    }

    // Check if cache has valid data
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    // Clear specific cache item
    clear(key: string): void {
        this.cache.delete(key);
    }

    // Clear all cache
    clearAll(): void {
        this.cache.clear();
        this.categoriesSubject.next([]);
        this.projectsSubject.next([]);
        this.recentProjectsSubject.next([]);
        this.skillsSubject.next([]);
    }

    // Get cache statistics for debugging and monitoring
    getCacheStats(): {
        totalItems: number;
        keys: string[];
        memoryUsage: number;
        hitRate: number;
        averageTTL: number;
    } {
        const keys = Array.from(this.cache.keys());
        let totalAccessCount = 0;
        let totalTTL = 0;

        this.cache.forEach(item => {
            totalAccessCount += item.accessCount;
            totalTTL += item.ttl;
        });

        return {
            totalItems: this.cache.size,
            keys,
            memoryUsage: this.estimateMemoryUsage(),
            hitRate: totalAccessCount > 0 ? totalAccessCount / this.cache.size : 0,
            averageTTL: totalTTL > 0 ? totalTTL / this.cache.size : 0
        };
    }

    // Get categories with caching and background refresh
    getCategories(): Observable<any[]> {
        return this.categoriesSubject.asObservable();
    }

    // Set categories and cache them
    setCategories(categories: any[]): void {
        this.set('categories', categories);
        this.categoriesSubject.next(categories);
    }

    // Get projects with caching
    getProjects(): Observable<any[]> {
        return this.projectsSubject.asObservable();
    }

    // Set projects and cache them
    setProjects(projects: any[]): void {
        this.set('projects', projects);
        this.projectsSubject.next(projects);
    }

    // Get recent projects with caching
    getRecentProjects(): Observable<any[]> {
        return this.recentProjectsSubject.asObservable();
    }

    // Set recent projects and cache them
    setRecentProjects(projects: any[]): void {
        this.set('recent_projects', projects);
        this.recentProjectsSubject.next(projects);
    }

    // Get skills with caching
    getSkills(): Observable<any[]> {
        return this.skillsSubject.asObservable();
    }

    // Set skills and cache them
    setSkills(skills: any[]): void {
        this.set('skills', skills);
        this.skillsSubject.next(skills);
    }

    // Check if we have cached data
    hasCachedCategories(): boolean {
        return this.has('categories');
    }

    hasCachedProjects(): boolean {
        return this.has('projects');
    }

    hasCachedRecentProjects(): boolean {
        return this.has('recent_projects');
    }

    hasCachedSkills(): boolean {
        return this.has('skills');
    }

    // Get cached data directly
    getCachedCategories(): any[] | null {
        return this.get('categories');
    }

    getCachedProjects(): any[] | null {
        return this.get('projects');
    }

    getCachedRecentProjects(): any[] | null {
        return this.get('recent_projects');
    }

    getCachedSkills(): any[] | null {
        return this.get('skills');
    }

    // Smart cache invalidation based on patterns
    invalidatePattern(pattern: string): void {
        const keysToDelete: string[] = [];

        this.cache.forEach((_, key) => {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.cache.delete(key));
        console.log(`Invalidated ${keysToDelete.length} cache items matching pattern: ${pattern}`);
    }

    // Progressive image loading methods
    cacheImageBySize(identifier: string, size: 'thumbnail' | 'medium' | 'full', imageData: string): void {
        const key = `${identifier}_${size}`;
        const config = this.getCacheConfig(`${size}_images`);
        this.set(key, imageData, config.ttl);
    }

    getImageBySize(identifier: string, size: 'thumbnail' | 'medium' | 'full'): string | null {
        const key = `${identifier}_${size}`;
        return this.get(key);
    }

    hasImageBySize(identifier: string, size: 'thumbnail' | 'medium' | 'full'): boolean {
        const key = `${identifier}_${size}`;
        return this.has(key);
    }

    // Preload thumbnails for better performance
    preloadThumbnails(items: any[], imageField: string = 'cover_image'): void {
        items.forEach(item => {
            if (item[imageField] && !this.hasImageBySize(`${item.id}`, 'thumbnail')) {
                this.cacheImageBySize(`${item.id}`, 'thumbnail', item[imageField]);
            }
        });
    }

    // Get cache size by type for monitoring
    getCacheSizeByType(): CacheSizes {
        const sizes: CacheSizes = {
            thumbnails: 0,
            medium: 0,
            full: 0,
            other: 0
        };

        this.cache.forEach((item, key) => {
            if (key.includes('_thumbnail')) {
                sizes.thumbnails++;
            } else if (key.includes('_medium')) {
                sizes.medium++;
            } else if (key.includes('_full')) {
                sizes.full++;
            } else {
                sizes.other++;
            }
        });

        return sizes;
    }

    // Get cache configuration for a specific key
    private getCacheConfig(key: string): CacheConfig {
        // Find matching config based on key patterns
        for (const [pattern, config] of Object.entries(this.cacheConfigs)) {
            if (key.includes(pattern)) {
                return config;
            }
        }

        // Return default config
        return {
            ttl: this.defaultTTL,
            backgroundRefresh: false,
            refreshThreshold: 0.8
        };
    }

    // Evict least used items when cache is full
    private evictLeastUsed(): void {
        let leastUsedKey = '';
        let lowestScore = Infinity;

        this.cache.forEach((item, key) => {
            // Score based on access count and last access time
            const timeSinceAccess = Date.now() - item.lastAccess;
            const score = (timeSinceAccess / 60000) - (item.accessCount * 10); // Time penalty + access bonus

            if (score < lowestScore) {
                lowestScore = score;
                leastUsedKey = key;
            }
        });

        if (leastUsedKey) {
            this.cache.delete(leastUsedKey);
            console.log(`Evicted least used cache item: ${leastUsedKey}`);
        }
    }

    // Estimate memory usage of cache
    private estimateMemoryUsage(): number {
        let totalSize = 0;

        this.cache.forEach((item, key) => {
            // Rough estimation: key length + data size + overhead
            totalSize += key.length * 2; // UTF-16 characters
            totalSize += JSON.stringify(item.data).length * 2;
            totalSize += 100; // Overhead for object structure
        });

        return totalSize;
    }

    // Check if background refresh is needed
    private checkBackgroundRefresh(): void {
        this.cache.forEach((item, key) => {
            const config = this.getCacheConfig(key);

            if (config.backgroundRefresh) {
                const timeSinceCreation = Date.now() - item.timestamp;
                const refreshThreshold = config.ttl * config.refreshThreshold;

                if (timeSinceCreation >= refreshThreshold) {
                    // Mark for background refresh (could trigger API call here)
                    console.log(`Background refresh needed for: ${key}`);
                }
            }
        });
    }

    private cleanupExpiredItems(): void {
        const now = Date.now();
        const expiredKeys: string[] = [];

        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.cache.delete(key));

        if (expiredKeys.length > 0) {
            console.log(`Cleaned up ${expiredKeys.length} expired cache items`);
        }
    }
}
