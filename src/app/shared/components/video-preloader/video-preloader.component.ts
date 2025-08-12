import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-preloader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-preloader" *ngIf="!isVideoReady">
      <!-- Video Container -->
      <div class="video-container">
        <video 
          #videoElement
          [src]="videoSrc"
          class="preloader-video"
          [autoplay]="true"
          [muted]="true"
          [controls]="false"
          (loadeddata)="onVideoLoaded()"
          (ended)="onVideoEnded()"
          (error)="onVideoError($event)">
        </video>
      </div>
    </div>
  `,
  styles: [`
    .video-preloader {
      position: fixed;
      inset: 0;
      z-index: 50;
      background: #1B1838;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .video-container {
      position: relative;
      width: 100%;
      max-width: 700px;
      max-height: 100vh;
      overflow: hidden;
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.05);
    }

    .preloader-video {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .video-container {
        max-width: 100%;
      }
    }

    @media (max-width: 480px) {
      .video-container {
        /* No additional styles needed */
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .video-container {
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid white;
      }
    }
  `]
})
export class VideoPreloaderComponent implements OnInit, OnDestroy {
  @Output() videoReady = new EventEmitter<string>();

  // Try multiple video formats
  videoSrcs = [
    'assets/vd/intro.mp4',
    'assets/vd/intro.webm',
    'assets/vd/video.mp4',
    'assets/vd/video.webm'
  ];
  currentVideoIndex = 0;
  videoSrc = this.videoSrcs[0];
  loadingMessage = 'Préparation de votre expérience...';
  isVideoReady = false;
  private videoElement: HTMLVideoElement | null = null;

  ngOnInit() {
    console.log('VideoPreloader: Starting video loading screen...');
    this.loadingMessage = 'Préparation de votre expérience...';

    // Add timeout to prevent getting stuck
    setTimeout(() => {
      if (!this.isVideoReady) {
        console.log('VideoPreloader: Timeout reached, forcing ready state');
        this.isVideoReady = true;
        this.videoReady.emit(this.videoSrc);
      }
    }, 30000); // 30 second timeout
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  onVideoLoaded() {
    console.log('VideoPreloader: Video loaded successfully');
    this.loadingMessage = 'Votre portfolio est prêt !';
  }

  onVideoEnded() {
    console.log('VideoPreloader: Video ended, transitioning to main content');
    this.isVideoReady = true;
    this.videoReady.emit(this.videoSrc);
  }

  onVideoError(event: Event) {
    console.error('Video preload error:', event);

    // Try next video format
    this.currentVideoIndex++;
    if (this.currentVideoIndex < this.videoSrcs.length) {
      this.loadingMessage = `Changement de format... (${this.currentVideoIndex + 1}/${this.videoSrcs.length})`;
      this.videoSrc = this.videoSrcs[this.currentVideoIndex];
    } else {
      // All formats failed - continue anyway
      console.warn('All video formats failed to load, continuing without video');
      this.loadingMessage = 'Finalisation du chargement...';

      setTimeout(() => {
        this.isVideoReady = true;
        this.videoReady.emit('');
      }, 2000);
    }
  }
}