import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { CacheService } from '../../../../services/cache.service';
import { NavigationService } from '../../../../services/navigation.service';
import { PerformanceMonitorService } from '../../../../services/performance-monitor.service';
import { ImageOptimizationService } from '../../../../services/image-optimization.service';
import { OptimizedProjectCardComponent, ProjectCardData } from '../../../../shared/components/optimized-project-card/optimized-project-card.component';
import { RouterModule } from '@angular/router';
import { Subject, fromEvent, debounceTime, distinctUntilChanged, timer } from 'rxjs';
import { takeUntil, catchError, finalize, filter, map, retry, retryWhen, delay } from 'rxjs/operators';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-category-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent, OptimizedProjectCardComponent],
  templateUrl: './category-projects.component.html',
  styleUrls: ['./category-projects.component.css']
})
export class CategoryProjectsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('projectsContainer', { static: false }) projectsContainer!: ElementRef;

  categoryId: string | null = null;
  projects: any[] = [];
  optimizedProjects: ProjectCardData[] = [];
  isLoading: boolean = false;
  isLoadingMore: boolean = false;
  error: string | null = null;
  retryCount: number = 0;
  maxRetries: number = 3;

  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 1;
  hasMorePages: boolean = true;
  perPage: number = this.getResponsivePerPage();

  // Simple state persistence
  private readonly STATE_KEY = 'category_projects_state';

  // Virtual scrolling properties
  visibleProjects: ProjectCardData[] = [];
  startIndex: number = 0;
  endIndex: number = 24;
  itemHeight: number = 400;
  containerHeight: number = 0;

  // Image lazy loading
  private imageObserver: IntersectionObserver | null = null;
  private lazyImages: Set<HTMLImageElement> = new Set();
  private mutationObserver: MutationObserver | null = null;

  // Preloading
  private preloadedPages: Set<number> = new Set();
  private isPreloading: boolean = false;

  // Cache key for category projects
  private readonly CACHE_KEY_PREFIX = 'category_projects_';
  private destroy$ = new Subject<void>();

  // Performance monitoring
  private loadStartTime: number = 0;
  private imageLoadTimes: Map<string, number> = new Map();
  private performanceSessionId: string = '';

  // Accessibility
  private focusableElements: HTMLElement[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cache: CacheService,
    private navigation: NavigationService,
    private router: Router,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private performanceMonitor: PerformanceMonitorService,
    private imageService: ImageOptimizationService
  ) { }

  ngOnInit(): void {
    this.setupAccessibility();

    // Start performance monitoring
    this.performanceSessionId = this.performanceMonitor.startMonitoring('CategoryProjectsComponent');

    // Update perPage based on screen size
    this.updatePerPageOnResize();

    // Try to restore global state first
    setTimeout(() => {
      this.restoreGlobalState();
    }, 100);

    // Subscribe to route parameter changes
    this.route.paramMap.subscribe(params => {
      const newCategoryId = params.get('id');

      if (newCategoryId !== this.categoryId) {
        this.categoryId = newCategoryId;

        if (this.categoryId) {
          // Reset state for new category
          this.resetState();
          // Check cache status on init
          this.checkCacheStatus();
          // Mark this component as visited for navigation state management
          this.navigation.markComponentVisited(`category_${this.categoryId}`);
          this.loadProjects();

          // Ensure projects are visible after marking as visited
          setTimeout(() => {
            this.ensureProjectsVisible();
          }, 100);
        }
      } else if (newCategoryId && !this.categoryId) {
        // Initial load
        this.categoryId = newCategoryId;

        if (this.categoryId) {
          // Check cache status on init
          this.checkCacheStatus();
          // Mark this component as visited for navigation state management
          this.navigation.markComponentVisited(`category_${this.categoryId}`);
          this.loadProjects();

          // Ensure projects are visible after marking as visited
          setTimeout(() => {
            this.ensureProjectsVisible();
          }, 100);
        }
      }
    });

    // Start periodic safety check to prevent white page issues
    this.startPeriodicSafetyCheck();
  }

  ngAfterViewInit(): void {
    this.setupVirtualScrolling();
    this.setupImageLazyLoading();
    this.setupScrollListener();

    // Start observing DOM changes for new images
    if (this.mutationObserver && this.projectsContainer) {
      this.mutationObserver.observe(this.projectsContainer.nativeElement, {
        childList: true,
        subtree: true
      });
    }

    // Simplified project visibility check
    setTimeout(() => {
      if (this.projects.length > 0 && this.visibleProjects.length === 0) {
        this.visibleProjects = [...this.projects];
      }

      // Observe any images that are already in the DOM
      this.observeNewImages();

      // Restore saved state if available
      setTimeout(() => {
        this.restoreState();
      }, 500);

      // Also try to restore global state
      setTimeout(() => {
        this.restoreGlobalState();
      }, 600);
    }, 500);
  }

  private setupAccessibility(): void {
    // Setup keyboard navigation
    this.setupKeyboardNavigation();

    // Setup ARIA labels and roles
    this.setupAriaLabels();
  }

  private setupKeyboardNavigation(): void {
    // Handle keyboard navigation for project cards
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        this.updateFocusableElements();
      }
    });
  }

  private setupAriaLabels(): void {
    // Add ARIA labels for better screen reader support
    setTimeout(() => {
      const projectCards = this.elementRef.nativeElement.querySelectorAll('.project-item');
      projectCards.forEach((card: HTMLElement, index: number) => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Projet ${index + 1}, cliquer pour voir les détails`);
      });
    }, 1000);
  }

  private updateFocusableElements(): void {
    this.focusableElements = Array.from(
      this.elementRef.nativeElement.querySelectorAll('button, a, .project-item[tabindex]')
    );
  }

  private resetState(): void {
    this.projects = [];
    this.visibleProjects = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.hasMorePages = true;
    this.error = null;
    this.isLoading = false;
    this.isLoadingMore = false;
    this.startIndex = 0;
    this.endIndex = 24;
    this.preloadedPages.clear();
    this.retryCount = 0;
    this.imageLoadTimes.clear();

    // Clear saved state when resetting
    this.clearSavedState();
  }

  // Clear saved state from localStorage
  private clearSavedState(): void {
    localStorage.removeItem(this.STATE_KEY);
  }

  // Prevent component destruction during navigation
  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.storeComponentState();
  }

  @HostListener('window:popstate')
  onPopState(): void {
    this.storeComponentState();
  }

  // Override ngOnDestroy to prevent destruction
  ngOnDestroy(): void {
    // Store state before destruction
    this.storeComponentState();

    // Only destroy if we're really leaving the app
    if (this.router.url.includes('category')) {
      return;
    }

    // Clear image states
    this.imageService.clearImageStates();

    this.destroy$.next();
    this.destroy$.complete();
    this.imageObserver?.disconnect();
    this.mutationObserver?.disconnect();

    // End performance monitoring
    if (this.performanceSessionId) {
      const metrics = this.performanceMonitor.endMonitoring(this.performanceSessionId);
    }
  }

  private getCacheKey(): string {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${this.categoryId}`;
    return cacheKey;
  }

  private transformProjects(projects: any[]): ProjectCardData[] {
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      image_url: this.getFirstImage(project) || undefined,
      cover_image: project.cover_image,
      category: project.category,
      created_at: project.created_at
    }));
  }

  private preloadImages(projects: ProjectCardData[]): void {
    const imageUrls = projects
      .map(project => project.image_url)
      .filter((url): url is string => !!url);

    imageUrls.forEach(url => {
      this.imageService.preloadImage(url);
    });
  }

  loadProjects(reset: boolean = true): void {
    if (!this.categoryId) return;

    this.loadStartTime = Date.now();

    // Check if we should skip data fetching (recently visited)
    if (reset && this.navigation.shouldSkipDataFetch(`category_${this.categoryId}`) && this.hasCachedProjects()) {
      const cachedData = this.getCachedProjects();
      if (cachedData && cachedData.projects && cachedData.projects.length > 0) {
        this.projects = cachedData.projects;
        this.currentPage = cachedData.currentPage || 1;
        this.totalPages = cachedData.totalPages || 1;
        this.hasMorePages = cachedData.hasMorePages || false;
        this.isLoading = false;

        // Transform cached projects to optimized format
        this.optimizedProjects = this.transformProjects(this.projects);
        this.visibleProjects = [...this.optimizedProjects];

        // Safety check
        this.ensureProjectsVisible();

        // Observe images for lazy loading with multiple retries
        setTimeout(() => this.observeNewImages(), 100);
        setTimeout(() => this.observeNewImages(), 500);
        setTimeout(() => this.observeNewImages(), 1000);

        // Restore saved state after loading from cache
        setTimeout(() => {
          this.restoreState();
        }, 200);
        return;
      }
    }

    // Check if we have cached data first
    if (reset && this.hasCachedProjects()) {
      const cachedData = this.getCachedProjects();
      if (cachedData && cachedData.projects && cachedData.projects.length > 0) {
        this.projects = cachedData.projects;
        this.currentPage = cachedData.currentPage || 1;
        this.totalPages = cachedData.totalPages || 1;
        this.hasMorePages = cachedData.hasMorePages || false;
        this.isLoading = false;

        // Transform cached projects to optimized format
        this.optimizedProjects = this.transformProjects(this.projects);
        this.visibleProjects = [...this.optimizedProjects];

        // Safety check
        this.ensureProjectsVisible();

        // Observe images for lazy loading with multiple retries
        setTimeout(() => this.observeNewImages(), 100);
        setTimeout(() => this.observeNewImages(), 500);
        setTimeout(() => this.observeNewImages(), 1000);

        // Restore saved state after loading from cache
        setTimeout(() => {
          this.restoreState();
        }, 200);
        return;
      }
    }

    if (reset) {
      this.isLoading = true;
      this.currentPage = 1;
      this.projects = [];
      this.visibleProjects = [];
    } else {
      this.isLoadingMore = true;
    }

    this.error = null;

    // Add pagination parameters
    const params = {
      page: this.currentPage,
      per_page: this.perPage
    };

    this.apiService.getProjectsByCategory(this.categoryId, params)
      .pipe(
        takeUntil(this.destroy$),
        retryWhen(errors =>
          errors.pipe(
            delay(1000 * (this.retryCount + 1)),
            map(error => {
              this.retryCount++;

              // Record retry in performance monitor
              if (this.performanceSessionId) {
                this.performanceMonitor.recordRetry(this.performanceSessionId);
              }

              if (this.retryCount >= this.maxRetries) {
                throw error;
              }
              return error;
            })
          )
        ),
        catchError(error => {
          this.error = this.getErrorMessage(error);

          // Record error in performance monitor
          if (this.performanceSessionId) {
            this.performanceMonitor.recordError(this.performanceSessionId);
          }

          throw error;
        }),
        finalize(() => {
          this.isLoading = false;
          this.isLoadingMore = false;
          this.retryCount = 0;
        })
      )
      .subscribe({
        next: (data) => {
          const newProjects = data.projects || [];

          if (reset) {
            this.projects = newProjects;
          } else {
            this.projects = [...this.projects, ...newProjects];
          }

          // Transform projects to optimized format
          this.optimizedProjects = this.transformProjects(this.projects);

          // Preload images for better performance
          this.preloadImages(this.optimizedProjects);

          // Update pagination info
          if (data.pagination) {
            this.currentPage = data.pagination.current_page;
            this.totalPages = data.pagination.last_page;
            this.hasMorePages = data.pagination.has_more_pages;
          }

          // Cache the data for future use
          if (reset) {
            this.cacheCategoryProjects();
          }

          this.visibleProjects = [...this.optimizedProjects];

          // Safety check to ensure projects are visible
          this.ensureProjectsVisible();

          // Start preloading next page if available
          if (this.hasMorePages && !this.preloadedPages.has(this.currentPage + 1)) {
            setTimeout(() => this.preloadNextPage(), 1000);
          }

          // Restore saved state after loading from API
          setTimeout(() => {
            this.restoreState();
          }, 200);

          // Trigger change detection
          this.cdr.detectChanges();
        },
        error: (err) => {
          // Handle 404 as "no projects found" instead of an error
          if (err.status === 404 || (err.error && err.error.message === 'No projects found for this category')) {
            if (reset) {
              this.projects = [];
            }
            this.error = null;
            this.hasMorePages = false;
          } else {
            // Real error
            this.error = this.getErrorMessage(err);
          }
        }
      });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    } else if (error.status === 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    } else if (error.status === 403) {
      return 'Accès refusé. Veuillez vous reconnecter.';
    } else {
      return 'Erreur lors du chargement des projets. Veuillez réessayer.';
    }
  }

  private hasCachedProjects(): boolean {
    const cacheKey = this.getCacheKey();
    const hasCache = this.cache.has(cacheKey);

    // Record cache hit/miss
    if (this.performanceSessionId) {
      if (hasCache) {
        this.performanceMonitor.recordCacheHit(cacheKey);
      } else {
        this.performanceMonitor.recordCacheMiss(cacheKey);
      }
    }
    return hasCache;
  }

  private getCachedProjects(): any {
    const cachedData = this.cache.get(this.getCacheKey());
    return cachedData;
  }

  private cacheCategoryProjects(): void {
    const cacheData = {
      projects: this.projects,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      hasMorePages: this.hasMorePages,
      categoryId: this.categoryId,
      timestamp: Date.now()
    };

    // Cache for 10 minutes
    this.cache.set(this.getCacheKey(), cacheData, 10 * 60 * 1000);
  }

  loadMoreProjects(): void {
    if (this.hasMorePages && !this.isLoadingMore) {
      this.isLoadingMore = true;
      const nextPage = this.currentPage + 1;

      // Check if we have preloaded data for the next page
      const preloadCacheKey = `${this.CACHE_KEY_PREFIX}${this.categoryId}_page_${nextPage}`;
      const preloadedData = this.cache.get(preloadCacheKey) as any;

      if (preloadedData && preloadedData.projects && Array.isArray(preloadedData.projects)) {
        // Add a small delay to show the loading animation
        setTimeout(() => {
          // Add preloaded projects to the list
          this.projects = [...this.projects, ...preloadedData.projects];
          this.currentPage = nextPage;
          this.hasMorePages = preloadedData.projects.length === this.perPage;

          this.visibleProjects = [...this.projects];

          // Safety check
          this.ensureProjectsVisible();

          // Don't force scroll - let user maintain their position

          // Remove from preloaded pages set
          this.preloadedPages.delete(nextPage);

          // Start preloading the next page if available
          if (this.hasMorePages && !this.preloadedPages.has(this.currentPage + 1)) {
            setTimeout(() => this.preloadNextPage(), 500);
          }

          this.isLoadingMore = false;
        }, 300);
      } else {
        // Fallback to regular loading if no preloaded data
        this.currentPage++;
        this.loadProjects(false);
        this.isLoadingMore = false;
      }
    }
  }

  retryLoad(): void {
    this.cache.clear(this.getCacheKey());
    this.navigation.resetNavigationState();
    this.clearSavedState(); // Clear saved state when retrying
    this.loadProjects();
  }

  refreshData(): void {
    this.cache.clear(this.getCacheKey());
    this.navigation.resetNavigationState();
    this.clearSavedState(); // Clear saved state when refreshing
    this.loadProjects();
  }

  // Check cache status (for debugging)
  checkCacheStatus(): void {
    const hasCache = this.hasCachedProjects();
    const cachedData = this.getCachedProjects();
  }

  getImageUrl(imageData: string | null): string {
    // Images now come as base64 data directly from the API
    if (!imageData) {
      return 'assets/Image/user.png';
    }

    let processedUrl: string;

    // Check if it's already a complete data URL
    if (imageData.startsWith('data:image/')) {
      processedUrl = imageData;
    }
    // If it's just base64 without data URL prefix, add it
    else if (imageData.startsWith('/9j/') || imageData.startsWith('iVBORw0KGgo') || imageData.startsWith('UklGR')) {
      // Common base64 prefixes for JPEG, PNG, WebP
      processedUrl = `data:image/jpeg;base64,${imageData}`;
    }
    // Return as is if it's already properly formatted
    else {
      processedUrl = imageData;
    }

    return processedUrl;
  }

  onImageLoad(event: Event): void {
    const target = event.target as HTMLImageElement;

    // Add the loaded class to make the image visible
    target.classList.add('loaded');

    // Ensure the image is visible
    target.style.opacity = '1';
    target.style.visibility = 'visible';
    target.style.display = 'block';

    // Record image load time for performance monitoring
    const dataSrc = target.getAttribute('data-src') || target.src;
    if (dataSrc) {
      const loadTime = Date.now() - this.loadStartTime;
      this.imageLoadTimes.set(dataSrc, loadTime);

      // Record in performance monitor
      if (this.performanceSessionId) {
        this.performanceMonitor.recordImageLoad(this.performanceSessionId, dataSrc, loadTime);
      }
    }

    // Ensure projects remain visible after image loads
    this.ensureProjectsVisible();
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png';

    // Ensure fallback image is visible
    target.style.opacity = '1';
    target.style.visibility = 'visible';
    target.style.display = 'block';
  }

  getFirstImage(project: any): string | null {
    // Check for cover_image first
    if (project.cover_image) {
      return project.cover_image;
    }

    // Check for images array
    if (project.images && Array.isArray(project.images) && project.images.length > 0) {
      const firstImage = project.images[0];
      if (firstImage.image_url) {
        return firstImage.image_url;
      } else if (typeof firstImage === 'string') {
        return firstImage;
      }
    }

    // Check for image field
    if (project.image) {
      return project.image;
    }

    return null;
  }

  // Navigate to project with forced scroll (improves UX when returning)
  navigateToProject(projectId: number, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Save current state before navigation
    this.saveCurrentState();

    // Store component state globally to prevent loss
    this.storeComponentState();

    // Navigate to project details (no forced scrolling)
    this.router.navigate(['/project-details', projectId]).then((success) => {
      console.log('Category navigation success:', success);
      console.log('URL after navigation:', this.router.url);

      // Force URL update if there's a mismatch
      const expectedUrl = `/project-details/${projectId}`;
      if (success && !window.location.href.includes(expectedUrl)) {
        console.log('Forcing category URL update...');
        window.history.replaceState(null, '', expectedUrl);
      }
    }).catch((error) => {
      console.error('Category navigation failed:', error);
    });
  }

  // Handle optimized project card clicks
  onCardClick(projectId: number): void {
    this.navigateToProject(projectId);
  }

  // Store component state globally to prevent loss during navigation
  private storeComponentState(): void {
    if (!this.categoryId) return;

    const globalState = {
      categoryId: this.categoryId,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      hasMorePages: this.hasMorePages,
      projects: this.projects,
      visibleProjects: this.visibleProjects,
      timestamp: Date.now()
    };

    // Store in window object to persist across navigation
    (window as any).__categoryProjectsState__ = globalState;
  }

  // Restore component state from global storage
  private restoreGlobalState(): void {
    if (!this.categoryId) return;

    const globalState = (window as any).__categoryProjectsState__;
    if (!globalState) return;

    // Check if this is the same category and state is not too old (1 hour)
    if (globalState.categoryId === this.categoryId &&
      (Date.now() - globalState.timestamp) < 60 * 60 * 1000) {

      // Restore all the state
      this.currentPage = globalState.currentPage;
      this.totalPages = globalState.totalPages;
      this.hasMorePages = globalState.hasMorePages;
      this.projects = globalState.projects || [];
      this.visibleProjects = globalState.visibleProjects || [];

      // Trigger change detection
      this.cdr.detectChanges();
    }
  }

  // Save current state to localStorage
  private saveCurrentState(): void {
    if (!this.categoryId) return;

    const state = {
      categoryId: this.categoryId,
      currentPage: this.currentPage,
      projectsCount: this.projects.length,
      timestamp: Date.now()
    };

    localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
  }

  // Restore state from localStorage
  private restoreState(): void {
    if (!this.categoryId) return;

    try {
      const savedState = localStorage.getItem(this.STATE_KEY);
      if (!savedState) return;

      const state = JSON.parse(savedState);

      // Check if this is the same category and state is not too old (1 hour)
      if (state.categoryId === this.categoryId &&
        (Date.now() - state.timestamp) < 60 * 60 * 1000) {

        // If we need to load more pages to reach the saved state
        if (state.currentPage > this.currentPage && this.hasMorePages) {
          this.loadToTargetPage(state.currentPage);
        }
      }
    } catch (error) {
      console.error('❌ ERROR RESTORING STATE:', error);
      localStorage.removeItem(this.STATE_KEY);
    }
  }

  // Load pages up to target page
  private loadToTargetPage(targetPage: number): void {
    if (targetPage <= this.currentPage) {
      return;
    }

    // Load one page at a time until we reach the target
    const loadNext = () => {
      if (this.currentPage >= targetPage || !this.hasMorePages) {
        return;
      }

      this.loadMoreProjects();

      // Wait for the page to load, then continue
      setTimeout(() => {
        loadNext();
      }, 300);
    };

    loadNext();
  }

  // Handle keyboard navigation for project cards
  onProjectKeyDown(event: KeyboardEvent, projectId: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.navigateToProject(projectId, event);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusNextProject(event.target as HTMLElement);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusPreviousProject(event.target as HTMLElement);
    }
  }

  private focusNextProject(currentElement: HTMLElement): void {
    const projectCards = Array.from(this.elementRef.nativeElement.querySelectorAll('.project-item'));
    const currentIndex = projectCards.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % projectCards.length;
    (projectCards[nextIndex] as HTMLElement).focus();
  }

  private focusPreviousProject(currentElement: HTMLElement): void {
    const projectCards = Array.from(this.elementRef.nativeElement.querySelectorAll('.project-item'));
    const currentIndex = projectCards.indexOf(currentElement);
    const previousIndex = currentIndex === 0 ? projectCards.length - 1 : currentIndex - 1;
    (projectCards[previousIndex] as HTMLElement).focus();
  }

  // Safety method to ensure visibleProjects is always in sync
  private ensureProjectsVisible(): void {
    if (this.projects.length > 0 && this.visibleProjects.length === 0) {
      this.visibleProjects = [...this.projects];
    }
  }

  // Start periodic safety check to prevent white page issues
  private startPeriodicSafetyCheck(): void {
    const safetyCheckInterval = setInterval(() => {
      if (this.projects.length > 0 && this.visibleProjects.length === 0) {
        this.visibleProjects = [...this.projects];
      }
    }, 2000);

    // Store the interval ID to clear it on destroy
    this.destroy$.subscribe(() => {
      clearInterval(safetyCheckInterval);
    });
  }

  // Handle window focus events (tab switching)
  private handleWindowFocus(): void {
    // When user switches back to the tab, ensure projects are visible
    setTimeout(() => {
      if (this.projects.length > 0 && this.visibleProjects.length === 0) {
        this.visibleProjects = [...this.projects];
      }
    }, 100);
  }

  private setupVirtualScrolling(): void {
    if (this.projectsContainer) {
      // Use a timeout to ensure the DOM is fully rendered
      setTimeout(() => {
        this.containerHeight = this.projectsContainer.nativeElement.clientHeight;
        // Only update visible projects if there's a real problem
        if (this.projects.length > 0 && this.visibleProjects.length === 0) {
          this.updateVisibleProjects();
        }
      }, 100);
    }
  }

  private setupImageLazyLoading(): void {
    // Simplified image loading - just ensure images are visible
    // Create Mutation Observer to watch for new images added to DOM
    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldObserve = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'IMG') {
                shouldObserve = true;
              } else if (element.querySelector && element.querySelector('img')) {
                shouldObserve = true;
              }
            }
          });
        }
      });

      if (shouldObserve) {
        setTimeout(() => this.observeNewImages(), 100);
      }
    });
  }

  private setupScrollListener(): void {
    // Listen to scroll events for virtual scrolling and preloading
    fromEvent(window, 'scroll')
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.handleScroll();
      });

    // Listen to window focus events to handle tab switching
    fromEvent(window, 'focus')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.handleWindowFocus();
      });
  }

  private handleScroll(): void {
    // Only update visible projects if we have projects loaded
    if (this.projects.length > 0) {
      this.updateVisibleProjects();
      // Additional safety check during scroll
      this.ensureProjectsVisible();
    }
    this.checkPreloadTrigger();
  }

  private updateVisibleProjects(): void {
    if (!this.projectsContainer) return;

    // Always show all projects for now to prevent white page issues
    if (this.projects.length > 0) {
      this.visibleProjects = [...this.projects];
    }
  }

  private checkPreloadTrigger(): void {
    // Preload next page when user is near the end
    if (this.hasMorePages && !this.isPreloading && !this.preloadedPages.has(this.currentPage + 1)) {
      const scrollPosition = window.pageYOffset + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (documentHeight - scrollPosition < 1000) {
        this.preloadNextPage();
      }
    }
    // Ensure projects remain visible during preload checks
    this.ensureProjectsVisible();
  }

  private preloadNextPage(): void {
    if (this.isPreloading || this.preloadedPages.has(this.currentPage + 1)) return;

    this.isPreloading = true;
    const nextPage = this.currentPage + 1;

    const params = {
      page: nextPage,
      per_page: this.perPage
    };

    this.apiService.getProjectsByCategory(this.categoryId!, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const newProjects = data.projects || [];
          if (newProjects.length > 0) {
            // Store preloaded data in cache
            const preloadCacheKey = `${this.CACHE_KEY_PREFIX}${this.categoryId}_page_${nextPage}`;
            this.cache.set(preloadCacheKey, {
              projects: newProjects,
              page: nextPage,
              timestamp: Date.now()
            }, 5 * 60 * 1000);

            this.preloadedPages.add(nextPage);
            // Ensure current projects remain visible during preloading
            this.ensureProjectsVisible();
          }
        },
        error: (err) => {
          console.warn('Failed to preload page', nextPage, ':', err);
        },
        complete: () => {
          this.isPreloading = false;
        }
      });
  }

  private loadImage(img: HTMLImageElement): void {
    // This method is no longer needed with simplified image loading
    // Images are loaded directly in the HTML template
  }

  private observeNewImages(): void {
    // Get all images and ensure they are visible
    const images = this.elementRef.nativeElement.querySelectorAll('img');

    images.forEach((img: HTMLImageElement) => {
      // Ensure all images are visible
      img.style.opacity = '1';
      img.style.visibility = 'visible';
      img.style.display = 'block';

      // Add loaded class if not already present
      if (!img.classList.contains('loaded')) {
        img.classList.add('loaded');
      }
    });
  }

  // Get responsive perPage value based on screen size
  private getResponsivePerPage(): number {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) { // Small screens (mobile)
        return 5;
      } else if (width < 1024) { // Medium screens (tablet)
        return 8;
      } else { // Large screens (desktop)
        return 12;
      }
    }
    return 12; // Default fallback
  }

  // Update perPage when window resizes
  private updatePerPageOnResize(): void {
    if (typeof window !== 'undefined') {
      const resizeHandler = () => {
        const newPerPage = this.getResponsivePerPage();
        if (newPerPage !== this.perPage) {
          this.perPage = newPerPage;
          // Reload projects with new perPage if we have a category loaded
          if (this.categoryId && this.projects.length > 0) {
            this.resetState();
            this.loadProjects();
          }
        }
      };

      window.addEventListener('resize', resizeHandler);

      // Store the handler for cleanup
      this.destroy$.subscribe(() => {
        window.removeEventListener('resize', resizeHandler);
      });
    }
  }
}
