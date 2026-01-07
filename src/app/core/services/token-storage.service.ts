/**
 * TokenStorageService - Secure token storage abstraction
 *
 * SECURITY NOTES:
 * - Access tokens are stored in memory (more secure against XSS)
 * - Refresh tokens use sessionStorage (cleared on tab close)
 * - For maximum security, consider HttpOnly cookies (requires backend changes)
 *
 * Trade-offs:
 * - Memory storage: Lost on page refresh (requires re-auth or refresh token flow)
 * - SessionStorage: Vulnerable to XSS but scoped to tab
 * - LocalStorage: Persistent but most vulnerable to XSS
 */
import { Injectable, signal, computed } from '@angular/core';

const REFRESH_KEY = 'app_refresh';
const TOKEN_KEY = 'app_token'; // For backward compatibility, will migrate

export interface StoredTokenInfo {
  token: string;
  storedAt: number;
}

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  /**
   * In-memory storage for access token (more secure against XSS)
   * Note: Will be lost on page refresh - use refresh token to restore session
   */
  private accessToken = signal<string | null>(null);

  /** Reactive signal indicating if a token is present */
  readonly hasToken = computed(() => !!this.accessToken());

  constructor() {
    // Migration: Check localStorage for existing token and move to memory
    this.migrateFromLocalStorage();
  }

  /**
   * One-time migration from localStorage to memory-based storage
   * Removes token from localStorage after reading
   */
  private migrateFromLocalStorage(): void {
    const legacyToken = localStorage.getItem(TOKEN_KEY);
    if (legacyToken) {
      // Set in memory
      this.accessToken.set(legacyToken);
      // Remove from localStorage for security
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  /**
   * Store the access token in memory
   * @param token - The JWT access token
   */
  setToken(token: string): void {
    if (!token || typeof token !== 'string') {
      console.warn('TokenStorageService: Invalid token provided');
      return;
    }
    this.accessToken.set(token);
  }

  /**
   * Get the current access token
   * @returns The stored token or null
   */
  getToken(): string | null {
    return this.accessToken();
  }

  /**
   * Store the refresh token in sessionStorage
   * SessionStorage is scoped to the browser tab and cleared on close
   * @param token - The refresh token
   */
  setRefreshToken(token: string): void {
    if (!token || typeof token !== 'string') {
      console.warn('TokenStorageService: Invalid refresh token provided');
      return;
    }
    try {
      sessionStorage.setItem(REFRESH_KEY, token);
    } catch (e) {
      console.error('TokenStorageService: Failed to store refresh token', e);
    }
  }

  /**
   * Get the stored refresh token
   * @returns The refresh token or null
   */
  getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Check if a refresh token exists
   */
  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  /**
   * Clear all stored tokens
   * Call this on logout or when tokens are invalidated
   */
  clear(): void {
    this.accessToken.set(null);
    try {
      sessionStorage.removeItem(REFRESH_KEY);
      // Also clean up any legacy localStorage tokens
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('TokenStorageService: Failed to clear tokens', e);
    }
  }

  /**
   * Store tokens from a login/refresh response
   * @param accessToken - The JWT access token
   * @param refreshToken - Optional refresh token
   */
  storeTokens(accessToken: string, refreshToken?: string): void {
    this.setToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }
}
