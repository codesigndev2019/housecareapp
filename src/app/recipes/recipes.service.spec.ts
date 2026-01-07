import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { RecipesService } from './recipes.service';
import { Recipe } from './models/recipe.model';

describe('RecipesService', () => {
  let service: RecipesService;

  beforeEach(() => {
    vi.useFakeTimers();
    
    TestBed.configureTestingModule({
      providers: [RecipesService]
    });
    service = TestBed.inject(RecipesService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('list', () => {
    it('should return observable of recipes', async () => {
      const recipes = await firstValueFrom(service.list().pipe(take(1)));
      expect(recipes).toBeInstanceOf(Array);
      expect(recipes.length).toBeGreaterThan(0);
    });

    it('should have initial recipes with required properties', async () => {
      const recipes = await firstValueFrom(service.list().pipe(take(1)));
      const recipe = recipes[0];
      expect(recipe.id).toBeDefined();
      expect(recipe.name).toBeDefined();
      expect(recipe.description).toBeDefined();
      expect(typeof recipe.active).toBe('boolean');
    });
  });

  describe('get', () => {
    it('should return a recipe by id', async () => {
      const recipe = await firstValueFrom(service.get('r1'));
      expect(recipe).toBeDefined();
      expect(recipe?.id).toBe('r1');
      expect(recipe?.name).toBe('Enchiladas verdes');
    });

    it('should return undefined for non-existent id', async () => {
      const recipe = await firstValueFrom(service.get('non-existent'));
      expect(recipe).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should add new recipe to list', async () => {
      const newRecipe: Partial<Recipe> = {
        name: 'Test Recipe',
        description: 'A test recipe',
        ingredients: 'Ingredient 1, Ingredient 2',
        preparation: 'Step 1, Step 2'
      };

      const createPromise = firstValueFrom(service.create(newRecipe));
      vi.advanceTimersByTime(300);
      const created = await createPromise;

      expect(created).toBeDefined();
      expect(created?.id).toBeDefined();
      expect(created?.name).toBe('Test Recipe');
      expect(created?.active).toBe(true);
    });

    it('should use default values for missing properties', async () => {
      const createPromise = firstValueFrom(service.create({ name: 'Minimal Recipe' }));
      vi.advanceTimersByTime(300);
      const created = await createPromise;

      expect(created?.name).toBe('Minimal Recipe');
      expect(created?.active).toBe(true);
      expect(created?.images).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update existing recipe', async () => {
      const newName = 'Updated Recipe Name';
      const updatePromise = firstValueFrom(service.update('r1', { name: newName }));
      vi.advanceTimersByTime(300);
      const updated = await updatePromise;

      expect(updated).toBeDefined();
      expect(updated?.name).toBe(newName);
    });

    it('should return undefined for non-existent id', async () => {
      const updatePromise = firstValueFrom(service.update('non-existent', { name: 'Test' }));
      vi.advanceTimersByTime(300);
      const result = await updatePromise;

      expect(result).toBeUndefined();
    });

    it('should update imageUrl when images array is provided', async () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const updatePromise = firstValueFrom(service.update('r1', { images }));
      vi.advanceTimersByTime(300);
      const updated = await updatePromise;

      expect(updated?.images).toEqual(images);
      expect(updated?.imageUrl).toBe('image1.jpg');
    });
  });

  describe('delete', () => {
    it('should remove recipe from list', async () => {
      const initialList = await firstValueFrom(service.list().pipe(take(1)));
      const initialLength = initialList.length;

      const result = await firstValueFrom(service.delete('r1'));
      expect(result).toBe(true);

      const newList = await firstValueFrom(service.list().pipe(take(1)));
      expect(newList.length).toBe(initialLength - 1);
      expect(newList.find(r => r.id === 'r1')).toBeUndefined();
    });

    it('should return false for non-existent id', async () => {
      const result = await firstValueFrom(service.delete('non-existent'));
      expect(result).toBe(false);
    });
  });

  describe('toggleActive', () => {
    it('should toggle active status from true to false', async () => {
      // First get current state
      const original = await firstValueFrom(service.get('r1'));
      expect(original?.active).toBe(true);

      const togglePromise = firstValueFrom(service.toggleActive('r1'));
      vi.advanceTimersByTime(300);
      const updated = await togglePromise;

      expect(updated?.active).toBe(false);
    });

    it('should return undefined for non-existent id', async () => {
      const togglePromise = firstValueFrom(service.toggleActive('non-existent'));
      vi.advanceTimersByTime(300);
      const result = await togglePromise;

      expect(result).toBeUndefined();
    });
  });

  describe('getByScheduledDate', () => {
    it('should return recipes scheduled for specific date', async () => {
      const recipes = await firstValueFrom(service.getByScheduledDate('2026-01-02').pipe(take(1)));
      expect(recipes.length).toBeGreaterThan(0);
      expect(recipes.every(r => r.scheduledAt === '2026-01-02')).toBe(true);
    });

    it('should return empty array for date with no recipes', async () => {
      const recipes = await firstValueFrom(service.getByScheduledDate('2030-01-01').pipe(take(1)));
      expect(recipes.length).toBe(0);
    });
  });

  describe('getActive', () => {
    it('should return only active recipes', async () => {
      const recipes = await firstValueFrom(service.getActive().pipe(take(1)));
      expect(recipes.every(r => r.active === true)).toBe(true);
    });
  });
});
