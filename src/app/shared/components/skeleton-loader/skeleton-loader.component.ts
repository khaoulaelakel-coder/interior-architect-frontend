import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-grid">
      <div class="skeleton-card" *ngFor="let item of [].constructor(count)">
        <!-- Image Container Skeleton -->
        <div class="skeleton-image-container">
          <!-- Category Badge Skeleton -->
          <div class="skeleton-badge"></div>
        </div>
        
        <!-- Content Skeleton -->
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-description"></div>
          <div class="skeleton-description short"></div>
          
          <div class="skeleton-footer">
            <div class="skeleton-date"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      max-width: 100%;
      margin: 0 auto;
    }

    .skeleton-card {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      cursor: pointer;
      min-height: 320px;
      transition: box-shadow 0.3s ease;
    }

    .skeleton-card:hover {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .skeleton-image-container {
      position: relative;
      height: 12rem;
      background: #f3f4f6;
      overflow: hidden;
    }

    .skeleton-badge {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      width: 60px;
      height: 24px;
      border-radius: 9999px;
      background: #f3f4f6;
      position: relative;
      overflow: hidden;
    }

    .skeleton-badge::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
      transform: translate3d(-100%, 0, 0);
      animation: skeleton-shimmer 1.5s ease-out infinite;
      will-change: transform;
      backface-visibility: hidden;
      perspective: 1000px;
    }

    .skeleton-content {
      padding: 1rem;
    }

    .skeleton-title {
      width: 80%;
      height: 20px;
      border-radius: 0.25rem;
      margin-bottom: 0.5rem;
      background: #f3f4f6;
      position: relative;
      overflow: hidden;
    }

    .skeleton-description {
      width: 100%;
      height: 16px;
      border-radius: 0.25rem;
      margin-bottom: 0.5rem;
      background: #f3f4f6;
      position: relative;
      overflow: hidden;
    }

    .skeleton-description.short {
      width: 70%;
    }

    .skeleton-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
    }

    .skeleton-date {
      width: 80px;
      height: 14px;
      border-radius: 0.25rem;
      background: #f3f4f6;
      position: relative;
      overflow: hidden;
    }

    .skeleton-button {
      width: 100px;
      height: 16px;
      border-radius: 0.25rem;
      background: #f3f4f6;
      position: relative;
      overflow: hidden;
    }

    /* Shimmer effect for all skeleton elements */
    .skeleton-title::before,
    .skeleton-description::before,
    .skeleton-date::before,
    .skeleton-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
      transform: translate3d(-100%, 0, 0);
      animation: skeleton-shimmer 1.5s ease-out infinite;
      will-change: transform;
      backface-visibility: hidden;
      perspective: 1000px;
    }

    @keyframes skeleton-shimmer {
      0% {
        transform: translate3d(-100%, 0, 0);
      }
      100% {
        transform: translate3d(100%, 0, 0);
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .skeleton-badge::before,
      .skeleton-title::before,
      .skeleton-description::before,
      .skeleton-date::before,
      .skeleton-button::before {
        animation: none;
      }
    }

    /* Responsive design */
    @media (max-width: 640px) {
      .skeleton-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .skeleton-content {
        padding: 0.75rem;
      }
      
      .skeleton-image-container {
        height: 10rem;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() count: number = 6;
}
