import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { DashboardStats, Booking } from '../../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <h1 class="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
      <p class="text-slate-500 mt-1">Overview of your business at a glance</p>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D7377]"></div>
        </div>
      } @else if (error()) {
        <div class="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-600 font-medium">Failed to load dashboard data</p>
          <p class="text-red-400 text-sm mt-1">{{ error() }}</p>
          <button (click)="loadStats()" class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      } @else {
        <!-- Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          @for (stat of stats(); track stat.label) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-500">{{ stat.label }}</p>
                  <p class="text-2xl font-bold mt-1" [style.color]="stat.color">{{ stat.value }}</p>
                </div>
                <div class="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                     [style.background-color]="stat.color + '15'" [style.color]="stat.color">
                  {{ stat.icon }}
                </div>
              </div>
              <p class="text-xs text-slate-400 mt-3">{{ stat.change }}</p>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <!-- Recent Activity -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
            @if (recentActivity().length === 0) {
              <p class="text-sm text-slate-400 text-center py-6">No recent activity</p>
            } @else {
              <div class="space-y-4">
                @for (activity of recentActivity(); track activity.id) {
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-teal-50 text-teal-600">
                      &#128197;
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-slate-700">{{ activity.clientName }} - {{ activity.session?.serviceTypeName || 'Session' }} ({{ activity.dogName }})</p>
                      <p class="text-xs text-slate-400 mt-0.5">{{ activity.createdAt | date:'short' }} &middot; {{ activity.status }}</p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Action Items -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-semibold text-slate-800 mb-4">Quick Stats</h2>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-4 rounded-lg border border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm bg-teal-50 text-teal-600">
                    &#128100;
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-700">New Users This Month</p>
                    <p class="text-xs text-slate-400">New registrations</p>
                  </div>
                </div>
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold text-white bg-[#0D7377]">
                  {{ dashboardData()?.newUsersThisMonth ?? 0 }}
                </span>
              </div>
              <div class="flex items-center justify-between p-4 rounded-lg border border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm bg-amber-50 text-amber-600">
                    &#128197;
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-700">Bookings This Month</p>
                    <p class="text-xs text-slate-400">Scheduled sessions</p>
                  </div>
                </div>
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold text-white bg-[#F59E0B]">
                  {{ dashboardData()?.bookingsThisMonth ?? 0 }}
                </span>
              </div>
              <div class="flex items-center justify-between p-4 rounded-lg border border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm bg-emerald-50 text-emerald-600">
                    &#128176;
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-700">Active Trainers</p>
                    <p class="text-xs text-slate-400">Currently accepting clients</p>
                  </div>
                </div>
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold text-white bg-[#10B981]">
                  {{ dashboardData()?.activeTrainers ?? 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  error = signal<string | null>(null);
  dashboardData = signal<DashboardStats | null>(null);

  stats = signal<{ label: string; value: string; icon: string; color: string; change: string }[]>([]);
  recentActivity = signal<Booking[]>([]);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.stats.set([
          {
            label: 'Total Revenue',
            value: '$' + (data.totalRevenue ?? 0).toLocaleString(),
            icon: '$',
            color: '#10B981',
            change: 'This month: $' + (data.revenueThisMonth ?? 0).toLocaleString(),
          },
          {
            label: 'Total Users',
            value: (data.totalUsers ?? 0).toString(),
            icon: '\u{1F464}',
            color: '#0D7377',
            change: '+' + (data.newUsersThisMonth ?? 0) + ' new this month',
          },
          {
            label: 'Total Bookings',
            value: (data.totalBookings ?? 0).toString(),
            icon: '\u{1F4C5}',
            color: '#F59E0B',
            change: (data.bookingsThisMonth ?? 0) + ' this month',
          },
          {
            label: 'Active Trainers',
            value: (data.activeTrainers ?? 0).toString(),
            icon: '\u{1F3C6}',
            color: '#F87171',
            change: 'Currently accepting clients',
          },
        ]);
        this.recentActivity.set(data.recentActivity ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'An unexpected error occurred');
        this.loading.set(false);
      },
    });
  }
}
