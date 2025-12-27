import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dev-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div style="max-width:520px;margin:3rem auto;padding:1.25rem">
      <h2>Dev Login</h2>
      <p>Este es un acceso temporal para desarrollo. Al hacer login se establecerá un token dummy.</p>
      <button mat-flat-button color="primary" (click)="login()">Login dummy</button>
    </div>
  `
})
export class DevLoginComponent {
  constructor(private router: Router) {}

  login() {
    localStorage.setItem('app_token', 'dev');
    this.router.navigate(['/app/family']);
  }
}
