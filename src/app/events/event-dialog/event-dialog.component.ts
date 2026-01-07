import { Component, inject } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FamilyService } from '../../family/family.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { EventItem } from '../models/event.model';
import { BaseDialogComponent, DialogData, DialogResult } from '../../shared/base/base-dialog.component';
import { FamilyMember } from '../../family/models/family-member.model';

/** Dialog data specific to EventDialog */
export interface EventDialogData extends DialogData<EventItem> {
  mode: 'create' | 'edit' | 'view';
  event?: EventItem;
}

/**
 * EventDialogComponent - Dialog for creating/editing events
 *
 * Extends BaseDialogComponent for common dialog functionality
 */
@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    TranslatePipe
  ],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})
export class EventDialogComponent extends BaseDialogComponent<EventItem, EventDialogData> {
  private readonly familyService = inject(FamilyService);

  /** Family members for participants selection */
  familyOptions: FamilyMember[] = [];

  override ngOnInit(): void {
    super.ngOnInit();
    this.familyService.list().subscribe(list => this.familyOptions = list);
  }

  /**
   * Create the form structure for events
   */
  protected createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      date: [new Date(), Validators.required],
      time: ['09:00', Validators.required],
      location: [''],
      participants: [[]],
      reminderEnabled: [false],
      reminderDate: [null],
      reminderTime: ['09:00'],
      reminderFreq: ['once']
    });
  }

  /**
   * Initialize form with event data (for edit/view modes)
   */
  protected override initializeFormValues(): void {
    const event = this.data.event || this.data.entity;
    if (event) {
      this.form.patchValue({
        name: event.name,
        date: event.date ? new Date(event.date) : new Date(),
        time: event.time,
        location: event.location,
        participants: event.participants,
        reminderEnabled: event.reminder?.enabled || false,
        reminderDate: event.reminder?.dateTime ? new Date(event.reminder.dateTime) : null,
        reminderTime: event.reminder?.dateTime ? event.reminder.dateTime.substring(11, 16) : '09:00',
        reminderFreq: event.reminder?.frequency || 'once'
      });
    }
  }

  /**
   * Get the title key based on dialog mode
   */
  getTitleKey(): string {
    switch (this.data.mode) {
      case 'create': return 'events.createTitle';
      case 'edit': return 'events.editTitle';
      case 'view': return 'events.viewTitle';
      default: return 'events.createTitle';
    }
  }

  /**
   * Transform form data to event payload
   */
  protected override getFormPayload(): Partial<EventItem> {
    const v = this.form.value;
    const payload: Partial<EventItem> = {
      name: v.name,
      date: (v.date instanceof Date) ? v.date.toISOString().slice(0, 10) : v.date,
      time: v.time,
      location: v.location,
      participants: v.participants,
      reminder: { enabled: v.reminderEnabled }
    };

    if (v.reminderEnabled) {
      const datePart = v.reminderDate
        ? (v.reminderDate instanceof Date ? v.reminderDate.toISOString().slice(0, 10) : v.reminderDate)
        : payload.date;
      payload.reminder = {
        enabled: true,
        dateTime: `${datePart}T${v.reminderTime}`,
        frequency: v.reminderFreq
      };
    }

    return payload;
  }

  /** Alias for template compatibility */
  close(): void {
    this.cancel();
  }
}
