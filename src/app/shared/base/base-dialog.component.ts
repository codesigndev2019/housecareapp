/**
 * BaseDialogComponent - Abstract base class for dialog components
 *
 * This class provides common functionality for dialog components including:
 * - Form creation and management
 * - View/Edit/Create mode handling
 * - Common dialog actions (save, cancel)
 * - Form validation utilities
 *
 * Usage:
 * @Component({...})
 * export class MyDialogComponent extends BaseDialogComponent<MyEntity> {
 *   protected createForm(): FormGroup {
 *     return this.fb.group({ ... });
 *   }
 *
 *   getTitleKey(): string {
 *     return this.isEditMode ? 'edit.title' : 'create.title';
 *   }
 * }
 */
import { Directive, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**
 * Standard dialog data structure
 * @template T - Entity type
 */
export interface DialogData<T> {
  /** Dialog mode: create new, edit existing, or view-only */
  mode: 'create' | 'edit' | 'view';
  /** Entity to edit or view (undefined for create mode) */
  entity?: T;
  /** Additional custom data */
  [key: string]: unknown;
}

/**
 * Standard dialog result structure
 * @template T - Entity/payload type
 */
export interface DialogResult<T> {
  /** Action performed */
  action: 'save' | 'cancel' | 'delete';
  /** Payload data (for save action) */
  payload?: Partial<T>;
}

/**
 * Abstract base class for dialog components
 * @template T - Entity type
 * @template D - Dialog data type (extends DialogData<T>)
 */
@Directive()
export abstract class BaseDialogComponent<T, D extends DialogData<T> = DialogData<T>> implements OnInit {
  /** Injected FormBuilder */
  protected readonly fb = inject(FormBuilder);

  /** Injected dialog reference */
  protected readonly dialogRef = inject(MatDialogRef<BaseDialogComponent<T, D>>);

  /** Injected dialog data */
  protected readonly data: D = inject(MAT_DIALOG_DATA);

  /** The form group for the dialog */
  form!: FormGroup;

  /** Convenience getters for mode checking */
  get isViewMode(): boolean {
    return this.data.mode === 'view';
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  get isCreateMode(): boolean {
    return this.data.mode === 'create';
  }

  /** The entity being edited/viewed */
  get entity(): T | undefined {
    return this.data.entity;
  }

  ngOnInit(): void {
    this.form = this.createForm();
    this.initializeFormValues();

    if (this.isViewMode) {
      this.form.disable();
    }
  }

  /**
   * Abstract method to create the form structure
   * Must be implemented by derived classes
   * @returns FormGroup for the dialog
   */
  protected abstract createForm(): FormGroup;

  /**
   * Get the i18n key for the dialog title
   * Should be overridden by derived classes for mode-specific titles
   * @returns Translation key for the title
   */
  abstract getTitleKey(): string;

  /**
   * Initialize form values from entity data
   * Override in derived classes for custom initialization
   */
  protected initializeFormValues(): void {
    if (this.entity) {
      this.form.patchValue(this.entity as any);
    }
  }

  /**
   * Handle form submission
   * Validates form and closes dialog with save result
   */
  save(): void {
    if (this.form.invalid) {
      this.markFormAsTouched();
      return;
    }

    const result: DialogResult<T> = {
      action: 'save',
      payload: this.getFormPayload()
    };

    this.dialogRef.close(result);
  }

  /**
   * Get the form data as payload
   * Override for custom payload transformation
   * @returns Form values as partial entity
   */
  protected getFormPayload(): Partial<T> {
    return this.form.value;
  }

  /**
   * Handle dialog cancellation
   * Closes dialog with cancel result
   */
  cancel(): void {
    const result: DialogResult<T> = {
      action: 'cancel'
    };
    this.dialogRef.close(result);
  }

  /**
   * Handle delete action (if applicable)
   * Closes dialog with delete result
   */
  delete(): void {
    const result: DialogResult<T> = {
      action: 'delete'
    };
    this.dialogRef.close(result);
  }

  /**
   * Mark all form controls as touched
   * Triggers validation display
   */
  protected markFormAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();

      // Handle nested form groups
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      }
    });
  }

  /**
   * Check if a form control has an error
   * @param controlName - Name of the control
   * @param errorType - Optional specific error type to check
   * @returns true if the control has the specified error
   */
  hasError(controlName: string, errorType?: string): boolean {
    const control = this.form.get(controlName);
    if (!control) return false;

    if (errorType) {
      return control.touched && control.hasError(errorType);
    }

    return control.touched && control.invalid;
  }

  /**
   * Get error message key for a control
   * Override for custom error messages
   * @param controlName - Name of the control
   * @returns Translation key for the error message
   */
  getErrorKey(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors) return '';

    if (control.hasError('required')) {
      return 'validation.required';
    }
    if (control.hasError('email')) {
      return 'validation.email';
    }
    if (control.hasError('minlength')) {
      return 'validation.minLength';
    }
    if (control.hasError('maxlength')) {
      return 'validation.maxLength';
    }
    if (control.hasError('pattern')) {
      return 'validation.pattern';
    }

    return 'validation.invalid';
  }
}
