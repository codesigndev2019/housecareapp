import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { ChoresService } from './chores.service';
import { Chore } from './models/chore.model';

describe('ChoresService', () => {
  let service: ChoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChoresService]
    });
    service = TestBed.inject(ChoresService);
  });

  describe('list', () => {
    it('should return observable of chores', async () => {
      const chores = await firstValueFrom(service.list().pipe(take(1)));
      expect(chores).toBeInstanceOf(Array);
      expect(chores.length).toBeGreaterThan(0);
    });

    it('should have initial chores with required properties', async () => {
      const chores = await firstValueFrom(service.list().pipe(take(1)));
      const chore = chores[0];
      expect(chore.id).toBeDefined();
      expect(chore.name).toBeDefined();
      expect(chore.frequency).toBeDefined();
      expect(typeof chore.completed).toBe('boolean');
      expect(typeof chore.active).toBe('boolean');
    });
  });

  describe('get', () => {
    it('should return a chore by id', async () => {
      const chore = await firstValueFrom(service.get('ch1'));
      expect(chore).toBeDefined();
      expect(chore?.id).toBe('ch1');
    });

    it('should return undefined for non-existent id', async () => {
      const chore = await firstValueFrom(service.get('non-existent'));
      expect(chore).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should add new chore to list', async () => {
      const newChore: Partial<Chore> = {
        name: 'Test Chore',
        frequency: 'daily',
        responsibleId: 'user1'
      };

      const created = await firstValueFrom(service.create(newChore));
      expect(created.id).toBeDefined();
      expect(created.name).toBe('Test Chore');
      expect(created.frequency).toBe('daily');
      expect(created.completed).toBe(false);
      expect(created.active).toBe(true);

      const list = await firstValueFrom(service.list().pipe(take(1)));
      expect(list.find(c => c.id === created.id)).toBeDefined();
    });

    it('should use default values for missing properties', async () => {
      const created = await firstValueFrom(service.create({ name: 'Minimal Chore' }));
      expect(created.frequency).toBe('weekly');
      expect(created.responsibleId).toBe('');
      expect(created.completed).toBe(false);
      expect(created.active).toBe(true);
    });
  });

  describe('update', () => {
    it('should update existing chore', async () => {
      const newName = 'Updated Chore Name';
      const updated = await firstValueFrom(service.update('ch1', { name: newName }));
      expect(updated).toBeDefined();
      expect(updated?.name).toBe(newName);
    });

    it('should return undefined for non-existent id', async () => {
      const result = await firstValueFrom(service.update('non-existent', { name: 'Test' }));
      expect(result).toBeUndefined();
    });

    it('should preserve other properties when updating', async () => {
      const original = await firstValueFrom(service.get('ch1'));
      const originalFrequency = original?.frequency;

      const updated = await firstValueFrom(service.update('ch1', { name: 'New Name' }));
      expect(updated?.frequency).toBe(originalFrequency);
    });
  });

  describe('delete', () => {
    it('should remove chore from list', async () => {
      const initialList = await firstValueFrom(service.list().pipe(take(1)));
      const initialLength = initialList.length;

      const result = await firstValueFrom(service.delete('ch1'));
      expect(result).toBe(true);

      const newList = await firstValueFrom(service.list().pipe(take(1)));
      expect(newList.length).toBe(initialLength - 1);
      expect(newList.find(c => c.id === 'ch1')).toBeUndefined();
    });

    it('should return false for non-existent id', async () => {
      const result = await firstValueFrom(service.delete('non-existent'));
      expect(result).toBe(false);
    });
  });

  describe('toggleCompleted', () => {
    it('should toggle completed status from false to true', async () => {
      const list = await firstValueFrom(service.list().pipe(take(1)));
      const chore = list.find(c => !c.completed);
      if (!chore) return;

      const updated = await firstValueFrom(service.toggleCompleted(chore.id));
      expect(updated?.completed).toBe(true);
    });

    it('should toggle completed status from true to false', async () => {
      const list = await firstValueFrom(service.list().pipe(take(1)));
      const chore = list.find(c => c.completed);
      if (!chore) return;

      const updated = await firstValueFrom(service.toggleCompleted(chore.id));
      expect(updated?.completed).toBe(false);
    });

    it('should return undefined for non-existent id', async () => {
      const result = await firstValueFrom(service.toggleCompleted('non-existent'));
      expect(result).toBeUndefined();
    });
  });

  describe('getPending', () => {
    it('should return only non-completed active chores', async () => {
      const pending = await firstValueFrom(service.getPending().pipe(take(1)));
      expect(pending.every(c => !c.completed && c.active)).toBe(true);
    });
  });

  describe('getByFrequency', () => {
    it('should return chores with daily frequency', async () => {
      const daily = await firstValueFrom(service.getByFrequency('daily').pipe(take(1)));
      expect(daily.every(c => c.frequency === 'daily')).toBe(true);
    });

    it('should return chores with weekly frequency', async () => {
      const weekly = await firstValueFrom(service.getByFrequency('weekly').pipe(take(1)));
      expect(weekly.every(c => c.frequency === 'weekly')).toBe(true);
    });
  });
});
