// JWT Interceptor (scaffold)
// - Attach Authorization: Bearer <token>
// - Handle 401 responses (attempt refresh via AuthService)
// - TODO: avoid infinite refresh loops

import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, switchMap, catchError, of } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private tokenStorage: TokenStorageService, private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenStorage.getToken();
    let cloned = req;
    if (token) {
      cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(cloned).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401 && !req.headers.get('x-refresh-attempt')) {
          const refreshToken = this.tokenStorage.getRefreshToken();
          if (refreshToken) {
            return this.auth.refresh(refreshToken).pipe(
              switchMap((res: any) => {
                if (res?.token) this.tokenStorage.setToken(res.token);
                const retry = req.clone({ setHeaders: { Authorization: `Bearer ${res?.token}`, 'x-refresh-attempt': '1' } });
                return next.handle(retry);
              }),
              catchError((refreshErr) => {
                this.tokenStorage.clear();
                this.router.navigate(['/auth/login']);
                return throwError(() => refreshErr);
              })
            );
          } else {
            this.tokenStorage.clear();
            this.router.navigate(['/auth/login']);
            return throwError(() => err);
          }
        }
        return throwError(() => err);
      })
    );
  }
}
