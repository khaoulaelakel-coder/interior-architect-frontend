import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressiveImageLoaderService, ProgressiveImageState } from '../../../services/progressive-image-loader.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-progressive-image',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="progressive-image-container" [class]="containerClass">
      <!-- Loading skeleton while thumbnail loads -->
      @if (!imageState.thumbnail && !imageState.error) {
      <div class="skeleton-loader">
        <div class="skeleton-shimmer"></div>
      </div>
      }
      
      <!-- Image with progressive loading -->
      @if (imageState.thumbnail && !imageState.error) {
      <img 
        #imageElement
        [src]="getCurrentImageUrl()"
        [alt]="alt"
        [class]="imageClass"
        (load)="onImageLoad()"
        (error)="onImageError()"
        (mouseenter)="onMouseEnter()"
        (click)="onImageClick()"
        loading="lazy">
      
      <!-- Loading overlay for medium/full image -->
      @if (imageState.loadingMedium || imageState.loadingFull) {
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
      }
      }
      
      <!-- Error state -->
      @if (imageState.error) {
      <div class="error-placeholder">
        <div class="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <span class="error-text">Image non disponible</span>
      </div>
      }
    </div>
  `,
    styles: [`
    .progressive-image-container {
      position: relative;
      overflow: hidden;
      background-color: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .skeleton-loader {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #f0f0f0 25%, transparent 37%, #f0f0f0 63%);
      background-size: 400% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    
    .skeleton-shimmer {
      width: 100%;
      height: 100%;
    }
    
    @keyframes shimmer {
      0% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .progressive-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .progressive-image-container img.loading {
      opacity: 0.7;
    }
    
    .loading-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      padding: 8px;
      backdrop-filter: blur(2px);
    }
    
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e5e7eb;
      border-top: 2px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #9ca3af;
      background-color: #f9fafb;
    }
    
    .error-icon {
      margin-bottom: 8px;
    }
    
    .error-text {
      font-size: 12px;
      text-align: center;
    }
    
    /* Hover effects */
    .progressive-image-container:hover img {
      transform: scale(1.05);
    }
    
    /* Different loading states */
    .image-quality-thumbnail {
      filter: blur(0.5px);
    }
    
    .image-quality-medium {
      filter: none;
    }
    
    .image-quality-full {
      filter: none;
    }
  `]
})
export class ProgressiveImageComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() itemId!: string | number;
    @Input() itemType: 'project' | 'skill' | 'category' = 'project';
    @Input() thumbnailUrl?: string;
    @Input() alt: string = '';
    @Input() containerClass: string = '';
    @Input() imageClass: string = '';
    @Input() loadMediumOnHover: boolean = true;
    @Input() loadFullOnClick: boolean = true;
    @Input() autoLoadMedium: boolean = false; // Load medium image when in viewport

    @ViewChild('imageElement') imageElement?: ElementRef<HTMLImageElement>;

    imageState: ProgressiveImageState = {
        id: '',
        loadingMedium: false,
        loadingFull: false,
        error: false
    };

    private destroy$ = new Subject<void>();
    private imageQuality: 'thumbnail' | 'medium' | 'full' = 'thumbnail';

    constructor(
        private progressiveLoader: ProgressiveImageLoaderService
    ) { }

    ngOnInit(): void {
        // Get initial image state
        this.progressiveLoader.getImageState(this.itemId.toString(), this.thumbnailUrl)
            .pipe(takeUntil(this.destroy$))
            .subscribe(state => {
                this.imageState = state;
                this.updateImageQuality();
            });
    }

    ngAfterViewInit(): void {
        // Set up automatic medium loading if enabled
        if (this.autoLoadMedium && this.imageElement) {
            this.progressiveLoader.observeForMediumLoading(
                this.imageElement.nativeElement,
                this.itemId.toString(),
                this.itemType
            );
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        // Clean up intersection observer
        if (this.imageElement) {
            this.progressiveLoader.unobserve(this.imageElement.nativeElement);
        }
    }

    getCurrentImageUrl(): string {
        if (this.imageState.full) {
            return this.imageState.full;
        }
        if (this.imageState.medium) {
            return this.imageState.medium;
        }
        return this.imageState.thumbnail || '';
    }

    onMouseEnter(): void {
        if (this.loadMediumOnHover && !this.imageState.medium && !this.imageState.loadingMedium) {
            this.progressiveLoader.loadMediumImage(this.itemId.toString(), this.itemType);
        }
    }

    onImageClick(): void {
        if (this.loadFullOnClick && !this.imageState.full && !this.imageState.loadingFull) {
            this.progressiveLoader.loadFullImage(this.itemId.toString(), this.itemType);
        }
    }

    onImageLoad(): void {
        // Image loaded successfully
    }

    onImageError(): void {
        console.warn(`Failed to load image for ${this.itemType} ${this.itemId}`);
    }

    private updateImageQuality(): void {
        if (this.imageState.full) {
            this.imageQuality = 'full';
        } else if (this.imageState.medium) {
            this.imageQuality = 'medium';
        } else {
            this.imageQuality = 'thumbnail';
        }

        // Update image class based on quality
        if (this.imageElement) {
            const img = this.imageElement.nativeElement;
            img.className = `${this.imageClass} image-quality-${this.imageQuality}`;
        }
    }
}
