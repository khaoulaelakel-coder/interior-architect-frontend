import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IOSCompatibilityService } from './ios-compatibility.service';

@Injectable({
    providedIn: 'root'
})
export class ServiceWorkerService {
    private swRegistration: ServiceWorkerRegistration | null = null;
    private isSupported = 'serviceWorker' in navigator;
    private isIOS: boolean;

    constructor(private iosService: IOSCompatibilityService) {
        this.isIOS = this.iosService.getIsIOS();
        this.initializeServiceWorker();
    }

    private async initializeServiceWorker(): Promise<void> {
        if (!this.isSupported) {
            console.log('Service Worker not supported');
            return;
        }

        // For iOS, be more conservative with service worker registration
        if (this.isIOS) {
            console.log('iOS device detected - using conservative service worker strategy');
            this.registerIOSServiceWorker();
        } else {
            this.registerStandardServiceWorker();
        }
    }

    private async registerStandardServiceWorker(): Promise<void> {
        try {
            // Register service worker
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('Service Worker registered successfully:', this.swRegistration);

            // Listen for updates
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration!.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && this.swRegistration!.waiting) {
                            this.showUpdateNotification();
                        }
                    });
                }
            });

            // Listen for controller change (new service worker activated)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('New Service Worker activated');
                window.location.reload();
            });

        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    private async registerIOSServiceWorker(): Promise<void> {
        try {
            // For iOS, use a more conservative approach
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none' // Don't cache the service worker itself on iOS
            });

            console.log('iOS Service Worker registered successfully:', this.swRegistration);

            // iOS-specific update handling
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration!.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && this.swRegistration!.waiting) {
                            // For iOS, don't auto-reload, just notify
                            this.showIOSUpdateNotification();
                        }
                    });
                }
            });

            // iOS-specific controller change handling
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('iOS Service Worker activated');
                // For iOS, show a manual reload option instead of auto-reload
                this.showIOSReloadPrompt();
            });

        } catch (error) {
            console.error('iOS Service Worker registration failed:', error);
            // On iOS, service worker failures are more common, so provide fallback
            this.provideIOSFallback();
        }
    }

    private showUpdateNotification(): void {
        if (confirm('A new version is available. Would you like to update now?')) {
            if (this.swRegistration && this.swRegistration.waiting) {
                this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        }
    }

    private showIOSUpdateNotification(): void {
        // iOS-specific update notification
        console.log('iOS: New version available');
        // You can implement a custom notification UI here
    }

    private showIOSReloadPrompt(): void {
        // iOS-specific reload prompt
        if (confirm('The app has been updated. Would you like to reload to see the changes?')) {
            window.location.reload();
        }
    }

    private provideIOSFallback(): void {
        // Provide fallback functionality for iOS when service worker fails
        console.log('iOS: Providing fallback functionality');

        // Implement basic offline functionality without service worker
        if ('caches' in window) {
            this.setupIOSFallbackCaching();
        }
    }

    private setupIOSFallbackCaching(): void {
        // Basic caching fallback for iOS
        console.log('iOS: Setting up fallback caching');

        // Cache essential files
        const essentialFiles = [
            '/',
            '/index.html',
            '/assets/Image/favicon.ico'
        ];

        caches.open('ios-fallback-cache').then(cache => {
            cache.addAll(essentialFiles).catch(error => {
                console.log('iOS fallback caching failed:', error);
            });
        });
    }

    // Public methods
    public async checkForUpdates(): Promise<void> {
        if (this.swRegistration) {
            try {
                await this.swRegistration.update();
                console.log('Service Worker update check completed');
            } catch (error) {
                console.error('Service Worker update check failed:', error);
            }
        }
    }

    public async unregister(): Promise<boolean> {
        if (this.swRegistration) {
            try {
                const result = await this.swRegistration.unregister();
                this.swRegistration = null;
                console.log('Service Worker unregistered:', result);
                return result;
            } catch (error) {
                console.error('Service Worker unregistration failed:', error);
                return false;
            }
        }
        return false;
    }

    public getRegistration(): ServiceWorkerRegistration | null {
        return this.swRegistration;
    }

    public isServiceWorkerSupported(): boolean {
        return this.isSupported;
    }

    public getIOSStatus(): boolean {
        return this.isIOS;
    }
}
