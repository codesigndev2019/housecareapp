import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Reusable validation service following Single Responsibility Principle
 * Provides common validation patterns used across the application
 */
@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  
  /**
   * Email validation pattern
   */
  static readonly EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  /**
   * Phone validation pattern (10-15 digits)
   */
  static readonly PHONE_PATTERN = /^\d{10,15}$/;
  
  /**
   * Strong password pattern (at least 8 chars, 1 upper, 1 lower, 1 digit, 1 special)
   */
  static readonly STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  /**
   * 6-digit verification code pattern
   */
  static readonly VERIFICATION_CODE_PATTERN = /^\d{6}$/;
  
  /**
   * Email validator
   */
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = ValidationService.EMAIL_PATTERN.test(control.value);
      return valid ? null : { email: true };
    };
  }
  
  /**
   * Phone validator
   */
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = ValidationService.PHONE_PATTERN.test(control.value.replace(/\D/g, ''));
      return valid ? null : { phone: true };
    };
  }
  
  /**
   * Strong password validator
   */
  static strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = ValidationService.STRONG_PASSWORD_PATTERN.test(control.value);
      return valid ? null : { weakPassword: true };
    };
  }
  
  /**
   * Verification code validator
   */
  static verificationCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = ValidationService.VERIFICATION_CODE_PATTERN.test(control.value);
      return valid ? null : { invalidCode: true };
    };
  }
  
  /**
   * Password confirmation validator
   * @param passwordField The name of the password field to match against
   */
  static passwordMatchValidator(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      
      const password = control.parent.get(passwordField);
      if (!password) return null;
      
      const valid = control.value === password.value;
      return valid ? null : { passwordMismatch: true };
    };
  }
  
  /**
   * Age validation (minimum age requirement)
   * @param minAge Minimum age in years
   */
  static ageValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= minAge ? null : { underage: { requiredAge: minAge, actualAge: age } };
    };
  }
  
  /**
   * Custom validator for required fields with specific error messages
   * @param errorKey Custom error key for translation
   */
  static customRequiredValidator(errorKey: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || (typeof control.value === 'string' && !control.value.trim())) {
        return { [errorKey]: true };
      }
      return null;
    };
  }
  
  /**
   * Get all validation error keys for a control
   * Useful for displaying multiple error messages
   */
  static getValidationErrors(control: AbstractControl): string[] {
    if (!control.errors) return [];
    return Object.keys(control.errors);
  }
  
  /**
   * Check if a specific validation error exists
   */
  static hasValidationError(control: AbstractControl, errorKey: string): boolean {
    return control.errors ? control.errors[errorKey] : false;
  }
  
  /**
   * Get validation error message key for translation
   * Maps validation errors to translation keys
   */
  static getErrorMessageKey(errorKey: string, fieldType: string = 'field'): string {
    const errorKeyMap: { [key: string]: string } = {
      required: `errors.required.${fieldType}`,
      email: 'errors.invalid.email',
      phone: 'errors.invalid.phone',
      weakPassword: 'errors.weak.password',
      passwordMismatch: 'errors.invalid.passwordMatch',
      invalidCode: 'errors.invalid.code',
      underage: 'errors.underage',
      minlength: `errors.minLength.${fieldType}`,
      maxlength: `errors.maxLength.${fieldType}`,
      pattern: `errors.invalid.${fieldType}`
    };
    
    return errorKeyMap[errorKey] || `errors.invalid.${fieldType}`;
  }
}