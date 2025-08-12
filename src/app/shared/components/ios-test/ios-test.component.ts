import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IOSCompatibilityService } from '../../../services/ios-compatibility.service';

@Component({
    selector: 'app-ios-test',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="ios-test-container" *ngIf="showTest">
      <div class="ios-test-card">
        <h3>🍎 iOS Compatibility Test</h3>
        
        <div class="test-results">
          <div class="test-item">
            <span class="label">Device Type:</span>
            <span class="value" [class]="isIOS ? 'ios' : 'other'">
              {{ isIOS ? 'iOS Device' : 'Other Device' }}
            </span>
          </div>
          
          <div class="test-item" *ngIf="isIOS">
            <span class="label">iPhone:</span>
            <span class="value" [class]="isIPhone ? 'iphone' : 'ipad'">
              {{ isIPhone ? 'iPhone' : 'iPad' }}
            </span>
          </div>
          
          <div class="test-item" *ngIf="isIOS">
            <span class="label">Safari:</span>
            <span class="value" [class]="isSafari ? 'safari' : 'other-browser'">
              {{ isSafari ? 'Safari' : 'Other Browser' }}
            </span>
          </div>
          
          <div class="test-item">
            <span class="label">Service Worker:</span>
            <span class="value" [class]="serviceWorkerSupported ? 'supported' : 'not-supported'">
              {{ serviceWorkerSupported ? 'Supported' : 'Not Supported' }}
            </span>
          </div>
          
          <div class="test-item">
            <span class="label">Touch Events:</span>
            <span class="value" [class]="touchEventsSupported ? 'supported' : 'not-supported'">
              {{ touchEventsSupported ? 'Supported' : 'Not Supported' }}
            </span>
          </div>
          
          <div class="test-item">
            <span class="label">Video Autoplay:</span>
            <span class="value" [class]="videoAutoplaySupported ? 'supported' : 'not-supported'">
              {{ videoAutoplaySupported ? 'Supported' : 'Not Supported' }}
            </span>
          </div>
        </div>
        
        <div class="test-actions">
          <button class="test-btn" (click)="testTouchEvents()">
            Test Touch Events
          </button>
          <button class="test-btn" (click)="testVideoPlayback()">
            Test Video Playback
          </button>
          <button class="test-btn" (click)="testServiceWorker()">
            Test Service Worker
          </button>
        </div>
        
        <div class="test-output" *ngIf="testOutput">
          <h4>Test Results:</h4>
          <pre>{{ testOutput }}</pre>
        </div>
        
        <button class="close-btn" (click)="hideTest()">Close Test</button>
      </div>
    </div>
  `,
    styles: [`
    .ios-test-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    }
    
    .ios-test-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    h3 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #1f2937;
    }
    
    .test-results {
      margin-bottom: 1.5rem;
    }
    
    .test-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .test-item:last-child {
      border-bottom: none;
    }
    
    .label {
      font-weight: 500;
      color: #374151;
    }
    
    .value {
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .ios { background: #dbeafe; color: #1e40af; }
    .other { background: #f3f4f6; color: #374151; }
    .iphone { background: #fef3c7; color: #92400e; }
    .ipad { background: #d1fae5; color: #065f46; }
    .safari { background: #fef3c7; color: #92400e; }
    .other-browser { background: #f3f4f6; color: #374151; }
    .supported { background: #d1fae5; color: #065f46; }
    .not-supported { background: #fee2e2; color: #991b1b; }
    
    .test-actions {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    
    .test-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }
    
    .test-btn:hover {
      background: #2563eb;
    }
    
    .test-btn:active {
      background: #1d4ed8;
    }
    
    .test-output {
      background: #f3f4f6;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .test-output h4 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }
    
    .test-output pre {
      margin: 0;
      white-space: pre-wrap;
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .close-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      width: 100%;
      transition: background-color 0.2s;
    }
    
    .close-btn:hover {
      background: #dc2626;
    }
    
    /* iOS-specific styles */
    @supports (-webkit-touch-callout: none) {
      .ios-test-card {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
      }
      
      .test-btn, .close-btn {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
    }
    
    /* Mobile responsive */
    @media (max-width: 640px) {
      .ios-test-container {
        padding: 0.5rem;
      }
      
      .ios-test-card {
        padding: 1.5rem;
      }
      
      .test-actions {
        flex-direction: column;
      }
      
      .test-btn {
        width: 100%;
      }
    }
  `]
})
export class IOSTestComponent implements OnInit {
    showTest = false;
    isIOS = false;
    isIPhone = false;
    isSafari = false;
    serviceWorkerSupported = false;
    touchEventsSupported = false;
    videoAutoplaySupported = false;
    testOutput = '';

    constructor(private iosService: IOSCompatibilityService) { }

    ngOnInit() {
        this.detectCapabilities();
    }

    private detectCapabilities(): void {
        this.isIOS = this.iosService.getIsIOS();
        this.isIPhone = this.iosService.getIsIPhone();
        this.isSafari = this.iosService.getIsSafari();
        this.serviceWorkerSupported = this.iosService.isFeatureSupported('serviceWorker');
        this.touchEventsSupported = this.iosService.isFeatureSupported('touchEvents');
        this.videoAutoplaySupported = this.iosService.isFeatureSupported('videoAutoplay');
    }

    showTestPanel(): void {
        this.showTest = true;
    }

    hideTest(): void {
        this.showTest = false;
        this.testOutput = '';
    }

    testTouchEvents(): void {
        this.testOutput = 'Testing touch events...\n';

        if (this.touchEventsSupported) {
            this.testOutput += '✅ Touch events are supported\n';
            this.testOutput += '✅ Touch event listeners can be added\n';
        } else {
            this.testOutput += '❌ Touch events are not supported\n';
        }

        this.testOutput += `\nDevice: ${this.isIOS ? 'iOS' : 'Other'}\n`;
        this.testOutput += `Touch Support: ${'ontouchstart' in window ? 'Yes' : 'No'}\n`;
    }

    testVideoPlayback(): void {
        this.testOutput = 'Testing video playback...\n';

        if (this.videoAutoplaySupported) {
            this.testOutput += '✅ Video autoplay is supported\n';
        } else {
            this.testOutput += '❌ Video autoplay is not supported (iOS restriction)\n';
            this.testOutput += 'ℹ️ User interaction required to play videos\n';
        }

        this.testOutput += `\nDevice: ${this.isIOS ? 'iOS' : 'Other'}\n`;
        this.testOutput += `Video Element Support: ${!!document.createElement('video') ? 'Yes' : 'No'}\n`;
    }

    testServiceWorker(): void {
        this.testOutput = 'Testing service worker...\n';

        if (this.serviceWorkerSupported) {
            this.testOutput += '✅ Service Worker is supported\n';

            if (navigator.serviceWorker.controller) {
                this.testOutput += '✅ Service Worker is active\n';
            } else {
                this.testOutput += 'ℹ️ Service Worker is not yet active\n';
            }
        } else {
            this.testOutput += '❌ Service Worker is not supported\n';
            this.testOutput += 'ℹ️ Fallback caching will be used\n';
        }

        this.testOutput += `\nDevice: ${this.isIOS ? 'iOS' : 'Other'}\n`;
        this.testOutput += `Service Worker API: ${'serviceWorker' in navigator ? 'Yes' : 'No'}\n`;
    }

    // Static method to show test panel from console
    static showTest(): void {
        const testComponent = document.querySelector('app-ios-test') as any;
        if (testComponent && testComponent.componentRef) {
            testComponent.componentRef.instance.showTestPanel();
        } else {
            console.log('iOS Test component not found. Make sure it\'s included in your app.');
        }
    }
}
