import { JwtInterceptor } from './jwt.interceptor';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../../auth/services/auth.service';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';

describe('JwtInterceptor', () => {
  it('should be defined', () => {
    expect(JwtInterceptor).toBeDefined();
  });

  it('should have intercept method', () => {
    expect(JwtInterceptor.prototype.intercept).toBeDefined();
  });

  it('should add Authorization header when token exists', () => {
    const tokenStorage = new TokenStorageService();
    tokenStorage.setToken('test-token');
    
    const authService = {} as AuthService;
    const interceptor = new JwtInterceptor(tokenStorage, authService);
    
    const mockRequest = {
      clone: vi.fn().mockReturnThis(),
      headers: { set: vi.fn() }
    } as unknown as HttpRequest<any>;
    
    const mockHandler = {
      handle: vi.fn().mockReturnValue(of({}))
    } as unknown as HttpHandler;
    
    interceptor.intercept(mockRequest, mockHandler);
    
    expect(mockRequest.clone).toHaveBeenCalled();
  });
});