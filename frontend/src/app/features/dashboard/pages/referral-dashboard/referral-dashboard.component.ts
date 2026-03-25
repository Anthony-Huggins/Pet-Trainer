import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReferralService } from '../../../../core/services/referral.service';
import { ReferralDashboard } from '../../../../core/models';

@Component({
  selector: 'app-referral-dashboard',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Referral Program</h1>
        <p class="text-slate-500 mt-1">Share your code with friends and earn rewards when they sign up.</p>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="inline-block h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-[#0D7377]"></div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-700">{{ error() }}</p>
          <button (click)="loadDashboard()" class="mt-3 text-sm font-semibold text-[#0D7377] hover:underline">Try again</button>
        </div>
      }

      @if (!loading() && !error() && dashboard()) {
        <!-- Referral Code Card -->
        <div class="bg-gradient-to-r from-[#0D7377] to-teal-600 rounded-2xl p-8 text-white shadow-lg">
          <h2 class="text-lg font-semibold mb-2 opacity-90">Your Referral Code</h2>
          <div class="flex items-center gap-4 mb-4">
            <span class="text-4xl font-bold tracking-wider">{{ dashboard()!.code.code }}</span>
            <button
              (click)="copyCode()"
              class="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition">
              {{ copied() ? '✓ Copied!' : 'Copy' }}
            </button>
          </div>
          <p class="opacity-80 text-sm">Share this link with friends:</p>
          <div class="flex items-center gap-2 mt-1">
            <code class="text-sm bg-white/10 px-3 py-1.5 rounded-lg flex-1 overflow-x-auto">{{ shareLink() }}</code>
            <button
              (click)="copyLink()"
              class="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition flex-shrink-0">
              {{ linkCopied() ? '✓ Copied!' : 'Copy Link' }}
            </button>
          </div>
          <p class="mt-4 text-sm opacity-80">Friends get <strong>{{ dashboard()!.code.discountPercent }}% off</strong> their first purchase!</p>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center">
            <p class="text-3xl font-bold text-[#0D7377]">{{ dashboard()!.code.timesUsed }}</p>
            <p class="text-sm text-slate-500 mt-1">Total Referrals</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center">
            <p class="text-3xl font-bold text-[#F59E0B]">\${{ dashboard()!.totalSavingsGenerated.toFixed(2) }}</p>
            <p class="text-sm text-slate-500 mt-1">Savings Generated</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center">
            <p class="text-3xl font-bold text-emerald-600">{{ dashboard()!.code.discountPercent }}%</p>
            <p class="text-sm text-slate-500 mt-1">Discount Per Referral</p>
          </div>
        </div>

        <!-- Redemption History -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div class="p-6 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-800">Redemption History</h2>
          </div>

          @if (dashboard()!.redemptions.length === 0) {
            <div class="p-12 text-center">
              <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                <svg class="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p class="text-slate-500">No one has used your code yet. Share it to get started!</p>
            </div>
          } @else {
            <div class="divide-y divide-slate-100">
              @for (redemption of dashboard()!.redemptions; track redemption.id) {
                <div class="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p class="font-medium text-slate-800">{{ redemption.referredUserName }}</p>
                    <p class="text-sm text-slate-400">{{ formatDate(redemption.createdAt) }}</p>
                  </div>
                  <span class="text-sm font-semibold text-emerald-600">-\${{ redemption.discountApplied.toFixed(2) }}</span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ReferralDashboardComponent implements OnInit {
  private referralService = inject(ReferralService);

  dashboard = signal<ReferralDashboard | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  copied = signal(false);
  linkCopied = signal(false);

  shareLink = computed(() => {
    const code = this.dashboard()?.code?.code;
    return code ? `${window.location.origin}/auth/register?ref=${code}` : '';
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);
    this.referralService.getReferralDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load referral data. Please try again.');
        this.loading.set(false);
      },
    });
  }

  copyCode(): void {
    const code = this.dashboard()?.code?.code;
    if (code) {
      navigator.clipboard.writeText(code);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  copyLink(): void {
    const link = this.shareLink();
    if (link) {
      navigator.clipboard.writeText(link);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
