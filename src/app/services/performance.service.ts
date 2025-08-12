import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface PerformanceMetrics {
    pageLoadTime: number;
    apiResponseTime: number;
    imageLoadTime: number;
    cacheHitRate: number;
    memoryUsage: number;
    networkRequests: number;
    errors: number;
    timestamp: number;
    // Enhanced metrics
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    cacheEfficiency: number;
    bundleSize: number;
}

export interface PerformanceThresholds {
    pageLoadTime: number; // milliseconds
    apiResponseTime: number; // milliseconds
    imageLoadTime: number; // milliseconds
    cacheHitRate: number; // percentage
    memoryUsage: number; // MB
    // Enhanced thresholds
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
}

export interface PerformanceAlert {
    type: 'warning' | 'error' | 'info';
    message: string;
    metric: string;
    value: number;
    threshold: number;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class PerformanceService {
    private metricsSubject = new BehaviorSubject<PerformanceMetrics[]>([]);
    private currentMetrics: PerformanceMetrics | null = null;
    private performanceObserver: PerformanceObserver | null = null;
    private navigationStart: number = 0;
    private alertsSubject = new Subject<PerformanceAlert>();
    private cacheStats = {
        hits: 0,
        misses: 0,
        total: 0
    };

    // Default performance thresholds
    private thresholds: PerformanceThresholds = {
        pageLoadTime: 3000, // 3 seconds
        apiResponseTime: 2000, // 2 seconds
        imageLoadTime: 1000, // 1 second
        cacheHitRate: 80, // 80%
        memoryUsage: 100, // 100 MB
        // Enhanced thresholds
        domContentLoaded: 2000,
        firstPaint: 1500,
        firstContentfulPaint: 2000,
        largestContentfulPaint: 2500,
        cumulativeLayoutShift: 0.1,
        firstInputDelay: 100
    };

    constructor() {
        this.initializePerformanceMonitoring();
    }

    private initializePerformanceMonitoring(): void {
        // Monitor navigation timing
        if ('performance' in window) {
            this.navigationStart = performance.now();

            // Monitor page load performance
            window.addEventListener('load', () => {
                this.measurePageLoadTime();
                this.measureCoreWebVitals();
            });

            // Monitor DOM content loaded
            document.addEventListener('DOMContentLoaded', () => {
                this.measureDOMContentLoaded();
            });

            // Monitor API performance
            this.monitorAPIPerformance();

            // Monitor image loading performance
            this.monitorImagePerformance();

            // Monitor memory usage
            this.monitorMemoryUsage();

            // Monitor errors
            this.monitorErrors();

            // Monitor caching performance
            this.monitorCachePerformance();
        }

        // Monitor Core Web Vitals if available
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.handlePerformanceEntry(entry);
                    }
                });

                // Observe different performance metrics
                this.performanceObserver.observe({
                    entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint', 'layout-shift']
                });
            } catch (error) {
                console.warn('PerformanceObserver not supported:', error);
            }
        }
    }

    private measurePageLoadTime(): void {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigation) {
                const pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
                this.updateMetrics({ pageLoadTime });
            }
        }
    }

    private measureCoreWebVitals(): void {
        // Measure First Paint and First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            if (entry.name === 'first-paint') {
                this.updateMetrics({ firstPaint: entry.startTime });
            } else if (entry.name === 'first-contentful-paint') {
                this.updateMetrics({ firstContentfulPaint: entry.startTime });
            }
        });

        // Measure Largest Contentful Paint
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
            const lcp = lcpEntries[lcpEntries.length - 1];
            this.updateMetrics({ largestContentfulPaint: lcp.startTime });
        }

        // Measure Cumulative Layout Shift
        const layoutShiftEntries = performance.getEntriesByType('layout-shift');
        let cumulativeLayoutShift = 0;
        layoutShiftEntries.forEach(entry => {
            const layoutShiftEntry = entry as any;
            if (!layoutShiftEntry.hadRecentInput) {
                cumulativeLayoutShift += layoutShiftEntry.value;
            }
        });
        this.updateMetrics({ cumulativeLayoutShift });
    }

    private measureDOMContentLoaded(): void {
        const domContentLoaded = performance.now() - this.navigationStart;
        this.updateMetrics({ domContentLoaded });
    }

    private monitorAPIPerformance(): void {
        // Override fetch to monitor API calls
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();

            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                const responseTime = endTime - startTime;

                this.updateMetrics({ apiResponseTime: responseTime });

                // Log slow API calls
                if (responseTime > this.thresholds.apiResponseTime) {
                    console.warn(`Slow API call detected: ${args[0]} took ${responseTime.toFixed(2)}ms`);
                }

                return response;
            } catch (error) {
                const endTime = performance.now();
                const responseTime = endTime - startTime;

                this.updateMetrics({
                    apiResponseTime: responseTime,
                    errors: (this.currentMetrics?.errors || 0) + 1
                });

                throw error;
            }
        };
    }

    private monitorImagePerformance(): void {
        // Monitor image loading performance
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const startTime = performance.now();

            img.addEventListener('load', () => {
                const endTime = performance.now();
                const loadTime = endTime - startTime;

                this.updateMetrics({ imageLoadTime: loadTime });

                // Log slow image loads
                if (loadTime > this.thresholds.imageLoadTime) {
                    console.warn(`Slow image load detected: ${img.src} took ${loadTime.toFixed(2)}ms`);
                }
            });

            img.addEventListener('error', () => {
                this.updateMetrics({
                    errors: (this.currentMetrics?.errors || 0) + 1
                });
            });
        });
    }

    private monitorMemoryUsage(): void {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = (performance as any).memory;
                const memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB

                this.updateMetrics({ memoryUsage });

                // Log high memory usage
                if (memoryUsage > this.thresholds.memoryUsage) {
                    console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB`);
                }
            }, 10000); // Check every 10 seconds
        }
    }

    private monitorErrors(): void {
        window.addEventListener('error', (event) => {
            this.updateMetrics({
                errors: (this.currentMetrics?.errors || 0) + 1
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.updateMetrics({
                errors: (this.currentMetrics?.errors || 0) + 1
            });
        });
    }

    private monitorCachePerformance(): void {
        // Monitor service worker cache performance
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'CACHE_STATS') {
                    this.cacheStats = event.data.stats;
                    this.updateCacheEfficiency();
                }
            });
        }

        // Monitor HTTP cache headers
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();

                // Check cache headers
                const cacheControl = response.headers.get('cache-control');
                const etag = response.headers.get('etag');
                const lastModified = response.headers.get('last-modified');

                if (cacheControl && (cacheControl.includes('no-cache') || cacheControl.includes('no-store'))) {
                    this.cacheStats.misses++;
                } else if (etag || lastModified) {
                    this.cacheStats.hits++;
                }

                this.cacheStats.total++;
                this.updateCacheEfficiency();

                return response;
            } catch (error) {
                throw error;
            }
        };
    }

    private updateCacheEfficiency(): void {
        if (this.cacheStats.total > 0) {
            const efficiency = (this.cacheStats.hits / this.cacheStats.total) * 100;
            this.updateMetrics({ cacheEfficiency: efficiency });
        }
    }

    private handlePerformanceEntry(entry: PerformanceEntry): void {
        if (entry.entryType === 'paint') {
            const paintEntry = entry as PerformancePaintTiming;
            if (paintEntry.name === 'first-paint') {
                console.log(`First Paint: ${paintEntry.startTime}ms`);
            } else if (paintEntry.name === 'first-contentful-paint') {
                console.log(`First Contentful Paint: ${paintEntry.startTime}ms`);
            }
        }
    }

    private updateMetrics(updates: Partial<PerformanceMetrics>): void {
        if (!this.currentMetrics) {
            this.currentMetrics = {
                pageLoadTime: 0,
                apiResponseTime: 0,
                imageLoadTime: 0,
                cacheHitRate: 0,
                memoryUsage: 0,
                networkRequests: 0,
                errors: 0,
                timestamp: Date.now(),
                // Enhanced metrics
                domContentLoaded: 0,
                firstPaint: 0,
                firstContentfulPaint: 0,
                largestContentfulPaint: 0,
                cumulativeLayoutShift: 0,
                firstInputDelay: 0,
                cacheEfficiency: 0,
                bundleSize: 0
            };
        }

        this.currentMetrics = { ...this.currentMetrics, ...updates };

        // Check thresholds and generate alerts
        this.checkThresholdsAndAlert(updates);

        // Add to metrics history
        const metrics = this.metricsSubject.value;
        metrics.push(this.currentMetrics);

        // Keep only last 100 metrics
        if (metrics.length > 100) {
            metrics.shift();
        }

        this.metricsSubject.next(metrics);
    }

    private checkThresholdsAndAlert(updates: Partial<PerformanceMetrics>): void {
        Object.keys(updates).forEach(key => {
            const metricKey = key as keyof PerformanceMetrics;
            const thresholdKey = key as keyof PerformanceThresholds;

            if (this.thresholds[thresholdKey] !== undefined && updates[metricKey] !== undefined) {
                const value = updates[metricKey] as number;
                const threshold = this.thresholds[thresholdKey];

                if (this.isMetricExceedingThreshold(metricKey, value, threshold)) {
                    const alert: PerformanceAlert = {
                        type: 'warning',
                        message: `${metricKey} is exceeding threshold: ${value} > ${threshold}`,
                        metric: metricKey,
                        value,
                        threshold,
                        timestamp: new Date()
                    };

                    this.alertsSubject.next(alert);
                }
            }
        });
    }

    private isMetricExceedingThreshold(metric: string, value: number, threshold: number): boolean {
        // For some metrics, lower is better (like response times)
        const lowerIsBetter = ['pageLoadTime', 'apiResponseTime', 'imageLoadTime', 'domContentLoaded',
            'firstPaint', 'firstContentfulPaint', 'largestContentfulPaint', 'firstInputDelay'];

        if (lowerIsBetter.includes(metric)) {
            return value > threshold;
        }

        // For others, higher is better (like cache hit rate)
        return value < threshold;
    }

    // Public methods
    getMetrics(): Observable<PerformanceMetrics[]> {
        return this.metricsSubject.asObservable();
    }

    getCurrentMetrics(): PerformanceMetrics | null {
        return this.currentMetrics;
    }

    getAlerts(): Observable<PerformanceAlert> {
        return this.alertsSubject.asObservable();
    }

    // Set custom thresholds
    setThresholds(thresholds: Partial<PerformanceThresholds>): void {
        this.thresholds = { ...this.thresholds, ...thresholds };
    }

    // Get performance recommendations
    getRecommendations(): string[] {
        const recommendations: string[] = [];

        if (!this.currentMetrics) return recommendations;

        if (this.currentMetrics.pageLoadTime > this.thresholds.pageLoadTime) {
            recommendations.push('Page load time is slow. Consider optimizing bundle size and critical resources.');
        }

        if (this.currentMetrics.apiResponseTime > this.thresholds.apiResponseTime) {
            recommendations.push('API response time is slow. Consider implementing better caching strategies.');
        }

        if (this.currentMetrics.imageLoadTime > this.thresholds.imageLoadTime) {
            recommendations.push('Image loading is slow. Consider implementing lazy loading and image optimization.');
        }

        if (this.currentMetrics.cacheEfficiency < this.thresholds.cacheHitRate) {
            recommendations.push('Cache efficiency is low. Consider improving caching strategies.');
        }

        if (this.currentMetrics.memoryUsage > this.thresholds.memoryUsage) {
            recommendations.push('Memory usage is high. Consider implementing memory cleanup and optimization.');
        }

        if (this.currentMetrics.errors > 0) {
            recommendations.push('Errors detected. Review error logs and implement better error handling.');
        }

        // Enhanced recommendations
        if (this.currentMetrics.largestContentfulPaint > this.thresholds.largestContentfulPaint) {
            recommendations.push('Largest Contentful Paint is slow. Optimize critical rendering path.');
        }

        if (this.currentMetrics.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
            recommendations.push('Cumulative Layout Shift is high. Avoid layout shifts during page load.');
        }

        if (this.currentMetrics.firstInputDelay > this.thresholds.firstInputDelay) {
            recommendations.push('First Input Delay is high. Optimize JavaScript execution and reduce main thread blocking.');
        }

        return recommendations;
    }

    // Generate performance report
    generateReport(): any {
        const metrics = this.metricsSubject.value;
        if (metrics.length === 0) return null;

        const latest = metrics[metrics.length - 1];
        const average = this.calculateAverages(metrics);

        return {
            current: latest,
            average,
            trends: this.calculateTrends(metrics),
            recommendations: this.getRecommendations(),
            thresholds: this.thresholds,
            generatedAt: new Date().toISOString()
        };
    }

    private calculateAverages(metrics: PerformanceMetrics[]): PerformanceMetrics {
        const sums = metrics.reduce((acc, metric) => ({
            pageLoadTime: acc.pageLoadTime + metric.pageLoadTime,
            apiResponseTime: acc.apiResponseTime + metric.apiResponseTime,
            imageLoadTime: acc.imageLoadTime + metric.imageLoadTime,
            cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
            memoryUsage: acc.memoryUsage + metric.memoryUsage,
            networkRequests: acc.networkRequests + metric.networkRequests,
            errors: acc.errors + metric.errors,
            timestamp: 0,
            // Enhanced metrics
            domContentLoaded: acc.domContentLoaded + metric.domContentLoaded,
            firstPaint: acc.firstPaint + metric.firstPaint,
            firstContentfulPaint: acc.firstContentfulPaint + metric.firstContentfulPaint,
            largestContentfulPaint: acc.largestContentfulPaint + metric.largestContentfulPaint,
            cumulativeLayoutShift: acc.cumulativeLayoutShift + metric.cumulativeLayoutShift,
            firstInputDelay: acc.firstInputDelay + metric.firstInputDelay,
            cacheEfficiency: acc.cacheEfficiency + metric.cacheEfficiency,
            bundleSize: acc.bundleSize + metric.bundleSize
        }), {
            pageLoadTime: 0,
            apiResponseTime: 0,
            imageLoadTime: 0,
            cacheHitRate: 0,
            memoryUsage: 0,
            networkRequests: 0,
            errors: 0,
            timestamp: 0,
            // Enhanced metrics
            domContentLoaded: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0,
            cacheEfficiency: 0,
            bundleSize: 0
        });

        const count = metrics.length;
        return {
            pageLoadTime: sums.pageLoadTime / count,
            apiResponseTime: sums.apiResponseTime / count,
            imageLoadTime: sums.imageLoadTime / count,
            cacheHitRate: sums.cacheHitRate / count,
            memoryUsage: sums.memoryUsage / count,
            networkRequests: sums.networkRequests / count,
            errors: sums.errors / count,
            timestamp: 0,
            // Enhanced metrics
            domContentLoaded: sums.domContentLoaded / count,
            firstPaint: sums.firstPaint / count,
            firstContentfulPaint: sums.firstContentfulPaint / count,
            largestContentfulPaint: sums.largestContentfulPaint / count,
            cumulativeLayoutShift: sums.cumulativeLayoutShift / count,
            firstInputDelay: sums.firstInputDelay / count,
            cacheEfficiency: sums.cacheEfficiency / count,
            bundleSize: sums.bundleSize / count
        };
    }

    private calculateTrends(metrics: PerformanceMetrics[]): any {
        if (metrics.length < 2) return {};

        const recent = metrics.slice(-10); // Last 10 metrics
        const older = metrics.slice(-20, -10); // Previous 10 metrics

        const recentAvg = this.calculateAverages(recent);
        const olderAvg = this.calculateAverages(older);

        return {
            pageLoadTime: this.calculateTrend(olderAvg.pageLoadTime, recentAvg.pageLoadTime),
            apiResponseTime: this.calculateTrend(olderAvg.apiResponseTime, recentAvg.apiResponseTime),
            imageLoadTime: this.calculateTrend(olderAvg.imageLoadTime, recentAvg.imageLoadTime),
            cacheHitRate: this.calculateTrend(olderAvg.cacheHitRate, recentAvg.cacheHitRate),
            memoryUsage: this.calculateTrend(olderAvg.memoryUsage, recentAvg.memoryUsage),
            // Enhanced trends
            domContentLoaded: this.calculateTrend(olderAvg.domContentLoaded, recentAvg.domContentLoaded),
            firstPaint: this.calculateTrend(olderAvg.firstPaint, recentAvg.firstPaint),
            firstContentfulPaint: this.calculateTrend(olderAvg.firstContentfulPaint, recentAvg.firstContentfulPaint),
            largestContentfulPaint: this.calculateTrend(olderAvg.largestContentfulPaint, recentAvg.largestContentfulPaint),
            cumulativeLayoutShift: this.calculateTrend(olderAvg.cumulativeLayoutShift, recentAvg.cumulativeLayoutShift),
            firstInputDelay: this.calculateTrend(olderAvg.firstInputDelay, recentAvg.firstInputDelay),
            cacheEfficiency: this.calculateTrend(olderAvg.cacheEfficiency, recentAvg.cacheEfficiency)
        };
    }

    private calculateTrend(oldValue: number, newValue: number): string {
        const change = ((newValue - oldValue) / oldValue) * 100;

        if (change > 10) return 'improving';
        if (change < -10) return 'degrading';
        return 'stable';
    }

    // Reset metrics
    resetMetrics(): void {
        this.metricsSubject.next([]);
        this.currentMetrics = null;
    }

    // Cleanup
    ngOnDestroy(): void {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
    }

    // Export performance data
    exportData(format: 'json' | 'csv' = 'json'): string {
        const metrics = this.metricsSubject.value;

        if (format === 'csv') {
            return this.convertToCSV(metrics);
        }

        return JSON.stringify(metrics, null, 2);
    }

    private convertToCSV(metrics: PerformanceMetrics[]): string {
        if (metrics.length === 0) return '';

        const headers = Object.keys(metrics[0]);
        const csvRows = [headers.join(',')];

        metrics.forEach(metric => {
            const values = headers.map(header => {
                const value = metric[header as keyof PerformanceMetrics];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }

    // Get performance score (0-100)
    getPerformanceScore(): number {
        if (!this.currentMetrics) return 0;

        let score = 100;
        const metrics = this.currentMetrics;

        // Deduct points for each metric that exceeds thresholds
        if (metrics.pageLoadTime > this.thresholds.pageLoadTime) {
            score -= 20;
        }
        if (metrics.apiResponseTime > this.thresholds.apiResponseTime) {
            score -= 15;
        }
        if (metrics.imageLoadTime > this.thresholds.imageLoadTime) {
            score -= 10;
        }
        if (metrics.cacheEfficiency < this.thresholds.cacheHitRate) {
            score -= 10;
        }
        if (metrics.memoryUsage > this.thresholds.memoryUsage) {
            score -= 10;
        }
        if (metrics.errors > 0) {
            score -= 15;
        }

        return Math.max(0, score);
    }
}
