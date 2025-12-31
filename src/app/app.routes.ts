import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

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
  { path: 'dev-login', loadComponent: () => import('./dev-login/dev-login.component').then(c => c.DevLoginComponent) },
  {
    path: 'app',
    loadComponent: () => import('./layout/internal-layout/internal-layout.component').then(c => c.InternalLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      { path: 'family', loadComponent: () => import('./family/family-list/family-list.component').then(c => c.FamilyListComponent) },
      { path: 'catalogs', loadComponent: () => import('./catalogs/add-catalogs/add-catalogs.component').then(c => c.AddCatalogsComponent) },
      { path: 'recipes', loadComponent: () => import('./recipes/recipes-list/recipes-list.component').then(c => c.RecipesListComponent) },
      { path: '', redirectTo: 'family', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }
];
