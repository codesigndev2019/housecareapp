// EncryptionInterceptor scaffold
// - Detects requests that require encryption (by HttpContext flag or header) and transforms body
// - Adds headers: X-Enc-Key-Id, X-Enc-Alg
// - Uses EncryptionService for encryption

import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EncryptionService } from '../services/encryption.service';

@Injectable()
export class EncryptionInterceptor implements HttpInterceptor {
  constructor(private encryption: EncryptionService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Detection: custom header 'X-Encrypt': 'true'
    const shouldEncrypt = req.headers.get('X-Encrypt') === 'true';
    if (!shouldEncrypt || !req.body) return next.handle(req);

    return from(this.encryptAndClone(req)).pipe(switchMap((cloned) => next.handle(cloned)));
  }

  private async encryptAndClone(req: HttpRequest<any>) {
    try {
      const keyId = req.headers.get('X-Enc-Key-Id') || 'v1';
      // Fetch public key from well-known endpoint
      const pem = await this.encryption.fetchPublicKeyPem(keyId);
      const encrypted = await this.encryption.encryptPayload(req.body, pem, keyId);

      const cloned = req.clone({
        body: encrypted,
        setHeaders: {
          'Content-Type': 'application/json',
          'X-Enc-Key-Id': encrypted.keyId,
          'X-Enc-Alg': encrypted.alg
        }
      });

      return cloned;
    } catch (err) {
      console.warn('Encryption failed, proceeding without encryption', err);
      return req;
    }
  }
}
