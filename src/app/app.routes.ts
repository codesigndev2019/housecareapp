import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { isDevMode } from '@angular/core';

/**
 * Development-only routes
 * These routes are only available in development mode and will be
 * stripped from production builds
 */
const devRoutes: Routes = isDevMode() ? [
  {
    path: 'dev-login',
    loadComponent: () => import('./dev-login/dev-login.component').then(c => c.DevLoginComponent)
  }
] : [];

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./layout/auth-layout/auth-layout.component').then(c => c.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent) },
      { path: 'register', loadComponent: () => import('./auth/register/register.component').then(c => c.RegisterComponent) },
      { path: 'reset', loadComponent: () => import('./auth/reset/request/request.component').then(c => c.ResetRequestComponent) },
      { path: 'reset/verify', loadComponent: () => import('./auth/reset/verify/verify.component').then(c => c.ResetVerifyComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  // Development routes (conditionally included)
  ...devRoutes,
  {
    path: 'app',
    loadComponent: () => import('./layout/internal-layout/internal-layout.component').then(c => c.InternalLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'family', loadComponent: () => import('./family/family-list/family-list.component').then(c => c.FamilyListComponent) },
      { path: 'chores', loadComponent: () => import('./chores/chores-list/chores-list.component').then(c => c.ChoresListComponent) },
      { path: 'catalogs', loadComponent: () => import('./catalogs/add-catalogs/add-catalogs.component').then(c => c.AddCatalogsComponent) },
      { path: 'recipes', loadComponent: () => import('./recipes/recipes-list/recipes-list.component').then(c => c.RecipesListComponent) },
      { path: 'events', loadComponent: () => import('./events/events-list/events-list.component').then(c => c.EventsListComponent) },
      { path: 'budget', loadComponent: () => import('./budget/budget-list/budget-list.component').then(c => c.BudgetListComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }
];
