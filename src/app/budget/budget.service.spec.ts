import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { BudgetService } from './budget.service';
import { BudgetMovement } from './models/budget.model';

describe('BudgetService', () => {
  let service: BudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BudgetService]
    });
    service = TestBed.inject(BudgetService);
  });

  describe('list', () => {
    it('should return observable of movements', async () => {
      const movements = await firstValueFrom(service.list().pipe(take(1)));
      expect(movements).toBeInstanceOf(Array);
      expect(movements.length).toBeGreaterThan(0);
    });

    it('should have initial movements with required properties', async () => {
      const movements = await firstValueFrom(service.list().pipe(take(1)));
      const movement = movements[0];
      expect(movement.id).toBeDefined();
      expect(movement.name).toBeDefined();
      expect(movement.currency).toBeDefined();
      expect(movement.movementType).toBeDefined();
      expect(typeof movement.amount).toBe('number');
      expect(typeof movement.isFixed).toBe('boolean');
    });
  });

  describe('get', () => {
    it('should return a movement by id', async () => {
      const movement = await firstValueFrom(service.get('bm1'));
      expect(movement).toBeDefined();
      expect(movement?.id).toBe('bm1');
    });

    it('should return undefined for non-existent id', async () => {
      const movement = await firstValueFrom(service.get('non-existent'));
      expect(movement).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should add new movement to list', async () => {
      const initialMovements = await firstValueFrom(service.list().pipe(take(1)));
      const initialLength = initialMovements.length;

      const newMovement: Partial<BudgetMovement> = {
        name: 'Test Movement',
        description: 'Test Description',
        currency: 'USD',
        amount: 100,
        movementType: 'income',
        isFixed: false
      };

      const created = await firstValueFrom(service.create(newMovement));
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.name).toBe('Test Movement');

      const updatedMovements = await firstValueFrom(service.list().pipe(take(1)));
      expect(updatedMovements.length).toBe(initialLength + 1);
    });
  });

  describe('update', () => {
    it('should update a movement', async () => {
      const movements = await firstValueFrom(service.list().pipe(take(1)));
      const movementToUpdate = movements[0];

      const updated = await firstValueFrom(service.update(movementToUpdate.id, { name: 'Updated Name' }));
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
    });

    it('should return undefined for non-existent id', async () => {
      const result = await firstValueFrom(service.update('non-existent', { name: 'Test' }));
      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a movement', async () => {
      const movements = await firstValueFrom(service.list().pipe(take(1)));
      const movementToDelete = movements[0];
      const initialLength = movements.length;

      const success = await firstValueFrom(service.delete(movementToDelete.id));
      expect(success).toBe(true);

      const updatedMovements = await firstValueFrom(service.list().pipe(take(1)));
      expect(updatedMovements.length).toBe(initialLength - 1);
    });

    it('should return false for non-existent id', async () => {
      const result = await firstValueFrom(service.delete('non-existent'));
      expect(result).toBe(false);
    });
  });

  describe('getIncomes', () => {
    it('should return only income movements', async () => {
      const incomes = await firstValueFrom(service.getIncomes().pipe(take(1)));
      expect(incomes).toBeInstanceOf(Array);
      incomes.forEach(income => {
        expect(income.movementType).toBe('income');
      });
    });
  });

  describe('getExpenses', () => {
    it('should return only expense movements', async () => {
      const expenses = await firstValueFrom(service.getExpenses().pipe(take(1)));
      expect(expenses).toBeInstanceOf(Array);
      expenses.forEach(expense => {
        expect(expense.movementType).toBe('expense');
      });
    });
  });

  describe('getSummary', () => {
    it('should calculate correct summary', async () => {
      const summary = await firstValueFrom(service.getSummary('USD').pipe(take(1)));
      expect(summary).toBeDefined();
      expect(summary.currency).toBe('USD');
      expect(summary.balance).toBe(summary.totalIncome - summary.totalExpenses);
    });
  });

  describe('toggleActive', () => {
    it('should toggle active status', async () => {
      const movements = await firstValueFrom(service.list().pipe(take(1)));
      const movement = movements[0];
      const initialActive = movement.active;

      const updated = await firstValueFrom(service.toggleActive(movement.id));
      expect(updated).toBeDefined();
      expect(updated?.active).toBe(!initialActive);
    });
  });
});
