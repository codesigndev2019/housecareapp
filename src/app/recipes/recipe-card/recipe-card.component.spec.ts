import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RecipeCardComponent } from './recipe-card.component';
import { Recipe } from '../models/recipe.model';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';

describe('RecipeCardComponent', () => {
  let component: RecipeCardComponent;
  let viewSpy: ReturnType<typeof vi.fn>;
  let editSpy: ReturnType<typeof vi.fn>;
  let toggleSpy: ReturnType<typeof vi.fn>;

  const mockRecipe: Recipe = {
    id: 'r1',
    name: 'Enchiladas verdes',
    description: 'Delicious Mexican dish',
    ingredients: 'Chicken, tortillas, salsa verde',
    preparation: 'Cook chicken, prepare sauce, assemble',
    active: true,
    images: [],
    imageUrl: ''
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA]
    });

    // Create component within injection context
    component = TestBed.runInInjectionContext(() => new RecipeCardComponent());
    
    // Mock the required input signal using writable signal
    const recipeSignal = signal(mockRecipe);
    Object.defineProperty(component, 'recipe', {
      value: recipeSignal,
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
    toggleSpy = vi.fn();

    component.view.subscribe(viewSpy);
    component.edit.subscribe(editSpy);
    component.toggleActive.subscribe(toggleSpy);
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have recipe input', () => {
      expect(component.recipe()).toEqual(mockRecipe);
    });

    it('should show actions by default', () => {
      expect(component.showActions()).toBe(true);
    });
  });

  describe('inputs', () => {
    it('should accept showActions input', () => {
      const showActionsSignal = signal(false);
      Object.defineProperty(component, 'showActions', { value: showActionsSignal });
      expect(component.showActions()).toBe(false);
    });

    it('should handle recipe with image', () => {
      const recipeWithImage = { ...mockRecipe, imageUrl: 'https://example.com/image.jpg' };
      const recipeSignal = signal(recipeWithImage);
      Object.defineProperty(component, 'recipe', { value: recipeSignal });
      expect(component.recipe().imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should handle inactive recipe', () => {
      const inactiveRecipe = { ...mockRecipe, active: false };
      const recipeSignal = signal(inactiveRecipe);
      Object.defineProperty(component, 'recipe', { value: recipeSignal });
      expect(component.recipe().active).toBe(false);
    });

    it('should handle scheduled recipe', () => {
      const scheduledRecipe = { ...mockRecipe, scheduledAt: '2025-07-20' };
      const recipeSignal = signal(scheduledRecipe);
      Object.defineProperty(component, 'recipe', { value: recipeSignal });
      expect(component.recipe().scheduledAt).toBe('2025-07-20');
    });
  });

  describe('outputs', () => {
    it('should emit view event', () => {
      component.onView();
      expect(viewSpy).toHaveBeenCalledWith(mockRecipe);
    });

    it('should emit edit event', () => {
      component.onEdit();
      expect(editSpy).toHaveBeenCalledWith(mockRecipe);
    });

    it('should emit toggleActive event', () => {
      component.onToggleActive();
      expect(toggleSpy).toHaveBeenCalledWith(mockRecipe);
    });
  });

  describe('display states', () => {
    it('should handle recipe without description', () => {
      const recipeSignal = signal({ ...mockRecipe, description: '' });
      Object.defineProperty(component, 'recipe', { value: recipeSignal });
      expect(component.recipe().description).toBe('');
    });

    it('should handle recipe with multiple images', () => {
      const recipeWithImages = { 
        ...mockRecipe, 
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
        imageUrl: 'img1.jpg'
      };
      const recipeSignal = signal(recipeWithImages);
      Object.defineProperty(component, 'recipe', { value: recipeSignal });
      expect(component.recipe().images.length).toBe(3);
    });
  });
});
