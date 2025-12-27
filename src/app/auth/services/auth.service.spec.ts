import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('should be defined', () => {
    expect(AuthService).toBeDefined();
  });

  it('should have login, register, requestReset, verifyReset, refresh, logout methods', () => {
    expect(AuthService.prototype.login).toBeDefined();
    expect(AuthService.prototype.register).toBeDefined();
    expect(AuthService.prototype.requestReset).toBeDefined();
    expect(AuthService.prototype.verifyReset).toBeDefined();
    expect(AuthService.prototype.refresh).toBeDefined();
    expect(AuthService.prototype.logout).toBeDefined();
  });
});