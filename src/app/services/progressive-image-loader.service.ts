import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CacheService } from './cache.service';
import { ApiService } from './api.service';

export interface ProgressiveImageState {
    id: string;
    thumbnail?: string;
    medium?: string;
    full?: string;
    loadingMedium: boolean;
    loadingFull: boolean;
    error: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ProgressiveImageLoaderService {
    private imageStates = new Map<string, BehaviorSubject<ProgressiveImageState>>();
    private intersectionObserver?: IntersectionObserver;

    constructor(
        private cache: CacheService,
        private api: ApiService
    ) {
        this.setupIntersectionObserver();
    }

    /**
     * Get progressive image state for an item
     */
    getImageState(itemId: string, thumbnailUrl?: string): Observable<ProgressiveImageState> {
        const key = itemId.toString();

        if (!this.imageStates.has(key)) {
            const initialState: ProgressiveImageState = {
                id: key,
                thumbnail: thumbnailUrl || this.cache.getImageBySize(key, 'thumbnail') || undefined,
                medium: this.cache.getImageBySize(key, 'medium') || undefined,
                full: this.cache.getImageBySize(key, 'full') || undefined,
                loadingMedium: false,
                loadingFull: false,
                error: false
            };

            this.imageStates.set(key, new BehaviorSubject(initialState));

            // Cache thumbnail if provided
            if (thumbnailUrl) {
                this.cache.cacheImageBySize(key, 'thumbnail', thumbnailUrl);
            }
        }

        return this.imageStates.get(key)!.asObservable();
    }

    /**
     * Load medium quality image on demand
     */
    loadMediumImage(itemId: string, type: 'project' | 'skill' | 'category'): Promise<string | null> {
        const key = itemId.toString();
        const state$ = this.imageStates.get(key);

        if (!state$) return Promise.resolve(null);

        const currentState = state$.value;

        // Return cached medium image if available
        if (currentState.medium) {
            return Promise.resolve(currentState.medium);
        }

        // Check cache first
        const cachedMedium = this.cache.getImageBySize(key, 'medium');
        if (cachedMedium) {
            this.updateImageState(key, { medium: cachedMedium });
            return Promise.resolve(cachedMedium);
        }

        // Load from API if not cached
        if (!currentState.loadingMedium) {
            this.updateImageState(key, { loadingMedium: true });

            return this.loadImageFromAPI(itemId, type, 'medium')
                .then(imageData => {
                    if (imageData) {
                        this.cache.cacheImageBySize(key, 'medium', imageData);
                        this.updateImageState(key, {
                            medium: imageData,
                            loadingMedium: false
                        });
                        return imageData;
                    }

                    this.updateImageState(key, {
                        loadingMedium: false,
                        error: true
                    });
                    return null;
                })
                .catch(() => {
                    this.updateImageState(key, {
                        loadingMedium: false,
                        error: true
                    });
                    return null;
                });
        }

        return Promise.resolve(null);
    }

    /**
     * Load full quality image on demand
     */
    loadFullImage(itemId: string, type: 'project' | 'skill' | 'category'): Promise<string | null> {
        const key = itemId.toString();
        const state$ = this.imageStates.get(key);

        if (!state$) return Promise.resolve(null);

        const currentState = state$.value;

        // Return cached full image if available
        if (currentState.full) {
            return Promise.resolve(currentState.full);
        }

        // Check cache first
        const cachedFull = this.cache.getImageBySize(key, 'full');
        if (cachedFull) {
            this.updateImageState(key, { full: cachedFull });
            return Promise.resolve(cachedFull);
        }

        // Load from API if not cached
        if (!currentState.loadingFull) {
            this.updateImageState(key, { loadingFull: true });

            return this.loadImageFromAPI(itemId, type, 'full')
                .then(imageData => {
                    if (imageData) {
                        this.cache.cacheImageBySize(key, 'full', imageData);
                        this.updateImageState(key, {
                            full: imageData,
                            loadingFull: false
                        });
                        return imageData;
                    }

                    this.updateImageState(key, {
                        loadingFull: false,
                        error: true
                    });
                    return null;
                })
                .catch(() => {
                    this.updateImageState(key, {
                        loadingFull: false,
                        error: true
                    });
                    return null;
                });
        }

        return Promise.resolve(null);
    }

    /**
     * Observe element for lazy loading medium images
     */
    observeForMediumLoading(element: HTMLElement, itemId: string, type: 'project' | 'skill' | 'category'): void {
        if (!this.intersectionObserver) return;

        element.dataset['itemId'] = itemId.toString();
        element.dataset['itemType'] = type;
        element.dataset['loadType'] = 'medium';

        this.intersectionObserver.observe(element);
    }

    /**
     * Observe element for lazy loading full images
     */
    observeForFullLoading(element: HTMLElement, itemId: string, type: 'project' | 'skill' | 'category'): void {
        if (!this.intersectionObserver) return;

        element.dataset['itemId'] = itemId.toString();
        element.dataset['itemType'] = type;
        element.dataset['loadType'] = 'full';

        this.intersectionObserver.observe(element);
    }

    /**
     * Stop observing element
     */
    unobserve(element: HTMLElement): void {
        if (this.intersectionObserver) {
            this.intersectionObserver.unobserve(element);
        }
    }

    /**
     * Preload medium images for visible items
     */
    preloadMediumImages(items: any[], type: 'project' | 'skill' | 'category'): void {
        const promises = items.slice(0, 6).map(item => // Only preload first 6
            this.loadMediumImage(item.id, type)
        );

        Promise.allSettled(promises).then(() => {
            console.log(`Preloaded medium images for ${type}s`);
        });
    }

    /**
     * Clear image states for memory management
     */
    clearImageStates(): void {
        this.imageStates.forEach(subject => subject.complete());
        this.imageStates.clear();
    }

    private updateImageState(key: string, update: Partial<ProgressiveImageState>): void {
        const state$ = this.imageStates.get(key);
        if (state$) {
            const currentState = state$.value;
            state$.next({ ...currentState, ...update });
        }
    }

    private setupIntersectionObserver(): void {
        if (typeof IntersectionObserver === 'undefined') return;

        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target as HTMLElement;
                        const itemId = element.dataset['itemId'];
                        const itemType = element.dataset['itemType'] as 'project' | 'skill' | 'category';
                        const loadType = element.dataset['loadType'] as 'medium' | 'full';

                        if (itemId && itemType && loadType) {
                            if (loadType === 'medium') {
                                this.loadMediumImage(itemId, itemType);
                            } else if (loadType === 'full') {
                                this.loadFullImage(itemId, itemType);
                            }

                            // Stop observing once loaded
                            this.intersectionObserver?.unobserve(element);
                        }
                    }
                });
            },
            {
                rootMargin: '50px', // Load 50px before entering viewport
                threshold: 0.1
            }
        );
    }

    private loadImageFromAPI(itemId: string, type: 'project' | 'skill' | 'category', size: 'medium' | 'full'): Promise<string | null> {
        // This would be implemented based on your API structure
        // For now, we'll return the thumbnail as a placeholder
        // In a real implementation, you'd make API calls with size parameters

        return new Promise((resolve) => {
            // Simulate API delay
            setTimeout(() => {
                const thumbnailData = this.cache.getImageBySize(itemId, 'thumbnail');
                resolve(thumbnailData); // In real implementation, this would be the actual API response
            }, 100);
        });
    }
}
