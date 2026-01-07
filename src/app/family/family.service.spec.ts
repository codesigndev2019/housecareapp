import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { FamilyService } from './family.service';
import { FamilyMember } from './models/family-member.model';

describe('FamilyService', () => {
  let service: FamilyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FamilyService]
    });
    service = TestBed.inject(FamilyService);
  });

  describe('list', () => {
    it('should return observable of family members', async () => {
      const members = await firstValueFrom(service.list().pipe(take(1)));
      expect(members).toBeInstanceOf(Array);
      expect(members.length).toBeGreaterThan(0);
    });

    it('should have initial members with required properties', async () => {
      const members = await firstValueFrom(service.list().pipe(take(1)));
      const member = members[0];
      expect(member.id).toBeDefined();
      expect(member.fullName).toBeDefined();
      expect(member.email).toBeDefined();
      expect(typeof member.active).toBe('boolean');
    });
  });

  describe('get', () => {
    it('should return a member by id', async () => {
      const member = await firstValueFrom(service.get('fm1'));
      expect(member).toBeDefined();
      expect(member?.id).toBe('fm1');
      expect(member?.fullName).toBe('María Pérez');
    });

    it('should return undefined for non-existent id', async () => {
      const member = await firstValueFrom(service.get('non-existent'));
      expect(member).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should add new family member to list', async () => {
      const newMember: Partial<FamilyMember> = {
        fullName: 'Juan García',
        email: 'juan@example.com',
        relation: 'Padre',
        phone: '555-9999'
      };

      const created = await firstValueFrom(service.create(newMember));
      expect(created.id).toBeDefined();
      expect(created.fullName).toBe('Juan García');
      expect(created.email).toBe('juan@example.com');
      expect(created.active).toBe(true);
      expect(created.accountType).toBe('read');

      const list = await firstValueFrom(service.list().pipe(take(1)));
      expect(list.find(m => m.id === created.id)).toBeDefined();
    });

    it('should use default values for missing properties', async () => {
      const created = await firstValueFrom(service.create({ fullName: 'Minimal Member' }));
      expect(created.accountType).toBe('read');
      expect(created.active).toBe(true);
    });
  });

  describe('update', () => {
    it('should update existing member', async () => {
      const newName = 'Updated Name';
      const updated = await firstValueFrom(service.update('fm1', { fullName: newName }));
      expect(updated).toBeDefined();
      expect(updated?.fullName).toBe(newName);
    });

    it('should return undefined for non-existent id', async () => {
      const result = await firstValueFrom(service.update('non-existent', { fullName: 'Test' }));
      expect(result).toBeUndefined();
    });

    it('should preserve other properties when updating', async () => {
      const original = await firstValueFrom(service.get('fm1'));
      const originalEmail = original?.email;

      const updated = await firstValueFrom(service.update('fm1', { fullName: 'New Name' }));
      expect(updated?.email).toBe(originalEmail);
    });
  });

  describe('delete', () => {
    it('should remove member from list', async () => {
      const initialList = await firstValueFrom(service.list().pipe(take(1)));
      const initialLength = initialList.length;

      const result = await firstValueFrom(service.delete('fm1'));
      expect(result).toBe(true);

      const newList = await firstValueFrom(service.list().pipe(take(1)));
      expect(newList.length).toBe(initialLength - 1);
      expect(newList.find(m => m.id === 'fm1')).toBeUndefined();
    });

    it('should return false for non-existent id', async () => {
      const result = await firstValueFrom(service.delete('non-existent'));
      expect(result).toBe(false);
    });
  });

  describe('deactivate', () => {
    it('should deactivate an active member', async () => {
      const result = await firstValueFrom(service.deactivate('fm1'));
      expect(result).toBe(true);

      const member = await firstValueFrom(service.get('fm1'));
      expect(member?.active).toBe(false);
    });

    it('should return false for non-existent id', async () => {
      const result = await firstValueFrom(service.deactivate('non-existent'));
      expect(result).toBe(false);
    });
  });

  describe('activate', () => {
    it('should activate a deactivated member', async () => {
      // First deactivate
      await firstValueFrom(service.deactivate('fm1'));
      // Then activate
      const result = await firstValueFrom(service.activate('fm1'));
      expect(result).toBe(true);

      const member = await firstValueFrom(service.get('fm1'));
      expect(member?.active).toBe(true);
    });

    it('should return false for non-existent id', async () => {
      const result = await firstValueFrom(service.activate('non-existent'));
      expect(result).toBe(false);
    });
  });

  describe('getActive', () => {
    it('should return only active members', async () => {
      const members = await firstValueFrom(service.getActive().pipe(take(1)));
      expect(members.every(m => m.active === true)).toBe(true);
    });

    it('should exclude deactivated members', async () => {
      // Deactivate one member
      await firstValueFrom(service.deactivate('fm1'));
      const members = await firstValueFrom(service.getActive().pipe(take(1)));
      expect(members.find(m => m.id === 'fm1')).toBeUndefined();
    });
  });

  describe('getByEmail', () => {
    it('should return member by email', async () => {
      const member = await firstValueFrom(service.getByEmail('maria@example.com'));
      expect(member).toBeDefined();
      expect(member?.fullName).toBe('María Pérez');
    });

    it('should return undefined for non-existent email', async () => {
      const member = await firstValueFrom(service.getByEmail('unknown@example.com'));
      expect(member).toBeUndefined();
    });
  });
});