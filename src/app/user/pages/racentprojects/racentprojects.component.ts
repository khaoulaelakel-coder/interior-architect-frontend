import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { CacheService } from '../../../services/cache.service';
import { NavigationService } from '../../../services/navigation.service';
import { LoadingDotsComponent } from '../../../shared/components/loading-dots/loading-dots.component';
import { ProgressiveImageComponent } from '../../../shared/components/progressive-image/progressive-image.component';
import { ProgressiveImageLoaderService } from '../../../services/progressive-image-loader.service';
import { Subject } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-racentprojects',
  standalone: true,
  imports: [RouterModule, CommonModule, LoadingDotsComponent, ProgressiveImageComponent],
  templateUrl: './racentprojects.component.html',
  styleUrl: './racentprojects.component.css'
})
export class RacentprojectsComponent implements OnInit, OnDestroy {
  recentProjects: any[] = [];
  loading: boolean = false;
  error = false;

  // Ensure we always show maximum 4 projects
  // This component is designed to display only the 4 most recent projects
  // for better performance and user experience
  private readonly MAX_RECENT_PROJECTS = 4;

  // Cache key for recent projects
  private readonly CACHE_KEY = 'recent_projects';

  // Getter to ensure we always return maximum 4 projects
  get displayProjects() {
    return this.recentProjects.slice(0, this.MAX_RECENT_PROJECTS);
  }

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private cache: CacheService,
    private navigation: NavigationService,
    private router: Router,
    private progressiveLoader: ProgressiveImageLoaderService
  ) { }

  ngOnInit(): void {
    console.log('Recent Projects Component initialized');
    this.checkCacheStatus(); // Check cache status on init
    this.loadRecentProjects();
    // Mark this component as visited
    this.navigation.markComponentVisited('recentProjects');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecentProjects(): void {
    // First, check if we have valid cached data
    if (this.cache.hasCachedRecentProjects()) {
      const cachedProjects = this.cache.getCachedRecentProjects();
      if (cachedProjects && cachedProjects.length > 0) {
        console.log('Using cached recent projects:', cachedProjects.length);
        // Ensure we only show exactly 4 projects from cache
        this.recentProjects = cachedProjects.slice(0, this.MAX_RECENT_PROJECTS);
        this.loading = false;
        // Cache thumbnails from cached data
        this.cache.preloadThumbnails(this.recentProjects, 'cover_image');
        return;
      }
    }

    // Check if we should skip data fetching (recently visited)
    if (this.navigation.shouldSkipDataFetch('recentProjects') && this.cache.hasCachedRecentProjects()) {
      const cachedProjects = this.cache.getCachedRecentProjects();
      if (cachedProjects && cachedProjects.length > 0) {
        console.log('Using cached recent projects (navigation skip):', cachedProjects.length);
        // Ensure we only show exactly 4 projects from cache
        this.recentProjects = cachedProjects.slice(0, this.MAX_RECENT_PROJECTS);
        this.loading = false;
        // Cache thumbnails from cached data
        this.cache.preloadThumbnails(this.recentProjects, 'cover_image');
        return;
      }
    }

    // If no cached data, fetch from API using optimized endpoint
    console.log('Fetching recent projects from API...');
    this.loading = true;
    this.error = false;

    this.apiService.getRecentProjects(this.MAX_RECENT_PROJECTS)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading recent projects:', error);
          this.error = true;
          this.loading = false;
          throw error;
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (data: any) => {
          // Get the projects directly (API should return only recent ones)
          const projects = data.projects || data || [];
          console.log('API returned projects:', projects.length);

          // Ensure we only show exactly 4 projects (or less if fewer exist)
          const limitedProjects = projects.slice(0, this.MAX_RECENT_PROJECTS);
          this.recentProjects = limitedProjects;
          console.log('Displaying projects:', this.recentProjects.length);

          // Cache the data for future use
          this.cache.setRecentProjects(limitedProjects);
          console.log('Cached recent projects for future use');

          // Cache thumbnails and preload medium images for better performance
          this.cache.preloadThumbnails(limitedProjects, 'cover_image');
          this.progressiveLoader.preloadMediumImages(limitedProjects, 'project');

          this.loading = false;
        }
      });
  }

  /**
   * Get optimized image URL for project display
   */
  getImageUrl(project: any): string {
    return project.cover_image || project.image_url || 'assets/Image/user.png';
  }

  /**
   * Handle image loading errors
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use fallback image
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    if (diffDays <= 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    if (diffDays <= 365) return `Il y a ${Math.ceil(diffDays / 30)} mois`;

    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short'
    });
  }

  retryLoad(): void {
    console.log('Retrying to load recent projects...');
    this.cache.clear(this.CACHE_KEY);
    this.navigation.resetNavigationState();
    this.loadRecentProjects();
  }

  // Navigate to project with forced scroll
  navigateToProject(projectId: number): void {
    console.log('Navigating to project with forced scroll:', projectId);
    console.log('Current URL before navigation:', this.router.url);

    // Force scroll to top BEFORE navigation
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Navigate immediately without setTimeout to prevent URL issues
    this.router.navigate(['/project-details', projectId]).then((success) => {
      console.log('Navigation success:', success);
      console.log('URL after navigation:', this.router.url);
      console.log('Browser location after navigation:', window.location.href);

      // Force URL update if there's a mismatch
      const expectedUrl = `/project-details/${projectId}`;
      if (success && !window.location.href.includes(expectedUrl)) {
        console.log('Forcing URL update...');
        window.history.replaceState(null, '', expectedUrl);
      }

      // Additional scroll after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        console.log('Post-navigation scroll applied');
      }, 0);
    }).catch((error) => {
      console.error('Navigation failed:', error);
    });
  }

  // Refresh data (useful for admin updates)
  refreshData(): void {
    console.log('Refreshing recent projects data...');
    this.cache.clear(this.CACHE_KEY);
    this.navigation.resetNavigationState();
    this.loadRecentProjects();
  }

  // Check cache status (for debugging)
  checkCacheStatus(): void {
    const hasCache = this.cache.hasCachedRecentProjects();
    const cachedData = this.cache.getCachedRecentProjects();
    const cacheStats = this.cache.getCacheStats();
    console.log('Cache status:', {
      hasCache,
      cachedCount: cachedData ? cachedData.length : 0,
      cacheKey: this.CACHE_KEY,
      totalCacheItems: cacheStats.totalItems,
      allCacheKeys: cacheStats.keys
    });
  }

  // Force refresh cache (useful for testing)
  forceRefreshCache(): void {
    console.log('Force refreshing cache...');
    this.cache.clear(this.CACHE_KEY);
    this.navigation.resetNavigationState();
    this.loadRecentProjects();
  }
}
