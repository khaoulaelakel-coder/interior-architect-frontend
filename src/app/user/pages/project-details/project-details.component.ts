import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css'
})
export class ProjectDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  project: any = null;
  currentImageIndex: number = 0;
  loading: boolean = true;
  error: string | null = null;

  // Modal functionality
  isModalOpen: boolean = false;
  modalImageIndex: number = 0;

  // Performance optimizations
  private imagePreloadQueue: string[] = [];
  private preloadTimeout: any;
  private scrollTimeout: any;

  // Accessibility
  private focusableElements: HTMLElement[] = [];

  // Event listener references for proper cleanup
  private keyDownHandler: (event: KeyboardEvent) => void;
  private keyboardNavHandler: (event: KeyboardEvent) => void;

  constructor(
    public route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    // Bind event handlers to preserve context
    this.keyDownHandler = this.handleKeyDown.bind(this);
    this.keyboardNavHandler = this.handleKeyboardNavigation.bind(this);
  }

  @HostListener('window:resize')
  onResize() {
    // Debounce resize events for performance
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.forceScrollToTop();
    }, 100);
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    // Clean up any pending operations
    this.cleanup();
  }

  ngOnInit(): void {
    console.log('ProjectDetailsComponent ngOnInit called');

    // Add escape key listener for modal
    document.addEventListener('keydown', this.keyDownHandler);

    // Add keyboard navigation for accessibility
    document.addEventListener('keydown', this.keyboardNavHandler);

    // Subscribe to route parameter changes - THIS IS THE KEY FIX
    this.route.paramMap.subscribe(params => {
      const projectId = params.get('id');
      console.log('Route parameter changed - Project ID:', projectId);
      console.log('Current URL:', this.router.url);
      console.log('Route snapshot:', this.route.snapshot);

      // AGGRESSIVE MOBILE SCROLL FIX
      this.forceScrollToTop();

      // Close modal if it's open when navigating to a new project
      if (this.isModalOpen) {
        console.log('Closing modal due to route change');
        this.closeModal();
      }

      // Reset component state for new project
      this.resetComponentForNewProject();

      if (projectId) {
        // Force URL sync to ensure browser URL matches the route
        this.forceUrlSync(projectId);
        this.loadProject(projectId);
      } else {
        this.error = 'ID du projet non valide';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private resetComponentForNewProject(): void {
    console.log('Resetting component for new project...');

    // Reset all component properties
    this.project = null;
    this.currentImageIndex = 0;
    this.loading = true;
    this.error = null;
    this.modalImageIndex = 0;
    this.isModalOpen = false;

    // Clear any pending operations
    if (this.preloadTimeout) {
      clearTimeout(this.preloadTimeout);
      this.preloadTimeout = null;
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }

    // Clear image preload queue
    this.imagePreloadQueue = [];

    // Ensure body styles are reset
    this.restoreBodyOverflow();

    // Force change detection
    this.cdr.detectChanges();

    console.log('Component reset complete');
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    console.log('Cleaning up ProjectDetailsComponent...');

    // Ensure modal is closed and body overflow is restored
    if (this.isModalOpen) {
      this.isModalOpen = false;
      document.body.style.overflow = 'auto';
      document.body.style.overflowX = 'auto';
      document.body.style.overflowY = 'auto';
    }

    // Remove event listeners
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keydown', this.keyboardNavHandler);

    // Clear timeouts
    if (this.preloadTimeout) {
      clearTimeout(this.preloadTimeout);
      this.preloadTimeout = null;
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }

    // Force body overflow restoration
    this.restoreBodyOverflow();
  }

  private restoreBodyOverflow(): void {
    try {
      document.body.style.overflow = 'auto';
      document.body.style.overflowX = 'auto';
      document.body.style.overflowY = 'auto';
      document.documentElement.style.overflow = 'auto';
      console.log('Body overflow restored');
    } catch (error) {
      console.error('Error restoring body overflow:', error);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isModalOpen) {
      console.log('Escape key pressed, closing modal...');
      this.closeModal();
    }
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    if (this.isModalOpen) {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.previousModalImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.nextModalImage();
          break;
        case 'Home':
          event.preventDefault();
          this.goToModalImage(0);
          break;
        case 'End':
          event.preventDefault();
          if (this.project?.images) {
            this.goToModalImage(this.project.images.length - 1);
          }
          break;
      }
    } else if (this.project?.images && this.project.images.length > 1) {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.previousImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.nextImage();
          break;
      }
    }
  }

  private forceScrollToTop(): void {
    // Multiple scroll methods for maximum compatibility
    try {
      // Method 1: Window scroll
      window.scrollTo(0, 0);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // Method 2: Document element scroll
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;

      // Method 3: Body scroll
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;

      // Method 4: Force viewport positioning
      if (window.pageYOffset !== 0) {
        window.pageYOffset = 0;
      }

      console.log('Forced scroll to top - all methods applied');
    } catch (error) {
      console.error('Error forcing scroll to top:', error);
    }
  }

  ngAfterViewInit(): void {
    // SUPER AGGRESSIVE SCROLL FIX FOR MOBILE
    setTimeout(() => {
      this.forceScrollToTop();
      console.log('AfterViewInit: Applied aggressive scroll fix');
    }, 0);

    setTimeout(() => {
      this.forceScrollToTop();
      console.log('AfterViewInit: Applied second aggressive scroll fix');
    }, 100);

    setTimeout(() => {
      this.forceScrollToTop();
      console.log('AfterViewInit: Applied third aggressive scroll fix');
    }, 300);

    // Initialize accessibility focus management
    this.initializeAccessibility();
  }

  private initializeAccessibility(): void {
    // Find all focusable elements for keyboard navigation
    this.focusableElements = Array.from(
      document.querySelectorAll('button, [tabindex]:not([tabindex="-1"]), a[href], input, select, textarea')
    ) as HTMLElement[];

    // Add ARIA labels for better screen reader support
    this.addAriaLabels();
  }

  private addAriaLabels(): void {
    // Add ARIA labels to navigation elements
    const prevButton = document.querySelector('[data-nav="prev"]');
    const nextButton = document.querySelector('[data-nav="next"]');

    if (prevButton) {
      prevButton.setAttribute('aria-label', 'Image précédente');
    }
    if (nextButton) {
      nextButton.setAttribute('aria-label', 'Image suivante');
    }
  }

  loadProject(projectId: string): void {
    console.log(`Loading project with ID: ${projectId}`);
    this.loading = true;
    this.error = null;

    // Ensure we have a valid project ID
    const numericProjectId = parseInt(projectId);
    if (isNaN(numericProjectId)) {
      console.error('Invalid project ID:', projectId);
      this.error = 'ID du projet non valide';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.apiService.getProjectById(numericProjectId).subscribe({
      next: (data) => {
        console.log('API response received:', data);

        if (data && data.project) {
          this.project = data.project;
          this.loading = false;
          console.log('Project loaded successfully:', this.project.name, this.project.id);

          // Start preloading images for better performance
          this.preloadImages();

          // FINAL AGGRESSIVE SCROLL AFTER DATA LOADS
          setTimeout(() => {
            this.forceScrollToTop();
            console.log('Data loaded: Applied final aggressive scroll fix');
          }, 100);

          setTimeout(() => {
            this.forceScrollToTop();
            console.log('Data loaded: Applied delayed aggressive scroll fix');
          }, 500);

          // Trigger change detection
          this.cdr.detectChanges();
        } else {
          console.error('Invalid API response structure:', data);
          this.loading = false;
          this.error = 'Données du projet invalides';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading project ID', projectId, ':', error);
        this.loading = false;
        this.error = this.getErrorMessage(error);
        this.cdr.detectChanges();
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'Projet introuvable';
    } else if (error.status === 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    } else if (error.status === 0) {
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    } else {
      return 'Une erreur est survenue lors du chargement du projet.';
    }
  }

  private preloadImages(): void {
    if (!this.project?.images) return;

    // Clear existing preload queue
    this.imagePreloadQueue = [];

    // Add all images to preload queue
    this.project.images.forEach((image: any) => {
      if (image.image_url) {
        this.imagePreloadQueue.push(image.image_url);
      }
    });

    // Start preloading with delay to avoid blocking initial render
    this.preloadTimeout = setTimeout(() => {
      this.preloadNextImage();
    }, 1000);
  }

  private preloadNextImage(): void {
    if (this.imagePreloadQueue.length === 0) return;

    const imageUrl = this.imagePreloadQueue.shift();
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        console.log('Image preloaded:', imageUrl);
        // Continue with next image
        if (this.imagePreloadQueue.length > 0) {
          setTimeout(() => this.preloadNextImage(), 200);
        }
      };
      img.onerror = () => {
        console.warn('Failed to preload image:', imageUrl);
        // Continue with next image even if this one fails
        if (this.imagePreloadQueue.length > 0) {
          setTimeout(() => this.preloadNextImage(), 200);
        }
      };
      img.src = this.getImageUrl(imageUrl);
    }
  }

  getImageUrl(imageData: string): string {
    // Images now come as base64 data directly from the API
    return imageData || 'assets/Image/user.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/Image/user.png'; // Use existing image as fallback
  }

  nextImage(): void {
    if (this.project && this.project.images && this.project.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.project.images.length;
      this.cdr.detectChanges();
    }
  }

  previousImage(): void {
    if (this.project && this.project.images && this.project.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0
        ? this.project.images.length - 1
        : this.currentImageIndex - 1;
      this.cdr.detectChanges();
    }
  }

  goToImage(index: number): void {
    if (this.project?.images && index >= 0 && index < this.project.images.length) {
      this.currentImageIndex = index;
      this.cdr.detectChanges();
    }
  }

  // Modal functionality
  openModal(imageIndex: number): void {
    console.log('Opening modal with image index:', imageIndex);

    this.modalImageIndex = imageIndex;
    this.isModalOpen = true;

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'hidden';

    // Debug logging
    console.log('Opening modal with image index:', imageIndex);
    console.log('Project images:', this.project?.images);
    console.log('Selected image:', this.project?.images[imageIndex]);
    console.log('Image URL:', this.getImageUrl(this.project?.images[imageIndex]?.image_url));

    // Focus management for accessibility
    this.trapFocus();
  }

  closeModal(): void {
    console.log('Closing modal...');

    // Ensure modal state is properly reset
    this.isModalOpen = false;
    this.modalImageIndex = 0;

    // Restore scrolling
    this.restoreBodyOverflow();

    // Release focus trap
    this.releaseFocus();

    // Force a small delay to ensure DOM updates
    setTimeout(() => {
      // Double-check that modal is closed
      if (this.isModalOpen) {
        this.isModalOpen = false;
        this.restoreBodyOverflow();
      }

      // Ensure we're back on the project detail page
      console.log('Modal closed, current state:', {
        isModalOpen: this.isModalOpen,
        modalImageIndex: this.modalImageIndex,
        bodyOverflow: document.body.style.overflow
      });
    }, 100);
  }

  private trapFocus(): void {
    // Store current focus for restoration
    this.focusableElements = Array.from(
      document.querySelectorAll('.modal button, .modal [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];

    // Focus first focusable element in modal
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  }

  private releaseFocus(): void {
    // Restore focus to previous element or body
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  }

  nextModalImage(): void {
    if (this.project && this.project.images) {
      this.modalImageIndex = this.modalImageIndex === this.project.images.length - 1
        ? 0
        : this.modalImageIndex + 1;
      this.cdr.detectChanges();
    }
  }

  previousModalImage(): void {
    if (this.project && this.project.images) {
      this.modalImageIndex = this.modalImageIndex === 0
        ? this.project.images.length - 1
        : this.modalImageIndex - 1;
      this.cdr.detectChanges();
    }
  }

  goToModalImage(index: number): void {
    if (this.project?.images && index >= 0 && index < this.project.images.length) {
      this.modalImageIndex = index;
      this.cdr.detectChanges();
    }
  }

  onModalBackdropClick(event: Event): void {
    console.log('Backdrop clicked, closing modal...');
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onImageLoad(event: Event): void {
    console.log('Image loaded successfully in modal');
  }

  // Utility methods
  getProjectId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  getImageCount(): number {
    return this.project?.images?.length || 0;
  }

  hasMultipleImages(): boolean {
    return this.getImageCount() > 1;
  }

  getCurrentImageInfo(): { index: number; total: number } {
    return {
      index: this.currentImageIndex + 1,
      total: this.getImageCount()
    };
  }

  // Debug method to help troubleshoot routing issues
  debugRouteState(): void {
    const currentProjectId = this.route.snapshot.paramMap.get('id');
    console.log('=== ROUTE DEBUG INFO ===');
    console.log('Current route project ID:', currentProjectId);
    console.log('Loaded project ID:', this.project?.id);
    console.log('Component loading state:', this.loading);
    console.log('Component error state:', this.error);
    console.log('Route URL:', this.router.url);
    console.log('Browser URL:', window.location.href);
    console.log('========================');
  }

  // Method to force URL sync if needed
  forceUrlSync(projectId: string): void {
    const expectedUrl = `/project-details/${projectId}`;
    const currentUrl = this.router.url;

    if (currentUrl !== expectedUrl) {
      console.log('URL mismatch detected, forcing sync...');
      console.log('Expected:', expectedUrl);
      console.log('Current:', currentUrl);

      // Force URL update using location service
      window.history.replaceState(null, '', expectedUrl);
    }
  }
}
