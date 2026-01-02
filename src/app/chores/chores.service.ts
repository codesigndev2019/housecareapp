import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Chore, ChoreFrequency } from './models/chore.model';

@Injectable({ providedIn: 'root' })
export class ChoresService {
  private data: Chore[] = [
    {
      id: 'ch1',
      name: 'Lavar los platos',
      responsibleId: '',
      frequency: 'daily',
      completed: false,
      active: true
    },
    {
      id: 'ch2',
      name: 'Barrer la casa',
      responsibleId: '',
      frequency: 'twice-weekly',
      completed: true,
      active: true
    },
    {
      id: 'ch3',
      name: 'Limpiar baños',
      responsibleId: '',
      frequency: 'weekly',
      completed: false,
      active: true
    },
    {
      id: 'ch4',
      name: 'Sacar la basura',
      responsibleId: '',
      frequency: 'daily',
      completed: true,
      active: true
    },
    {
      id: 'ch5',
      name: 'Tender las camas',
      responsibleId: '',
      frequency: 'daily',
      completed: false,
      active: true
    }
  ];

  private subject = new BehaviorSubject<Chore[]>([...this.data]);

  list(): Observable<Chore[]> {
    return this.subject.asObservable();
  }

  get(id: string): Observable<Chore | undefined> {
    return of(this.data.find(c => c.id === id));
  }

  create(payload: Partial<Chore>): Observable<Chore> {
    const chore: Chore = {
      id: this.generateId(),
      name: payload.name || '',
      responsibleId: payload.responsibleId || '',
      frequency: payload.frequency || 'weekly',
      completed: payload.completed ?? false,
      active: true
    };
    this.data = [chore, ...this.data];
    this.subject.next([...this.data]);
    return of(chore);
  }

  update(id: string, payload: Partial<Chore>): Observable<Chore | undefined> {
    const idx = this.data.findIndex(c => c.id === id);
    if (idx === -1) return of(undefined);
    this.data[idx] = { ...this.data[idx], ...payload };
    this.subject.next([...this.data]);
    return of(this.data[idx]);
  }

  toggleCompleted(id: string): Observable<Chore | undefined> {
    const idx = this.data.findIndex(c => c.id === id);
    if (idx === -1) return of(undefined);
    this.data[idx].completed = !this.data[idx].completed;
    this.subject.next([...this.data]);
    return of(this.data[idx]);
  }

  delete(id: string): Observable<boolean> {
    const before = this.data.length;
    this.data = this.data.filter(c => c.id !== id);
    this.subject.next([...this.data]);
    return of(this.data.length < before);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}
