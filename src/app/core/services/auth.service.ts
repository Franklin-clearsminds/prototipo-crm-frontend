import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole } from '../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private currentUserSignal = signal<User | null>(null);

  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  constructor(private router: Router) {
    // Check local storage / session mock initialization
    const savedUser = sessionStorage.getItem('crm_user');
    if (savedUser) {
      try {
        this.currentUserSignal.set(JSON.parse(savedUser));
      } catch (e) {
        sessionStorage.removeItem('crm_user');
      }
    }
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Simulate network request
      setTimeout(() => {
        if (email === 'admin@demo.com' && password === 'Admin123*') {
          const user: User = {
            id: 'admin_1',
            email: 'admin@demo.com',
            name: 'Alex Rivera',
            role: 'admin',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          };
          this.currentUserSignal.set(user);
          sessionStorage.setItem('crm_user', JSON.stringify(user));
          resolve(true);
        } else if (email === 'agent@demo.com' && password === 'Agent123*') {
          const user: User = {
            id: 'agent_1',
            email: 'agent@demo.com',
            name: 'Sarah Jenkins',
            role: 'agent',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
          };
          this.currentUserSignal.set(user);
          sessionStorage.setItem('crm_user', JSON.stringify(user));
          resolve(true);
        } else {
          reject(new Error('Credenciales incorrectas. Verifique su correo o contraseña.'));
        }
      }, 800);
    });
  }

  logout() {
    this.currentUserSignal.set(null);
    sessionStorage.removeItem('crm_user');
    this.router.navigate(['/login']);
  }

  updateProfile(name: string, email: string, avatarUrl?: string) {
    const current = this.currentUserSignal();
    if (current) {
      const updated = { ...current, name, email };
      if (avatarUrl) {
        updated.avatarUrl = avatarUrl;
      }
      this.currentUserSignal.set(updated);
      sessionStorage.setItem('crm_user', JSON.stringify(updated));
    }
  }
}
