// with-loading directive scaffold
// - Usage: <div [withLoading]="isLoading$"> ... content ... </div>
// - When loading, it renders <app-skeleton-loader> automatically

import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';

@Directive({ selector: '[withLoading]' })
export class WithLoadingDirective implements OnInit {
  @Input('withLoading') loading$!: Observable<boolean>;
  @Input('withLoadingType') type: 'list' | 'card' | 'form' = 'list';

  private hasView = false;

  constructor(private tpl: TemplateRef<any>, private vcr: ViewContainerRef) {}

  ngOnInit(): void {
    this.loading$.subscribe((isLoading) => {
      this.vcr.clear();
      if (isLoading) {
        // render a skeleton loader placeholder
        const el = document.createElement('app-skeleton-loader');
        el.setAttribute('type', this.type);
        this.vcr.element.nativeElement.appendChild(el);
      } else {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }
}
