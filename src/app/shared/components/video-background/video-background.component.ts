import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

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
        [autoplay]="autoplay"
        [loop]="loop"
        [muted]="muted"
        [controls]="showControls"
        playsinline
        webkit-playsinline
        (loadedmetadata)="onVideoLoaded()"
        (error)="onVideoError($event)">
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
      
      <!-- Overlay for better text readability -->
      <div class="video-overlay" *ngIf="showOverlay"></div>
      
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
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .video-background {
        object-fit: cover;
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

  @ViewChild('videoElement', { static: false }) videoElementRef!: ElementRef<HTMLVideoElement>;

  ngOnInit() {
    // Simple initialization - no complex DOM manipulation
    console.log('Video background component initialized');
  }

  ngOnDestroy() {
    // Safe cleanup
    try {
      if (this.videoElementRef?.nativeElement) {
        this.videoElementRef.nativeElement.pause();
        this.videoElementRef.nativeElement.src = '';
        this.videoElementRef.nativeElement.load();
      }
    } catch (error) {
      console.warn('Video cleanup error:', error);
    }
  }

  onVideoLoaded() {
    console.log('Video background loaded successfully');
  }

  onVideoError(event: Event) {
    console.warn('Video background error:', event);

    // Simple fallback - just log the error
    // Don't try to manipulate DOM on error
  }
}
