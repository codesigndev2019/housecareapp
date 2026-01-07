import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BudgetMovement, BudgetSummary, Currency, MovementType } from './models/budget.model';
import { BaseCrudService } from '../shared/base/base-crud.service';

/** Initial sample data for development */
const INITIAL_MOVEMENTS: BudgetMovement[] = [
  {
    id: 'bm1',
    name: 'Salario mensual',
    description: 'Ingreso principal del hogar',
    currency: 'USD',
    amount: 3500,
    movementType: 'income',
    categoryId: 'cat1',
    isFixed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'bm2',
    name: 'Alquiler',
    description: 'Pago mensual de alquiler',
    currency: 'USD',
    amount: 1200,
    movementType: 'expense',
    categoryId: 'cat2',
    isFixed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'bm3',
    name: 'Electricidad',
    description: 'Pago del servicio eléctrico',
    currency: 'USD',
    amount: 150,
    movementType: 'expense',
    categoryId: 'cat3',
    isFixed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'bm4',
    name: 'Supermercado',
    description: 'Compras semanales',
    currency: 'USD',
    amount: 400,
    movementType: 'expense',
    categoryId: 'cat4',
    isFixed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'bm5',
    name: 'Freelance',
    description: 'Trabajo extra freelance',
    currency: 'USD',
    amount: 800,
    movementType: 'income',
    categoryId: 'cat5',
    isFixed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  },
  {
    id: 'bm6',
    name: 'Internet',
    description: 'Servicio de internet fibra óptica',
    currency: 'USD',
    amount: 60,
    movementType: 'expense',
    categoryId: 'cat6',
    isFixed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true
  }
];

/**
 * BudgetService - Manages household budget movements
 *
 * Extends BaseCrudService for common CRUD operations
 * and adds budget-specific functionality like summaries.
 */
@Injectable({ providedIn: 'root' })
export class BudgetService extends BaseCrudService<BudgetMovement> {
  constructor() {
    super(INITIAL_MOVEMENTS);
  }

  /**
   * Build a new BudgetMovement entity from partial data
   */
  protected buildEntity(payload: Partial<BudgetMovement>): BudgetMovement {
    const now = new Date().toISOString();
    return {
      id: this.generateId(),
      name: payload.name || '',
      description: payload.description || '',
      currency: payload.currency || 'USD',
      amount: payload.amount || 0,
      movementType: payload.movementType || 'expense',
      categoryId: payload.categoryId || '',
      isFixed: payload.isFixed ?? false,
      createdAt: now,
      updatedAt: now,
      active: payload.active ?? true
    };
  }

  /**
   * Override update to set updatedAt timestamp
   */
  override update(id: string, payload: Partial<BudgetMovement>): Observable<BudgetMovement | undefined> {
    return super.update(id, { ...payload, updatedAt: new Date().toISOString() });
  }

  /**
   * Get all income movements
   */
  getIncomes(): Observable<BudgetMovement[]> {
    return this.filter(m => m.movementType === 'income' && m.active);
  }

  /**
   * Get all expense movements
   */
  getExpenses(): Observable<BudgetMovement[]> {
    return this.filter(m => m.movementType === 'expense' && m.active);
  }

  /**
   * Get all fixed movements
   */
  getFixed(): Observable<BudgetMovement[]> {
    return this.filter(m => m.isFixed && m.active);
  }

  /**
   * Get movements by type
   */
  getByType(type: MovementType): Observable<BudgetMovement[]> {
    return this.filter(m => m.movementType === type && m.active);
  }

  /**
   * Get budget summary (totals and balance)
   * @param currency - Currency to calculate summary for
   */
  getSummary(currency: Currency = 'USD'): Observable<BudgetSummary> {
    return this.list().pipe(
      map(movements => {
        const activeMovements = movements.filter(m => m.active && m.currency === currency);
        
        const totalIncome = activeMovements
          .filter(m => m.movementType === 'income')
          .reduce((sum, m) => sum + m.amount, 0);
        
        const totalExpenses = activeMovements
          .filter(m => m.movementType === 'expense')
          .reduce((sum, m) => sum + m.amount, 0);
        
        return {
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          currency
        };
      })
    );
  }

  /**
   * Get all currencies used in movements
   */
  getUsedCurrencies(): Observable<Currency[]> {
    return this.list().pipe(
      map(movements => {
        const currencies = new Set(movements.map(m => m.currency));
        return Array.from(currencies);
      })
    );
  }

  /**
   * Toggle the active status of a movement
   */
  toggleActive(id: string): Observable<BudgetMovement | undefined> {
    const movement = this.data.find(m => m.id === id);
    if (!movement) {
      return this.get(id);
    }
    return this.update(id, { active: !movement.active });
  }
}
