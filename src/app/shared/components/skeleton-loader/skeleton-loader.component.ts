import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonLoaderComponent {
  /** Number of skeleton rows to display */
  rows = input<number>(3);

  /** Type of skeleton layout */
  type = input<'card' | 'list' | 'form'>('list');

  /** Whether to animate the skeleton */
  animated = input<boolean>(true);

  /** Computed array of row indices */
  rowIndices = computed(() => 
    Array(this.rows()).fill(0).map((_, i) => i)
  );

  getWidth(index: number): number {
    return Math.max(40, 90 - (index * 10));
  }
}
