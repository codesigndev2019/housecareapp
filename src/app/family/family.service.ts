import { Injectable } from '@angular/core';
import { FamilyMember } from './models/family-member.model';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  private data: FamilyMember[] = [
    { id: this.generateId(), fullName: 'María Pérez', birthday: '1985-04-12', relation: 'Madre', phone: '555-1234', email: 'maria@example.com', accountType: 'editor', active: true },
    { id: this.generateId(), fullName: 'Carlos Pérez', birthday: '2010-08-02', relation: 'Hijo', phone: '555-5678', email: 'carlos@example.com', accountType: 'read', active: true }
  ];

  private subj = new BehaviorSubject<FamilyMember[]>(this.data);

  list(): Observable<FamilyMember[]> {
    return this.subj.asObservable();
  }

  get(id: string): Observable<FamilyMember | undefined> {
    return of(this.data.find(d => d.id === id));
  }

  create(payload: Partial<FamilyMember>): Observable<FamilyMember> {
    const member: FamilyMember = {
      id: this.generateId(),
      fullName: payload.fullName || '',
      birthday: payload.birthday,
      relation: payload.relation,
      phone: payload.phone,
      email: payload.email,
      accountType: payload.accountType || 'read',
      active: true
    };
    this.data = [member, ...this.data];
    this.subj.next(this.data);
    return of(member);
  }

  update(id: string, payload: Partial<FamilyMember>): Observable<FamilyMember | undefined> {
    const idx = this.data.findIndex(d => d.id === id);
    if (idx === -1) return of(undefined);
    this.data[idx] = { ...this.data[idx], ...payload };
    this.subj.next(this.data);
    return of(this.data[idx]);
  }

  deactivate(id: string): Observable<boolean> {
    const idx = this.data.findIndex(d => d.id === id);
    if (idx === -1) return of(false);
    this.data[idx].active = false;
    this.subj.next(this.data);
    return of(true);
  }
  activate(id: string): Observable<boolean> {
    const idx = this.data.findIndex(d => d.id === id);
    if (idx === -1) return of(false);
    this.data[idx].active = true;
    this.subj.next(this.data);
    return of(true);
  }
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

}
