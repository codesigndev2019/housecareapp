import { Injectable, Optional } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { Catalog } from './models/catalog.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CatalogsService {
  private data: Catalog[] = [];
  private baseUrl = '/api/catalogs';

  private makeId(prefix = 'c') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  constructor(@Optional() private http?: HttpClient) {
    // create mock data
    for (let i = 1; i <= 42; i++) {
      const now = new Date();
      const created = new Date(now.getTime() - Math.floor(Math.random() * 10000000000));
      const updated = new Date(created.getTime() + Math.floor(Math.random() * 1000000000));
      this.data.push({
        id: this.makeId(),
        name: `Catalog ${i}`,
        description: `This is a description for catalog ${i}.`,
        createdAt: created.toISOString(),
        updatedAt: updated.toISOString(),
        lastModifiedBy: `user${(i % 5) + 1}@example.com`,
        active: Math.random() > 0.15
      });
    }
  }

  list(): Observable<Catalog[]> {
    if (this.http) {
      return this.http.get<Catalog[]>(this.baseUrl).pipe(catchError(() => of(this.data.slice())));
    }
    return of(this.data.slice());
  }

  create(payload: { name: string; description: string }): Observable<Catalog> {
    const now = new Date().toISOString();
    const newCatalog: Catalog = {
      id: this.makeId(),
      name: payload.name,
      description: payload.description,
      createdAt: now,
      updatedAt: now,
      lastModifiedBy: 'current-user@example.com',
      active: true
    };

    if (this.http) {
      return this.http.post<Catalog>(this.baseUrl, newCatalog).pipe(
        catchError(() => {
          this.data.push(newCatalog);
          return of(newCatalog);
        })
      );
    }

    this.data.push(newCatalog);
    return of(newCatalog);
  }

  update(id: string, patch: Partial<Catalog>): Observable<Catalog> {
    if (this.http) {
      return this.http.patch<Catalog>(`${this.baseUrl}/${id}`, patch).pipe(
        catchError(() => {
          // fallback to local
          const idx = this.data.findIndex(d => d.id === id);
          if (idx === -1) throw new Error('Not found');
          this.data[idx] = { ...this.data[idx], ...patch, updatedAt: new Date().toISOString() };
          return of(this.data[idx]);
        })
      );
    }

    const idx = this.data.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Not found');
    this.data[idx] = { ...this.data[idx], ...patch, updatedAt: new Date().toISOString() };
    return of(this.data[idx]);
  }

  toggleActive(id: string): Observable<Catalog> {
    if (this.http) {
      return this.http.patch<Catalog>(`${this.baseUrl}/${id}/toggle`, {}).pipe(
        catchError(() => {
          const idx = this.data.findIndex(d => d.id === id);
          if (idx === -1) throw new Error('Not found');
          this.data[idx].active = !this.data[idx].active;
          this.data[idx].updatedAt = new Date().toISOString();
          return of(this.data[idx]);
        })
      );
    }

    const idx = this.data.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Not found');
    this.data[idx].active = !this.data[idx].active;
    this.data[idx].updatedAt = new Date().toISOString();
    return of(this.data[idx]);
  }
}
