import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceService } from '../../../services/performance.service';

@Component({
    selector: 'app-performance-demo',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './performance-demo.component.html',
    styleUrls: ['./performance-demo.component.css']
})
export class PerformanceDemoComponent implements OnInit {

    constructor(private performanceService: PerformanceService) { }

    ngOnInit(): void {
        // Simulate some performance data for demo purposes
        this.simulatePerformanceData();
    }

    simulatePerformanceData(): void {
        // Simulate page load time
        setTimeout(() => {
            this.performanceService['updateMetrics']({ pageLoadTime: 2500 });
        }, 1000);

        // Simulate API response time
        setTimeout(() => {
            this.performanceService['updateMetrics']({ apiResponseTime: 1800 });
        }, 2000);

        // Simulate image load time
        setTimeout(() => {
            this.performanceService['updateMetrics']({ imageLoadTime: 1200 });
        }, 3000);

        // Simulate memory usage
        setTimeout(() => {
            this.performanceService['updateMetrics']({ memoryUsage: 85 });
        }, 4000);

        // Simulate cache efficiency
        setTimeout(() => {
            this.performanceService['updateMetrics']({ cacheEfficiency: 75 });
        }, 5000);

        // Simulate some errors
        setTimeout(() => {
            this.performanceService['updateMetrics']({ errors: 2 });
        }, 6000);
    }

    simulateSlowPerformance(): void {
        this.performanceService['updateMetrics']({
            pageLoadTime: 5000,
            apiResponseTime: 4000,
            imageLoadTime: 3000,
            memoryUsage: 150,
            cacheEfficiency: 45
        });
    }

    simulateGoodPerformance(): void {
        this.performanceService['updateMetrics']({
            pageLoadTime: 1500,
            apiResponseTime: 800,
            imageLoadTime: 500,
            memoryUsage: 60,
            cacheEfficiency: 90
        });
    }

    resetSimulation(): void {
        this.performanceService.resetMetrics();
    }
}
