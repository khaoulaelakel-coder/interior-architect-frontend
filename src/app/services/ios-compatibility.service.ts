import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class IOSCompatibilityService {
    private isIOS: boolean = false;
    private isSafari: boolean = false;
    private isIPhone: boolean = false;
    private isSamsung: boolean = false;
    private isAndroid: boolean = false;
    private isChrome: boolean = false;

    constructor() {
        // Simple, safe initialization
        this.initializeSafely();
    }

    private initializeSafely(): void {
        try {
            // Wait for everything to be ready
            setTimeout(() => {
                this.detectDevice();
                this.applyBasicFixes();
            }, 1000);
        } catch (error) {
            console.warn('iOS compatibility service initialization failed:', error);
        }
    }

    private detectDevice(): void {
        try {
            if (typeof navigator !== 'undefined' && navigator.userAgent) {
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
                    isChrome: this.isChrome
                });
            }
        } catch (error) {
            console.warn('Device detection failed:', error);
        }
    }

    private applyBasicFixes(): void {
        try {
            // Only apply viewport fixes - the safest option
            this.fixViewport();
        } catch (error) {
            console.warn('Basic fixes failed:', error);
        }
    }

    private fixViewport(): void {
        try {
            if (typeof document !== 'undefined') {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport && this.isIOS) {
                    // Simple iOS viewport fix
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
                }
            }
        } catch (error) {
            console.warn('Viewport fix failed:', error);
        }
    }

    // Public methods - safe getters
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
}
