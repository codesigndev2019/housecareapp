import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ChoreCardComponent } from './chore-card.component';
import { Chore } from '../models/chore.model';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';

describe('ChoreCardComponent', () => {
  let component: ChoreCardComponent;
  let viewSpy: ReturnType<typeof vi.fn>;
  let editSpy: ReturnType<typeof vi.fn>;
  let deleteSpy: ReturnType<typeof vi.fn>;
  let toggleSpy: ReturnType<typeof vi.fn>;

  const mockChore: Chore = {
    id: 'ch1',
    name: 'Test Chore',
    frequency: 'daily',
    completed: false,
    active: true,
    responsibleId: 'fm1'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA]
    });

    // Create component within injection context
    component = TestBed.runInInjectionContext(() => new ChoreCardComponent());
    
    // Mock the required input signal using writable signal
    const choreSignal = signal(mockChore);
    Object.defineProperty(component, 'chore', {
      value: choreSignal,
      writable: true
    });
    
    // Mock the optional input signal
    const showActionsSignal = signal(true);
    Object.defineProperty(component, 'showActions', {
      value: showActionsSignal,
      writable: true
    });

    // Setup spies for outputs
    viewSpy = vi.fn();
    editSpy = vi.fn();
    deleteSpy = vi.fn();
    toggleSpy = vi.fn();

    component.view.subscribe(viewSpy);
    component.edit.subscribe(editSpy);
    component.delete.subscribe(deleteSpy);
    component.toggleCompleted.subscribe(toggleSpy);
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have chore input', () => {
      expect(component.chore()).toEqual(mockChore);
    });

    it('should show actions by default', () => {
      expect(component.showActions()).toBe(true);
    });
  });

  describe('getFrequencyKey', () => {
    it('should return daily key', () => {
      const choreSignal = signal({ ...mockChore, frequency: 'daily' as const });
      Object.defineProperty(component, 'chore', { value: choreSignal });
      expect(component.getFrequencyKey()).toBe('chores.daily');
    });

    it('should return twice weekly key', () => {
      const choreSignal = signal({ ...mockChore, frequency: 'twice-weekly' as const });
      Object.defineProperty(component, 'chore', { value: choreSignal });
      expect(component.getFrequencyKey()).toBe('chores.twiceWeekly');
    });

    it('should return weekly key', () => {
      const choreSignal = signal({ ...mockChore, frequency: 'weekly' as const });
      Object.defineProperty(component, 'chore', { value: choreSignal });
      expect(component.getFrequencyKey()).toBe('chores.weekly');
    });

    it('should default to weekly key for unknown frequency', () => {
      const choreSignal = signal({ ...mockChore, frequency: 'unknown' as any });
      Object.defineProperty(component, 'chore', { value: choreSignal });
      expect(component.getFrequencyKey()).toBe('chores.weekly');
    });
  });

  describe('outputs', () => {
    it('should emit view event', () => {
      component.onView();
      expect(viewSpy).toHaveBeenCalledWith(mockChore);
    });

    it('should emit edit event', () => {
      component.onEdit();
      expect(editSpy).toHaveBeenCalledWith(mockChore);
    });

    it('should emit delete event', () => {
      component.onDelete();
      expect(deleteSpy).toHaveBeenCalledWith(mockChore);
    });

    it('should emit toggleCompleted event', () => {
      component.onToggle(true);
      expect(toggleSpy).toHaveBeenCalledWith(mockChore);
    });
  });

  describe('display states', () => {
    it('should handle completed chore', () => {
      const choreSignal = signal({ ...mockChore, completed: true });
      Object.defineProperty(component, 'chore', { value: choreSignal });
      expect(component.chore().completed).toBe(true);
    });

    it('should handle inactive chore', () => {
      const choreSignal = signal({ ...mockChore, active: false });
      Object.defineProperty(component, 'chore', { value: choreSignal });
      expect(component.chore().active).toBe(false);
    });

    it('should handle chore without responsible', () => {
      const choreSignal = signal({ ...mockChore, responsibleId: '' });
      Object.defineProperty(component, 'chore', { value: choreSignal });
      expect(component.chore().responsibleId).toBe('');
    });
  });
});
