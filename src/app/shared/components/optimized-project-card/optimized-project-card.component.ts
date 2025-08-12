import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ImageOptimizationService } from '../../../services/image-optimization.service';
import { LazyLoadImageDirective } from '../../directives/lazy-load-image.directive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface ProjectCardData {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  cover_image?: string;
  category?: {
    id: number;
    name: string;
    cover?: string;
  };
  created_at: string;
}

@Component({
  selector: 'app-optimized-project-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LazyLoadImageDirective],
  template: `
    <div class="project-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
         (click)="onCardClick()">
      
      <!-- Image Container with Lazy Loading -->
      <div class="image-container relative h-48 bg-gray-100 overflow-hidden">
        <img 
          [appLazyLoadImage]="getOptimizedImageUrl()"
          [placeholder]="imageService.getLoadingPlaceholder()"
          [errorPlaceholder]="imageService.getErrorPlaceholder()"
          alt="{{ project.name }}"
          class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy">
        
        <!-- Category Badge -->
        @if (project.category) {
        <div class="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          {{ project.category.name }}
        </div>
        }
        
        <!-- Loading Overlay -->
        @if (isImageLoading) {
        <div class="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        }
      </div>

      <!-- Content -->
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {{ project.name }}
        </h3>
        
        <p class="text-gray-600 text-sm line-clamp-3 mb-3">
          {{ project.description }}
        </p>
        
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-500">
            {{ formatDate(project.created_at) }}
          </span>
          
          <button class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
            Voir plus →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .project-card {
      min-height: 320px;
    }
    
    .image-container {
      position: relative;
    }
    
    .image-container img {
      transition: opacity 0.3s ease;
    }
    
    .image-container img[src*="loading"] {
      opacity: 0.5;
    }
    
    .image-container img[src*="error"] {
      opacity: 0.7;
    }
  `]
})
export class OptimizedProjectCardComponent implements OnInit, OnDestroy {
  @Input() project!: ProjectCardData;
  @Input() showCategory: boolean = true;
  @Input() imageSize: 'thumbnail' | 'medium' | 'full' = 'thumbnail';
  @Output() cardClick = new EventEmitter<number>();

  isImageLoading: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(
    public imageService: ImageOptimizationService
  ) { }

  ngOnInit(): void {
    this.preloadImage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCardClick(): void {
    this.cardClick.emit(this.project.id);
  }

  getOptimizedImageUrl(): string {
    if (!this.project) return '';

    const imageUrl = this.project.cover_image || this.project.image_url;
    if (!imageUrl) return this.imageService.getErrorPlaceholder();

    switch (this.imageSize) {
      case 'thumbnail':
        return this.imageService.getThumbnailUrl(imageUrl);
      case 'medium':
        return this.imageService.getMediumImageUrl(imageUrl);
      case 'full':
        return this.imageService.getFullImageUrl(imageUrl);
      default:
        return this.imageService.getThumbnailUrl(imageUrl);
    }
  }

  private preloadImage(): void {
    const imageUrl = this.getOptimizedImageUrl();
    if (!imageUrl) return;

    this.isImageLoading = true;

    this.imageService.preloadImage(imageUrl)
      .then(() => {
        this.isImageLoading = false;
      })
      .catch(() => {
        this.isImageLoading = false;
      });
  }

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
}
