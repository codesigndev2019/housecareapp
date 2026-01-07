import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { firstValueFrom, take } from 'rxjs';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let mockEventsService: { list: ReturnType<typeof vi.fn> };
  let mockRecipesService: { list: ReturnType<typeof vi.fn> };
  let mockChoresService: { list: ReturnType<typeof vi.fn>; toggleCompleted: ReturnType<typeof vi.fn> };

  const mockEvents = [
    { id: 'e1', title: 'Event 1', date: new Date().toISOString().split('T')[0], time: '10:00' },
    { id: 'e2', title: 'Event 2', date: new Date().toISOString().split('T')[0], time: '14:00' }
  ];

  const mockRecipes = [
    { id: 'r1', name: 'Recipe 1', scheduledAt: new Date().toISOString().split('T')[0], active: true },
    { id: 'r2', name: 'Recipe 2', scheduledAt: new Date().toISOString().split('T')[0], active: true }
  ];

  const mockChores = [
    { id: 'c1', name: 'Chore 1', completed: false, active: true, frequency: 'daily' },
    { id: 'c2', name: 'Chore 2', completed: true, active: true, frequency: 'weekly' },
    { id: 'c3', name: 'Chore 3', completed: false, active: true, frequency: 'daily' }
  ];

  beforeEach(() => {
    mockEventsService = {
      list: vi.fn().mockReturnValue(of(mockEvents))
    };

    mockRecipesService = {
      list: vi.fn().mockReturnValue(of(mockRecipes))
    };

    mockChoresService = {
      list: vi.fn().mockReturnValue(of(mockChores)),
      toggleCompleted: vi.fn().mockReturnValue(of({ ...mockChores[0], completed: true }))
    };

    component = new DashboardComponent(
      mockEventsService as any,
      mockRecipesService as any,
      mockChoresService as any
    );
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize events$', () => {
      expect(component.events$).toBeDefined();
    });

    it('should initialize recipes$', () => {
      expect(component.recipes$).toBeDefined();
    });

    it('should initialize chores$', () => {
      expect(component.chores$).toBeDefined();
    });
  });

  describe('data loading', () => {
    it('should call events service list', () => {
      expect(mockEventsService.list).toHaveBeenCalled();
    });

    it('should call recipes service list', () => {
      expect(mockRecipesService.list).toHaveBeenCalled();
    });

    it('should call chores service list', () => {
      expect(mockChoresService.list).toHaveBeenCalled();
    });
  });

  describe('chores filtering', () => {
    it('should filter only incomplete chores', async () => {
      const chores = await firstValueFrom(component.chores$.pipe(take(1)));
      expect(chores.every(c => !c.completed)).toBe(true);
    });

    it('should limit to 5 chores', async () => {
      const manyChores = Array(10).fill(null).map((_, i) => ({
        id: `c${i}`,
        name: `Chore ${i}`,
        completed: false,
        active: true,
        frequency: 'daily'
      }));
      mockChoresService.list.mockReturnValue(of(manyChores));
      
      const newComponent = new DashboardComponent(
        mockEventsService as any,
        mockRecipesService as any,
        mockChoresService as any
      );

      const chores = await firstValueFrom(newComponent.chores$.pipe(take(1)));
      expect(chores.length).toBeLessThanOrEqual(5);
    });
  });

  describe('onToggleChore', () => {
    it('should call choresService.toggleCompleted', () => {
      const chore = mockChores[0];
      component.onToggleChore(chore as any);
      
      expect(mockChoresService.toggleCompleted).toHaveBeenCalledWith('c1');
    });
  });

  describe('static date utilities', () => {
    it('should calculate start of week correctly', () => {
      const testDate = new Date('2025-07-17'); // Thursday
      const startOfWeek = DashboardComponent.startOfWeek(testDate);
      
      // Monday should be July 14, 2025
      expect(startOfWeek.getDay()).toBe(1); // Monday
    });

    it('should calculate end of week correctly', () => {
      const testDate = new Date('2025-07-17'); // Thursday
      const endOfWeek = DashboardComponent.endOfWeek(testDate);
      
      // Sunday should be July 20, 2025
      expect(endOfWeek.getDay()).toBe(0); // Sunday
    });

    it('should set start of week to midnight', () => {
      const testDate = new Date('2025-07-17T15:30:00');
      const startOfWeek = DashboardComponent.startOfWeek(testDate);
      
      expect(startOfWeek.getHours()).toBe(0);
      expect(startOfWeek.getMinutes()).toBe(0);
      expect(startOfWeek.getSeconds()).toBe(0);
    });

    it('should set end of week to end of day', () => {
      const testDate = new Date('2025-07-17T15:30:00');
      const endOfWeek = DashboardComponent.endOfWeek(testDate);
      
      expect(endOfWeek.getHours()).toBe(23);
      expect(endOfWeek.getMinutes()).toBe(59);
      expect(endOfWeek.getSeconds()).toBe(59);
    });

    it('should handle Sunday correctly', () => {
      const sunday = new Date('2025-07-20'); // Sunday
      const startOfWeek = DashboardComponent.startOfWeek(sunday);
      
      // Start of week should be Monday July 14
      expect(startOfWeek.getDate()).toBe(14);
    });
  });
});
