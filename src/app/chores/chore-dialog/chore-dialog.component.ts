import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { FamilyService } from '../../family/family.service';
import { FamilyMember } from '../../family/models/family-member.model';
import { Chore, ChoreFrequency } from '../models/chore.model';
import { Observable } from 'rxjs';

export interface ChoreDialogData {
  mode: 'create' | 'edit' | 'view';
  chore?: Chore;
}

@Component({
  selector: 'app-chore-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './chore-dialog.component.html',
  styleUrls: ['./chore-dialog.component.scss']
})
export class ChoreDialogComponent implements OnInit {
  form!: FormGroup;
  familyMembers$: Observable<FamilyMember[]>;
  isViewMode = false;

  frequencies: { value: ChoreFrequency; labelKey: string }[] = [
    { value: 'daily', labelKey: 'chores.daily' },
    { value: 'twice-weekly', labelKey: 'chores.twiceWeekly' },
    { value: 'weekly', labelKey: 'chores.weekly' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChoreDialogData,
    private familyService: FamilyService
  ) {
    this.familyMembers$ = this.familyService.list();
    this.isViewMode = data.mode === 'view';
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.data.chore?.name || '', Validators.required],
      responsibleId: [this.data.chore?.responsibleId || ''],
      frequency: [this.data.chore?.frequency || 'weekly', Validators.required]
    });

    if (this.isViewMode) {
      this.form.disable();
    }
  }

  getTitle(): string {
    switch (this.data.mode) {
      case 'create': return 'chores.createTitle';
      case 'edit': return 'chores.editTitle';
      case 'view': return 'chores.viewTitle';
      default: return 'chores.createTitle';
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.invalid) return;
    this.dialogRef.close({
      action: 'save',
      payload: this.form.value
    });
  }
}
