import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Recipe } from './models/recipe.model';
import { BaseCrudService } from '../shared/base/base-crud.service';

/** Initial sample data for development */
const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'r1',
    name: 'Enchiladas verdes',
    description: 'Deliciosas enchiladas con salsa verde y queso fresco.',
    ingredients: '- 12 tortillas de maíz\n- 2 tazas de salsa verde\n- 2 tazas de queso oaxaca rallado\n- 1 cebolla\n- Crema de leche\n- Cilantro fresco',
    preparation: '1. Calienta la salsa verde en una olla.\n2. Pasa cada tortilla por la salsa.\n3. Rellena con queso y cebolla.\n4. Coloca en un refractario engrasado.\n5. Vierte el resto de la salsa encima.\n6. Cubre con más queso.\n7. Hornea a 180°C durante 25 minutos.\n8. Sirve con crema y cilantro.',
    imageUrl: '/assets/images/placeholder-food-1.jpg',
    scheduledAt: '2026-01-02',
    active: true
  },
  {
    id: 'r2',
    name: 'Ensalada César',
    description: 'Clásica ensalada con aderezo césar casero.',
    ingredients: '- 1 lechuga romana\n- 1/2 taza de queso parmesano rallado\n- 1 taza de crutones\n- 4 filetes de anchoas\n- 1 diente de ajo\n- Jugo de limón\n- Aceite de oliva',
    preparation: '1. Lava y pica la lechuga romana.\n2. Prepara el aderezo: mezcla ajo, anchoas, limón y aceite.\n3. Tuesta el pan para los crutones.\n4. En un tazón, combina la lechuga con el aderezo.\n5. Agrega crutones y queso parmesano.\n6. Mezcla bien y sirve inmediatamente.',
    imageUrl: '/assets/images/placeholder-food-2.jpg',
    scheduledAt: '2026-01-03',
    active: true
  },
  {
    id: 'r3',
    name: 'Tacos al pastor',
    description: 'Tacos con carne de cerdo marinada y piña.',
    ingredients: '- 500g carne de cerdo\n- Chile guajillo\n- Achiote\n- Piña\n- Tortillas de maíz\n- Cilantro y cebolla',
    preparation: '1. Marina la carne con chiles y achiote.\n2. Deja reposar 4 horas.\n3. Cocina en trompo o sartén.\n4. Sirve en tortillas con piña, cilantro y cebolla.',
    imageUrl: '/assets/images/placeholder-food-1.jpg',
    scheduledAt: '2026-01-04',
    active: true
  },
  {
    id: 'r4',
    name: 'Sopa de tortilla',
    description: 'Sopa tradicional mexicana con tiras de tortilla crujientes.',
    ingredients: '- Tortillas de maíz\n- Tomate\n- Chile pasilla\n- Crema\n- Queso fresco\n- Aguacate',
    preparation: '1. Fríe las tiras de tortilla.\n2. Prepara el caldillo de tomate.\n3. Sirve caliente con los complementos.',
    imageUrl: '/assets/images/placeholder-food-2.jpg',
    scheduledAt: '2026-01-05',
    active: true
  },
  {
    id: 'r5',
    name: 'Pollo a la plancha',
    description: 'Pechuga de pollo con especias y ensalada fresca.',
    ingredients: '- 2 pechugas de pollo\n- Limón\n- Ajo\n- Hierbas finas\n- Ensalada mixta',
    preparation: '1. Marina el pollo con limón y ajo.\n2. Cocina a la plancha.\n3. Sirve con ensalada fresca.',
    imageUrl: '/assets/images/placeholder-food-1.jpg',
    scheduledAt: '2026-01-06',
    active: true
  }
];

/**
 * RecipesService - Manages recipes
 *
 * Extends BaseCrudService for common CRUD operations
 * and adds recipe-specific functionality.
 */
@Injectable({ providedIn: 'root' })
export class RecipesService extends BaseCrudService<Recipe> {
  constructor() {
    super(INITIAL_RECIPES);
  }

  /**
   * Build a new Recipe entity from partial data
   */
  protected buildEntity(payload: Partial<Recipe>): Recipe {
    return {
      id: `r${Date.now()}`,
      name: payload.name || 'Untitled',
      description: payload.description,
      ingredients: payload.ingredients,
      preparation: payload.preparation,
      images: payload.images || [],
      imageUrl: payload.images?.[0] || payload.imageUrl,
      scheduledAt: payload.scheduledAt || null,
      active: payload.active ?? true
    };
  }

  /**
   * Override create to add simulated delay
   */
  override create(payload: Partial<Recipe>): Observable<Recipe> {
    const newItem = this.buildEntity(payload);
    this.data.unshift(newItem);
    this.emitChanges();
    return of(newItem).pipe(delay(150));
  }

  /**
   * Override update to handle images and add simulated delay
   */
  override update(id: string, changes: Partial<Recipe>): Observable<Recipe | undefined> {
    const idx = this.data.findIndex(r => r.id === id);
    if (idx === -1) {
      return of(undefined);
    }

    // If images array provided, update imageUrl to first image
    if (changes.images?.length) {
      changes.imageUrl = changes.images[0];
    }

    this.data[idx] = { ...this.data[idx], ...changes };
    this.emitChanges();
    return of(this.data[idx]).pipe(delay(120));
  }

  /**
   * Toggle active status of a recipe
   */
  toggleActive(id: string): Observable<Recipe | undefined> {
    const recipe = this.data.find(r => r.id === id);
    if (!recipe) {
      return of(undefined);
    }
    return this.update(id, { active: !recipe.active }).pipe(delay(80));
  }

  /**
   * Get recipes scheduled for a specific date
   */
  getByScheduledDate(date: string): Observable<Recipe[]> {
    return this.filter(recipe => recipe.scheduledAt === date && recipe.active === true);
  }

  /**
   * Get active recipes only
   */
  getActive(): Observable<Recipe[]> {
    return this.filter(recipe => recipe.active === true);
  }
}
