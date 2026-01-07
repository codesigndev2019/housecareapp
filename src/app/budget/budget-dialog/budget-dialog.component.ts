import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { CatalogsService } from '../../catalogs/catalogs.service';
import { Catalog } from '../../catalogs/models/catalog.model';
import { BudgetMovement, CURRENCIES, Currency, MovementType } from '../models/budget.model';
import { Observable } from 'rxjs';
import { BaseDialogComponent, DialogData } from '../../shared/base/base-dialog.component';

/** Dialog data specific to BudgetMovementDialog */
export interface BudgetDialogData extends DialogData<BudgetMovement> {
  mode: 'create' | 'edit' | 'view';
  movement?: BudgetMovement;
}

/**
 * BudgetDialogComponent - Dialog for creating/editing/viewing budget movements
 *
 * Extends BaseDialogComponent for common dialog functionality
 */
@Component({
  selector: 'app-budget-dialog',
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
    MatSlideToggleModule,
    TranslatePipe
  ],
  templateUrl: './budget-dialog.component.html',
  styleUrls: ['./budget-dialog.component.scss']
})
export class BudgetDialogComponent extends BaseDialogComponent<BudgetMovement, BudgetDialogData> {
  private readonly catalogsService = inject(CatalogsService);

  /** Observable of catalogs for movement type selection */
  catalogs$: Observable<Catalog[]> = this.catalogsService.list();

  /** Available currencies */
  readonly currencies = CURRENCIES;

  /** Available movement types */
  readonly movementTypes: { value: MovementType; labelKey: string; icon: string }[] = [
    { value: 'income', labelKey: 'budget.income', icon: 'trending_up' },
    { value: 'expense', labelKey: 'budget.expense', icon: 'trending_down' }
  ];

  /**
   * Create the form structure for budget movements
   */
  protected createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      currency: ['USD' as Currency, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      movementType: ['expense' as MovementType, Validators.required],
      categoryId: [''],
      isFixed: [false]
    });
  }

  /**
   * Initialize form with movement data (for edit/view modes)
   */
  protected override initializeFormValues(): void {
    const movement = this.data.movement || this.data.entity;
    if (movement) {
      this.form.patchValue({
        name: movement.name,
        description: movement.description,
        currency: movement.currency,
        amount: movement.amount,
        movementType: movement.movementType,
        categoryId: movement.categoryId,
        isFixed: movement.isFixed
      });
    }
  }

  /**
   * Get the title key based on dialog mode
   */
  getTitleKey(): string {
    switch (this.data.mode) {
      case 'create': return 'budget.createTitle';
      case 'edit': return 'budget.editTitle';
      case 'view': return 'budget.viewTitle';
      default: return 'budget.createTitle';
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
