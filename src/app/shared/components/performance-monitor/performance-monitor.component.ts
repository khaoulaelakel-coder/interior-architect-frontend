import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceService, PerformanceMetrics, PerformanceAlert } from '../../../services/performance.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-performance-monitor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './performance-monitor.component.html',
    styleUrls: ['./performance-monitor.component.css']
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
    metrics: PerformanceMetrics[] = [];
    currentMetrics: PerformanceMetrics | null = null;
    alerts: PerformanceAlert[] = [];
    performanceScore: number = 0;
    recommendations: string[] = [];
    showDetails: boolean = false;
    exportFormat: 'json' | 'csv' = 'json';

    private metricsSubscription: Subscription;
    private alertsSubscription: Subscription;

    constructor(private performanceService: PerformanceService) {
        this.metricsSubscription = new Subscription();
        this.alertsSubscription = new Subscription();
    }

    ngOnInit(): void {
        this.metricsSubscription = this.performanceService.getMetrics().subscribe(metrics => {
            this.metrics = metrics;
            this.currentMetrics = metrics[metrics.length - 1] || null;
            this.performanceScore = this.performanceService.getPerformanceScore();
            this.recommendations = this.performanceService.getRecommendations();
        });

        this.alertsSubscription = this.performanceService.getAlerts().subscribe(alert => {
            this.alerts.unshift(alert);
            // Keep only last 10 alerts
            if (this.alerts.length > 10) {
                this.alerts.pop();
            }
        });
    }

    ngOnDestroy(): void {
        this.metricsSubscription.unsubscribe();
        this.alertsSubscription.unsubscribe();
    }

    toggleDetails(): void {
        this.showDetails = !this.showDetails;
    }

    exportData(): void {
        const data = this.performanceService.exportData(this.exportFormat);
        const blob = new Blob([data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-data.${this.exportFormat}`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    resetMetrics(): void {
        this.performanceService.resetMetrics();
    }

    getScoreColor(score: number): string {
        if (score >= 80) return 'green';
        if (score >= 60) return 'orange';
        return 'red';
    }

    getAlertIcon(type: string): string {
        switch (type) {
            case 'warning': return '⚠️';
            case 'error': return '❌';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    }

    formatTime(ms: number | undefined): string {
        if (ms === undefined || ms === null) return 'N/A';
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }

    formatMemory(mb: number | undefined): string {
        if (mb === undefined || mb === null) return 'N/A';
        return `${mb.toFixed(2)}MB`;
    }

    formatPercentage(value: number | undefined): string {
        if (value === undefined || value === null) return 'N/A';
        return `${value.toFixed(1)}%`;
    }
}
