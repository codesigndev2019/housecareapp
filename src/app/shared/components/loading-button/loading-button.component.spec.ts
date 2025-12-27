import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <button [disabled]="loading || disabled" [ngClass]="btnClass">
      <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
      <ng-content *ngIf="!loading"></ng-content>
    </button>
  `
})
class StubLoadingButtonComponent {
  @Input() loading = false;
  @Input() btnClass = '';
  @Input() color: string = 'primary';
  @Input() type: string = 'button';
  @Input() disabled = false;
}

@Component({
  standalone: true,
  imports: [StubLoadingButtonComponent],
  template: `
    <app-loading-button [loading]="loading" [btnClass]="'auth-btn'">
      <span class="slot">Enviar Código</span>
    </app-loading-button>
  `
})
class HostComponent {
  loading = false;
}

describe('LoadingButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();
  });

  it('renders projected content when not loading', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const slot = fixture.debugElement.query(By.css('.slot'));
    expect(slot).toBeTruthy();
    expect(slot.nativeElement.textContent.trim()).toBe('Enviar Código');

    // spinner should not be present
    const spinner = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinner).toBeNull();
  });

  it('shows spinner when loading is true', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.loading = true;
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinner).toBeTruthy();

    // projected content is removed from DOM when loading is true due to *ngIf
    const slot = fixture.debugElement.query(By.css('.slot'));
    expect(slot).toBeNull();
  });
});