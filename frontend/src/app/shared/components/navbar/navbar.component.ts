import { Component, computed, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WebSocketNotificationService } from '../../../core/services/websocket-notification.service';
import { UserRole } from '../../../core/models';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { NotificationToastComponent } from '../notification-toast/notification-toast.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NotificationBellComponent, NotificationToastComponent],
  template: `
    <nav class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo + Primary Nav -->
          <div class="flex items-center gap-8">
            <a routerLink="/" class="flex items-center gap-2">
              <span class="text-2xl">🐾</span>
              <span class="text-xl font-bold text-teal-700">PawForward</span>
            </a>

            <!-- Desktop nav links -->
            <div class="hidden md:flex items-center gap-1">
              <a
                routerLink="/services"
                routerLinkActive="bg-teal-50 text-teal-700"
                class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
              >
                Services
              </a>
              <a
                routerLink="/trainers"
                routerLinkActive="bg-teal-50 text-teal-700"
                class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
              >
                Trainers
              </a>
              <a
                routerLink="/classes"
                routerLinkActive="bg-teal-50 text-teal-700"
                class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
              >
                Classes
              </a>
              <a
                routerLink="/reviews"
                routerLinkActive="bg-teal-50 text-teal-700"
                class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
              >
                Reviews
              </a>
              <a
                routerLink="/about"
                routerLinkActive="bg-teal-50 text-teal-700"
                class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
              >
                About
              </a>
              <a
                routerLink="/contact"
                routerLinkActive="bg-teal-50 text-teal-700"
                class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
              >
                Contact
              </a>
            </div>
          </div>

          <!-- Right side: Auth -->
          <div class="flex items-center gap-3">
            @if (isAuthenticated()) {
              <!-- Notification Bell -->
              <app-notification-bell />

              <!-- Dashboard link based on role -->
              @if (isAdmin()) {
                <a
                  routerLink="/admin"
                  class="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
                >
                  Admin
                </a>
              }
              @if (isTrainer()) {
                <a
                  routerLink="/trainer"
                  class="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
                >
                  Trainer Portal
                </a>
              }
              @if (isClient()) {
                <a
                  routerLink="/dashboard"
                  class="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
                >
                  Dashboard
                </a>
                <a
                  routerLink="/book"
                  class="hidden sm:inline-flex bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
                >
                  Book Now
                </a>
              }
              <button
                (click)="logout()"
                class="text-sm text-slate-500 hover:text-slate-700 transition"
              >
                Log Out
              </button>
            } @else {
              <a
                routerLink="/auth/login"
                class="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-700 transition"
              >
                Log In
              </a>
              <a
                routerLink="/auth/register"
                class="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
              >
                Sign Up
              </a>
            }

            <!-- Mobile menu toggle -->
            <button
              (click)="mobileMenuOpen = !mobileMenuOpen"
              class="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (mobileMenuOpen) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileMenuOpen) {
        <div class="md:hidden border-t border-slate-200 bg-white">
          <div class="px-4 py-3 space-y-1">
            <a
              routerLink="/services"
              routerLinkActive="bg-teal-50 text-teal-700"
              (click)="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-teal-50"
            >
              Services
            </a>
            <a
              routerLink="/trainers"
              routerLinkActive="bg-teal-50 text-teal-700"
              (click)="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-teal-50"
            >
              Trainers
            </a>
            <a
              routerLink="/classes"
              routerLinkActive="bg-teal-50 text-teal-700"
              (click)="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-teal-50"
            >
              Classes
            </a>
            <a
              routerLink="/reviews"
              routerLinkActive="bg-teal-50 text-teal-700"
              (click)="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-teal-50"
            >
              Reviews
            </a>
            <a
              routerLink="/about"
              routerLinkActive="bg-teal-50 text-teal-700"
              (click)="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-teal-50"
            >
              About
            </a>
            <a
              routerLink="/contact"
              routerLinkActive="bg-teal-50 text-teal-700"
              (click)="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-teal-50"
            >
              Contact
            </a>

            @if (isAuthenticated()) {
              <hr class="border-slate-200 my-2" />
              @if (isAdmin()) {
                <a
                  routerLink="/admin"
                  (click)="mobileMenuOpen = false"
                  class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-teal-50"
                >
                  Admin
                </a>
              }
              @if (isTrainer()) {
                <a
                  routerLink="/trainer"
                  (click)="mobileMenuOpen = false"
                  class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-teal-50"
                >
                  Trainer Portal
                </a>
              }
              @if (isClient()) {
                <a
                  routerLink="/dashboard"
                  (click)="mobileMenuOpen = false"
                  class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-teal-50"
                >
                  Dashboard
                </a>
                <a
                  routerLink="/book"
                  (click)="mobileMenuOpen = false"
                  class="block px-3 py-2 rounded-lg text-sm font-medium text-teal-700 bg-teal-50"
                >
                  Book Now
                </a>
              }
            }
          </div>
        </div>
      }
    </nav>

    <!-- Toast Notification (renders outside nav for proper positioning) -->
    @if (isAuthenticated()) {
      <app-notification-toast />
    }
  `,
})
export class NavbarComponent implements OnDestroy {
  private authService = inject(AuthService);
  private wsService = inject(WebSocketNotificationService);

  mobileMenuOpen = false;

  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = computed(() => this.authService.userRole() === UserRole.ADMIN);
  isTrainer = computed(() => this.authService.userRole() === UserRole.TRAINER);
  isClient = computed(() => this.authService.userRole() === UserRole.CLIENT);

  private authEffect = effect(() => {
    if (this.authService.isAuthenticated()) {
      this.wsService.connect();
    } else {
      this.wsService.disconnect();
    }
  });

  logout(): void {
    this.wsService.disconnect();
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }
}
