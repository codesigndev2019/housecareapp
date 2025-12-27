import { Component, OnInit, inject, signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { PasswordStrengthComponent } from '../../components/password-strength/password-strength.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-reset-verify',
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
    PasswordStrengthComponent,
    TranslatePipe
  ],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class ResetVerifyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loadingService = inject(LoadingService);

  verifyForm!: FormGroup;
  submitting = signal(false);
  hidePassword = signal(true);
  hideConfirm = signal(true);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  email = signal('');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email.set(params['email']);
      }
    });

    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
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
    if (this.verifyForm.invalid || !this.email()) {
      this.verifyForm.markAllAsTouched();
      if (!this.email()) {
        this.errorMessage.set('No se especificó el correo electrónico');
      }
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.loadingService.show('reset-verify');

    const payload = {
      email: this.email(),
      code: this.verifyForm.value.code,
      password: this.verifyForm.value.password
    };

    this.authService.verifyReset(payload).subscribe({
      next: () => {
        this.loadingService.hide('reset-verify');
        this.submitting.set(false);
        this.successMessage.set('Contraseña actualizada exitosamente');
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.loadingService.hide('reset-verify');
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Código inválido o expirado');
      }
    });
  }
}
