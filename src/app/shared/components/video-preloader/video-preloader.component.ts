import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-preloader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-preloader" *ngIf="!isVideoReady">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ loadingMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .video-preloader {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background: #1B1838;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-container {
      text-align: center;
      color: white;
      padding: 20px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    .loading-text {
      font-size: 14px;
      font-weight: normal;
      margin: 0;
      opacity: 0.9;
      font-family: Arial, sans-serif;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Universal responsive */
    @media screen and (max-width: 768px) {
      .loading-spinner {
        width: 35px;
        height: 35px;
        border-width: 2px;
      }
      
      .loading-text {
        font-size: 13px;
      }
    }

    @media screen and (max-width: 480px) {
      .loading-spinner {
        width: 30px;
        height: 30px;
        border-width: 1px;
      }
      
      .loading-text {
        font-size: 12px;
      }
    }

    @media screen and (max-width: 320px) {
      .loading-spinner {
        width: 25px;
        height: 25px;
        border-width: 1px;
      }
      
      .loading-text {
        font-size: 11px;
      }
    }

    /* Universal landscape support */
    @media screen and (orientation: landscape) and (max-height: 500px) {
      .loading-spinner {
        width: 25px;
        height: 25px;
        border-width: 1px;
      }
      
      .loading-text {
        font-size: 11px;
      }
    }

    /* Universal reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .loading-spinner {
        animation: none;
      }
    }

    /* Universal high contrast support */
    @media (prefers-contrast: high) {
      .loading-spinner {
        border-color: white;
        border-top-color: black;
      }
      
      .loading-text {
        color: white;
        font-weight: bold;
      }
    }

    /* Universal dark mode support */
    @media (prefers-color-scheme: dark) {
      .video-preloader {
        background: #000000;
      }
    }
  `]
})
export class VideoPreloaderComponent implements OnInit, OnDestroy {
  @Output() videoReady = new EventEmitter<string>();

  loadingMessage = 'Loading...';
  isVideoReady = false;

  ngOnInit() {
    console.log('VideoPreloader: Starting universal loading screen...');

    // Universal approach - works on ALL devices
    this.loadingMessage = 'Loading your portfolio...';

    // Very short loading time for ALL devices
    setTimeout(() => {
      this.isVideoReady = true;
      this.videoReady.emit('');
    }, 800); // Show loading for 0.8 seconds
  }

  ngOnDestroy() {
    // No cleanup needed
  }
}