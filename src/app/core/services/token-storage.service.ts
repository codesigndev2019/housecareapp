// TokenStorageService scaffold
// - Abstraction over localStorage/sessionStorage/IndexedDB (start with localStorage)
// - Methods: setToken, getToken, setRefreshToken, getRefreshToken, clear

import { Injectable } from '@angular/core';

const TOKEN_KEY = 'app_token';
const REFRESH_KEY = 'app_refresh';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}
