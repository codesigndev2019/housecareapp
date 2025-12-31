import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ActivityEvent {
  id: string;
  type: 'create' | 'update' | 'activate' | 'deactivate' | 'undo';
  timestamp: string; // ISO
  user?: string;
  catalogId?: string;
  catalogName?: string;
  meta?: Record<string, any>;
}

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private events: ActivityEvent[] = [];
  private events$ = new BehaviorSubject<ActivityEvent[]>([]);

  allEvents(): Observable<ActivityEvent[]> {
    return this.events$.asObservable();
  }

  list(): ActivityEvent[] {
    return this.events.slice();
  }

  add(event: Omit<ActivityEvent, 'id' | 'timestamp'>) {
    const e: ActivityEvent = {
      id: 'ev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      timestamp: new Date().toISOString(),
      ...event
    };
    this.events.unshift(e);
    this.events$.next(this.events.slice());
    return e;
  }

  clear() {
    this.events = [];
    this.events$.next([]);
  }
}
