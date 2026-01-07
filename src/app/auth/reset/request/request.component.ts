import { Component, OnInit, inject, signal, NO_ERRORS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-reset-request',
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
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetRequestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  requestForm!: FormGroup;
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.loadingService.show('reset-request');

    this.authService.requestReset(this.requestForm.value.email).subscribe({
      next: () => {
        this.loadingService.hide('reset-request');
        this.submitting.set(false);
        this.successMessage.set('Se ha enviado un código de 6 dígitos a tu correo');
        setTimeout(() => {
          this.router.navigate(['/auth/reset/verify'], {
            queryParams: { email: this.requestForm.value.email }
          });
        }, 2000);
      },
      error: (err) => {
        this.loadingService.hide('reset-request');
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Error al solicitar el código');
      }
    });
  }
}
