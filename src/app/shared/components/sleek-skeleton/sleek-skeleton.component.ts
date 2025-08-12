import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sleek-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [class.dark]="dark">
      <!-- Card Skeleton -->
      <div class="skeleton-card" *ngIf="type === 'card'">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
        </div>
      </div>

      <!-- List Item Skeleton -->
      <div class="skeleton-list-item" *ngIf="type === 'list-item'">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>

      <!-- Profile Skeleton -->
      <div class="skeleton-profile" *ngIf="type === 'profile'">
        <div class="skeleton-header">
          <div class="skeleton-avatar large"></div>
          <div class="skeleton-info">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
          </div>
        </div>
        <div class="skeleton-bio">
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
        </div>
      </div>

      <!-- Grid Skeleton -->
      <div class="skeleton-grid" *ngIf="type === 'grid'">
        <div class="skeleton-grid-item" *ngFor="let item of [1,2,3,4,5,6]">
          <div class="skeleton-image"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>

      <!-- Table Skeleton -->
      <div class="skeleton-table" *ngIf="type === 'table'">
        <div class="skeleton-table-header">
          <div class="skeleton-cell" *ngFor="let header of [1,2,3,4]"></div>
        </div>
        <div class="skeleton-table-row" *ngFor="let row of [1,2,3,4,5]">
          <div class="skeleton-cell" *ngFor="let cell of [1,2,3,4]"></div>
        </div>
      </div>

      <!-- Custom Skeleton -->
      <div class="skeleton-custom" *ngIf="type === 'custom'">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      width: 100%;
    }

    .skeleton-container.dark {
      --skeleton-bg: #2c3e50;
      --skeleton-shine: #34495e;
      --skeleton-text: #ecf0f1;
    }

    .skeleton-container:not(.dark) {
      --skeleton-bg: #f8f9fa;
      --skeleton-shine: #e9ecef;
      --skeleton-text: #6c757d;
    }

    /* Base Skeleton Elements */
    .skeleton-image,
    .skeleton-title,
    .skeleton-text,
    .skeleton-avatar,
    .skeleton-cell {
      position: relative;
      overflow: hidden;
      background: var(--skeleton-bg);
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .skeleton-image::before,
    .skeleton-title::before,
    .skeleton-text::before,
    .skeleton-avatar::before,
    .skeleton-cell::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent 0%, var(--skeleton-shine) 50%, transparent 100%);
      transform: translate3d(-100%, 0, 0);
      animation: skeleton-shimmer 2s ease-out infinite;
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
      .skeleton-image::before,
      .skeleton-title::before,
      .skeleton-text::before,
      .skeleton-avatar::before,
      .skeleton-cell::before {
        animation: none;
      }
    }

    /* Card Skeleton */
    .skeleton-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .skeleton-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .skeleton-card .skeleton-image {
      width: 100%;
      height: 200px;
      margin-bottom: 20px;
      border-radius: 12px;
    }

    .skeleton-card .skeleton-title {
      width: 70%;
      height: 24px;
      margin-bottom: 16px;
    }

    .skeleton-card .skeleton-text {
      width: 100%;
      height: 16px;
      margin-bottom: 12px;
    }

    .skeleton-card .skeleton-text.short {
      width: 60%;
    }

    /* List Item Skeleton */
    .skeleton-list-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: white;
      border-radius: 12px;
      margin-bottom: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .skeleton-list-item .skeleton-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .skeleton-list-item .skeleton-content {
      flex: 1;
    }

    .skeleton-list-item .skeleton-title {
      width: 60%;
      height: 20px;
      margin-bottom: 8px;
    }

    .skeleton-list-item .skeleton-text {
      width: 80%;
      height: 16px;
    }

    /* Profile Skeleton */
    .skeleton-profile {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .skeleton-profile .skeleton-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
    }

    .skeleton-profile .skeleton-avatar.large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin-right: 20px;
      flex-shrink: 0;
    }

    .skeleton-profile .skeleton-info {
      flex: 1;
    }

    .skeleton-profile .skeleton-title {
      width: 80%;
      height: 28px;
      margin-bottom: 12px;
    }

    .skeleton-profile .skeleton-text {
      width: 60%;
      height: 18px;
    }

    .skeleton-profile .skeleton-bio .skeleton-text {
      width: 100%;
      height: 18px;
      margin-bottom: 12px;
    }

    .skeleton-profile .skeleton-bio .skeleton-text.short {
      width: 70%;
    }

    /* Grid Skeleton */
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .skeleton-grid-item {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .skeleton-grid-item:hover {
      transform: translateY(-4px);
    }

    .skeleton-grid-item .skeleton-image {
      width: 100%;
      height: 180px;
      margin-bottom: 16px;
      border-radius: 12px;
    }

    .skeleton-grid-item .skeleton-title {
      width: 80%;
      height: 22px;
      margin-bottom: 12px;
    }

    .skeleton-grid-item .skeleton-text {
      width: 100%;
      height: 16px;
      margin-bottom: 8px;
    }

    /* Table Skeleton */
    .skeleton-table {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .skeleton-table-header {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      background: var(--skeleton-bg);
      padding: 16px;
    }

    .skeleton-table-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 16px;
      border-bottom: 1px solid var(--skeleton-shine);
    }

    .skeleton-table-row:last-child {
      border-bottom: none;
    }

    .skeleton-cell {
      height: 20px;
      margin: 0 8px;
    }

    /* Custom Skeleton */
    .skeleton-custom {
      width: 100%;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .skeleton-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .skeleton-card,
      .skeleton-profile {
        padding: 16px;
      }

      .skeleton-profile .skeleton-header {
        flex-direction: column;
        text-align: center;
      }

      .skeleton-profile .skeleton-avatar.large {
        margin-right: 0;
        margin-bottom: 16px;
      }

      .skeleton-table-header,
      .skeleton-table-row {
        grid-template-columns: repeat(2, 1fr);
        padding: 12px;
      }
    }

    /* Animation Variations */
    .skeleton-container.slow .skeleton-image,
    .skeleton-container.slow .skeleton-title,
    .skeleton-container.slow .skeleton-text,
    .skeleton-container.slow .skeleton-avatar,
    .skeleton-container.slow .skeleton-cell {
      animation-duration: 3s;
    }

    .skeleton-container.fast .skeleton-image,
    .skeleton-container.fast .skeleton-title,
    .skeleton-container.fast .skeleton-text,
    .skeleton-container.fast .skeleton-avatar,
    .skeleton-container.fast .skeleton-cell {
      animation-duration: 1s;
    }

    /* Pulse Effect */
    .skeleton-container.pulse .skeleton-image,
    .skeleton-container.pulse .skeleton-title,
    .skeleton-container.pulse .skeleton-text,
    .skeleton-container.pulse .skeleton-avatar,
    .skeleton-container.pulse .skeleton-cell {
      animation: skeleton-pulse 1.5s ease-in-out infinite;
      will-change: opacity;
    }

    .skeleton-container.pulse .skeleton-image::before,
    .skeleton-container.pulse .skeleton-title::before,
    .skeleton-container.pulse .skeleton-text::before,
    .skeleton-container.pulse .skeleton-avatar::before,
    .skeleton-container.pulse .skeleton-cell::before {
      animation: none;
    }

    @keyframes skeleton-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `]
})
export class SleekSkeletonComponent {
  @Input() type: 'card' | 'list-item' | 'profile' | 'grid' | 'table' | 'custom' = 'card';
  @Input() dark: boolean = false;
  @Input() animation: 'normal' | 'slow' | 'fast' | 'pulse' = 'normal';

  get animationClass(): string {
    return this.animation !== 'normal' ? this.animation : '';
  }
}
