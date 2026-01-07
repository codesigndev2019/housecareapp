import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { LoadingService } from '../../core/services/loading.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let mockAuthService: { login: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockLoadingService: { show: ReturnType<typeof vi.fn>; hide: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn()
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
    component = TestBed.runInInjectionContext(() => new LoginComponent());
    component.ngOnInit();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should create form with email and password controls', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')).toBeDefined();
      expect(component.loginForm.get('password')).toBeDefined();
    });

    it('should have empty form initially', () => {
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have form invalid initially', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('should have submitting as false initially', () => {
      expect(component.submitting()).toBe(false);
    });

    it('should have password hidden initially', () => {
      expect(component.hidePassword()).toBe(true);
    });
  });

  describe('form validation', () => {
    it('should require email', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should accept valid email', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should require password', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should require minimum password length', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);
    });

    it('should accept valid password', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('123456');
      expect(passwordControl?.valid).toBe(true);
    });

    it('should be valid when all fields are correct', () => {
      component.loginForm.get('email')?.setValue('test@email.com');
      component.loginForm.get('password')?.setValue('password123');
      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('should toggle password visibility', () => {
      expect(component.hidePassword()).toBe(true);
      
      component.togglePasswordVisibility();
      expect(component.hidePassword()).toBe(false);
      
      component.togglePasswordVisibility();
      expect(component.hidePassword()).toBe(true);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.loginForm.get('email')?.setValue('test@email.com');
      component.loginForm.get('password')?.setValue('password123');
    });

    it('should not submit if form is invalid', () => {
      component.loginForm.get('email')?.setValue('');
      component.onSubmit();
      
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should mark form as touched when invalid', () => {
      component.loginForm.get('email')?.setValue('');
      component.onSubmit();
      
      expect(component.loginForm.touched).toBe(true);
    });

    it('should call authService.login on valid submit', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'test-token' }));
      
      component.onSubmit();
      
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@email.com',
        password: 'password123'
      });
    });

    it('should show loading on submit', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'test-token' }));
      
      component.onSubmit();
      
      expect(mockLoadingService.show).toHaveBeenCalledWith('login');
    });

    it('should navigate to home on successful login', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'test-token' }));
      
      component.onSubmit();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should hide loading on successful login', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'test-token' }));
      
      component.onSubmit();
      
      expect(mockLoadingService.hide).toHaveBeenCalledWith('login');
    });

    it('should set error message on login failure', () => {
      mockAuthService.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Invalid credentials' } }))
      );
      
      component.onSubmit();
      
      expect(component.errorMessage()).toBe('Invalid credentials');
    });

    it('should set default error message when no message provided', () => {
      mockAuthService.login.mockReturnValue(
        throwError(() => ({}))
      );
      
      component.onSubmit();
      
      expect(component.errorMessage()).toBe('Error al iniciar sesión');
    });

    it('should hide loading on login failure', () => {
      mockAuthService.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } }))
      );
      
      component.onSubmit();
      
      expect(mockLoadingService.hide).toHaveBeenCalledWith('login');
    });

    it('should set submitting to false on login failure', () => {
      mockAuthService.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } }))
      );
      
      component.onSubmit();
      
      expect(component.submitting()).toBe(false);
    });
  });
});
