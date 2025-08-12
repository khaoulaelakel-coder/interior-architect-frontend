import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const router = inject(Router);

    const authToken = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';

    if (authToken) {
      const headers: any = {
        'Authorization': `${tokenType} ${authToken}`,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };

      if (!(request.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      request = request.clone({
        setHeaders: headers
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Only redirect to login if it's an admin API call (POST, PUT, DELETE operations)
          const isAdminApiCall = request.url.includes('/api/') &&
            (request.url.includes('/admin/') ||
              (request.url.includes('/projects') && request.method !== 'GET') ||
              (request.url.includes('/category') && request.method !== 'GET') ||
              (request.url.includes('/skills') && request.method !== 'GET') ||
              request.url.includes('/education') ||
              request.url.includes('/experience'));

          if (isAdminApiCall) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_type');
            localStorage.removeItem('user');
            router.navigate(['/admin/login']);
          }
        }

        return throwError(() => error);
      })
    );
  }
}
