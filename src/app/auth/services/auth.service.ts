// AuthService scaffold
// - login, register, requestReset, verifyReset, refresh, logout
// - Uses ApiService for network calls

import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { TokenStorageService } from '../../core/services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService, private tokenStorage: TokenStorageService) {}

  login(payload: { email: string; password: string }): Observable<any> {
    return this.api.request('post', '/auth/login', payload).pipe(
      tap((res: any) => {
        if (res?.token) this.tokenStorage.setToken(res.token);
        if (res?.refreshToken) this.tokenStorage.setRefreshToken(res.refreshToken);
      })
    );
  }

  register(payload: any): Observable<any> {
    return this.api.request('post', '/auth/register', payload);
  }

  requestReset(payload: { email: string }): Observable<any> {
    return this.api.request('post', '/auth/request-reset', payload);
  }

  verifyReset(payload: { email: string; code: string; password: string }): Observable<any> {
    return this.api.request('post', '/auth/verify-reset', payload);
  }

  refresh(refreshToken: string): Observable<any> {
    return this.api.request('post', '/auth/refresh', { refreshToken });
  }

  logout(): void {
    this.tokenStorage.clear();
    // TODO: navigate to login
  }
}
