/**
 * FamilyStore - Signal-based family members state management
 *
 * Features:
 * - Centralized family member data
 * - Reactive member lookup by ID
 * - Caching for performance
 * - Loading and error states
 * - CRUD operation tracking
 *
 * Usage:
 *   const familyStore = inject(FamilyStore);
 *   familyStore.loadMembers();
 *   familyStore.getMemberName('id'); // returns member name
 */
import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState
} from '@ngrx/signals';
import { FamilyMember } from '../family/models/family-member.model';
import { FamilyService } from '../family/family.service';
import { take } from 'rxjs';

/** Family state shape */
export interface FamilyState {
  members: FamilyMember[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

/** Initial family state */
const initialState: FamilyState = {
  members: [],
  loading: false,
  error: null,
  lastUpdated: null
};

/** Cache duration in milliseconds (5 minutes) */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * FamilyStore - NgRx Signal Store for family members
 *
 * Provides reactive state management for:
 * - Family member list
 * - Member lookup operations
 * - CRUD tracking
 */
export const FamilyStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    /**
     * Total number of family members
     */
    memberCount: computed(() => store.members().length),

    /**
     * Active family members only
     */
    activeMembers: computed(() =>
      store.members().filter(m => m.active !== false)
    ),

    /**
     * Whether data is stale and needs refresh
     */
    isStale: computed(() => {
      const lastUpdated = store.lastUpdated();
      if (!lastUpdated) return true;
      return Date.now() - lastUpdated > CACHE_DURATION;
    }),

    /**
     * Map of member ID to member object for fast lookup
     */
    memberMap: computed(() => {
      const map = new Map<string, FamilyMember>();
      for (const member of store.members()) {
        if (member.id) {
          map.set(member.id, member);
        }
      }
      return map;
    }),

    /**
     * Whether data is currently loading
     */
    isLoading: computed(() => store.loading()),

    /**
     * Whether data has been loaded at least once
     */
    hasData: computed(() => store.members().length > 0)
  })),

  withMethods((store) => {
    const familyService = inject(FamilyService);

    return {
      /**
       * Load family members from API
       */
      loadMembers(forceRefresh = false): void {
        // Skip if already loading
        if (store.loading()) return;

        // Skip if data is fresh and not forcing refresh
        if (!forceRefresh && !store.isStale() && store.hasData()) return;

        patchState(store, { loading: true, error: null });

        familyService.list().pipe(take(1)).subscribe({
          next: (members) => {
            patchState(store, {
              members,
              loading: false,
              lastUpdated: Date.now()
            });
          },
          error: (err) => {
            patchState(store, {
              loading: false,
              error: err.message || 'Failed to load family members'
            });
          }
        });
      },

      /**
       * Get member by ID
       */
      getMember(id: string): FamilyMember | undefined {
        return store.memberMap().get(id);
      },

      /**
       * Get member name by ID
       */
      getMemberName(id: string): string {
        const member = store.memberMap().get(id);
        return member?.fullName ?? member?.email ?? id;
      },

      /**
       * Get multiple member names
       */
      getMemberNames(ids: string[]): string[] {
        return ids.map(id => this.getMemberName(id));
      },

      /**
       * Add a new member to local state
       */
      addMember(member: FamilyMember): void {
        patchState(store, {
          members: [...store.members(), member]
        });
      },

      /**
       * Update a member in local state
       */
      updateMember(id: string, updates: Partial<FamilyMember>): void {
        patchState(store, {
          members: store.members().map(m =>
            m.id === id ? { ...m, ...updates } : m
          )
        });
      },

      /**
       * Remove a member from local state
       */
      removeMember(id: string): void {
        patchState(store, {
          members: store.members().filter(m => m.id !== id)
        });
      },

      /**
       * Clear all data
       */
      clear(): void {
        patchState(store, initialState);
      },

      /**
       * Set error state
       */
      setError(error: string | null): void {
        patchState(store, { error });
      }
    };
  })
);
