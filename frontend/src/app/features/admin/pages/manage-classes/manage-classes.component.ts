import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { ClassSeries } from '../../../../core/models';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Component({
  selector: 'app-manage-classes',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Manage Classes</h1>
          <p class="text-slate-500 mt-1">{{ classes().length }} class series</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D7377]"></div>
        </div>
      } @else if (error()) {
        <div class="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-600 font-medium">Failed to load classes</p>
          <p class="text-red-400 text-sm mt-1">{{ error() }}</p>
          <button (click)="loadClasses()" class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      } @else if (classes().length === 0) {
        <div class="mt-16 text-center">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl text-slate-400">&#128218;</span>
          </div>
          <h3 class="text-lg font-semibold text-slate-700">No class series yet</h3>
          <p class="text-sm text-slate-400 mt-1">Create your first class series to get started</p>
        </div>
      } @else {
        <div class="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Title</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Trainer</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Day / Time</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Date Range</th>
                  <th class="text-center px-6 py-3 font-semibold text-slate-600">Enrolled</th>
                  <th class="text-center px-6 py-3 font-semibold text-slate-600">Spots Left</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (cls of classes(); track cls.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td class="px-6 py-4 font-medium text-slate-800">{{ cls.title }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ cls.trainerName }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ getDayName(cls.dayOfWeek) }}, {{ cls.startTime }} - {{ cls.endTime }}</td>
                    <td class="px-6 py-4 text-slate-500 text-xs">{{ cls.startDate | date:'mediumDate' }} - {{ cls.endDate | date:'mediumDate' }}</td>
                    <td class="px-6 py-4 text-center text-slate-700 font-medium">{{ cls.currentEnrollment }}/{{ cls.maxParticipants }}</td>
                    <td class="px-6 py-4 text-center text-slate-600">{{ cls.spotsAvailable }}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [class]="statusBadge(cls.status)">
                        {{ cls.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class ManageClassesComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  error = signal<string | null>(null);
  classes = signal<ClassSeries[]>([]);

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getAllClasses().subscribe({
      next: (classes) => {
        this.classes.set(classes);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load classes');
        this.loading.set(false);
      },
    });
  }

  getDayName(dayOfWeek: number): string {
    return DAY_NAMES[dayOfWeek] ?? 'Unknown';
  }

  statusBadge(status: string): string {
    switch (status) {
      case 'OPEN': return 'bg-emerald-100 text-emerald-700';
      case 'FULL': return 'bg-amber-100 text-amber-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
