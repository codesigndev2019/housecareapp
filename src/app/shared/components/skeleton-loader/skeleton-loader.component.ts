import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent {
  @Input() rows = 3;
  @Input() type: 'card' | 'list' | 'form' = 'list';
  @Input() animated = true;

  getRows(): number[] {
    return Array(this.rows).fill(0).map((_, i) => i);
  }

  getWidth(index: number): number {
    return Math.max(40, 90 - (index * 10));
  }
}
