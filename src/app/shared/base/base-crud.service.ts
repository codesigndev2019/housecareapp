/**
 * BaseCrudService - Generic abstract base class for CRUD operations
 *
 * This class implements the common CRUD pattern used across multiple services
 * (Chores, Events, Recipes, Family, etc.), reducing code duplication and
 * ensuring consistent behavior.
 *
 * Features:
 * - Generic type support with entity constraint
 * - BehaviorSubject-based reactive state management
 * - Common CRUD operations (list, get, create, update, delete)
 * - ID generation utility
 * - Immutable data updates
 *
 * Usage:
 * @Injectable({ providedIn: 'root' })
 * export class MyService extends BaseCrudService<MyEntity> {
 *   constructor() {
 *     super(INITIAL_DATA);
 *   }
 *
 *   protected buildEntity(payload: Partial<MyEntity>): MyEntity {
 *     return { id: this.generateId(), ...payload };
 *   }
 * }
 */
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Base interface for all entities managed by BaseCrudService
 * All entities must have a unique string ID
 */
export interface BaseEntity {
  id: string;
}

/**
 * Generic abstract base class for CRUD services
 * @template T - Entity type extending BaseEntity
 */
export abstract class BaseCrudService<T extends BaseEntity> {
  /** Internal data array - should not be modified directly */
  protected data: T[] = [];

  /** BehaviorSubject for reactive data updates */
  protected readonly subject: BehaviorSubject<T[]>;

  /**
   * Creates an instance of BaseCrudService
   * @param initialData - Optional initial data to populate the service
   */
  constructor(initialData: T[] = []) {
    this.data = [...initialData];
    this.subject = new BehaviorSubject<T[]>([...this.data]);
  }

  /**
   * Get an observable of all entities
   * Emits whenever the data changes
   * @returns Observable of entity array
   */
  list(): Observable<T[]> {
    return this.subject.asObservable();
  }

  /**
   * Get the current snapshot of all entities (non-reactive)
   * Use this when you need a one-time read without subscription
   * @returns Current array of entities
   */
  getSnapshot(): T[] {
    return [...this.data];
  }

  /**
   * Get a single entity by ID
   * @param id - Entity ID to find
   * @returns Observable of entity or undefined if not found
   */
  get(id: string): Observable<T | undefined> {
    return of(this.data.find(item => item.id === id));
  }

  /**
   * Get a single entity by ID (reactive)
   * Updates when the entity changes
   * @param id - Entity ID to find
   * @returns Observable of entity or undefined
   */
  getById$(id: string): Observable<T | undefined> {
    return this.subject.asObservable().pipe(
      map(items => items.find(item => item.id === id))
    );
  }

  /**
   * Create a new entity
   * @param payload - Partial entity data (ID will be generated)
   * @returns Observable of the created entity
   */
  create(payload: Partial<T>): Observable<T> {
    const newEntity = this.buildEntity(payload);
    this.data = [newEntity, ...this.data];
    this.emitChanges();
    return of(newEntity);
  }

  /**
   * Update an existing entity
   * @param id - ID of entity to update
   * @param payload - Partial entity data to merge
   * @returns Observable of updated entity or undefined if not found
   */
  update(id: string, payload: Partial<T>): Observable<T | undefined> {
    const index = this.data.findIndex(item => item.id === id);

    if (index === -1) {
      return of(undefined);
    }

    // Ensure ID cannot be changed
    const { id: _, ...updatePayload } = payload as any;

    this.data[index] = { ...this.data[index], ...updatePayload };
    this.emitChanges();
    return of(this.data[index]);
  }

  /**
   * Delete an entity by ID
   * @param id - ID of entity to delete
   * @returns Observable of true if deleted, false if not found
   */
  delete(id: string): Observable<boolean> {
    const initialLength = this.data.length;
    this.data = this.data.filter(item => item.id !== id);

    if (this.data.length < initialLength) {
      this.emitChanges();
      return of(true);
    }

    return of(false);
  }

  /**
   * Check if an entity exists
   * @param id - Entity ID to check
   * @returns true if entity exists
   */
  exists(id: string): boolean {
    return this.data.some(item => item.id === id);
  }

  /**
   * Get the count of entities
   * @returns Current count of entities
   */
  count(): number {
    return this.data.length;
  }

  /**
   * Filter entities by a predicate
   * @param predicate - Filter function
   * @returns Observable of filtered entities
   */
  filter(predicate: (item: T) => boolean): Observable<T[]> {
    return this.subject.asObservable().pipe(
      map(items => items.filter(predicate))
    );
  }

  /**
   * Generate a unique ID for new entities
   * Uses timestamp + random string for uniqueness
   * @returns Unique string ID
   */
  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  /**
   * Emit current data to subscribers
   * Creates a new array reference for immutability
   */
  protected emitChanges(): void {
    this.subject.next([...this.data]);
  }

  /**
   * Abstract method to build a complete entity from partial data
   * Must be implemented by derived classes
   * @param payload - Partial entity data
   * @returns Complete entity with all required fields
   */
  protected abstract buildEntity(payload: Partial<T>): T;
}
