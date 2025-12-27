import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-button.component.html',
  styleUrls: ['./loading-button.component.scss']
})
export class LoadingButtonComponent {
  @Input() loading = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() loadingLabel = 'Loading...';
  /** Optional extra classes to apply to the button */
  @Input() btnClass = '';
}
