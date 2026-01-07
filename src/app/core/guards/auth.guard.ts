/**
 * Authentication Guard
 *
 * Protects routes requiring authentication by:
 * 1. Checking if a token exists
 * 2. Validating the token is not expired
 * 3. Redirecting to login if authentication fails
 *
 * Supports both functional guard (recommended) and class-based guard (legacy)
 */
import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateFn, Router, UrlTree } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { JwtService } from '../services/jwt.service';

/**
 * Functional guard (recommended for Angular 16+)
 * Usage: canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const tokenStorage = inject(TokenStorageService);
  const jwtService = inject(JwtService);
  const router = inject(Router);

  const token = tokenStorage.getToken();

  // No token present
  if (!token) {
    return router.createUrlTree(['/auth/login']);
  }

  // Token expired or invalid
  if (!jwtService.isTokenValid(token)) {
    // Clear invalid tokens
    tokenStorage.clear();
    return router.createUrlTree(['/auth/login'], {
      queryParams: { reason: 'session_expired' }
    });
  }

  return true;
};

/**
 * Class-based guard (legacy, for backward compatibility)
 * @deprecated Use authGuard functional guard instead
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private tokenStorage = inject(TokenStorageService);
  private jwtService = inject(JwtService);
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    const token = this.tokenStorage.getToken();

    if (!token) {
      return this.router.createUrlTree(['/auth/login']);
    }

    if (!this.jwtService.isTokenValid(token)) {
      this.tokenStorage.clear();
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { reason: 'session_expired' }
      });
    }

    return true;
  }
}
