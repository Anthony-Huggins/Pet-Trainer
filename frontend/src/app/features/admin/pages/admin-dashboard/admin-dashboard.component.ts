import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <h1 class="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
      <p class="text-slate-500 mt-1">Overview of your business at a glance</p>

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
          <div class="space-y-4">
            @for (activity of activities(); track activity.text) {
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                     [class]="activity.bgClass">
                  {{ activity.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-700">{{ activity.text }}</p>
                  <p class="text-xs text-slate-400 mt-0.5">{{ activity.time }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Action Items -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Action Items</h2>
          <div class="space-y-3">
            @for (item of actionItems(); track item.label) {
              <div class="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-[#0D7377]/30 transition-colors cursor-pointer">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm"
                       [style.background-color]="item.color + '15'" [style.color]="item.color">
                    {{ item.icon }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-700">{{ item.label }}</p>
                    <p class="text-xs text-slate-400">{{ item.sub }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold text-white"
                      [style.background-color]="item.color">
                  {{ item.count }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {
  stats = signal([
    { label: 'Total Revenue', value: '$12,450', icon: '$', color: '#10B981', change: '+12% from last month' },
    { label: 'Active Clients', value: '156', icon: '\u{1F464}', color: '#0D7377', change: '+8 new this month' },
    { label: 'Sessions This Month', value: '89', icon: '\u{1F4C5}', color: '#F59E0B', change: '23 remaining this week' },
    { label: 'Pending Inquiries', value: '7', icon: '\u{2709}', color: '#F87171', change: '3 new today' },
  ]);

  activities = signal([
    { icon: '\u{1F4C5}', text: 'New booking by Sarah M. - Private Training', time: '10 minutes ago', bgClass: 'bg-teal-50 text-teal-600' },
    { icon: '$', text: 'Payment received $85 - Group Obedience Class', time: '25 minutes ago', bgClass: 'bg-emerald-50 text-emerald-600' },
    { icon: '\u{2B50}', text: 'New 5-star review posted by James K.', time: '1 hour ago', bgClass: 'bg-amber-50 text-amber-600' },
    { icon: '\u{1F436}', text: 'New dog profile added: Bella (Golden Retriever)', time: '2 hours ago', bgClass: 'bg-blue-50 text-blue-600' },
    { icon: '\u{2709}', text: 'New inquiry from Mike D. about Board & Train', time: '3 hours ago', bgClass: 'bg-red-50 text-red-600' },
  ]);

  actionItems = signal([
    { label: 'Pending Review Approvals', sub: 'Reviews awaiting moderation', count: 3, icon: '\u{2B50}', color: '#F59E0B' },
    { label: 'Unanswered Inquiries', sub: 'Contact form submissions', count: 7, icon: '\u{2709}', color: '#F87171' },
    { label: 'Upcoming Sessions Today', sub: 'Scheduled for today', count: 5, icon: '\u{1F4C5}', color: '#0D7377' },
  ]);
}
