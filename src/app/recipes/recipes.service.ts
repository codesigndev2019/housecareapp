import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Recipe } from './models/recipe.model';
import { map, delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RecipesService {
  private data: Recipe[] = [
    {
      id: 'r1',
      name: 'Enchiladas verdes',
      description: 'Deliciosas enchiladas con salsa verde y queso fresco.',
      ingredients: '- 12 tortillas de maíz\n- 2 tazas de salsa verde\n- 2 tazas de queso oaxaca rallado\n- 1 cebolla\n- Crema de leche\n- Cilantro fresco',
      preparation: '1. Calienta la salsa verde en una olla.\n2. Pasa cada tortilla por la salsa.\n3. Rellena con queso y cebolla.\n4. Coloca en un refractario engrasado.\n5. Vierte el resto de la salsa encima.\n6. Cubre con más queso.\n7. Hornea a 180°C durante 25 minutos.\n8. Sirve con crema y cilantro.',
      imageUrl: '/assets/images/placeholder-food-1.jpg',
      scheduledAt: null,
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
    }
  ];

  private subject = new BehaviorSubject<Recipe[]>([...this.data]);

  list(): Observable<Recipe[]> {
    // Simulate async fetch
    return this.subject.asObservable();
  }

  get(id: string): Observable<Recipe | undefined> {
    return this.subject.asObservable().pipe(map(arr => arr.find(r => r.id === id)));
  }

  create(payload: Partial<Recipe>): Observable<Recipe> {
    const newItem: Recipe = {
      id: `r${Date.now()}`,
      name: payload.name || 'Untitled',
      description: payload.description,
      ingredients: payload.ingredients,
      preparation: payload.preparation,
      images: payload.images || [],
      imageUrl: payload.images?.[0] || payload.imageUrl,
      scheduledAt: payload.scheduledAt || null,
      active: true
    };
    this.data.unshift(newItem);
    this.subject.next([...this.data]);
    return of(newItem).pipe(delay(150));
  }

  update(id: string, changes: Partial<Recipe>): Observable<Recipe | undefined> {
    const idx = this.data.findIndex(r => r.id === id);
    if (idx === -1) return of(undefined);
    // If images array provided, update imageUrl to first image
    if (changes.images?.length) {
      changes.imageUrl = changes.images[0];
    }
    this.data[idx] = { ...this.data[idx], ...changes };
    this.subject.next([...this.data]);
    return of(this.data[idx]).pipe(delay(120));
  }

  toggleActive(id: string): Observable<Recipe | undefined> {
    const idx = this.data.findIndex(r => r.id === id);
    if (idx === -1) return of(undefined);
    this.data[idx].active = !this.data[idx].active;
    this.subject.next([...this.data]);
    return of(this.data[idx]).pipe(delay(80));
  }
}
