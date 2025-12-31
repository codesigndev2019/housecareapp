import { Directive, Input, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';
import { I18nService } from './i18n.service';
import { Subscription } from 'rxjs';
import { LoggerService } from '../services/logger.service';

@Directive({
  selector: '[i18nText]',
  standalone: true
})
export class I18nTextDirective implements OnInit, OnDestroy {
  @Input('i18nText') key = '';
  private sub?: Subscription;
  private logger = inject(LoggerService);

  constructor(private el: ElementRef<HTMLElement>, private i18n: I18nService) {}

  ngOnInit(): void {
    this.logger.debug && this.logger.debug('I18nTextDirective initialized with key:', this.key);
    this.update();
    this.sub = this.i18n.translations$.subscribe(() => {
      this.logger.debug && this.logger.debug('I18nTextDirective received translations update for key:', this.key);
      this.update();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private update() {
    if (!this.key) return;
    const txt = this.i18n.instant(this.key, this.key);
    this.logger.debug && this.logger.debug('I18nTextDirective updating element with key:', this.key, 'value:', txt);
    this.el.nativeElement.textContent = txt;
  }
}
