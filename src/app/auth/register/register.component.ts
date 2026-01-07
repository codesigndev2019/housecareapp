import { Component, OnInit, inject, signal, NO_ERRORS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../../core/services/loading.service';
import { PasswordStrengthComponent } from '../components/password-strength/password-strength.component';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    PasswordStrengthComponent,
    TranslatePipe
  ],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  registerForm!: FormGroup;
  submitting = signal(false);
  hidePassword = signal(true);
  hideConfirm = signal(true);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  relationOptions = [
    { value: 'padre', label: 'Padre/Madre' },
    { value: 'hijo', label: 'Hijo/Hija' },
    { value: 'abuelo', label: 'Abuelo/Abuela' },
    { value: 'otro', label: 'Otro' }
  ];

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      relation: ['', []],
      dob: ['', []],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirm');
    if (password && confirm && password.value !== confirm.value) {
      confirm.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(v => !v);
  }

  toggleConfirmVisibility(): void {
    this.hideConfirm.update(v => !v);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.loadingService.show('register');

    const { confirm, ...payload } = this.registerForm.value;

    this.authService.register(payload).subscribe({
      next: () => {
        this.loadingService.hide('register');
        this.submitting.set(false);
        this.successMessage.set('Registro exitoso. Redirigiendo...');
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.loadingService.hide('register');
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Error al registrar');
      }
    });
  }
}
