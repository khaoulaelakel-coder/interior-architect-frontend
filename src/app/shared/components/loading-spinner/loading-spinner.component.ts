import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="loading-container" [class.fullscreen]="fullscreen">
      <div class="spinner-overlay">
        <div class="spinner-container">
          <div class="spinner"></div>
          <div class="loading-text" *ngIf="showText">{{ text }}</div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
    }

    .loading-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(5px);
      z-index: 9999;
      min-height: 100vh;
    }

    .spinner-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner-container {
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    .loading-text {
      color: #666;
      font-size: 16px;
      font-weight: 500;
      margin-top: 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Skeleton loading animation */
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
    }

    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class LoadingSpinnerComponent {
    @Input() text: string = 'Chargement...';
    @Input() showText: boolean = true;
    @Input() fullscreen: boolean = false;
}
