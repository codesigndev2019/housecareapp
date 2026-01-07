/**
 * FamilyResolverService - Centralized service for resolving family member IDs to names
 *
 * This service provides a single source of truth for family member name resolution,
 * eliminating duplicate code in ChoreCardComponent, EventCardComponent, etc.
 *
 * Features:
 * - Signal-based reactive state
 * - Cached lookups for performance
 * - Observable and synchronous access patterns
 */
import { Injectable, signal, computed, inject } from '@angular/core';
import { FamilyService } from '../../family/family.service';
import { FamilyMember } from '../../family/models/family-member.model';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FamilyResolverService {
  private readonly familyService = inject(FamilyService);

  /** Signal holding the map of member ID to full name */
  private readonly memberMap = signal<Map<string, string>>(new Map());

  /** Signal holding full member data by ID */
  private readonly memberDataMap = signal<Map<string, FamilyMember>>(new Map());

  /** Computed signal for checking if data is loaded */
  readonly isLoaded = computed(() => this.memberMap().size > 0);

  constructor() {
    // Subscribe to family members and maintain the lookup maps
    this.familyService.list().subscribe(members => {
      const nameMap = new Map<string, string>();
      const dataMap = new Map<string, FamilyMember>();

      members.forEach(member => {
        nameMap.set(member.id, member.fullName);
        dataMap.set(member.id, member);
      });

      this.memberMap.set(nameMap);
      this.memberDataMap.set(dataMap);
    });
  }

  /**
   * Resolve a member ID to their full name (synchronous)
   * Returns the ID if member not found
   * @param id - Member ID
   * @returns Full name or ID as fallback
   */
  resolveName(id: string): string {
    if (!id) return '';
    return this.memberMap().get(id) || id;
  }

  /**
   * Resolve multiple member IDs to names
   * @param ids - Array of member IDs
   * @returns Array of full names
   */
  resolveNames(ids: string[]): string[] {
    if (!ids || !Array.isArray(ids)) return [];
    return ids.map(id => this.resolveName(id));
  }

  /**
   * Get a member's full data by ID
   * @param id - Member ID
   * @returns FamilyMember or undefined
   */
  getMember(id: string): FamilyMember | undefined {
    return this.memberDataMap().get(id);
  }

  /**
   * Resolve member name as Observable (reactive)
   * @param id - Member ID
   * @returns Observable of full name
   */
  resolveName$(id: string): Observable<string> {
    return this.familyService.list().pipe(
      map(members => {
        const member = members.find(m => m.id === id);
        return member?.fullName || id || '';
      })
    );
  }

  /**
   * Resolve multiple member names as Observable (reactive)
   * @param ids - Array of member IDs
   * @returns Observable of full names array
   */
  resolveNames$(ids: string[]): Observable<string[]> {
    return this.familyService.list().pipe(
      map(members => {
        const nameMap = new Map(members.map(m => [m.id, m.fullName]));
        return (ids || []).map(id => nameMap.get(id) || id);
      })
    );
  }

  /**
   * Get all active family members
   * @returns Observable of active members
   */
  getActiveMembers(): Observable<FamilyMember[]> {
    return this.familyService.list().pipe(
      map(members => members.filter(m => m.active))
    );
  }
}
