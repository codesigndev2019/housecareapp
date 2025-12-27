// LoadingService scaffold
// - Manage ref-counted loading states per key
// - Expose isLoading$(key?) and helper wrap(key, observable)

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private counters = new Map<string, number>();
  private subjects = new Map<string, BehaviorSubject<boolean>>();
  private GLOBAL = '__global__';

  private ensure(key: string) {
    if (!this.counters.has(key)) {
      this.counters.set(key, 0);
      this.subjects.set(key, new BehaviorSubject<boolean>(false));
    }
  }

  show(key = this.GLOBAL) {
    this.ensure(key);
    const v = (this.counters.get(key) || 0) + 1;
    this.counters.set(key, v);
    this.subjects.get(key)!.next(true);
  }

  hide(key = this.GLOBAL) {
    this.ensure(key);
    const v = Math.max(0, (this.counters.get(key) || 1) - 1);
    this.counters.set(key, v);
    if (v === 0) this.subjects.get(key)!.next(false);
  }

  isLoading$(key = this.GLOBAL): Observable<boolean> {
    this.ensure(key);
    return this.subjects.get(key)!.asObservable();
  }

  // Helper to wrap an observable (not implemented fully here)
  wrap<T>(key: string, obs: Observable<T>): Observable<T> {
    this.show(key);
    return new Observable<T>((subscriber) => {
      const sub = obs.subscribe({
        next: (v) => subscriber.next(v),
        error: (e) => {
          subscriber.error(e);
          this.hide(key);
        },
        complete: () => {
          subscriber.complete();
          this.hide(key);
        }
      });
      return () => sub.unsubscribe();
    });
  }
}
