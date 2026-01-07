import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { FamilyMemberNamePipe } from '../../shared/pipes/family-member-name.pipe';
import { Chore } from '../models/chore.model';

@Component({
  selector: 'app-chore-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatChipsModule,
    TranslatePipe,
    FamilyMemberNamePipe
  ],
  templateUrl: './chore-card.component.html',
  styleUrls: ['./chore-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChoreCardComponent {
  /** The chore to display */
  chore = input.required<Chore>();

  /** Whether to show action buttons */
  showActions = input<boolean>(true);

  /** Emits when view is requested */
  view = output<Chore>();

  /** Emits when edit is requested */
  edit = output<Chore>();

  /** Emits when delete is requested */
  delete = output<Chore>();

  /** Emits when toggle completed is requested */
  toggleCompleted = output<Chore>();

  getFrequencyKey(): string {
    switch (this.chore().frequency) {
      case 'daily': return 'chores.daily';
      case 'twice-weekly': return 'chores.twiceWeekly';
      case 'weekly': return 'chores.weekly';
      default: return 'chores.weekly';
    }
  }

  onToggle(checked: boolean): void {
    this.toggleCompleted.emit(this.chore());
  }

  onView(): void {
    this.view.emit(this.chore());
  }

  onEdit(): void {
    this.edit.emit(this.chore());
  }

  onDelete(): void {
    this.delete.emit(this.chore());
  }
}
