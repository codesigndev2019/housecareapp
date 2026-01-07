import { Component, input, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { EventItem } from '../models/event.model';
import { EventsService } from '../events.service';
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { FamilyMemberNamePipe } from '../../shared/pipes/family-member-name.pipe';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatSlideToggleModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatChipsModule, 
    MatIconModule, 
    MatButtonModule, 
    MatDialogModule, 
    TranslatePipe, 
    FamilyMemberNamePipe
  ],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCardComponent {
  /** The event to display */
  event = input.required<EventItem>();

  /** Editing reminder state */
  editingReminder = signal(false);

  private events = inject(EventsService);
  private dialog = inject(MatDialog);

  toggleReminder(enabled: boolean): void {
    const currentEvent = this.event();
    const reminder = { ...(currentEvent.reminder || {}), enabled: !!enabled };
    if (!enabled) {
      reminder.dateTime = undefined;
      reminder.frequency = undefined;
    }
    this.events.update(currentEvent.id, { reminder: reminder as any }).subscribe();
  }

  updateReminderDateTime(dateStr: string): void {
    const currentEvent = this.event();
    const reminder = { ...(currentEvent.reminder || {}), dateTime: dateStr, enabled: !!currentEvent.reminder?.enabled };
    this.events.update(currentEvent.id, { reminder: reminder as any }).subscribe();
  }

  updateReminderFrequency(freq: any): void {
    const currentEvent = this.event();
    const reminder = { ...(currentEvent.reminder || {}), frequency: freq, enabled: !!currentEvent.reminder?.enabled };
    this.events.update(currentEvent.id, { reminder: reminder as any }).subscribe();
  }

  onReminderPartsChange(datePart: string, timePart: string): void {
    const currentEvent = this.event();
    const date = datePart || currentEvent.date;
    const time = timePart || currentEvent.time || '09:00';
    this.updateReminderDateTime(`${date}T${time}`);
  }

  edit(): void {
    const currentEvent = this.event();
    const ref = this.dialog.open(EventDialogComponent, { data: { mode: 'edit', event: currentEvent }, width: '560px' });
    ref.afterClosed().subscribe(res => {
      if (res && res.action === 'save' && res.payload) {
        this.events.update(currentEvent.id, res.payload).subscribe();
      }
    });
  }

  cancel(): void {
    this.events.delete(this.event().id).subscribe();
  }
}
