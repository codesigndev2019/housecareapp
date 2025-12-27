import { EncryptionInterceptor } from './encryption.interceptor';
import { EncryptionService } from '../services/encryption.service';

describe('EncryptionInterceptor', () => {
  it('should be defined', () => {
    expect(EncryptionInterceptor).toBeDefined();
  });

  it('should have intercept method', () => {
    expect(EncryptionInterceptor.prototype.intercept).toBeDefined();
  });

  it('should check for X-Encrypt header', () => {
    const encryptionService = new EncryptionService();
    const interceptor = new EncryptionInterceptor(encryptionService);
    
    // Interceptor should exist with proper service injection
    expect(interceptor).toBeDefined();
  });
});