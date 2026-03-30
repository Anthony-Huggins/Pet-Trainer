import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Don't redirect during session restore or token refresh
        const isAuthEndpoint = req.url.includes('/auth/me') || req.url.includes('/auth/refresh');
        if (!isAuthEndpoint) {
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
