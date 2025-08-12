import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { category } from '../../../../model/category.model';
import { ApiService } from '../../../../services/api.service';
import { CacheService } from '../../../../services/cache.service';
import { NavigationService } from '../../../../services/navigation.service';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent implements OnInit, OnDestroy {
  categories: category[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private cache: CacheService,
    private navigation: NavigationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.hideFooter();
    // Mark this component as visited
    this.navigation.markComponentVisited('portfolio');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.showFooter();
  }

  private hideFooter(): void {
    // Hide footer when portfolio component loads
    const footer = document.querySelector('app-footer');
    if (footer) {
      (footer as HTMLElement).style.display = 'none';
    }
  }

  private showFooter(): void {
    // Show footer when leaving portfolio component
    const footer = document.querySelector('app-footer');
    if (footer) {
      (footer as HTMLElement).style.display = 'block';
    }
  }

  loadCategories() {
    // Check if we should skip data fetching (recently visited)
    if (this.navigation.shouldSkipDataFetch('portfolio') && this.cache.hasCachedCategories()) {
      const cachedCategories = this.cache.getCachedCategories();
      if (cachedCategories && cachedCategories.length > 0) {
        this.categories = cachedCategories;
        this.isLoading = false;
        return;
      }
    }

    // Check if we have cached data first
    if (this.cache.hasCachedCategories()) {
      const cachedCategories = this.cache.getCachedCategories();
      if (cachedCategories && cachedCategories.length > 0) {
        this.categories = cachedCategories;
        this.isLoading = false;
        return;
      }
    }

    // If no cached data, fetch from API
    this.isLoading = true;
    this.error = null;

    this.api.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const categories = res.categories || [];
          this.categories = categories;

          // Cache the data for future use
          this.cache.setCategories(categories);

          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error fetching categories:', err);
          this.error = 'Failed to load categories. Please try again.';
          this.isLoading = false;
        }
      });
  }

  // Get full image URL - now using base64 data directly
  getImageUrl(coverData: string): string {
    return coverData || 'assets/Image/user.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use existing image as fallback
  }

  // Navigate to category with forced scroll
  navigateToCategory(categoryId: number, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('Portfolio: Navigating to category with forced scroll:', categoryId);

    // Force scroll to top BEFORE navigation
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Small delay then navigate
    setTimeout(() => {
      this.router.navigate(['/categories', categoryId]).then(() => {
        // Additional scroll after navigation
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          console.log('Portfolio: Post-navigation scroll applied');
        }, 0);
      });
    }, 50);
  }

  // Refresh data (useful for admin updates)
  refreshData(): void {
    this.cache.clear('categories');
    this.navigation.resetNavigationState();
    this.loadCategories();
  }
}
