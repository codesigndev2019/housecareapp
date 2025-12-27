// AuthGuard scaffold
// - Protect routes and redirect to /auth/login if not authenticated

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private tokenStorage: TokenStorageService, private router: Router) {}

  canActivate(): boolean {
    const token = this.tokenStorage.getToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true; // TODO: validate token expiration
  }
}
