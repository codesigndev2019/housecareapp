/**
 * UIStore - Signal-based UI state management
 *
 * Features:
 * - Theme management (light/dark)
 * - Language selection
 * - Sidebar state
 * - Loading states
 * - Toast notifications
 * - Breakpoint detection
 *
 * Usage:
 *   const uiStore = inject(UIStore);
 *   uiStore.toggleTheme();
 *   uiStore.theme(); // 'light' | 'dark'
 */
import { computed, effect, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
  withHooks
} from '@ngrx/signals';
import { DOCUMENT } from '@angular/common';

/** Theme options */
export type Theme = 'light' | 'dark';

/** Language options */
export type Language = 'en' | 'es';

/** Toast notification */
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

/** UI state shape */
export interface UIState {
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  globalLoading: boolean;
  toasts: Toast[];
  isMobile: boolean;
}

/** Initial UI state */
const initialState: UIState = {
  theme: 'light',
  language: 'en',
  sidebarOpen: true,
  sidebarCollapsed: false,
  globalLoading: false,
  toasts: [],
  isMobile: false
};

/** Storage keys */
const THEME_KEY = 'app-theme';
const LANGUAGE_KEY = 'app-language';
const SIDEBAR_KEY = 'sidebar-collapsed';

/**
 * UIStore - NgRx Signal Store for UI state
 *
 * Provides reactive state management for:
 * - Theme switching with persistence
 * - Language selection
 * - Sidebar behavior
 * - Global loading states
 * - Toast notifications
 */
export const UIStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    /**
     * Whether dark theme is active
     */
    isDark: computed(() => store.theme() === 'dark'),

    /**
     * Whether light theme is active
     */
    isLight: computed(() => store.theme() === 'light'),

    /**
     * Current language code
     */
    currentLanguage: computed(() => store.language()),

    /**
     * Whether sidebar is visible
     */
    isSidebarVisible: computed(() =>
      store.sidebarOpen() && !store.isMobile()
    ),

    /**
     * Active toast notifications
     */
    activeToasts: computed(() => store.toasts()),

    /**
     * Whether there are any toasts showing
     */
    hasToasts: computed(() => store.toasts().length > 0)
  })),

  withMethods((store) => {
    // We'll inject document in hooks

    return {
      /**
       * Initialize UI state from localStorage
       */
      initialize(document: Document): void {
        // Load theme
        const savedTheme = localStorage.getItem(THEME_KEY) as Theme;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');

        // Load language
        const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language;
        const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
        const language = savedLanguage || browserLang;

        // Load sidebar state
        const savedSidebar = localStorage.getItem(SIDEBAR_KEY);
        const sidebarCollapsed = savedSidebar === 'true';

        // Check mobile
        const isMobile = window.innerWidth < 768;

        patchState(store, {
          theme,
          language,
          sidebarCollapsed,
          sidebarOpen: !isMobile,
          isMobile
        });

        // Apply theme to document
        applyTheme(document, theme);
      },

      /**
       * Set theme
       */
      setTheme(theme: Theme, document: Document): void {
        localStorage.setItem(THEME_KEY, theme);
        patchState(store, { theme });
        applyTheme(document, theme);
      },

      /**
       * Toggle between light and dark theme
       */
      toggleTheme(document: Document): void {
        const newTheme = store.theme() === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme, document);
      },

      /**
       * Set language
       */
      setLanguage(language: Language): void {
        localStorage.setItem(LANGUAGE_KEY, language);
        patchState(store, { language });
      },

      /**
       * Toggle sidebar open/closed
       */
      toggleSidebar(): void {
        patchState(store, { sidebarOpen: !store.sidebarOpen() });
      },

      /**
       * Toggle sidebar collapsed state
       */
      toggleSidebarCollapsed(): void {
        const newState = !store.sidebarCollapsed();
        localStorage.setItem(SIDEBAR_KEY, String(newState));
        patchState(store, { sidebarCollapsed: newState });
      },

      /**
       * Set sidebar open state
       */
      setSidebarOpen(open: boolean): void {
        patchState(store, { sidebarOpen: open });
      },

      /**
       * Set global loading state
       */
      setGlobalLoading(loading: boolean): void {
        patchState(store, { globalLoading: loading });
      },

      /**
       * Update mobile detection
       */
      setMobile(isMobile: boolean): void {
        patchState(store, {
          isMobile,
          sidebarOpen: !isMobile
        });
      },

      /**
       * Show a toast notification
       */
      showToast(message: string, type: Toast['type'] = 'info', duration = 5000): void {
        const toast: Toast = {
          id: generateId(),
          message,
          type,
          duration
        };

        patchState(store, { toasts: [...store.toasts(), toast] });

        // Auto-remove after duration
        if (duration > 0) {
          setTimeout(() => {
            this.removeToast(toast.id);
          }, duration);
        }
      },

      /**
       * Remove a toast notification
       */
      removeToast(id: string): void {
        patchState(store, {
          toasts: store.toasts().filter(t => t.id !== id)
        });
      },

      /**
       * Clear all toasts
       */
      clearToasts(): void {
        patchState(store, { toasts: [] });
      },

      /**
       * Show success toast
       */
      success(message: string): void {
        this.showToast(message, 'success');
      },

      /**
       * Show error toast
       */
      error(message: string): void {
        this.showToast(message, 'error', 8000);
      },

      /**
       * Show warning toast
       */
      warning(message: string): void {
        this.showToast(message, 'warning');
      },

      /**
       * Show info toast
       */
      info(message: string): void {
        this.showToast(message, 'info');
      }
    };
  })
);

/**
 * Apply theme to document body
 */
function applyTheme(document: Document, theme: Theme): void {
  const body = document.body;
  body.classList.remove('light-theme', 'dark-theme');
  body.classList.add(`${theme}-theme`);
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
