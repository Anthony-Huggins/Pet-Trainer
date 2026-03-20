import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { SessionPackage, ClientPackage } from '../../../../core/models';

@Component({
  selector: 'app-my-packages',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="max-w-6xl mx-auto py-10 px-6">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-slate-800">My Packages</h1>
      <p class="text-slate-500 mt-1">Manage your purchased training packages and sessions.</p>

      <!-- Loading State -->
      @if (loading()) {
        <div class="mt-10 text-center py-16">
          <div class="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#0D7377] rounded-full animate-spin"></div>
          <p class="text-slate-500 mt-4">Loading packages...</p>
        </div>
      } @else {
        <!-- Error State -->
        @if (error()) {
          <div class="mt-8 bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-red-700">
            {{ error() }}
          </div>
        }

        <!-- My Purchased Packages -->
        @if (myPackages().length > 0) {
          <h2 class="text-xl font-semibold text-slate-800 mt-10 mb-4">Your Packages</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (pkg of myPackages(); track pkg.id) {
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div class="flex items-start justify-between mb-4">
                  <h3 class="text-lg font-semibold text-slate-800">{{ pkg.packageName || 'Training Package' }}</h3>
                  <span [class]="getPackageStatusClasses(pkg.status)">
                    {{ pkg.status }}
                  </span>
                </div>

                <!-- Sessions Remaining Ring -->
                <div class="flex items-center justify-center my-6">
                  <div class="relative w-24 h-24">
                    <svg class="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                      <path class="text-slate-100" stroke="currentColor" stroke-width="3" fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                      <path class="text-[#0D7377]" stroke="currentColor" stroke-width="3" fill="none"
                        [attr.stroke-dasharray]="getSessionRingDash(pkg)"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-lg font-bold text-slate-800">{{ pkg.sessionsRemaining }}</span>
                    </div>
                  </div>
                </div>

                <p class="text-sm text-slate-500 text-center">Sessions remaining</p>
                @if (pkg.expiresAt) {
                  <p class="text-xs text-slate-400 text-center mt-2">Expires: {{ pkg.expiresAt | date:'MMM d, y' }}</p>
                }

                <a
                  routerLink="/book"
                  class="block w-full mt-5 px-4 py-2.5 rounded-lg bg-[#0D7377] text-white font-medium hover:bg-teal-700 transition-colors text-center"
                >
                  Book Using Package
                </a>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State for My Packages -->
          <div class="mt-10 bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-16 text-center">
            <svg class="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <h3 class="text-lg font-semibold text-slate-700 mt-4">No packages purchased yet</h3>
            <p class="text-slate-500 mt-2 max-w-md mx-auto">
              Training packages let you pre-purchase multiple sessions at a discount.
              Browse our available packages below to get started.
            </p>
          </div>
        }

        <!-- Available Packages for Purchase -->
        @if (availablePackages().length > 0) {
          <h2 class="text-xl font-semibold text-slate-800 mt-12 mb-4">Available Packages</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (pkg of availablePackages(); track pkg.id) {
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <h3 class="text-lg font-semibold text-slate-800">{{ pkg.name }}</h3>
                @if (pkg.description) {
                  <p class="text-sm text-slate-500 mt-2">{{ pkg.description }}</p>
                }

                <div class="mt-4 flex-1">
                  <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold text-slate-800">{{ pkg.price | currency:'USD' }}</span>
                  </div>
                  <p class="text-sm text-slate-500 mt-1">{{ pkg.sessionCount }} sessions included</p>
                  @if (pkg.perSessionPrice) {
                    <p class="text-sm text-[#0D7377] font-medium mt-1">{{ pkg.perSessionPrice | currency:'USD' }} per session</p>
                  }
                  @if (pkg.validDays) {
                    <p class="text-xs text-slate-400 mt-2">Valid for {{ pkg.validDays }} days after purchase</p>
                  }
                </div>

                <button
                  (click)="buyPackage(pkg.id)"
                  [disabled]="purchasingId() === pkg.id"
                  class="w-full mt-5 px-4 py-2.5 rounded-lg bg-[#F59E0B] text-white font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  @if (purchasingId() === pkg.id) {
                    <span class="inline-flex items-center gap-2">
                      <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Redirecting...
                    </span>
                  } @else {
                    Buy Package
                  }
                </button>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class MyPackagesComponent implements OnInit {
  myPackages = signal<ClientPackage[]>([]);
  availablePackages = signal<SessionPackage[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  purchasingId = signal<string | null>(null);

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    let loadedCount = 0;
    const checkDone = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        this.loading.set(false);
      }
    };

    this.paymentService.getMyPackages().subscribe({
      next: (packages) => {
        this.myPackages.set(packages);
        checkDone();
      },
      error: () => {
        this.error.set('Failed to load your packages.');
        checkDone();
      },
    });

    this.paymentService.getPackages().subscribe({
      next: (packages) => {
        this.availablePackages.set(packages.filter(p => p.isActive));
        checkDone();
      },
      error: () => {
        checkDone();
      },
    });
  }

  buyPackage(packageId: string): void {
    this.purchasingId.set(packageId);
    this.paymentService.createPackageCheckout(packageId).subscribe({
      next: (response) => {
        window.location.href = response.checkoutUrl;
      },
      error: () => {
        this.purchasingId.set(null);
        this.error.set('Failed to start checkout. Please try again.');
      },
    });
  }

  getSessionRingDash(pkg: ClientPackage): string {
    // Estimate total sessions (remaining is what we know; show proportional ring)
    // Use a max of 100 for the ring
    const percent = Math.min(pkg.sessionsRemaining * 10, 100);
    return `${percent}, 100`;
  }

  getPackageStatusClasses(status: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const lower = status.toLowerCase();
    if (lower === 'active') {
      return `${base} bg-emerald-50 text-emerald-700`;
    } else if (lower === 'expired') {
      return `${base} bg-red-50 text-red-700`;
    } else if (lower === 'depleted') {
      return `${base} bg-slate-100 text-slate-600`;
    }
    return `${base} bg-slate-100 text-slate-600`;
  }
}
