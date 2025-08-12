import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOSCompatibilityService } from '../../../services/ios-compatibility.service';

@Component({
  selector: 'app-video-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-background-container" *ngIf="videoSrc">
      <video 
        #videoElement
        [src]="videoSrc"
        class="video-background"
        [autoplay]="autoplay && !isIOS"
        [loop]="loop"
        [muted]="muted"
        [controls]="showControls"
        (loadedmetadata)="onVideoLoaded()"
        (error)="onVideoError($event)"
        (touchstart)="onTouchStart()">
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
      
      <!-- Overlay for better text readability -->
      <div class="video-overlay" *ngIf="showOverlay"></div>
      
      <!-- iOS-specific play button -->
      <div class="ios-play-button" *ngIf="isIOS && !videoPlaying" (click)="playVideo()">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      
      <!-- Content slot -->
      <div class="video-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .video-background-container {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
    
    .video-background {
      position: absolute;
      top: 50%;
      left: 50%;
      min-width: 100%;
      min-height: 100%;
      width: auto;
      height: auto;
      transform: translateX(-50%) translateY(-50%);
      object-fit: cover;
      z-index: 1;
    }
    
    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 2;
    }
    
    .video-content {
      position: relative;
      z-index: 3;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ios-play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 4;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .ios-play-button:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: translate(-50%, -50%) scale(1.1);
    }
    
    .ios-play-button:active {
      transform: translate(-50%, -50%) scale(0.95);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .video-background {
        object-fit: cover;
      }
      
      .ios-play-button {
        width: 60px;
        height: 60px;
      }
      
      .ios-play-button svg {
        width: 48px;
        height: 48px;
      }
    }
    
    /* iOS-specific styles */
    @supports (-webkit-touch-callout: none) {
      .video-background {
        -webkit-transform: translateX(-50%) translateY(-50%);
        transform: translateX(-50%) translateY(-50%);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      
      .ios-play-button {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
    }
  `]
})
export class VideoBackgroundComponent implements OnInit, OnDestroy {
  @Input() videoSrc: string = '';
  @Input() autoplay: boolean = true;
  @Input() loop: boolean = true;
  @Input() muted: boolean = true;
  @Input() showControls: boolean = false;
  @Input() showOverlay: boolean = true;

  private videoElement: HTMLVideoElement | null = null;
  public isIOS: boolean = false;
  public videoPlaying: boolean = false;

  constructor(private iosService: IOSCompatibilityService) { }

  ngOnInit() {
    this.isIOS = this.iosService.getIsIOS();

    // For iOS, we need to handle video playback differently
    if (this.isIOS) {
      this.setupIOSVideoHandling();
    }
  }

  ngOnDestroy() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement.load();
    }
  }

  private setupIOSVideoHandling(): void {
    // iOS requires user interaction to play videos
    if (this.isIOS) {
      this.autoplay = false; // Disable autoplay on iOS

      // Add touch event listeners for iOS
      setTimeout(() => {
        const video = document.querySelector('video');
        if (video) {
          this.videoElement = video as HTMLVideoElement;

          // Set iOS-specific attributes
          this.videoElement.setAttribute('playsinline', 'true');
          this.videoElement.setAttribute('webkit-playsinline', 'true');
          this.videoElement.setAttribute('muted', 'true');

          // Listen for play/pause events
          this.videoElement.addEventListener('play', () => {
            this.videoPlaying = true;
          });

          this.videoElement.addEventListener('pause', () => {
            this.videoPlaying = false;
          });

          this.videoElement.addEventListener('ended', () => {
            this.videoPlaying = false;
            if (this.loop) {
              this.videoElement!.currentTime = 0;
              this.playVideo();
            }
          });
        }
      }, 100);
    }
  }

  onVideoLoaded() {
    console.log('Video background loaded successfully');

    if (this.isIOS) {
      // On iOS, pause the video initially
      if (this.videoElement) {
        this.videoElement.pause();
        this.videoPlaying = false;
      }
    }
  }

  onVideoError(event: Event) {
    console.error('Video background error:', event);

    // On iOS, provide fallback for video errors
    if (this.isIOS) {
      this.handleIOSVideoError();
    }
  }

  onTouchStart() {
    // iOS touch event handler
    if (this.isIOS && !this.videoPlaying) {
      this.playVideo();
    }
  }

  public playVideo(): void {
    if (this.videoElement) {
      this.videoElement.play().then(() => {
        this.videoPlaying = true;
        console.log('Video started playing on iOS');
      }).catch((error) => {
        console.error('Failed to play video on iOS:', error);
        this.videoPlaying = false;
      });
    }
  }

  public pauseVideo(): void {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoPlaying = false;
    }
  }

  public restartVideo(): void {
    if (this.videoElement) {
      this.videoElement.currentTime = 0;
      if (!this.isIOS) {
        this.videoElement.play();
      }
    }
  }

  private handleIOSVideoError(): void {
    // Provide fallback content for iOS video errors
    console.log('Providing fallback for iOS video error');

    // You can implement fallback image or animation here
    const videoContainer = document.querySelector('.video-background-container') as HTMLElement;
    if (videoContainer) {
      // Add fallback background or message
      videoContainer.style.background = 'linear-gradient(135deg, #1B1838 0%, #2D1B69 100%)';
    }
  }
}
