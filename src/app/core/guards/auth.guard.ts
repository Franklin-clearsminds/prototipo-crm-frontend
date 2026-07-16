import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MockAuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(MockAuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Role permissions checks
  const user = authService.currentUser();
  const isAdminRoute = state.url.startsWith('/settings') || 
                       state.url.startsWith('/agents') || 
                       state.url.startsWith('/campaigns');

  if (isAdminRoute && user?.role === 'agent') {
    // Redirect agents to dashboard if trying to access admin pages
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
