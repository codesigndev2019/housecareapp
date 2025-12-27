import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Base class for auth forms following DRY principle
 * Provides common functionality for login, register, and reset forms
 */
@Component({ template: '' })
export abstract class BaseAuthComponent implements OnDestroy {
  protected formBuilder = inject(FormBuilder);
  protected router = inject(Router);
  protected destroy$ = new Subject<void>();
  
  form!: FormGroup;
  isLoading = false;
  errorMessage = '';
  
  constructor() {
    this.createForm();
    this.setupFormValidation();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Abstract method to be implemented by child classes
   * Should create the specific form for each auth type
   */
  protected abstract createForm(): void;
  
  /**
   * Abstract method for form submission
   * Should handle the specific submission logic for each form
   */
  protected abstract onSubmit(): Promise<void>;
  
  /**
   * Setup common form validation behavior
   */
  protected setupFormValidation(): void {
    // Mark all fields as touched when form is submitted
    // This ensures validation errors are shown immediately
    this.form?.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.form.invalid && this.isLoading) {
          this.markFormGroupTouched();
        }
      });
  }
  
  /**
   * Mark all form fields as touched to trigger validation display
   */
  protected markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
      
      if (control && 'controls' in control) {
        this.markFormGroupTouched();
      }
    });
  }
  
  /**
   * Reset form and error state
   */
  protected resetForm(): void {
    this.form.reset();
    this.errorMessage = '';
    this.isLoading = false;
  }
  
  /**
   * Handle form submission with loading state
   */
  async handleSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.onSubmit();
    } catch (error: any) {
      this.errorMessage = error?.message || 'An error occurred';
      console.error('Form submission error:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Navigate to a different route
   */
  protected navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  
  /**
   * Check if a form field has a specific error
   */
  hasFieldError(fieldName: string, errorType: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }
  
  /**
   * Get error message for a form field
   */
  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || (!field.dirty && !field.touched)) {
      return null;
    }
    
    // Return first error key for translation
    const errorKey = Object.keys(field.errors)[0];
    return `errors.${errorKey}.${fieldName}`;
  }
  
  /**
   * Check if form is valid and ready for submission
   */
  get isFormValid(): boolean {
    return this.form.valid && !this.isLoading;
  }
  
  /**
   * Get form data as typed object
   */
  protected getFormData<T>(): T {
    return this.form.value as T;
  }
}