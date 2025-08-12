import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CacheService } from '../../../services/cache.service';
import { ProgressiveImageComponent } from '../../../shared/components/progressive-image/progressive-image.component';
import { ProgressiveImageLoaderService } from '../../../services/progressive-image-loader.service';
import { Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

interface Project {
    id: number;
    name: string;
    description: string;
    cover_image?: string;
    image_url?: string;
    category?: {
        id: number;
        name: string;
        cover?: string;
    };
    created_at: string;
}

@Component({
    selector: 'app-portfolio',
    standalone: true,
    imports: [CommonModule, RouterModule, ProgressiveImageComponent],
    templateUrl: './portfolio.component.html',
    styleUrl: './portfolio.component.css'
})
export class PortfolioComponent implements OnInit, OnDestroy {
    categories: any[] = [];
    isLoading: boolean = true;
    error: string | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        private apiService: ApiService,
        private cache: CacheService,
        private progressiveLoader: ProgressiveImageLoaderService
    ) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.progressiveLoader.clearImageStates();
    }

    loadCategories(): void {
        this.isLoading = true;
        this.error = null;

        // Check cache first
        if (this.cache.hasCachedCategories()) {
            const cachedCategories = this.cache.getCachedCategories();
            if (cachedCategories && cachedCategories.length > 0) {
                console.log('Using cached categories:', cachedCategories.length);
                this.categories = cachedCategories;
                this.isLoading = false;

                // Cache thumbnails from cached data
                this.cache.preloadThumbnails(this.categories, 'cover');
                return;
            }
        }

        // Load from API if not cached
        console.log('Fetching categories from API...');
        this.apiService.getCategories()
            .pipe(
                takeUntil(this.destroy$),
                catchError(error => {
                    console.error('Error loading categories:', error);
                    this.error = 'Erreur lors du chargement des catégories';
                    this.isLoading = false;
                    throw error;
                }),
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (response: any) => {
                    if (response.status === 'success') {
                        const categories = response.categories || [];
                        console.log('API returned categories:', categories.length);

                        this.categories = categories;

                        // Cache the data for future use
                        this.cache.setCategories(categories);
                        console.log('Cached categories for future use');

                        // Cache thumbnails and preload medium images for better performance
                        this.cache.preloadThumbnails(categories, 'cover');
                        this.progressiveLoader.preloadMediumImages(categories, 'category');

                        this.isLoading = false;
                    } else {
                        this.error = 'Échec du chargement des catégories';
                    }
                }
            });
    }

    /**
     * Get image URL for category display
     */
    getImageUrl(category: any): string {
        return category.cover || 'assets/Image/user.png';
    }

    /**
     * Handle image loading errors
     */
    onImageError(event: Event): void {
        const target = event.target as HTMLImageElement;
        target.src = 'assets/Image/user.png'; // Use fallback image
    }

    /**
     * Navigate to category projects
     */
    navigateToCategory(categoryId: number): void {
        console.log('Navigating to category:', categoryId);
        // Add navigation logic here
    }

    /**
     * Refresh categories data
     */
    refreshCategories(): void {
        console.log('Refreshing categories data...');
        this.cache.clear('categories');
        this.loadCategories();
    }

    /**
     * Track by function for better performance
     */
    trackByCategoryId(index: number, category: any): number {
        return category.id;
    }
}
