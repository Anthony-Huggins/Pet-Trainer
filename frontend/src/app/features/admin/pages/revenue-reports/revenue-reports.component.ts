import { Component, inject, signal, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { RevenueReport, ServiceRevenue, MonthlyRevenue } from '../../../../core/models';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-revenue-reports',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Revenue Reports</h1>
          <p class="text-slate-500 mt-1">Financial overview and analytics</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D7377]"></div>
        </div>
      } @else if (error()) {
        <div class="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-600 font-medium">Failed to load revenue data</p>
          <p class="text-red-400 text-sm mt-1">{{ error() }}</p>
          <button (click)="loadReport()" class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      } @else {
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p class="text-sm font-medium text-slate-500">Total Revenue</p>
            <p class="text-2xl font-bold mt-1 text-[#10B981]">{{ report()?.totalRevenue | currency }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p class="text-sm font-medium text-slate-500">This Month</p>
            <p class="text-2xl font-bold mt-1 text-[#0D7377]">{{ report()?.monthlyRevenue | currency }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p class="text-sm font-medium text-slate-500">Services Tracked</p>
            <p class="text-2xl font-bold mt-1 text-[#F59E0B]">{{ serviceBreakdown().length }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <!-- Revenue by Service -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-semibold text-slate-800 mb-6">Revenue by Service</h2>
            @if (serviceBreakdown().length === 0) {
              <p class="text-sm text-slate-400 text-center py-6">No service revenue data available</p>
            } @else {
              <div class="space-y-5">
                @for (svc of serviceBreakdown(); track svc.serviceName) {
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-sm font-medium text-slate-700">{{ svc.serviceName }}</span>
                      <span class="text-sm font-semibold text-slate-800">{{ svc.total | currency }} ({{ svc.percentage }}%)</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-3">
                      <div class="h-3 rounded-full transition-all duration-500"
                           [style.width.%]="svc.percentage"
                           [style.background-color]="svc.barColor"></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Monthly Trend -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-semibold text-slate-800 mb-6">Monthly Trend</h2>
            @if (monthlyBars().length === 0) {
              <p class="text-sm text-slate-400 text-center py-6">No monthly trend data available</p>
            } @else {
              <div class="flex items-end justify-between gap-2 h-48 px-2">
                @for (month of monthlyBars(); track month.label) {
                  <div class="flex flex-col items-center gap-2 flex-1">
                    <span class="text-xs font-medium text-slate-600">{{ month.amount | currency:'USD':'symbol':'1.0-0' }}</span>
                    <div class="w-full rounded-t-md transition-all duration-500"
                         [style.height.%]="month.heightPct"
                         [style.background-color]="month.isCurrentMonth ? '#0D7377' : '#0D737740'"></div>
                    <span class="text-xs text-slate-500">{{ month.label }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class RevenueReportsComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  error = signal<string | null>(null);
  report = signal<RevenueReport | null>(null);
  serviceBreakdown = signal<(ServiceRevenue & { percentage: number; barColor: string })[]>([]);
  monthlyBars = signal<{ label: string; amount: number; heightPct: number; isCurrentMonth: boolean }[]>([]);

  private barColors = ['#0D7377', '#F59E0B', '#F87171', '#10B981', '#6366F1', '#EC4899'];

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getRevenueReport().subscribe({
      next: (data) => {
        this.report.set(data);
        this.buildServiceBreakdown(data);
        this.buildMonthlyBars(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load revenue data');
        this.loading.set(false);
      },
    });
  }

  private buildServiceBreakdown(data: RevenueReport) {
    const totalServiceRevenue = (data.revenueByService ?? []).reduce((sum, s) => sum + (s.total ?? 0), 0);
    this.serviceBreakdown.set(
      (data.revenueByService ?? []).map((svc, i) => ({
        ...svc,
        percentage: totalServiceRevenue > 0 ? Math.round(((svc.total ?? 0) / totalServiceRevenue) * 100) : 0,
        barColor: this.barColors[i % this.barColors.length],
      }))
    );
  }

  private buildMonthlyBars(data: RevenueReport) {
    const trend = data.monthlyTrend ?? [];
    const maxRevenue = Math.max(...trend.map(m => m.revenue ?? 0), 1);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    this.monthlyBars.set(
      trend.map(m => ({
        label: MONTH_NAMES[m.month] ?? `M${m.month}`,
        amount: m.revenue ?? 0,
        heightPct: maxRevenue > 0 ? Math.round(((m.revenue ?? 0) / maxRevenue) * 100) : 0,
        isCurrentMonth: m.month === currentMonth && m.year === currentYear,
      }))
    );
  }
}
