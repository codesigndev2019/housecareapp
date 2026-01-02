import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FamilyService } from '../../family/family.service';
import { EventsService } from '../events.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nTextDirective } from '../../core/i18n/i18n-text.directive';

@Component({
    selector: 'app-event-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSlideToggleModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, TranslatePipe, I18nTextDirective],
    templateUrl: './event-dialog.component.html',
    styleUrls: ['./event-dialog.component.scss']
})
export class EventDialogComponent implements OnInit {
    form!: FormGroup;
    familyOptions: any[] = [];

    constructor(
        private fb: FormBuilder,
        private family: FamilyService,
        private events: EventsService,
        private dialogRef: MatDialogRef<EventDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: [this.data?.event?.name || '', Validators.required],
            date: [this.data?.event?.date ? new Date(this.data.event.date) : new Date(), Validators.required],
            time: [this.data?.event?.time || '09:00', Validators.required],
            location: [this.data?.event?.location || ''],
            participants: [this.data?.event?.participants || []],
            reminderEnabled: [this.data?.event?.reminder?.enabled || false],
            reminderDate: [this.data?.event?.reminder?.dateTime ? new Date(this.data.event.reminder.dateTime) : null],
            reminderTime: [this.data?.event?.reminder?.dateTime ? (this.data.event.reminder.dateTime.substring(11, 16)) : '09:00'],
            reminderFreq: [this.data?.event?.reminder?.frequency || 'once']
        });

        this.family.list().subscribe(list => this.familyOptions = list);
    }

    save() {
        if (this.form.invalid) return;
        const v = this.form.value;
        const payload: any = {
            name: v.name,
            date: (v.date instanceof Date) ? v.date.toISOString().slice(0, 10) : v.date,
            time: v.time,
            location: v.location,
            participants: v.participants,
            reminder: { enabled: v.reminderEnabled }
        };

        if (v.reminderEnabled) {
            const datePart = v.reminderDate ? (v.reminderDate instanceof Date ? v.reminderDate.toISOString().slice(0, 10) : v.reminderDate) : payload.date;
            payload.reminder.dateTime = `${datePart}T${v.reminderTime}`;
            payload.reminder.frequency = v.reminderFreq;
        }

        this.dialogRef.close({ action: 'save', payload });
    }

    close() { this.dialogRef.close({ action: 'cancel' }); }
}
