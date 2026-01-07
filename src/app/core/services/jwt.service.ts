/**
 * JwtService - Servicio para manejo y validación de tokens JWT
 *
 * Responsabilidades:
 * - Decodificar tokens JWT sin verificar firma (client-side)
 * - Validar expiración de tokens
 * - Extraer claims del payload
 *
 * NOTA: La verificación de firma DEBE hacerse en el backend.
 * Este servicio solo valida la estructura y expiración client-side.
 */
import { Injectable } from '@angular/core';

export interface JwtPayload {
  /** Subject - typically user ID */
  sub?: string;
  /** Expiration time (Unix timestamp in seconds) */
  exp?: number;
  /** Issued at (Unix timestamp in seconds) */
  iat?: number;
  /** Issuer */
  iss?: string;
  /** Audience */
  aud?: string | string[];
  /** User email (custom claim) */
  email?: string;
  /** User roles (custom claim) */
  roles?: string[];
  /** Allow additional claims */
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class JwtService {
  /** Buffer time in seconds before token is considered expired (default: 60s) */
  private readonly EXPIRATION_BUFFER_SECONDS = 60;

  /**
   * Decode a JWT token and extract its payload
   * @param token - The JWT token string
   * @returns The decoded payload or null if invalid
   */
  decodeToken(token: string): JwtPayload | null {
    if (!token || typeof token !== 'string') {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      // Handle base64url encoding (replace - with + and _ with /)
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Check if a token is expired
   * @param token - The JWT token string
   * @returns true if token is expired or invalid, false otherwise
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);

    if (!decoded) {
      return true;
    }

    // If no expiration claim, consider it expired for security
    if (typeof decoded.exp !== 'number') {
      return true;
    }

    const expirationDate = new Date(decoded.exp * 1000);
    const now = new Date();
    // Add buffer to handle clock skew and prevent edge cases
    const bufferMs = this.EXPIRATION_BUFFER_SECONDS * 1000;

    return expirationDate.getTime() - bufferMs < now.getTime();
  }

  /**
   * Check if a token is valid (not expired and properly formatted)
   * @param token - The JWT token string
   * @returns true if token is valid, false otherwise
   */
  isTokenValid(token: string): boolean {
    if (!token) {
      return false;
    }

    const decoded = this.decodeToken(token);
    if (!decoded) {
      return false;
    }

    return !this.isTokenExpired(token);
  }

  /**
   * Get the expiration date of a token
   * @param token - The JWT token string
   * @returns Date object or null if token is invalid
   */
  getTokenExpirationDate(token: string): Date | null {
    const decoded = this.decodeToken(token);

    if (!decoded || typeof decoded.exp !== 'number') {
      return null;
    }

    return new Date(decoded.exp * 1000);
  }

  /**
   * Get time remaining until token expires in milliseconds
   * @param token - The JWT token string
   * @returns Milliseconds until expiration, or 0 if expired/invalid
   */
  getTimeUntilExpiration(token: string): number {
    const expirationDate = this.getTokenExpirationDate(token);

    if (!expirationDate) {
      return 0;
    }

    const remaining = expirationDate.getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Extract a specific claim from the token
   * @param token - The JWT token string
   * @param claim - The claim key to extract
   * @returns The claim value or undefined
   */
  getClaim<T = unknown>(token: string, claim: string): T | undefined {
    const decoded = this.decodeToken(token);
    return decoded?.[claim] as T | undefined;
  }

  /**
   * Get the user ID from the token (sub claim)
   * @param token - The JWT token string
   * @returns User ID or undefined
   */
  getUserId(token: string): string | undefined {
    return this.getClaim<string>(token, 'sub');
  }

  /**
   * Get the user email from the token
   * @param token - The JWT token string
   * @returns Email or undefined
   */
  getUserEmail(token: string): string | undefined {
    return this.getClaim<string>(token, 'email');
  }

  /**
   * Get user roles from the token
   * @param token - The JWT token string
   * @returns Array of roles or empty array
   */
  getUserRoles(token: string): string[] {
    return this.getClaim<string[]>(token, 'roles') || [];
  }
}
