import { Injectable } from '@angular/core';

export interface PerformanceMetrics {
    skillsLoadTime: number;
    cacheHitRate: number;
    totalRequests: number;
    cachedRequests: number;
    averageResponseTime: number;
}

export interface ComponentPerformanceMetrics {
    componentName: string;
    loadTime: number;
    imageLoadTimes: Map<string, number>;
    cacheHits: number;
    cacheMisses: number;
    errorCount: number;
    retryCount: number;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class PerformanceMonitorService {
    private metrics: PerformanceMetrics = {
        skillsLoadTime: 0,
        cacheHitRate: 0,
        totalRequests: 0,
        cachedRequests: 0,
        averageResponseTime: 0
    };

    private componentMetrics = new Map<string, ComponentPerformanceMetrics>();
    private startTimes = new Map<string, number>();
    private responseTimes: number[] = [];

    constructor() {
        // Load metrics from localStorage if available
        this.loadMetrics();
    }

    // Skills-focused methods
    startTimer(operation: string): void {
        this.startTimes.set(operation, performance.now());
    }

    endTimer(operation: string): number {
        const startTime = this.startTimes.get(operation);
        if (!startTime) return 0;

        const duration = performance.now() - startTime;
        this.startTimes.delete(operation);

        // Track response times for averaging
        this.responseTimes.push(duration);
        if (this.responseTimes.length > 100) {
            this.responseTimes.shift(); // Keep only last 100 measurements
        }

        // Update specific metrics
        if (operation === 'skills-load') {
            this.metrics.skillsLoadTime = duration;
        }

        this.updateAverageResponseTime();
        this.saveMetrics();
        return duration;
    }

    recordCacheHit(cacheKey?: string): void {
        this.metrics.cachedRequests++;
        this.metrics.totalRequests++;
        this.updateCacheHitRate();
        this.saveMetrics();
    }

    recordCacheMiss(cacheKey?: string): void {
        this.metrics.totalRequests++;
        this.updateCacheHitRate();
        this.saveMetrics();
    }

    getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    resetMetrics(): void {
        this.metrics = {
            skillsLoadTime: 0,
            cacheHitRate: 0,
            totalRequests: 0,
            cachedRequests: 0,
            averageResponseTime: 0
        };
        this.responseTimes = [];
        this.saveMetrics();
    }

    // Component-focused methods (for backward compatibility)
    startMonitoring(componentName: string): string {
        const sessionId = `${componentName}_${Date.now()}`;
        const startTime = performance.now();

        this.componentMetrics.set(sessionId, {
            componentName,
            loadTime: 0,
            imageLoadTimes: new Map(),
            cacheHits: 0,
            cacheMisses: 0,
            errorCount: 0,
            retryCount: 0,
            timestamp: new Date()
        });

        this.startTimes.set(sessionId, startTime);
        return sessionId;
    }

    endMonitoring(sessionId: string): ComponentPerformanceMetrics | null {
        const startTime = this.startTimes.get(sessionId);
        const metric = this.componentMetrics.get(sessionId);

        if (metric && startTime) {
            metric.loadTime = performance.now() - startTime;
            this.startTimes.delete(sessionId);
            this.componentMetrics.delete(sessionId);
            return metric;
        }
        return null;
    }

    recordImageLoad(sessionId: string, imageUrl: string, loadTime: number): void {
        const metric = this.componentMetrics.get(sessionId);
        if (metric) {
            metric.imageLoadTimes.set(imageUrl, loadTime);
        }
    }

    recordError(sessionId: string): void {
        const metric = this.componentMetrics.get(sessionId);
        if (metric) {
            metric.errorCount++;
        }
    }

    recordRetry(sessionId: string): void {
        const metric = this.componentMetrics.get(sessionId);
        if (metric) {
            metric.retryCount++;
        }
    }

    // Utility methods
    private updateCacheHitRate(): void {
        if (this.metrics.totalRequests > 0) {
            this.metrics.cacheHitRate = (this.metrics.cachedRequests / this.metrics.totalRequests) * 100;
        }
    }

    private updateAverageResponseTime(): void {
        if (this.responseTimes.length > 0) {
            const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
            this.metrics.averageResponseTime = sum / this.responseTimes.length;
        }
    }

    private saveMetrics(): void {
        try {
            localStorage.setItem('performance-metrics', JSON.stringify(this.metrics));
        } catch (error) {
            console.warn('Could not save performance metrics to localStorage:', error);
        }
    }

    private loadMetrics(): void {
        try {
            const saved = localStorage.getItem('performance-metrics');
            if (saved) {
                this.metrics = { ...this.metrics, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Could not load performance metrics from localStorage:', error);
        }
    }

    // Log performance summary to console
    logPerformanceSummary(): void {
        console.group('🚀 Performance Summary');
        console.log(`Skills Load Time: ${this.metrics.skillsLoadTime.toFixed(2)}ms`);
        console.log(`Cache Hit Rate: ${this.metrics.cacheHitRate.toFixed(1)}%`);
        console.log(`Total Requests: ${this.metrics.totalRequests}`);
        console.log(`Cached Requests: ${this.metrics.cachedRequests}`);
        console.log(`Average Response Time: ${this.metrics.averageResponseTime.toFixed(2)}ms`);
        console.groupEnd();
    }

    // Clear all component metrics
    clearComponentMetrics(): void {
        this.componentMetrics.clear();
        this.startTimes.clear();
    }

    // Get component performance report
    getComponentPerformanceReport(): any {
        const allMetrics = Array.from(this.componentMetrics.values());
        const totalLoadTime = allMetrics.reduce((sum, metric) => sum + metric.loadTime, 0);
        const averageLoadTime = allMetrics.length > 0 ? totalLoadTime / allMetrics.length : 0;

        return {
            totalComponents: allMetrics.length,
            averageLoadTime: Math.round(averageLoadTime),
            totalErrors: allMetrics.reduce((sum, metric) => sum + metric.errorCount, 0),
            totalRetries: allMetrics.reduce((sum, metric) => sum + metric.retryCount, 0)
        };
    }
}
