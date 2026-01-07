import { describe, it, expect, beforeEach } from 'vitest';
import { JwtService, JwtPayload } from './jwt.service';

describe('JwtService', () => {
  let service: JwtService;

  // Helper to create a valid JWT token
  const createToken = (payload: JwtPayload): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = 'test-signature';
    return `${header}.${body}.${signature}`;
  };

  beforeEach(() => {
    service = new JwtService();
  });

  describe('decodeToken', () => {
    it('should decode a valid JWT token', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      const token = createToken(payload);

      const decoded = service.decodeToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe('user123');
      expect(decoded?.email).toBe('test@example.com');
    });

    it('should return null for empty token', () => {
      expect(service.decodeToken('')).toBeNull();
    });

    it('should return null for invalid token format', () => {
      expect(service.decodeToken('invalid')).toBeNull();
      expect(service.decodeToken('only.two')).toBeNull();
      expect(service.decodeToken('too.many.parts.here')).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(service.decodeToken(null as unknown as string)).toBeNull();
      expect(service.decodeToken(undefined as unknown as string)).toBeNull();
      expect(service.decodeToken(123 as unknown as string)).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for non-expired token', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 3600 // expires in 1 hour
      };
      const token = createToken(payload);

      expect(service.isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) - 3600 // expired 1 hour ago
      };
      const token = createToken(payload);

      expect(service.isTokenExpired(token)).toBe(true);
    });

    it('should return true for token without exp claim', () => {
      const payload: JwtPayload = {
        sub: 'user123'
      };
      const token = createToken(payload);

      expect(service.isTokenExpired(token)).toBe(true);
    });

    it('should return true for invalid token', () => {
      expect(service.isTokenExpired('invalid')).toBe(true);
      expect(service.isTokenExpired('')).toBe(true);
    });

    it('should consider token expired within buffer time', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 30 // expires in 30 seconds (within 60s buffer)
      };
      const token = createToken(payload);

      expect(service.isTokenExpired(token)).toBe(true);
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid non-expired token', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      const token = createToken(payload);

      expect(service.isTokenValid(token)).toBe(true);
    });

    it('should return false for expired token', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) - 3600
      };
      const token = createToken(payload);

      expect(service.isTokenValid(token)).toBe(false);
    });

    it('should return false for empty token', () => {
      expect(service.isTokenValid('')).toBe(false);
    });
  });

  describe('getTokenExpirationDate', () => {
    it('should return correct expiration date', () => {
      const expTimestamp = Math.floor(Date.now() / 1000) + 3600;
      const payload: JwtPayload = {
        sub: 'user123',
        exp: expTimestamp
      };
      const token = createToken(payload);

      const expirationDate = service.getTokenExpirationDate(token);

      expect(expirationDate).not.toBeNull();
      expect(expirationDate?.getTime()).toBe(expTimestamp * 1000);
    });

    it('should return null for token without exp', () => {
      const payload: JwtPayload = { sub: 'user123' };
      const token = createToken(payload);

      expect(service.getTokenExpirationDate(token)).toBeNull();
    });

    it('should return null for invalid token', () => {
      expect(service.getTokenExpirationDate('invalid')).toBeNull();
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return positive value for non-expired token', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      const token = createToken(payload);

      const remaining = service.getTimeUntilExpiration(token);

      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(3600 * 1000);
    });

    it('should return 0 for expired token', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) - 3600
      };
      const token = createToken(payload);

      expect(service.getTimeUntilExpiration(token)).toBe(0);
    });

    it('should return 0 for invalid token', () => {
      expect(service.getTimeUntilExpiration('invalid')).toBe(0);
    });
  });

  describe('getClaim', () => {
    it('should return specific claim value', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        email: 'test@example.com',
        roles: ['admin', 'user'],
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      const token = createToken(payload);

      expect(service.getClaim(token, 'email')).toBe('test@example.com');
      expect(service.getClaim<string[]>(token, 'roles')).toEqual(['admin', 'user']);
    });

    it('should return undefined for non-existent claim', () => {
      const payload: JwtPayload = { sub: 'user123' };
      const token = createToken(payload);

      expect(service.getClaim(token, 'email')).toBeUndefined();
    });
  });

  describe('getUserId', () => {
    it('should return user ID from sub claim', () => {
      const payload: JwtPayload = { sub: 'user123', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = createToken(payload);

      expect(service.getUserId(token)).toBe('user123');
    });
  });

  describe('getUserEmail', () => {
    it('should return user email', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      const token = createToken(payload);

      expect(service.getUserEmail(token)).toBe('test@example.com');
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles', () => {
      const payload: JwtPayload = {
        sub: 'user123',
        roles: ['admin', 'user'],
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      const token = createToken(payload);

      expect(service.getUserRoles(token)).toEqual(['admin', 'user']);
    });

    it('should return empty array if no roles', () => {
      const payload: JwtPayload = { sub: 'user123', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = createToken(payload);

      expect(service.getUserRoles(token)).toEqual([]);
    });
  });
});
