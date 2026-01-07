import { describe, it, expect, beforeEach } from 'vitest';
import { BaseCrudService, BaseEntity } from './base-crud.service';
import { take, firstValueFrom, skip } from 'rxjs';

interface TestEntity extends BaseEntity {
  id: string;
  name: string;
  active: boolean;
}

class TestCrudService extends BaseCrudService<TestEntity> {
  constructor(initialData: TestEntity[] = []) {
    super(initialData);
  }

  protected buildEntity(payload: Partial<TestEntity>): TestEntity {
    return {
      id: this.generateId(),
      name: payload.name || '',
      active: payload.active ?? true
    };
  }
}

describe('BaseCrudService', () => {
  let service: TestCrudService;
  const initialData: TestEntity[] = [
    { id: '1', name: 'First', active: true },
    { id: '2', name: 'Second', active: false },
    { id: '3', name: 'Third', active: true }
  ];

  beforeEach(() => {
    service = new TestCrudService([...initialData]);
  });

  describe('list', () => {
    it('should return observable of all entities', async () => {
      const items = await firstValueFrom(service.list());
      expect(items).toHaveLength(3);
      expect(items[0].name).toBe('First');
    });

    it('should emit new value when data changes', async () => {
      // Skip first emission, wait for second after create
      const itemsPromise = firstValueFrom(service.list().pipe(skip(1)));
      service.create({ name: 'New Item' });
      const items = await itemsPromise;
      expect(items).toHaveLength(4);
    });
  });

  describe('getSnapshot', () => {
    it('should return current data array', () => {
      const snapshot = service.getSnapshot();
      expect(snapshot).toHaveLength(3);
      expect(snapshot).not.toBe(service.getSnapshot()); // Different reference
    });
  });

  describe('get', () => {
    it('should return entity by id', async () => {
      const item = await firstValueFrom(service.get('1'));
      expect(item).toBeDefined();
      expect(item?.name).toBe('First');
    });

    it('should return undefined for non-existent id', async () => {
      const item = await firstValueFrom(service.get('non-existent'));
      expect(item).toBeUndefined();
    });
  });

  describe('getById$', () => {
    it('should return reactive entity stream', async () => {
      const firstItem = await firstValueFrom(service.getById$('1'));
      expect(firstItem?.name).toBe('First');

      // Update and check new value
      const updatedPromise = firstValueFrom(service.getById$('1').pipe(skip(1)));
      service.update('1', { name: 'Updated First' });
      const updatedItem = await updatedPromise;
      expect(updatedItem?.name).toBe('Updated First');
    });
  });

  describe('create', () => {
    it('should add new entity to beginning of list', async () => {
      const created = await firstValueFrom(service.create({ name: 'New Entity' }));
      expect(created.id).toBeDefined();
      expect(created.name).toBe('New Entity');
      expect(created.active).toBe(true);

      const items = await firstValueFrom(service.list());
      expect(items).toHaveLength(4);
      expect(items[0].name).toBe('New Entity');
    });

    it('should generate unique IDs', async () => {
      const e1 = await firstValueFrom(service.create({ name: 'Entity 1' }));
      const e2 = await firstValueFrom(service.create({ name: 'Entity 2' }));
      expect(e1.id).not.toBe(e2.id);
    });
  });

  describe('update', () => {
    it('should update existing entity', async () => {
      const updated = await firstValueFrom(service.update('1', { name: 'Updated Name' }));
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.active).toBe(true); // unchanged
    });

    it('should return undefined for non-existent id', async () => {
      const result = await firstValueFrom(service.update('non-existent', { name: 'Test' }));
      expect(result).toBeUndefined();
    });

    it('should not allow changing id', async () => {
      const updated = await firstValueFrom(service.update('1', { id: 'new-id', name: 'Test' } as any));
      expect(updated?.id).toBe('1');
    });
  });

  describe('delete', () => {
    it('should remove entity from list', async () => {
      const result = await firstValueFrom(service.delete('1'));
      expect(result).toBe(true);

      const items = await firstValueFrom(service.list());
      expect(items).toHaveLength(2);
      expect(items.find(i => i.id === '1')).toBeUndefined();
    });

    it('should return false for non-existent id', async () => {
      const result = await firstValueFrom(service.delete('non-existent'));
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true for existing entity', () => {
      expect(service.exists('1')).toBe(true);
    });

    it('should return false for non-existent entity', () => {
      expect(service.exists('non-existent')).toBe(false);
    });
  });

  describe('count', () => {
    it('should return current entity count', () => {
      expect(service.count()).toBe(3);
    });

    it('should update after create/delete', async () => {
      await firstValueFrom(service.create({ name: 'New' }));
      expect(service.count()).toBe(4);

      await firstValueFrom(service.delete('1'));
      expect(service.count()).toBe(3);
    });
  });

  describe('filter', () => {
    it('should return filtered entities', async () => {
      const items = await firstValueFrom(service.filter(item => item.active));
      expect(items).toHaveLength(2);
      expect(items.every(i => i.active)).toBe(true);
    });

    it('should update when data changes', async () => {
      const initialItems = await firstValueFrom(service.filter(item => item.active));
      expect(initialItems).toHaveLength(2);

      // Create active item and check filter updates
      const updatedPromise = firstValueFrom(service.filter(item => item.active).pipe(skip(1)));
      service.create({ name: 'Active', active: true });
      const updatedItems = await updatedPromise;
      expect(updatedItems).toHaveLength(3);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const id = (service as any).generateId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
    });
  });
});
