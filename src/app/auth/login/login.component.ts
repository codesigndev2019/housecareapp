import { Component, OnInit, inject, signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-login',
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
    TranslatePipe
  ],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  loginForm!: FormGroup;
  submitting = signal(false);
  hidePassword = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.loadingService.show('login');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loadingService.hide('login');
        this.submitting.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loadingService.hide('login');
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Error al iniciar sesión');
      }
    });
  }
}
