import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { LoadingService } from '../../core/services/loading.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let mockAuthService: { register: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockLoadingService: { show: ReturnType<typeof vi.fn>; hide: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.useFakeTimers();

    mockAuthService = {
      register: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    mockLoadingService = {
      show: vi.fn(),
      hide: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: LoadingService, useValue: mockLoadingService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    // Create component within injection context
    component = TestBed.runInInjectionContext(() => new RegisterComponent());
    component.ngOnInit();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should create form with all required controls', () => {
      expect(component.registerForm).toBeDefined();
      expect(component.registerForm.get('fullName')).toBeDefined();
      expect(component.registerForm.get('email')).toBeDefined();
      expect(component.registerForm.get('password')).toBeDefined();
      expect(component.registerForm.get('confirm')).toBeDefined();
      expect(component.registerForm.get('relation')).toBeDefined();
      expect(component.registerForm.get('phone')).toBeDefined();
    });

    it('should have form invalid initially', () => {
      expect(component.registerForm.valid).toBe(false);
    });

    it('should have submitting as false initially', () => {
      expect(component.submitting()).toBe(false);
    });

    it('should have password hidden initially', () => {
      expect(component.hidePassword()).toBe(true);
      expect(component.hideConfirm()).toBe(true);
    });

    it('should have relation options defined', () => {
      expect(component.relationOptions.length).toBeGreaterThan(0);
    });
  });

  describe('form validation', () => {
    it('should require fullName', () => {
      const control = component.registerForm.get('fullName');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should require minimum fullName length', () => {
      const control = component.registerForm.get('fullName');
      control?.setValue('A');
      expect(control?.hasError('minlength')).toBe(true);
    });

    it('should require email', () => {
      const control = component.registerForm.get('email');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const control = component.registerForm.get('email');
      control?.setValue('invalid');
      expect(control?.hasError('email')).toBe(true);
    });

    it('should require password', () => {
      const control = component.registerForm.get('password');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should require minimum password length of 8', () => {
      const control = component.registerForm.get('password');
      control?.setValue('1234567');
      expect(control?.hasError('minlength')).toBe(true);
    });

    it('should require password confirmation', () => {
      const control = component.registerForm.get('confirm');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should validate phone pattern when provided', () => {
      const control = component.registerForm.get('phone');
      control?.setValue('123');
      expect(control?.hasError('pattern')).toBe(true);
    });

    it('should accept valid phone number', () => {
      const control = component.registerForm.get('phone');
      control?.setValue('1234567890');
      expect(control?.valid).toBe(true);
    });
  });

  describe('password matching', () => {
    it('should detect password mismatch', () => {
      component.registerForm.get('password')?.setValue('password123');
      component.registerForm.get('confirm')?.setValue('different123');
      component.registerForm.updateValueAndValidity();
      
      const confirmControl = component.registerForm.get('confirm');
      expect(confirmControl?.hasError('passwordMismatch')).toBe(true);
    });

    it('should pass when passwords match', () => {
      component.registerForm.get('password')?.setValue('password123');
      component.registerForm.get('confirm')?.setValue('password123');
      component.registerForm.updateValueAndValidity();
      
      expect(component.registerForm.hasError('passwordMismatch')).toBe(false);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('should toggle password visibility', () => {
      expect(component.hidePassword()).toBe(true);
      
      component.togglePasswordVisibility();
      expect(component.hidePassword()).toBe(false);
    });

    it('should toggle confirm visibility', () => {
      expect(component.hideConfirm()).toBe(true);
      
      component.toggleConfirmVisibility();
      expect(component.hideConfirm()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    const validFormData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirm: 'password123',
      relation: 'padre',
      dob: '',
      phone: ''
    };

    beforeEach(() => {
      Object.keys(validFormData).forEach(key => {
        component.registerForm.get(key)?.setValue((validFormData as any)[key]);
      });
    });

    it('should not submit if form is invalid', () => {
      component.registerForm.get('email')?.setValue('');
      component.onSubmit();
      
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should mark form as touched when invalid', () => {
      component.registerForm.get('fullName')?.setValue('');
      component.onSubmit();
      
      expect(component.registerForm.touched).toBe(true);
    });

    it('should call authService.register on valid submit', () => {
      mockAuthService.register.mockReturnValue(of({}));
      
      component.onSubmit();
      
      expect(mockAuthService.register).toHaveBeenCalled();
    });

    it('should not include confirm field in payload', () => {
      mockAuthService.register.mockReturnValue(of({}));
      
      component.onSubmit();
      
      const callArgs = mockAuthService.register.mock.calls[0][0];
      expect(callArgs.confirm).toBeUndefined();
    });

    it('should show loading on submit', () => {
      mockAuthService.register.mockReturnValue(of({}));
      
      component.onSubmit();
      
      expect(mockLoadingService.show).toHaveBeenCalledWith('register');
    });

    it('should set success message on successful register', () => {
      mockAuthService.register.mockReturnValue(of({}));
      
      component.onSubmit();
      
      expect(component.successMessage()).toBe('Registro exitoso. Redirigiendo...');
    });

    it('should navigate to login after delay on success', () => {
      mockAuthService.register.mockReturnValue(of({}));
      
      component.onSubmit();
      vi.advanceTimersByTime(1600);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should hide loading on successful register', () => {
      mockAuthService.register.mockReturnValue(of({}));
      
      component.onSubmit();
      
      expect(mockLoadingService.hide).toHaveBeenCalledWith('register');
    });

    it('should set error message on register failure', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => ({ error: { message: 'Email already exists' } }))
      );
      
      component.onSubmit();
      
      expect(component.errorMessage()).toBe('Email already exists');
    });

    it('should set default error message when no message provided', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => ({}))
      );
      
      component.onSubmit();
      
      expect(component.errorMessage()).toBe('Error al registrar');
    });

    it('should set submitting to false on error', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => ({}))
      );
      
      component.onSubmit();
      
      expect(component.submitting()).toBe(false);
    });
  });
});
