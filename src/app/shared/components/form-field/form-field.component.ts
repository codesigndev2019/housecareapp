import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

export interface FormFieldOption {
  value: any;
  label: string;
  translationKey?: string;
}

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe
  ],
  template: `
    <mat-form-field [appearance]="appearance" [class]="fieldClass">
      <mat-label>{{ labelTranslationKey | translate }}</mat-label>
      
      <!-- Text Input -->
      @if (type === 'text' || type === 'email' || type === 'password' || type === 'tel') {
        <input 
          matInput 
          [type]="inputType" 
          [formControl]="control"
          [placeholder]="placeholder"
          [attr.aria-label]="ariaLabelKey | translate"
          [readonly]="readonly">
      }
      
      <!-- Textarea -->
      @if (type === 'textarea') {
        <textarea 
          matInput 
          [formControl]="control"
          [placeholder]="placeholder"
          [attr.aria-label]="ariaLabelKey | translate"
          [readonly]="readonly"
          [rows]="textareaRows">
        </textarea>
      }
      
      <!-- Select -->
      @if (type === 'select') {
        <mat-select [formControl]="control" [attr.aria-label]="ariaLabelKey | translate">
          @for (option of options; track option.value) {
            <mat-option [value]="option.value">
              {{ option.translationKey ? (option.translationKey | translate) : option.label }}
            </mat-option>
          }
        </mat-select>
      }
      
      <!-- Prefix Icon -->
      @if (prefixIcon) {
        <mat-icon matPrefix>{{ prefixIcon }}</mat-icon>
      }
      
      <!-- Suffix Icon (like toggle password) -->
      @if (suffixIcon) {
        <button 
          type="button" 
          mat-icon-button 
          matSuffix 
          (click)="onSuffixClick()"
          [attr.aria-label]="suffixAriaKey | translate">
          <mat-icon>{{ suffixIcon }}</mat-icon>
        </button>
      }
      
      <!-- Error Messages -->
      @for (error of getErrorKeys(); track error.key) {
        <mat-error>{{ error.translationKey | translate }}</mat-error>
      }
    </mat-form-field>
  `,
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent implements OnInit {
  @Input() control!: FormControl;
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select' = 'text';
  @Input() labelTranslationKey = '';
  @Input() placeholder = '';
  @Input() ariaLabelKey = '';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() fieldClass = 'full-width';
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() suffixAriaKey = '';
  @Input() options: FormFieldOption[] = [];
  @Input() readonly = false;
  @Input() textareaRows = 3;
  @Input() showPasswordToggle = false;
  
  inputType = 'text';
  
  ngOnInit() {
    if (this.type === 'password' && this.showPasswordToggle) {
      this.inputType = 'password';
      this.suffixIcon = 'visibility_off';
      this.suffixAriaKey = 'auth.showPassword';
    } else {
      this.inputType = this.type;
    }
  }
  
  onSuffixClick() {
    if (this.type === 'password' && this.showPasswordToggle) {
      this.togglePasswordVisibility();
    }
  }
  
  private togglePasswordVisibility() {
    if (this.inputType === 'password') {
      this.inputType = 'text';
      this.suffixIcon = 'visibility';
      this.suffixAriaKey = 'auth.hidePassword';
    } else {
      this.inputType = 'password';
      this.suffixIcon = 'visibility_off';
      this.suffixAriaKey = 'auth.showPassword';
    }
  }
  
  getErrorKeys(): { key: string; translationKey: string }[] {
    if (!this.control || !this.control.errors) return [];
    
    const errors: { key: string; translationKey: string }[] = [];
    const controlErrors = this.control.errors;
    
    // Map common validation errors to translation keys
    const errorKeyMap: { [key: string]: string } = {
      required: 'errors.required.field',
      email: 'errors.invalid.email',
      minlength: 'errors.minLength.field',
      pattern: 'errors.invalid.pattern',
      passwordMismatch: 'errors.invalid.passwordMatch'
    };
    
    Object.keys(controlErrors).forEach(key => {
      if (errorKeyMap[key]) {
        errors.push({ key, translationKey: errorKeyMap[key] });
      }
    });
    
    return errors;
  }
}