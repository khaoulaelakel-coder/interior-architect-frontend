import { ApplicationConfig } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { AuthInterceptor } from './Admin/Auth/auth.interceptor';
import { PerformanceService } from './services/performance.service';
import { IOSCompatibilityService } from './services/ios-compatibility.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const interceptor = new AuthInterceptor();
          // Adapt next (HttpHandlerFn) to HttpHandler for the interceptor
          const handler = { handle: next } as any;
          return interceptor.intercept(req, handler);
        }
      ])
    ),
    provideAnimations(),
    PerformanceService,
    IOSCompatibilityService
  ]
};
