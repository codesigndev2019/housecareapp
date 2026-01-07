import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TokenStorageService } from '../core/services/token-storage.service';

@Component({
  selector: 'app-dev-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div style="max-width:520px;margin:3rem auto;padding:1.25rem">
      <h2>Dev Login</h2>
      <p>Este es un acceso temporal para desarrollo. Al hacer login se establecerá un token JWT válido.</p>
      <button mat-flat-button color="primary" (click)="login()">Login dummy</button>
    </div>
  `
})
export class DevLoginComponent {
  private router = inject(Router);
  private tokenStorage = inject(TokenStorageService);

  login(): void {
    // Generate a valid JWT token for development
    const token = this.generateDevToken();
    this.tokenStorage.setToken(token);
    this.router.navigate(['/app/dashboard']);
  }

  /**
   * Generate a valid JWT token for development purposes
   * Token expires in 24 hours
   */
  private generateDevToken(): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: 'dev-user-001',
      email: 'dev@housecareapp.local',
      name: 'Developer User',
      roles: ['admin', 'editor'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));

    // Note: This is a fake signature for dev purposes only
    // In production, tokens should come from the backend
    return `${base64Header}.${base64Payload}.dev-signature`;
  }
}
