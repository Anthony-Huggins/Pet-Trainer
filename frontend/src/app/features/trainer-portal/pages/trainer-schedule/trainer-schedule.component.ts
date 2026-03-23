import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { SchedulingService } from '../../../../core/services/scheduling.service';
import { TrainerService } from '../../../../core/services/trainer.service';
import { Session } from '../../../../core/models';

interface ScheduleSession {
  day: number;
  startHour: number;
  title: string;
  type: 'private' | 'group' | 'board';
}

@Component({
  selector: 'app-trainer-schedule',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen bg-slate-100">
      <div class="max-w-7xl mx-auto py-10 px-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 class="text-3xl font-bold text-slate-800">My Schedule</h1>
          <div class="flex items-center gap-3">
            <!-- View Toggle -->
            <div class="inline-flex rounded-lg border border-slate-200 bg-white overflow-hidden">
              <button
                (click)="viewMode.set('week')"
                [class]="viewMode() === 'week'
                  ? 'px-4 py-2 text-sm font-medium bg-[#0D7377] text-white'
                  : 'px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50'"
              >Week</button>
              <button
                (click)="viewMode.set('month')"
                [class]="viewMode() === 'month'
                  ? 'px-4 py-2 text-sm font-medium bg-[#0D7377] text-white'
                  : 'px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50'"
              >Month</button>
            </div>
          </div>
        </div>

        <!-- Week Navigation -->
        <div class="flex items-center justify-between mb-6">
          <button
            (click)="prevWeek()"
            class="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold text-slate-700">{{ weekLabel() }}</h2>
            <button
              (click)="goToToday()"
              class="px-3 py-1 text-sm font-medium rounded-lg bg-[#0D7377] text-white hover:bg-[#0D7377]/90 transition-colors"
            >Today</button>
          </div>
          <button
            (click)="nextWeek()"
            class="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Loading indicator -->
        @if (loading()) {
          <div class="mb-4 text-center">
            <div class="inline-flex items-center gap-2 text-sm text-slate-500">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#0D7377]"></div>
              Loading sessions...
            </div>
          </div>
        }

        <!-- Error -->
        @if (error()) {
          <div class="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
            {{ error() }}
          </div>
        }

        <!-- Legend -->
        <div class="flex items-center gap-6 mb-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-[#0D7377]"></span>
            <span class="text-sm text-slate-600">Private</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
            <span class="text-sm text-slate-600">Group Class</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-[#F87171]"></span>
            <span class="text-sm text-slate-600">Board & Train</span>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <!-- Day Headers -->
          <div class="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200">
            <div class="p-3 bg-slate-50"></div>
            @for (day of weekDays(); track day.label) {
              <div class="p-3 text-center border-l border-slate-200"
                   [class]="day.isToday ? 'bg-teal-50' : 'bg-slate-50'">
                <p class="text-xs text-slate-500 uppercase">{{ day.label }}</p>
                <p class="text-lg font-semibold" [class]="day.isToday ? 'text-[#0D7377]' : 'text-slate-800'">{{ day.date }}</p>
              </div>
            }
          </div>

          <!-- Time Rows -->
          @for (hour of hours; track hour) {
            <div class="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100 last:border-b-0">
              <div class="p-2 text-right pr-4 text-xs text-slate-400 bg-slate-50 border-r border-slate-200">
                {{ formatHour(hour) }}
              </div>
              @for (dayIdx of [0,1,2,3,4,5,6]; track dayIdx) {
                <div class="relative h-14 border-l border-slate-100 hover:bg-slate-50/50 transition-colors">
                  @if (getSession(dayIdx, hour); as session) {
                    <div
                      class="absolute inset-1 rounded-md px-2 py-1 text-xs font-medium text-white flex items-center overflow-hidden"
                      [class]="getSessionBg(session.type)"
                    >
                      {{ session.title }}
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

      </div>
    </div>
  `,
})
export class TrainerScheduleComponent implements OnInit {
  private schedulingService = inject(SchedulingService);
  private trainerService = inject(TrainerService);

  viewMode = signal<'week' | 'month'>('week');
  weekOffset = signal(0);
  loading = signal(false);
  error = signal('');
  trainerId = signal<string | null>(null);

  hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  calendarSessions = signal<ScheduleSession[]>([]);

  weekStart = computed(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + this.weekOffset() * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  weekDays = computed(() => {
    const start = this.weekStart();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels.map((label, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        label,
        date: d.getDate(),
        isToday: d.getTime() === today.getTime(),
      };
    });
  });

  weekLabel = computed(() => {
    const start = this.weekStart();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
  });

  // Reload sessions when weekOffset changes
  private weekWatcher = effect(() => {
    // Access the signal to subscribe
    this.weekStart();
    if (this.trainerId()) {
      this.loadSessions();
    }
  });

  ngOnInit(): void {
    // First get the trainer's profile to get the trainerId
    this.trainerService.getMyProfile().subscribe({
      next: (profile) => {
        this.trainerId.set(profile.id);
        this.loadSessions();
      },
      error: () => {
        this.error.set('Could not load trainer profile.');
      },
    });
  }

  private loadSessions(): void {
    const tid = this.trainerId();
    if (!tid) return;

    this.loading.set(true);
    this.error.set('');

    const start = this.weekStart();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const fromStr = this.toDateString(start);
    const toStr = this.toDateString(end);

    this.schedulingService.getSessionsByTrainer(tid, fromStr, toStr).subscribe({
      next: (sessions) => {
        this.calendarSessions.set(this.mapSessionsToGrid(sessions, start));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load sessions.');
        this.calendarSessions.set([]);
        this.loading.set(false);
      },
    });
  }

  private mapSessionsToGrid(sessions: Session[], weekStart: Date): ScheduleSession[] {
    return sessions.map(s => {
      const sessionDate = new Date(s.sessionDate + 'T00:00:00');
      const dayDiff = Math.round((sessionDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      const startHour = parseInt(s.startTime.split(':')[0], 10);

      let type: 'private' | 'group' | 'board' = 'private';
      const name = (s.serviceTypeName ?? '').toLowerCase();
      if (name.includes('board') || name.includes('train')) {
        type = 'board';
      } else if (s.classSeriesId || name.includes('group') || name.includes('class')) {
        type = 'group';
      }

      const title = s.serviceTypeName
        ? `${s.serviceTypeName}${s.notes ? ' - ' + s.notes : ''}`
        : (s.notes ?? 'Session');

      return { day: dayDiff, startHour, title, type };
    }).filter(s => s.day >= 0 && s.day <= 6);
  }

  private toDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  prevWeek() {
    this.weekOffset.update(v => v - 1);
  }

  nextWeek() {
    this.weekOffset.update(v => v + 1);
  }

  goToToday() {
    this.weekOffset.set(0);
  }

  formatHour(hour: number): string {
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  }

  getSession(dayIdx: number, hour: number): ScheduleSession | undefined {
    return this.calendarSessions().find(s => s.day === dayIdx && s.startHour === hour);
  }

  getSessionBg(type: string): string {
    switch (type) {
      case 'private': return 'bg-[#0D7377]';
      case 'group': return 'bg-[#F59E0B]';
      case 'board': return 'bg-[#F87171]';
      default: return 'bg-slate-400';
    }
  }
}
