import { Component, input, signal, effect, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field [appearance]="appearance()" [class]="fieldClass()">
      <mat-label>{{ labelTranslationKey() | translate }}</mat-label>
      
      <!-- Text Input -->
      @if (type() === 'text' || type() === 'email' || type() === 'password' || type() === 'tel') {
        <input 
          matInput 
          [type]="inputType()" 
          [formControl]="control()"
          [placeholder]="placeholder()"
          [attr.aria-label]="ariaLabelKey() | translate"
          [readonly]="readonly()">
      }
      
      <!-- Textarea -->
      @if (type() === 'textarea') {
        <textarea 
          matInput 
          [formControl]="control()"
          [placeholder]="placeholder()"
          [attr.aria-label]="ariaLabelKey() | translate"
          [readonly]="readonly()"
          [rows]="textareaRows()">
        </textarea>
      }
      
      <!-- Select -->
      @if (type() === 'select') {
        <mat-select [formControl]="control()" [attr.aria-label]="ariaLabelKey() | translate">
          @for (option of options(); track option.value) {
            <mat-option [value]="option.value">
              {{ option.translationKey ? (option.translationKey | translate) : option.label }}
            </mat-option>
          }
        </mat-select>
      }
      
      <!-- Prefix Icon -->
      @if (prefixIcon()) {
        <mat-icon matPrefix>{{ prefixIcon() }}</mat-icon>
      }
      
      <!-- Suffix Icon (like toggle password) -->
      @if (currentSuffixIcon()) {
        <button 
          type="button" 
          mat-icon-button 
          matSuffix 
          (click)="onSuffixClick()"
          [attr.aria-label]="currentSuffixAriaKey() | translate">
          <mat-icon>{{ currentSuffixIcon() }}</mat-icon>
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
export class FormFieldComponent {
  // Input signals
  control = input.required<FormControl>();
  type = input<'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select'>('text');
  labelTranslationKey = input<string>('');
  placeholder = input<string>('');
  ariaLabelKey = input<string>('');
  appearance = input<'fill' | 'outline'>('outline');
  fieldClass = input<string>('full-width');
  prefixIcon = input<string>('');
  suffixIcon = input<string>('');
  suffixAriaKey = input<string>('');
  options = input<FormFieldOption[]>([]);
  readonly = input<boolean>(false);
  textareaRows = input<number>(3);
  showPasswordToggle = input<boolean>(false);
  
  // Internal state signals
  inputType = signal<string>('text');
  currentSuffixIcon = signal<string>('');
  currentSuffixAriaKey = signal<string>('');
  
  constructor() {
    // Effect to initialize password toggle state
    effect(() => {
      const fieldType = this.type();
      const showToggle = this.showPasswordToggle();
      const customSuffix = this.suffixIcon();
      const customAriaKey = this.suffixAriaKey();
      
      if (fieldType === 'password' && showToggle) {
        this.inputType.set('password');
        this.currentSuffixIcon.set('visibility_off');
        this.currentSuffixAriaKey.set('auth.showPassword');
      } else {
        this.inputType.set(fieldType);
        this.currentSuffixIcon.set(customSuffix);
        this.currentSuffixAriaKey.set(customAriaKey);
      }
    }, { allowSignalWrites: true });
  }
  
  onSuffixClick(): void {
    if (this.type() === 'password' && this.showPasswordToggle()) {
      this.togglePasswordVisibility();
    }
  }
  
  private togglePasswordVisibility(): void {
    if (this.inputType() === 'password') {
      this.inputType.set('text');
      this.currentSuffixIcon.set('visibility');
      this.currentSuffixAriaKey.set('auth.hidePassword');
    } else {
      this.inputType.set('password');
      this.currentSuffixIcon.set('visibility_off');
      this.currentSuffixAriaKey.set('auth.showPassword');
    }
  }
  
  getErrorKeys(): { key: string; translationKey: string }[] {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return [];
    
    const errors: { key: string; translationKey: string }[] = [];
    const controlErrors = ctrl.errors;
    
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