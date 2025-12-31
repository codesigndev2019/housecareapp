import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { I18nService } from './i18n.service';
import { Subscription } from 'rxjs';

@Pipe({ name: 'translate', pure: false, standalone: true })
export class TranslatePipe implements PipeTransform, OnDestroy {

  private subscription?: Subscription;
  private lastKey = '';
  private lastValue = '';

  constructor(
    private i18n: I18nService,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to translation changes to trigger pipe updates
    this.subscription = this.i18n.translations$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  transform(key: string, fallback?: string): string {
    if (!key) return '';
    
    const result = this.i18n.instant(key, fallback);
    
    // Keep last value for change detection, but avoid noisy console output
    this.lastKey = key;
    this.lastValue = result;
    return result;
  }
}
