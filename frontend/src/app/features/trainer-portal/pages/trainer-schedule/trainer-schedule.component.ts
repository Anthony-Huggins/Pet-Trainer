import { Component, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';

interface ScheduleSession {
  day: number;
  startHour: number;
  title: string;
  type: 'private' | 'group' | 'board';
}

@Component({
  selector: 'app-trainer-schedule',
  standalone: true,
  imports: [DatePipe],
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
export class TrainerScheduleComponent {
  viewMode = signal<'week' | 'month'>('week');
  weekOffset = signal(0);

  hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  mockSessions: ScheduleSession[] = [
    { day: 0, startHour: 9, title: 'Basic Obedience - Luna', type: 'private' },
    { day: 0, startHour: 14, title: 'Agility Group', type: 'group' },
    { day: 1, startHour: 10, title: 'Board & Train - Rocky', type: 'board' },
    { day: 1, startHour: 15, title: 'Puppy Class', type: 'group' },
    { day: 2, startHour: 9, title: 'Leash Reactivity - Max', type: 'private' },
    { day: 3, startHour: 11, title: 'Advanced Agility Group', type: 'group' },
    { day: 3, startHour: 14, title: 'Board & Train - Bella', type: 'board' },
    { day: 4, startHour: 9, title: 'Recall Training - Daisy', type: 'private' },
    { day: 4, startHour: 13, title: 'Socialization Group', type: 'group' },
  ];

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
    return this.mockSessions.find(s => s.day === dayIdx && s.startHour === hour);
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
