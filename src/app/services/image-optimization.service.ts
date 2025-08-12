import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ImageLoadState {
    loaded: boolean;
    loading: boolean;
    error: boolean;
    url: string;
}

@Injectable({
    providedIn: 'root'
})
export class ImageOptimizationService {
    private imageStates = new Map<string, ImageLoadState>();
    private imageStatesSubject = new BehaviorSubject<Map<string, ImageLoadState>>(new Map());
    private baseUrl = environment.apiUrl;

    constructor() { }

    /**
     * Get optimized image URL using backend optimization routes
     */
    getOptimizedImageUrl(imageUrl: string, width: number = 300, height: number = 200, quality: number = 80): string {
        if (!imageUrl) return '';

        // If it's already a base64 image, return as is (for now)
        if (imageUrl.startsWith('data:image/')) {
            return imageUrl;
        }

        // If it's already an optimized URL from our backend, return as is
        if (imageUrl.includes('/images/optimized/') ||
            imageUrl.includes('/images/thumbnail/') ||
            imageUrl.includes('/images/medium/') ||
            imageUrl.includes('/images/full/')) {
            return imageUrl;
        }

        // For external URLs or local paths, use our optimization endpoint
        if (imageUrl.includes('api/images/') || imageUrl.includes('storage/')) {
            // Extract filename from the URL
            const filename = this.extractFilename(imageUrl);
            if (filename) {
                return `${this.baseUrl}/images/optimized/${filename}?w=${width}&h=${height}&q=${quality}&fit=crop`;
            }
        }

        return imageUrl;
    }

    /**
     * Get thumbnail URL for project lists
     */
    getThumbnailUrl(imageUrl: string): string {
        if (!imageUrl) return '';

        // If it's already a base64 image, return as is
        if (imageUrl.startsWith('data:image/')) {
            return imageUrl;
        }

        // If it's already an optimized URL, return as is
        if (imageUrl.includes('/images/thumbnail/')) {
            return imageUrl;
        }

        // Extract filename and use thumbnail endpoint
        const filename = this.extractFilename(imageUrl);
        if (filename) {
            return `${this.baseUrl}/images/thumbnail/${filename}`;
        }

        return imageUrl;
    }

    /**
     * Get medium size URL for project details
     */
    getMediumImageUrl(imageUrl: string): string {
        if (!imageUrl) return '';

        // If it's already a base64 image, return as is
        if (imageUrl.startsWith('data:image/')) {
            return imageUrl;
        }

        // If it's already an optimized URL, return as is
        if (imageUrl.includes('/images/medium/')) {
            return imageUrl;
        }

        // Extract filename and use medium endpoint
        const filename = this.extractFilename(imageUrl);
        if (filename) {
            return `${this.baseUrl}/images/medium/${filename}`;
        }

        return imageUrl;
    }

    /**
     * Get full size URL for modal view
     */
    getFullImageUrl(imageUrl: string): string {
        if (!imageUrl) return '';

        // If it's already a base64 image, return as is
        if (imageUrl.startsWith('data:image/')) {
            return imageUrl;
        }

        // If it's already an optimized URL, return as is
        if (imageUrl.includes('/images/full/')) {
            return imageUrl;
        }

        // Extract filename and use full endpoint
        const filename = this.extractFilename(imageUrl);
        if (filename) {
            return `${this.baseUrl}/images/full/${filename}`;
        }

        return imageUrl;
    }

    /**
     * Extract filename from various URL formats
     */
    private extractFilename(imageUrl: string): string | null {
        if (!imageUrl) return null;

        // Handle base64 images
        if (imageUrl.startsWith('data:image/')) {
            return null;
        }

        // Handle URLs with query parameters
        const urlWithoutParams = imageUrl.split('?')[0];

        // Extract filename from path
        const pathParts = urlWithoutParams.split('/');
        const filename = pathParts[pathParts.length - 1];

        // Remove any file extension and get the hash/filename
        if (filename && filename.includes('.')) {
            return filename;
        }

        // If no extension, it might be a hash-based filename
        if (filename && filename.length > 10) {
            return filename;
        }

        return null;
    }

    /**
     * Preload image for better performance
     */
    preloadImage(imageUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!imageUrl) {
                reject(new Error('No image URL provided'));
                return;
            }

            const img = new Image();

            img.onload = () => {
                this.updateImageState(imageUrl, { loaded: true, loading: false, error: false, url: imageUrl });
                resolve();
            };

            img.onerror = () => {
                this.updateImageState(imageUrl, { loaded: false, loading: false, error: true, url: imageUrl });
                reject(new Error('Failed to load image'));
            };

            this.updateImageState(imageUrl, { loaded: false, loading: true, error: false, url: imageUrl });
            img.src = imageUrl;
        });
    }

    /**
     * Preload multiple images
     */
    preloadImages(imageUrls: string[]): Promise<void[]> {
        const promises = imageUrls
            .filter(url => url && !this.imageStates.get(url)?.loaded)
            .map(url => this.preloadImage(url));

        return Promise.all(promises);
    }

    /**
     * Get image load state
     */
    getImageState(imageUrl: string): ImageLoadState | undefined {
        return this.imageStates.get(imageUrl);
    }

    /**
     * Get image load state as observable
     */
    getImageStateObservable(imageUrl: string): Observable<ImageLoadState | undefined> {
        return new Observable(observer => {
            const currentState = this.imageStates.get(imageUrl);
            if (currentState) {
                observer.next(currentState);
            }

            const subscription = this.imageStatesSubject.subscribe(states => {
                const state = states.get(imageUrl);
                if (state) {
                    observer.next(state);
                }
            });

            return () => subscription.unsubscribe();
        });
    }

    /**
     * Update image state
     */
    private updateImageState(imageUrl: string, state: ImageLoadState): void {
        this.imageStates.set(imageUrl, state);
        this.imageStatesSubject.next(new Map(this.imageStates));
    }

    /**
     * Clear image states (useful for memory management)
     */
    clearImageStates(): void {
        this.imageStates.clear();
        this.imageStatesSubject.next(new Map());
    }

    /**
     * Get loading placeholder
     */
    getLoadingPlaceholder(): string {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';
    }

    /**
     * Get error placeholder
     */
    getErrorPlaceholder(): string {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmVlMmUyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2Q5NzM3MyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
    }
}
