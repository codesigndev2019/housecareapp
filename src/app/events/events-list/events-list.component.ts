import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EventsService } from '../events.service';
import { Observable } from 'rxjs';
import { EventItem } from '../models/event.model';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { EventCardComponent } from '../event-card/event-card.component';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nTextDirective } from '../../core/i18n/i18n-text.directive';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, MatChipsModule, EventCardComponent, TranslatePipe, I18nTextDirective],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit {
  events$: Observable<EventItem[]>;

  constructor(private events: EventsService, private dialog: MatDialog) {
    this.events$ = this.events.list();
  }

  ngOnInit(): void {}

  openCreate() {
    const ref = this.dialog.open(EventDialogComponent, { data: { mode: 'create' }, width: '560px' });

    ref.afterClosed().subscribe(res => {
      if (res && res.action === 'save' && res.payload) {
        this.events.create(res.payload).subscribe();
      }
    });
  }

}
