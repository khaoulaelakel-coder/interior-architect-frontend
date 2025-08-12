import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NavigationState {
    portfolioVisited: boolean;
    recentProjectsVisited: boolean;
    lastVisitTime: { [key: string]: number };
}

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private navigationState = new BehaviorSubject<NavigationState>({
        portfolioVisited: false,
        recentProjectsVisited: false,
        lastVisitTime: {}
    });

    constructor() {
        // Load state from localStorage if available
        this.loadState();
    }

    // Mark component as visited
    markComponentVisited(componentName: string): void {
        const currentState = this.navigationState.value;
        const updatedState = {
            ...currentState,
            lastVisitTime: {
                ...currentState.lastVisitTime,
                [componentName]: Date.now()
            }
        };

        // Set specific flags
        if (componentName === 'portfolio') {
            updatedState.portfolioVisited = true;
        } else if (componentName === 'recentProjects') {
            updatedState.recentProjectsVisited = true;
        }

        this.navigationState.next(updatedState);
        this.saveState();
    }

    // Check if component was recently visited (within 5 minutes)
    wasRecentlyVisited(componentName: string, thresholdMinutes: number = 5): boolean {
        const currentState = this.navigationState.value;
        const lastVisit = currentState.lastVisitTime[componentName];

        if (!lastVisit) return false;

        const thresholdMs = thresholdMinutes * 60 * 1000;
        return (Date.now() - lastVisit) < thresholdMs;
    }

    // Get current navigation state
    getNavigationState(): NavigationState {
        return this.navigationState.value;
    }

    // Reset navigation state (useful for logout or clear cache)
    resetNavigationState(): void {
        this.navigationState.next({
            portfolioVisited: false,
            recentProjectsVisited: false,
            lastVisitTime: {}
        });
        this.saveState();
    }

    // Check if we should skip data fetching (data was recently loaded)
    shouldSkipDataFetch(componentName: string): boolean {
        return this.wasRecentlyVisited(componentName, 5); // 5 minutes threshold
    }

    private saveState(): void {
        try {
            localStorage.setItem('navigationState', JSON.stringify(this.navigationState.value));
        } catch (error) {
            console.warn('Could not save navigation state to localStorage:', error);
        }
    }

    private loadState(): void {
        try {
            const savedState = localStorage.getItem('navigationState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                this.navigationState.next(parsedState);
            }
        } catch (error) {
            console.warn('Could not load navigation state from localStorage:', error);
        }
    }
}
