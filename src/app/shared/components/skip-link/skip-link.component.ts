import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-skip-link',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './skip-link.component.html',
  styleUrls: ['./skip-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkipLinkComponent {}
