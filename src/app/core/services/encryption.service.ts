// EncryptionService scaffold
// - Wrapper for Web Crypto (SubtleCrypto)
// - Methods: importPublicKey, generateSymmetricKey, encryptPayload, serializeResult
// - Note: for production, coordinate keyId exchange and rotation with backend

import { Injectable } from '@angular/core';

// Helper utilities for base64
function buf2b64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function str2ab(str: string) {
  const enc = new TextEncoder();
  return enc.encode(str).buffer;
}

@Injectable({ providedIn: 'root' })
export class EncryptionService {
  // Implement Web Crypto wrappers with AES-GCM and RSA-OAEP key wrapping

  async importPublicKey(pem: string, alg: 'RSA-OAEP' | 'RSA-OAEP-256' = 'RSA-OAEP'): Promise<CryptoKey> {
    // Supports PEM format (-----BEGIN PUBLIC KEY-----...)
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    let b64 = pem;
    if (pem.startsWith(pemHeader)) {
      b64 = pem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s+/g, '');
    }
    const binaryDer = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return await crypto.subtle.importKey('spki', binaryDer.buffer, { name: alg, hash: 'SHA-256' }, true, ['encrypt']);
  }

  async generateSymmetricKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  }

  private async exportSymmetricKeyRaw(key: CryptoKey): Promise<ArrayBuffer> {
    return await crypto.subtle.exportKey('raw', key);
  }

  async fetchPublicKeyPem(keyId = 'v1'): Promise<string> {
    // Default endpoint to retrieve public key for keyId. Backend must serve PEM (spki) text.
    const url = `/.well-known/enc-keys/${keyId}.pem`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to retrieve public key');
    return res.text();
  }

  async encryptPayload(plain: any, publicKeyPemOrKey: CryptoKey | string, keyId = 'v1') {
    // Hybrid encryption: generate AES-GCM key, encrypt payload JSON, wrap sym key with RSA-OAEP
    // Step 1: Ensure we have CryptoKey for public key
    let pubKey: CryptoKey;
    if (typeof publicKeyPemOrKey === 'string') {
      pubKey = await this.importPublicKey(publicKeyPemOrKey);
    } else {
      pubKey = publicKeyPemOrKey;
    }

    const symKey = await this.generateSymmetricKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const plainBuf = str2ab(JSON.stringify(plain));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, symKey, plainBuf);

    const rawSym = await this.exportSymmetricKeyRaw(symKey);
    const encryptedKeyBuf = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, rawSym);

    return {
      iv: buf2b64(iv.buffer),
      encryptedKey: buf2b64(encryptedKeyBuf),
      ciphertext: buf2b64(ciphertext),
      keyId,
      alg: 'RSA-OAEP+AES-GCM'
    };
  }
}
