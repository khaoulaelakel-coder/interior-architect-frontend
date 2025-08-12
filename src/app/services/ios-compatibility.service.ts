import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class IOSCompatibilityService {
    private isIOS!: boolean;
    private isSafari!: boolean;
    private isIPhone!: boolean;
    private isSamsung!: boolean;
    private isAndroid!: boolean;
    private isChrome!: boolean;

    constructor() {
        this.detectDevice();
        this.applyMobileFixes();
    }

    private detectDevice(): void {
        const userAgent = navigator.userAgent.toLowerCase();
        this.isIOS = /iphone|ipad|ipod/.test(userAgent);
        this.isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
        this.isIPhone = /iphone/.test(userAgent);
        this.isSamsung = /samsung|sm-|gt-|galaxy/.test(userAgent);
        this.isAndroid = /android/.test(userAgent);
        this.isChrome = /chrome/.test(userAgent);

        console.log('Device Detection:', {
            isIOS: this.isIOS,
            isSafari: this.isSafari,
            isIPhone: this.isIPhone,
            isSamsung: this.isSamsung,
            isAndroid: this.isAndroid,
            isChrome: this.isChrome,
            userAgent: navigator.userAgent
        });
    }

    private applyMobileFixes(): void {
        if (this.isIOS) {
            this.applyIOSFixes();
        }

        if (this.isSamsung || this.isAndroid) {
            this.applySamsungFixes();
        }

        // Apply general mobile fixes for all mobile devices
        if (this.isIOS || this.isAndroid) {
            this.applyGeneralMobileFixes();
        }
    }

    private applyIOSFixes(): void {
        this.fixIOSViewport();
        this.fixIOSScrolling();
        this.fixIOSTouchEvents();
        this.fixIOSVideoAutoplay();
        this.fixIOSInputZoom();
    }

    private applySamsungFixes(): void {
        this.fixSamsungViewport();
        this.fixSamsungScrolling();
        this.fixSamsungTouchEvents();
        this.fixSamsungVideoPlayback();
        this.fixSamsungInputIssues();
    }

    private applyGeneralMobileFixes(): void {
        this.fixMobileViewport();
        this.fixMobileScrolling();
        this.fixMobileTouchEvents();
        this.fixMobileVideoPlayback();
        this.fixMobileInputIssues();
    }

    private fixIOSViewport(): void {
        // Fix for iOS viewport issues
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            // iOS Safari specific viewport settings
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
        }

        // Fix for iOS status bar
        if (this.isIPhone) {
            document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
            document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
        }
    }

    private fixSamsungViewport(): void {
        // Samsung-specific viewport fixes
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            // Samsung phones often need specific viewport settings
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover');
        }

        // Fix for Samsung's One UI specific issues
        if (this.isSamsung) {
            document.documentElement.style.setProperty('--samsung-safe-area', 'env(safe-area-inset-top)');
        }
    }

    private fixMobileViewport(): void {
        // General mobile viewport fixes
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            const currentContent = viewport.getAttribute('content') || '';
            if (!currentContent.includes('viewport-fit=cover')) {
                viewport.setAttribute('content', currentContent + ', viewport-fit=cover');
            }
        }
    }

    private fixIOSScrolling(): void {
        // Fix for iOS momentum scrolling issues
        if (this.isIOS) {
            (document.body.style as any).webkitOverflowScrolling = 'touch';

            // Fix for iOS scroll bounce
            document.addEventListener('touchmove', (e) => {
                const target = e.target as Element;
                if (target?.closest('.scrollable-content')) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    }

    private fixSamsungScrolling(): void {
        // Samsung-specific scrolling fixes
        if (this.isSamsung) {
            // Fix for Samsung's touch scrolling issues
            (document.body.style as any).overflowScrolling = 'touch';

            // Fix for Samsung's momentum scrolling
            document.addEventListener('touchmove', (e) => {
                const target = e.target as Element;
                if (target?.closest('.scrollable-content')) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    }

    private fixMobileScrolling(): void {
        // General mobile scrolling fixes
        (document.body.style as any).overflowScrolling = 'touch';

        // Fix for mobile scroll bounce
        document.addEventListener('touchmove', (e) => {
            const target = e.target as Element;
            if (target?.closest('.scrollable-content')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    private fixIOSTouchEvents(): void {
        // Fix for iOS touch event issues
        if (this.isIOS) {
            // Add touch-action CSS property to prevent unwanted touch behaviors
            const style = document.createElement('style');
            style.textContent = `
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          touch-action: manipulation;
        }
        
        input, textarea, [contenteditable] {
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        .scrollable-content {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
        }
      `;
            document.head.appendChild(style);
        }
    }

    private fixSamsungTouchEvents(): void {
        // Samsung-specific touch event fixes
        if (this.isSamsung) {
            const style = document.createElement('style');
            style.textContent = `
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          touch-action: manipulation;
        }
        
        input, textarea, [contenteditable] {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        .scrollable-content {
          overflow-scrolling: touch;
        }
        
        /* Samsung One UI specific fixes */
        button, a {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
      `;
            document.head.appendChild(style);
        }
    }

    private fixMobileTouchEvents(): void {
        // General mobile touch event fixes
        const style = document.createElement('style');
        style.textContent = `
      * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        touch-action: manipulation;
      }
      
      input, textarea, [contenteditable] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      
      .scrollable-content {
        overflow-scrolling: touch;
      }
      
      button, a {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
    `;
        document.head.appendChild(style);
    }

    private fixIOSVideoAutoplay(): void {
        // Fix for iOS video autoplay restrictions
        if (this.isIOS) {
            // iOS requires user interaction to play videos
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                video.setAttribute('playsinline', 'true');
                video.setAttribute('webkit-playsinline', 'true');
                video.setAttribute('muted', 'true');

                // Add touch event to enable video playback
                video.addEventListener('touchstart', () => {
                    if (video.paused) {
                        video.play().catch(e => console.log('Video autoplay failed:', e));
                    }
                });
            });
        }
    }

    private fixSamsungVideoPlayback(): void {
        // Samsung-specific video playback fixes
        if (this.isSamsung) {
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                video.setAttribute('playsinline', 'true');
                video.setAttribute('muted', 'true');
                video.setAttribute('preload', 'metadata');

                // Samsung phones sometimes need specific video attributes
                video.setAttribute('webkit-playsinline', 'true');
                video.setAttribute('x-webkit-airplay', 'allow');

                // Add touch event for Samsung phones
                video.addEventListener('touchstart', () => {
                    if (video.paused) {
                        video.play().catch(e => console.log('Samsung video autoplay failed:', e));
                    }
                });
            });
        }
    }

    private fixMobileVideoPlayback(): void {
        // General mobile video playback fixes
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.setAttribute('playsinline', 'true');
            video.setAttribute('muted', 'true');
            video.setAttribute('preload', 'metadata');

            // Add touch event for mobile devices
            video.addEventListener('touchstart', () => {
                if (video.paused) {
                    video.play().catch(e => console.log('Mobile video autoplay failed:', e));
                }
            });
        });
    }

    private fixIOSInputZoom(): void {
        // Prevent zoom on input focus in iOS
        if (this.isIOS) {
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    // Set font size to 16px to prevent zoom
                    const currentFontSize = window.getComputedStyle(input).fontSize;
                    if (parseFloat(currentFontSize) < 16) {
                        (input as HTMLElement).style.fontSize = '16px';
                    }
                });

                input.addEventListener('blur', () => {
                    // Restore original font size
                    (input as HTMLElement).style.fontSize = '';
                });
            });
        }
    }

    private fixSamsungInputIssues(): void {
        // Samsung-specific input fixes
        if (this.isSamsung) {
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                // Fix for Samsung keyboard issues
                input.addEventListener('focus', () => {
                    const currentFontSize = window.getComputedStyle(input).fontSize;
                    if (parseFloat(currentFontSize) < 16) {
                        (input as HTMLElement).style.fontSize = '16px';
                    }

                    // Fix for Samsung's virtual keyboard
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                });

                input.addEventListener('blur', () => {
                    (input as HTMLElement).style.fontSize = '';
                });
            });
        }
    }

    private fixMobileInputIssues(): void {
        // General mobile input fixes
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                const currentFontSize = window.getComputedStyle(input).fontSize;
                if (parseFloat(currentFontSize) < 16) {
                    (input as HTMLElement).style.fontSize = '16px';
                }

                // Scroll input into view on mobile
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });

            input.addEventListener('blur', () => {
                (input as HTMLElement).style.fontSize = '';
            });
        });
    }

    // Public methods for components to use
    public getIsIOS(): boolean {
        return this.isIOS;
    }

    public getIsIPhone(): boolean {
        return this.isIPhone;
    }

    public getIsSafari(): boolean {
        return this.isSafari;
    }

    public getIsSamsung(): boolean {
        return this.isSamsung;
    }

    public getIsAndroid(): boolean {
        return this.isAndroid;
    }

    public getIsChrome(): boolean {
        return this.isChrome;
    }

    // Method to handle mobile-specific API calls
    public handleMobileAPI(url: string): string {
        if (this.isSamsung || this.isAndroid) {
            // Add mobile-specific headers or modify URLs if needed
            return url;
        }
        return url;
    }

    // Method to check if a feature is supported on mobile
    public isFeatureSupported(feature: string): boolean {
        switch (feature) {
            case 'serviceWorker':
                return 'serviceWorker' in navigator;
            case 'videoAutoplay':
                return !this.isIOS; // iOS doesn't support autoplay without user interaction
            case 'touchEvents':
                return 'ontouchstart' in window;
            case 'webGL':
                try {
                    const canvas = document.createElement('canvas');
                    return !!(window.WebGLRenderingContext &&
                        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
                } catch (e) {
                    return false;
                }
            case 'samsungOptimizations':
                return this.isSamsung;
            default:
                return true;
        }
    }

    // Method to apply mobile-specific CSS classes
    public applyMobileClasses(element: HTMLElement): void {
        if (this.isIOS) {
            element.classList.add('ios-device');
            if (this.isIPhone) {
                element.classList.add('iphone-device');
            }
            if (this.isSafari) {
                element.classList.add('safari-browser');
            }
        }

        if (this.isSamsung) {
            element.classList.add('samsung-device');
        }

        if (this.isAndroid) {
            element.classList.add('android-device');
        }

        if (this.isChrome) {
            element.classList.add('chrome-browser');
        }
    }
}
