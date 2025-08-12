import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
    private storedRoutes = new Map<string, DetachedRouteHandle>();

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        // Only detach CategoryProjectsComponent
        return route.component?.name === 'CategoryProjectsComponent';
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
        if (handle) {
            const key = this.getRouteKey(route);
            console.log('💾 STORING ROUTE:', key);
            this.storedRoutes.set(key, handle);
        }
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const key = this.getRouteKey(route);
        const hasStoredRoute = this.storedRoutes.has(key);
        console.log('🔄 SHOULD ATTACH ROUTE:', key, 'has stored:', hasStoredRoute);
        return hasStoredRoute;
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        const key = this.getRouteKey(route);
        const storedRoute = this.storedRoutes.get(key);
        console.log('📦 RETRIEVING STORED ROUTE:', key, 'found:', !!storedRoute);
        return storedRoute || null;
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        const shouldReuse = future.routeConfig === curr.routeConfig;
        console.log('🔄 SHOULD REUSE ROUTE:', shouldReuse, 'future:', future.url, 'current:', curr.url);
        return shouldReuse;
    }

    private getRouteKey(route: ActivatedRouteSnapshot): string {
        const categoryId = route.paramMap.get('id');
        return `category_${categoryId}`; // Key based on category ID
    }

    clearStoredRoutes(): void {
        console.log('🧹 CLEARING STORED ROUTES');
        this.storedRoutes.clear();
    }
}
