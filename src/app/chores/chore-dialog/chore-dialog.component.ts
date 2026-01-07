import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
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
import { BaseDialogComponent, DialogData } from '../../shared/base/base-dialog.component';

/** Dialog data specific to ChoreDialog */
export interface ChoreDialogData extends DialogData<Chore> {
  mode: 'create' | 'edit' | 'view';
  chore?: Chore;
}

/**
 * ChoreDialogComponent - Dialog for creating/editing/viewing chores
 *
 * Extends BaseDialogComponent for common dialog functionality
 */
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
export class ChoreDialogComponent extends BaseDialogComponent<Chore, ChoreDialogData> {
  private readonly familyService = inject(FamilyService);

  /** Observable of family members for responsible selection */
  familyMembers$: Observable<FamilyMember[]> = this.familyService.list();

  /** Available frequency options */
  readonly frequencies: { value: ChoreFrequency; labelKey: string }[] = [
    { value: 'daily', labelKey: 'chores.daily' },
    { value: 'twice-weekly', labelKey: 'chores.twiceWeekly' },
    { value: 'weekly', labelKey: 'chores.weekly' }
  ];

  /**
   * Create the form structure for chores
   */
  protected createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      responsibleId: [''],
      frequency: ['weekly', Validators.required]
    });
  }

  /**
   * Initialize form with chore data (for edit/view modes)
   */
  protected override initializeFormValues(): void {
    const chore = this.data.chore || this.data.entity;
    if (chore) {
      this.form.patchValue({
        name: chore.name,
        responsibleId: chore.responsibleId,
        frequency: chore.frequency
      });
    }
  }

  /**
   * Get the title key based on dialog mode
   */
  getTitleKey(): string {
    switch (this.data.mode) {
      case 'create': return 'chores.createTitle';
      case 'edit': return 'chores.editTitle';
      case 'view': return 'chores.viewTitle';
      default: return 'chores.createTitle';
    }
  }

  /** Alias methods for template compatibility */
  onCancel(): void {
    this.cancel();
  }

  onSave(): void {
    this.save();
  }
}
