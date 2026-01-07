/**
 * NgRx Signal Stores - Centralized exports
 *
 * This barrel file exports all application stores
 * for convenient imports across the application.
 *
 * Usage:
 *   import { AuthStore, FamilyStore, UIStore } from '@app/stores';
 */

// Auth store
export { AuthStore, type AuthState, type AuthUser } from './auth.store';

// Family store
export { FamilyStore, type FamilyState } from './family.store';

// UI store
export { UIStore, type UIState, type Theme, type Language, type Toast } from './ui.store';
