import { Component, Input, OnDestroy } from '@angular/core';
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
import { I18nTextDirective } from '../../core/i18n/i18n-text.directive';
import { FamilyService } from '../../family/family.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatSlideToggleModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule, MatIconModule, MatButtonModule, MatDialogModule, TranslatePipe, I18nTextDirective],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent {
  private _event!: EventItem;
  @Input()
  set event(v: EventItem) {
    this._event = v;
    this.updateParticipantNames();
  }
  get event(): EventItem {
    return this._event;
  }

  editingReminder = false;
  participantNames: string[] = [];
  private familySub?: Subscription;

  constructor(private events: EventsService, private dialog: MatDialog, private family: FamilyService) {
    this.familySub = this.family.list().subscribe(list => {
      this.familyMap = (list || []).reduce((acc, cur) => { acc[cur.id] = cur.fullName; return acc; }, {} as Record<string,string>);
      this.updateParticipantNames();
    });
  }

  private familyMap: Record<string,string> = {};

  ngOnDestroy(): void {
    this.familySub?.unsubscribe();
  }

  toggleReminder(enabled: boolean) {
    const reminder = { ...(this.event.reminder || {}), enabled: !!enabled };
    if (!enabled) {
      reminder.dateTime = undefined;
      reminder.frequency = undefined;
    }
    this.events.update(this.event.id, { reminder: reminder as any }).subscribe();
  }

  updateReminderDateTime(dateStr: string) {
    const reminder = { ...(this.event.reminder || {}), dateTime: dateStr, enabled: !!this.event.reminder?.enabled };
    this.events.update(this.event.id, { reminder: reminder as any }).subscribe();
  }

  updateReminderFrequency(freq: any) {
    const reminder = { ...(this.event.reminder || {}), frequency: freq, enabled: !!this.event.reminder?.enabled };
    this.events.update(this.event.id, { reminder: reminder as any }).subscribe();
  }

  onReminderPartsChange(datePart: string, timePart: string) {
    const date = datePart || this.event.date;
    const time = timePart || this.event.time || '09:00';
    this.updateReminderDateTime(`${date}T${time}`);
  }

  private updateParticipantNames() {
    if (!this._event || !this._event.participants?.length) {
      this.participantNames = [];
      return;
    }
    this.participantNames = this._event.participants.map(id => this.familyMap[id] || id);
  }

  edit() {
    const ref = this.dialog.open(EventDialogComponent, { data: { mode: 'edit', event: this.event }, width: '560px' });
    ref.afterClosed().subscribe(res => {
      if (res && res.action === 'save' && res.payload) {
        this.events.update(this.event.id, res.payload).subscribe();
      }
    });
  }

  cancel() {
    // a simple delete for canceling an event
    this.events.delete(this.event.id).subscribe();
  }
}
