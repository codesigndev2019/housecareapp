import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { EventItem } from './models/event.model';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private data: EventItem[] = [
    {
      id: 'evt1',
      name: 'Reunión familiar',
      date: '2026-01-03',
      time: '14:00',
      location: 'Casa de los abuelos',
      participants: [],
      reminder: { enabled: true, dateTime: '2026-01-02T10:00', frequency: 'once' }
    },
    {
      id: 'evt2',
      name: 'Cita médica',
      date: '2026-01-04',
      time: '09:30',
      location: 'Hospital Central',
      participants: [],
      reminder: { enabled: true, dateTime: '2026-01-03T18:00', frequency: 'once' }
    },
    {
      id: 'evt3',
      name: 'Cumpleaños de María',
      date: '2026-01-05',
      time: '18:00',
      location: 'Restaurante El Jardín',
      participants: [],
      reminder: { enabled: true, dateTime: '2026-01-04T12:00', frequency: 'daily' }
    },
    {
      id: 'evt4',
      name: 'Pago de servicios',
      date: '2026-01-02',
      time: '10:00',
      location: 'Banco',
      participants: [],
      reminder: { enabled: true, dateTime: '2026-01-01T09:00', frequency: 'weekly' }
    },
    {
      id: 'evt5',
      name: 'Clase de natación',
      date: '2026-01-06',
      time: '16:00',
      location: 'Club Deportivo',
      participants: [],
      reminder: { enabled: false }
    }
  ];
  private subj = new BehaviorSubject<EventItem[]>(this.data);

  list(): Observable<EventItem[]> {
    return this.subj.asObservable();
  }

  create(payload: Partial<EventItem>): Observable<EventItem> {
    const item: EventItem = {
      id: this.generateId(),
      name: payload.name || '',
      date: payload.date || new Date().toISOString().slice(0, 10),
      time: payload.time || '12:00',
      location: payload.location || '',
      participants: payload.participants || [],
      reminder: payload.reminder || { enabled: false }
    };
    this.data = [item, ...this.data];
    this.subj.next(this.data);
    return of(item);
  }

  update(id: string, payload: Partial<EventItem>): Observable<EventItem | undefined> {
    const idx = this.data.findIndex(d => d.id === id);
    if (idx === -1) return of(undefined);
    this.data[idx] = { ...this.data[idx], ...payload } as EventItem;
    this.subj.next(this.data);
    return of(this.data[idx]);
  }

  delete(id: string): Observable<boolean> {
    const before = this.data.length;
    this.data = this.data.filter(d => d.id !== id);
    this.subj.next(this.data);
    return of(this.data.length < before);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}
