import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Chore, ChoreFrequency } from './models/chore.model';
import { BaseCrudService } from '../shared/base/base-crud.service';

/** Initial sample data for development */
const INITIAL_CHORES: Chore[] = [
  {
    id: 'ch1',
    name: 'Lavar los platos',
    responsibleId: '',
    frequency: 'daily',
    completed: false,
    active: true
  },
  {
    id: 'ch2',
    name: 'Barrer la casa',
    responsibleId: '',
    frequency: 'twice-weekly',
    completed: true,
    active: true
  },
  {
    id: 'ch3',
    name: 'Limpiar baños',
    responsibleId: '',
    frequency: 'weekly',
    completed: false,
    active: true
  },
  {
    id: 'ch4',
    name: 'Sacar la basura',
    responsibleId: '',
    frequency: 'daily',
    completed: true,
    active: true
  },
  {
    id: 'ch5',
    name: 'Tender las camas',
    responsibleId: '',
    frequency: 'daily',
    completed: false,
    active: true
  }
];

/**
 * ChoresService - Manages household chores/tasks
 *
 * Extends BaseCrudService for common CRUD operations
 * and adds chore-specific functionality like toggle completed.
 */
@Injectable({ providedIn: 'root' })
export class ChoresService extends BaseCrudService<Chore> {
  constructor() {
    super(INITIAL_CHORES);
  }

  /**
   * Build a new Chore entity from partial data
   */
  protected buildEntity(payload: Partial<Chore>): Chore {
    return {
      id: this.generateId(),
      name: payload.name || '',
      responsibleId: payload.responsibleId || '',
      frequency: payload.frequency || 'weekly',
      completed: payload.completed ?? false,
      active: payload.active ?? true
    };
  }

  /**
   * Toggle the completed status of a chore
   * @param id - Chore ID
   * @returns Observable of updated chore or undefined
   */
  toggleCompleted(id: string): Observable<Chore | undefined> {
    const chore = this.data.find(c => c.id === id);
    if (!chore) {
      return of(undefined);
    }
    return this.update(id, { completed: !chore.completed });
  }

  /**
   * Get all pending (not completed) chores
   */
  getPending(): Observable<Chore[]> {
    return this.filter(chore => !chore.completed && chore.active);
  }

  /**
   * Get chores by frequency
   */
  getByFrequency(frequency: ChoreFrequency): Observable<Chore[]> {
    return this.filter(chore => chore.frequency === frequency && chore.active);
  }
}
