import { Directive, Input, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { I18nService } from './i18n.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[i18nText]',
  standalone: true
})
export class I18nTextDirective implements OnInit, OnDestroy {
  @Input('i18nText') key = '';
  private sub?: Subscription;

  constructor(private el: ElementRef<HTMLElement>, private i18n: I18nService) {}

  ngOnInit(): void {
    console.log('I18nTextDirective initialized with key:', this.key);
    this.update();
    this.sub = this.i18n.translations$.subscribe(() => {
      console.log('I18nTextDirective received translations update for key:', this.key);
      this.update();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private update() {
    if (!this.key) return;
    const txt = this.i18n.instant(this.key, this.key);
    console.log('I18nTextDirective updating element with key:', this.key, 'value:', txt);
    this.el.nativeElement.textContent = txt;
  }
}
