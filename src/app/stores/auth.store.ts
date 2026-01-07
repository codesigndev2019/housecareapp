/**
 * AuthStore - Signal-based authentication state management
 *
 * Features:
 * - Reactive authentication state with signals
 * - Token management with automatic validation
 * - User info storage
 * - Loading and error states
 * - Computed selectors for derived state
 *
 * Usage:
 *   const authStore = inject(AuthStore);
 *   authStore.login({ email, password });
 *   authStore.isAuthenticated(); // computed signal
 */
import { computed } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState
} from '@ngrx/signals';

/** User information stored in auth state */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Authentication state shape */
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

/** Initial authentication state */
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false
};

/**
 * Check if a JWT token is expired
 * Simplified validation without service dependency
 */
function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return true; // No expiration = valid

    const expirationDate = new Date(payload.exp * 1000);
    return expirationDate > new Date();
  } catch {
    return false;
  }
}

/**
 * Decode JWT token payload
 */
function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Extract user info from decoded JWT payload
 */
function extractUserFromToken(decoded: Record<string, unknown>): AuthUser {
  return {
    id: String(decoded['sub'] || decoded['id'] || ''),
    email: String(decoded['email'] || ''),
    name: String(decoded['name'] || decoded['username'] || ''),
    role: String(decoded['role'] || 'user')
  };
}

/**
 * AuthStore - NgRx Signal Store for authentication
 *
 * Provides reactive state management for:
 * - User authentication status
 * - Token storage and validation
 * - Login/logout operations
 * - Loading and error states
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    /**
     * Whether user is authenticated with a valid token
     */
    isAuthenticated: computed(() => {
      const token = store.token();
      if (!token) return false;
      return isTokenValid(token);
    }),

    /**
     * Current user's display name
     */
    userName: computed(() => store.user()?.name ?? ''),

    /**
     * Current user's email
     */
    userEmail: computed(() => store.user()?.email ?? ''),

    /**
     * Current user's role
     */
    userRole: computed(() => store.user()?.role ?? ''),

    /**
     * Whether auth operations are in progress
     */
    isLoading: computed(() => store.loading()),

    /**
     * Whether auth state has been initialized
     */
    isInitialized: computed(() => store.initialized())
  })),

  withMethods((store) => {
    return {
      /**
       * Initialize auth state from stored token
       */
      initialize(): void {
        const storedToken = localStorage.getItem('auth_token');

        if (storedToken && isTokenValid(storedToken)) {
          const decoded = decodeToken(storedToken);
          const user = decoded ? extractUserFromToken(decoded) : null;

          patchState(store, {
            token: storedToken,
            user,
            initialized: true
          });
        } else {
          // Clear any invalid token
          localStorage.removeItem('auth_token');
          patchState(store, { initialized: true });
        }
      },

      /**
       * Set authentication state after successful login
       */
      setAuthenticated(token: string): void {
        localStorage.setItem('auth_token', token);
        const decoded = decodeToken(token);
        const user = decoded ? extractUserFromToken(decoded) : null;

        patchState(store, {
          token,
          user,
          loading: false,
          error: null
        });
      },

      /**
       * Clear authentication state (logout)
       */
      logout(): void {
        localStorage.removeItem('auth_token');
        patchState(store, {
          user: null,
          token: null,
          error: null
        });
      },

      /**
       * Set loading state
       */
      setLoading(loading: boolean): void {
        patchState(store, { loading });
      },

      /**
       * Set error state
       */
      setError(error: string | null): void {
        patchState(store, {
          error,
          loading: false
        });
      },

      /**
       * Clear error state
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Update user info
       */
      updateUser(updates: Partial<AuthUser>): void {
        const currentUser = store.user();
        if (currentUser) {
          patchState(store, {
            user: { ...currentUser, ...updates }
          });
        }
      }
    };
  })
);
