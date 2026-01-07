import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventItem } from './models/event.model';
import { BaseCrudService } from '../shared/base/base-crud.service';

/** Initial sample data for development */
const INITIAL_EVENTS: EventItem[] = [
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

/**
 * EventsService - Manages calendar events
 *
 * Extends BaseCrudService for common CRUD operations
 * and adds event-specific functionality.
 */
@Injectable({ providedIn: 'root' })
export class EventsService extends BaseCrudService<EventItem> {
  constructor() {
    super(INITIAL_EVENTS);
  }

  /**
   * Build a new EventItem entity from partial data
   */
  protected buildEntity(payload: Partial<EventItem>): EventItem {
    return {
      id: this.generateId(),
      name: payload.name || '',
      date: payload.date || new Date().toISOString().slice(0, 10),
      time: payload.time || '12:00',
      location: payload.location || '',
      participants: payload.participants || [],
      reminder: payload.reminder || { enabled: false }
    };
  }

  /**
   * Get events for a specific date range
   * @param startDate - Start date (inclusive)
   * @param endDate - End date (inclusive)
   */
  getByDateRange(startDate: string, endDate: string): Observable<EventItem[]> {
    return this.filter(event => event.date >= startDate && event.date <= endDate);
  }

  /**
   * Get events for a specific date
   * @param date - Date string in YYYY-MM-DD format
   */
  getByDate(date: string): Observable<EventItem[]> {
    return this.filter(event => event.date === date);
  }

  /**
   * Get upcoming events (today and future)
   */
  getUpcoming(): Observable<EventItem[]> {
    const today = new Date().toISOString().slice(0, 10);
    return this.filter(event => event.date >= today);
  }

  /**
   * Get events with reminders enabled
   */
  getWithReminders(): Observable<EventItem[]> {
    return this.filter(event => event.reminder?.enabled === true);
  }
}
