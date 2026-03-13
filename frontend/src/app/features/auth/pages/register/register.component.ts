import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-teal-700">PawForward Academy</h1>
          <p class="text-slate-500 mt-2">Create your account</p>
        </div>

        <!-- Error message -->
        @if (errorMessage()) {
          <div
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm"
          >
            {{ errorMessage() }}
          </div>
        }

        <!-- Success message -->
        @if (successMessage()) {
          <div
            class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm"
          >
            {{ successMessage() }}
          </div>
        }

        <!-- Register form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-slate-700 mb-1"
                >First name</label
              >
              <input
                id="firstName"
                type="text"
                [(ngModel)]="firstName"
                name="firstName"
                required
                class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-slate-700 mb-1"
                >Last name</label
              >
              <input
                id="lastName"
                type="text"
                [(ngModel)]="lastName"
                name="lastName"
                required
                class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1"
              >Email</label
            >
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              placeholder="you&#64;example.com"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-slate-700 mb-1"
              >Phone <span class="text-slate-400">(optional)</span></label
            >
            <input
              id="phone"
              type="tel"
              [(ngModel)]="phone"
              name="phone"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1"
              >Password</label
            >
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              minlength="8"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              placeholder="At least 8 characters"
            />
            <!-- Password strength meter -->
            @if (password) {
              <div class="mt-2">
                <div class="flex gap-1">
                  @for (i of [0, 1, 2, 3]; track i) {
                    <div
                      class="h-1.5 flex-1 rounded-full transition-colors"
                      [class]="i < passwordStrength() ? strengthColor() : 'bg-slate-200'"
                    ></div>
                  }
                </div>
                <p class="text-xs mt-1" [class]="strengthTextColor()">
                  {{ strengthLabel() }}
                </p>
              </div>
            }
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-slate-700 mb-1"
              >Confirm password</label
            >
            <input
              id="confirmPassword"
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading() ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="flex items-center my-6">
          <div class="flex-1 border-t border-slate-200"></div>
          <span class="px-4 text-sm text-slate-400">or continue with</span>
          <div class="flex-1 border-t border-slate-200"></div>
        </div>

        <!-- Google OAuth -->
        <button
          (click)="signUpWithGoogle()"
          class="w-full flex items-center justify-center gap-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg transition"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </button>

        <!-- Login link -->
        <p class="text-center text-sm text-slate-500 mt-6">
          Already have an account?
          <a routerLink="/auth/login" class="text-teal-600 hover:text-teal-700 font-medium"
            >Log In</a
          >
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  passwordStrength = computed(() => {
    const p = this.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  });

  strengthColor = computed(() => {
    const s = this.passwordStrength();
    if (s <= 1) return 'bg-red-400';
    if (s === 2) return 'bg-amber-400';
    if (s === 3) return 'bg-emerald-400';
    return 'bg-emerald-500';
  });

  strengthTextColor = computed(() => {
    const s = this.passwordStrength();
    if (s <= 1) return 'text-red-500';
    if (s === 2) return 'text-amber-500';
    return 'text-emerald-500';
  });

  strengthLabel = computed(() => {
    const s = this.passwordStrength();
    if (s <= 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set('');

    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage.set('Password must be at least 8 characters');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);

    this.authService
      .register({
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone || undefined,
      })
      .subscribe({
        next: () => {
          this.successMessage.set(
            'Account created! You can now log in.'
          );
          this.isLoading.set(false);
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
        },
      });
  }

  signUpWithGoogle(): void {
    window.location.href = environment.googleOAuthUrl;
  }
}
