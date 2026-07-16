import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockAuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(MockAuthService);
  private router = inject(Router);

  loginForm!: FormGroup;
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit() {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  togglePassword() {
    this.showPassword.update(curr => !curr);
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .then(() => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      })
      .catch((error: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message);
      });
  }

  // Pre-seed credentials quick login helper
  quickLogin(role: 'admin' | 'agent') {
    if (role === 'admin') {
      this.loginForm.patchValue({
        email: 'admin@demo.com',
        password: 'Admin123*'
      });
    } else {
      this.loginForm.patchValue({
        email: 'agent@demo.com',
        password: 'Agent123*'
      });
    }
    this.login();
  }
}
