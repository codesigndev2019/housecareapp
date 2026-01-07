import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FamilyMember } from './models/family-member.model';
import { BaseCrudService } from '../shared/base/base-crud.service';

/** Initial sample data for development */
const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fm1',
    fullName: 'María Pérez',
    birthday: '1985-04-12',
    relation: 'Madre',
    phone: '555-1234',
    email: 'maria@example.com',
    accountType: 'editor',
    active: true
  },
  {
    id: 'fm2',
    fullName: 'Carlos Pérez',
    birthday: '2010-08-02',
    relation: 'Hijo',
    phone: '555-5678',
    email: 'carlos@example.com',
    accountType: 'read',
    active: true
  }
];

/**
 * FamilyService - Manages family members
 *
 * Extends BaseCrudService for common CRUD operations
 * and adds family-specific functionality like activate/deactivate.
 */
@Injectable({ providedIn: 'root' })
export class FamilyService extends BaseCrudService<FamilyMember> {
  constructor() {
    super(INITIAL_FAMILY_MEMBERS);
  }

  /**
   * Build a new FamilyMember entity from partial data
   */
  protected buildEntity(payload: Partial<FamilyMember>): FamilyMember {
    return {
      id: this.generateId(),
      fullName: payload.fullName || '',
      birthday: payload.birthday,
      relation: payload.relation,
      phone: payload.phone,
      email: payload.email,
      accountType: payload.accountType || 'read',
      active: payload.active ?? true
    };
  }

  /**
   * Deactivate a family member (soft delete)
   * @param id - Member ID
   */
  deactivate(id: string): Observable<boolean> {
    const member = this.data.find(m => m.id === id);
    if (!member) {
      return of(false);
    }
    this.update(id, { active: false });
    return of(true);
  }

  /**
   * Activate a family member
   * @param id - Member ID
   */
  activate(id: string): Observable<boolean> {
    const member = this.data.find(m => m.id === id);
    if (!member) {
      return of(false);
    }
    this.update(id, { active: true });
    return of(true);
  }

  /**
   * Get active family members only
   */
  getActive(): Observable<FamilyMember[]> {
    return this.filter(member => member.active);
  }

  /**
   * Get family member by email
   */
  getByEmail(email: string): Observable<FamilyMember | undefined> {
    return of(this.data.find(m => m.email === email));
  }
}
