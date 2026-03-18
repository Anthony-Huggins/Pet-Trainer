import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-revenue-reports',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Revenue Reports</h1>
          <p class="text-slate-500 mt-1">Financial overview and analytics</p>
        </div>
        <button class="inline-flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white font-medium rounded-lg hover:bg-amber-600 transition-colors text-sm">
          Export CSV
        </button>
      </div>

      <!-- Date Range -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6">
        <span class="text-sm font-medium text-slate-600">Date range:</span>
        <input type="date" value="2026-03-01"
               class="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]" />
        <span class="text-sm text-slate-400">to</span>
        <input type="date" value="2026-03-17"
               class="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]" />
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        @for (stat of summaryStats(); track stat.label) {
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p class="text-sm font-medium text-slate-500">{{ stat.label }}</p>
            <p class="text-2xl font-bold mt-1" [style.color]="stat.color">{{ stat.value }}</p>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <!-- Revenue by Service -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-6">Revenue by Service</h2>
          <div class="space-y-5">
            @for (svc of serviceRevenue(); track svc.name) {
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm font-medium text-slate-700">{{ svc.name }}</span>
                  <span class="text-sm font-semibold text-slate-800">{{ svc.amount }} ({{ svc.percentage }}%)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-3">
                  <div class="h-3 rounded-full transition-all duration-500"
                       [style.width.%]="svc.percentage"
                       [style.background-color]="svc.color"></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Monthly Trend -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-6">Monthly Trend</h2>
          <div class="flex items-end justify-between gap-2 h-48 px-2">
            @for (month of monthlyTrend(); track month.label) {
              <div class="flex flex-col items-center gap-2 flex-1">
                <span class="text-xs font-medium text-slate-600">{{ month.amount }}</span>
                <div class="w-full rounded-t-md transition-all duration-500"
                     [style.height.%]="month.heightPct"
                     [style.background-color]="month.label === 'Mar' ? '#0D7377' : '#0D737740'"></div>
                <span class="text-xs text-slate-500">{{ month.label }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RevenueReportsComponent {
  summaryStats = signal([
    { label: 'Total Revenue', value: '$12,450', color: '#10B981' },
    { label: 'Avg Per Session', value: '$92', color: '#0D7377' },
    { label: 'Total Sessions', value: '135', color: '#F59E0B' },
    { label: 'Refunds', value: '$340', color: '#F87171' },
  ]);

  serviceRevenue = signal([
    { name: 'Private Training', amount: '$5,603', percentage: 45, color: '#0D7377' },
    { name: 'Group Classes', amount: '$4,358', percentage: 35, color: '#F59E0B' },
    { name: 'Board & Train', amount: '$2,490', percentage: 20, color: '#F87171' },
  ]);

  monthlyTrend = signal([
    { label: 'Oct', amount: '$8.2k', heightPct: 55 },
    { label: 'Nov', amount: '$9.1k', heightPct: 61 },
    { label: 'Dec', amount: '$7.8k', heightPct: 52 },
    { label: 'Jan', amount: '$10.3k', heightPct: 69 },
    { label: 'Feb', amount: '$11.7k', heightPct: 78 },
    { label: 'Mar', amount: '$12.5k', heightPct: 100 },
  ]);
}
