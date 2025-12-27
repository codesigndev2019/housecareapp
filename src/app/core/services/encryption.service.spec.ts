import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    service = new EncryptionService();
  });

  it('should be defined with expected methods', () => {
    expect(service).toBeDefined();
    expect(service.importPublicKey).toBeDefined();
    expect(service.generateSymmetricKey).toBeDefined();
    expect(service.encryptPayload).toBeDefined();
    expect(service.fetchPublicKeyPem).toBeDefined();
  });

  it('should generate a symmetric key', async () => {
    const key = await service.generateSymmetricKey();
    expect(key).toBeDefined();
    expect(key.algorithm.name).toBe('AES-GCM');
  });
});