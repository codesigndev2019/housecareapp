import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Chore } from '../models/chore.model';
import { FamilyService } from '../../family/family.service';
import { Subscription } from 'rxjs';

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
    TranslatePipe
  ],
  templateUrl: './chore-card.component.html',
  styleUrls: ['./chore-card.component.scss']
})
export class ChoreCardComponent implements OnDestroy {
  @Input() chore!: Chore;
  @Input() showActions = true;

  @Output() view = new EventEmitter<Chore>();
  @Output() edit = new EventEmitter<Chore>();
  @Output() delete = new EventEmitter<Chore>();
  @Output() toggleCompleted = new EventEmitter<Chore>();

  responsibleName = '';
  private familySub?: Subscription;
  private familyMap: Record<string, string> = {};

  constructor(private familyService: FamilyService) {
    this.familySub = this.familyService.list().subscribe(members => {
      this.familyMap = members.reduce((acc, m) => {
        acc[m.id] = m.fullName;
        return acc;
      }, {} as Record<string, string>);
      this.updateResponsibleName();
    });
  }

  ngOnChanges() {
    this.updateResponsibleName();
  }

  ngOnDestroy() {
    this.familySub?.unsubscribe();
  }

  private updateResponsibleName() {
    if (this.chore?.responsibleId) {
      this.responsibleName = this.familyMap[this.chore.responsibleId] || this.chore.responsibleId;
    } else {
      this.responsibleName = '';
    }
  }

  getFrequencyKey(): string {
    switch (this.chore.frequency) {
      case 'daily': return 'chores.daily';
      case 'twice-weekly': return 'chores.twiceWeekly';
      case 'weekly': return 'chores.weekly';
      default: return 'chores.weekly';
    }
  }

  onToggle(checked: boolean) {
    this.toggleCompleted.emit(this.chore);
  }

  onView() {
    this.view.emit(this.chore);
  }

  onEdit() {
    this.edit.emit(this.chore);
  }

  onDelete() {
    this.delete.emit(this.chore);
  }
}
