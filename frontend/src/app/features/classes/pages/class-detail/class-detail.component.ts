import { Component, OnInit, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SchedulingService } from '../../../../core/services/scheduling.service';
import { ClassSeries, Session } from '../../../../core/models';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Loading State -->
    @if (loading()) {
      <div class="max-w-6xl mx-auto py-16 px-6">
        <div class="animate-pulse space-y-6">
          <div class="h-4 w-32 bg-slate-200 rounded"></div>
          <div class="h-10 w-2/3 bg-slate-200 rounded"></div>
          <div class="h-6 w-1/3 bg-slate-200 rounded"></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div class="lg:col-span-2 space-y-6">
              <div class="h-40 bg-slate-200 rounded-xl"></div>
              <div class="h-60 bg-slate-200 rounded-xl"></div>
            </div>
            <div class="space-y-6">
              <div class="h-48 bg-slate-200 rounded-xl"></div>
              <div class="h-36 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Error State -->
    @if (error()) {
      <div class="max-w-6xl mx-auto py-16 px-6">
        <div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <svg class="w-12 h-12 text-[#F87171] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-xl font-semibold text-slate-800 mb-2">Unable to load class details</h2>
          <p class="text-slate-500 mb-6">{{ error() }}</p>
          <a routerLink="/classes"
             class="inline-flex items-center gap-2 text-[#0D7377] font-medium hover:underline">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Classes
          </a>
        </div>
      </div>
    }

    <!-- Content -->
    @if (classSeries() && !loading()) {
      <div class="max-w-6xl mx-auto py-12 px-6">

        <!-- Back Link -->
        <a routerLink="/classes"
           class="inline-flex items-center gap-2 text-slate-500 hover:text-[#0D7377] transition-colors mb-6 text-sm font-medium">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Classes
        </a>

        <!-- Header -->
        <div class="mb-8">
          <div class="flex flex-wrap items-center gap-3 mb-2">
            <span class="text-sm font-medium text-[#0D7377] bg-teal-50 px-3 py-1 rounded-full">
              {{ classSeries()!.serviceTypeName }}
            </span>
            <span [class]="statusBadgeClass()">
              {{ classSeries()!.status }}
            </span>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            {{ classSeries()!.title }}
          </h1>
          <p class="text-slate-500 text-lg">
            with <span class="font-medium text-slate-700">{{ classSeries()!.trainerName }}</span>
          </p>
        </div>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-8">

            <!-- Description -->
            @if (classSeries()!.description) {
              <div class="bg-white rounded-xl border border-slate-200 p-6">
                <h2 class="text-lg font-semibold text-slate-800 mb-3">About This Class</h2>
                <p class="text-slate-600 leading-relaxed whitespace-pre-line">{{ classSeries()!.description }}</p>
              </div>
            }

            <!-- Schedule Details -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
              <h2 class="text-lg font-semibold text-slate-800 mb-4">Schedule Details</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-slate-500">Day</p>
                    <p class="font-medium text-slate-800">{{ dayOfWeekName(classSeries()!.dayOfWeek) }}s</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-slate-500">Time</p>
                    <p class="font-medium text-slate-800">{{ formatTime(classSeries()!.startTime) }} &ndash; {{ formatTime(classSeries()!.endTime) }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-slate-500">Date Range</p>
                    <p class="font-medium text-slate-800">{{ formatDate(classSeries()!.startDate) }} &ndash; {{ formatDate(classSeries()!.endDate) }}</p>
                  </div>
                </div>

                @if (classSeries()!.location) {
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <svg class="w-5 h-5 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-slate-500">Location</p>
                      <p class="font-medium text-slate-800">{{ classSeries()!.location }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Session Dates -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
              <h2 class="text-lg font-semibold text-slate-800 mb-4">
                Session Dates
                @if (sessions().length > 0) {
                  <span class="text-sm font-normal text-slate-400 ml-2">({{ sessions().length }} sessions)</span>
                }
              </h2>
              @if (sessionsLoading()) {
                <div class="space-y-3">
                  @for (i of [1, 2, 3, 4]; track i) {
                    <div class="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
                  }
                </div>
              } @else if (sessions().length === 0) {
                <p class="text-slate-400 text-sm">No sessions scheduled yet.</p>
              } @else {
                <div class="space-y-2">
                  @for (session of sessions(); track session.id) {
                    <div class="flex items-center justify-between py-3 px-4 rounded-lg"
                         [class]="session.status === 'CANCELLED' ? 'bg-red-50' : 'bg-slate-50'">
                      <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full"
                             [class]="sessionDotClass(session.status)"></div>
                        <span class="font-medium text-slate-700">{{ formatDate(session.sessionDate) }}</span>
                        <span class="text-slate-400 text-sm">{{ formatTime(session.startTime) }} &ndash; {{ formatTime(session.endTime) }}</span>
                      </div>
                      <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                            [class]="sessionStatusClass(session.status)">
                        {{ session.status }}
                      </span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Right Column (Sidebar) -->
          <div class="space-y-6">

            <!-- Enrollment Card -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
              <h3 class="text-lg font-semibold text-slate-800 mb-4">Enrollment</h3>

              <!-- Progress Bar -->
              <div class="mb-3">
                <div class="flex justify-between text-sm mb-1.5">
                  <span class="text-slate-500">{{ classSeries()!.currentEnrollment }} / {{ classSeries()!.maxParticipants }} enrolled</span>
                  <span class="font-medium" [class]="enrollmentPercentage() >= 90 ? 'text-[#F87171]' : 'text-[#0D7377]'">
                    {{ enrollmentPercentage() }}%
                  </span>
                </div>
                <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                       [style.width.%]="enrollmentPercentage()"
                       [class]="enrollmentPercentage() >= 90 ? 'bg-[#F87171]' : enrollmentPercentage() >= 70 ? 'bg-[#F59E0B]' : 'bg-[#0D7377]'">
                  </div>
                </div>
              </div>

              <p class="text-sm mb-5" [class]="classSeries()!.spotsAvailable <= 3 ? 'text-[#F87171] font-medium' : 'text-slate-500'">
                @if (classSeries()!.spotsAvailable > 0) {
                  {{ classSeries()!.spotsAvailable }} {{ classSeries()!.spotsAvailable === 1 ? 'spot' : 'spots' }} available
                } @else {
                  Class is full
                }
              </p>

              <!-- Price Placeholder -->
              <div class="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg mb-5">
                <span class="text-sm text-slate-500">Price</span>
                <span class="font-semibold text-slate-700">Contact for pricing</span>
              </div>

              <!-- CTA Button -->
              @if (classSeries()!.status === 'OPEN') {
                <a routerLink="/book"
                   class="block w-full text-center py-3 px-6 bg-[#F59E0B] hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors shadow-sm">
                  Enroll Now
                </a>
              } @else if (classSeries()!.status === 'FULL') {
                <a routerLink="/book"
                   class="block w-full text-center py-3 px-6 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors shadow-sm">
                  Join Waitlist
                </a>
              } @else {
                <button disabled
                        class="block w-full text-center py-3 px-6 bg-slate-300 text-slate-500 font-semibold rounded-lg cursor-not-allowed">
                  {{ classSeries()!.status === 'COMPLETED' ? 'Class Completed' : 'Enrollment Closed' }}
                </button>
              }
            </div>

            <!-- Trainer Card -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
              <h3 class="text-lg font-semibold text-slate-800 mb-4">Your Trainer</h3>
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                  <span class="text-xl font-bold text-[#0D7377]">
                    {{ trainerInitials() }}
                  </span>
                </div>
                <div>
                  <p class="font-semibold text-slate-800">{{ classSeries()!.trainerName }}</p>
                  <p class="text-sm text-slate-500">{{ classSeries()!.serviceTypeName }} Specialist</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    }
  `,
})
export class ClassDetailComponent implements OnInit {
  id = input<string>();

  classSeries = signal<ClassSeries | null>(null);
  sessions = signal<Session[]>([]);
  loading = signal(true);
  sessionsLoading = signal(true);
  error = signal<string | null>(null);

  enrollmentPercentage = computed(() => {
    const cs = this.classSeries();
    if (!cs || cs.maxParticipants === 0) return 0;
    return Math.round((cs.currentEnrollment / cs.maxParticipants) * 100);
  });

  statusBadgeClass = computed(() => {
    const status = this.classSeries()?.status;
    const base = 'text-xs font-semibold px-3 py-1 rounded-full';
    switch (status) {
      case 'OPEN':
        return `${base} bg-emerald-50 text-emerald-700`;
      case 'FULL':
        return `${base} bg-red-50 text-red-700`;
      case 'COMPLETED':
        return `${base} bg-slate-100 text-slate-600`;
      case 'CANCELLED':
        return `${base} bg-red-50 text-red-600`;
      default:
        return `${base} bg-slate-100 text-slate-600`;
    }
  });

  trainerInitials = computed(() => {
    const name = this.classSeries()?.trainerName ?? '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  constructor(private schedulingService: SchedulingService) {}

  ngOnInit(): void {
    const classId = this.id();
    if (!classId) {
      this.error.set('No class ID provided.');
      this.loading.set(false);
      return;
    }
    this.loadClassSeries(classId);
    this.loadSessions(classId);
  }

  private loadClassSeries(id: string): void {
    this.schedulingService.getClassSeries(id).subscribe({
      next: (cs) => {
        this.classSeries.set(cs);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err.status === 404
            ? 'Class not found.'
            : 'Something went wrong. Please try again later.'
        );
        this.loading.set(false);
      },
    });
  }

  private loadSessions(id: string): void {
    this.schedulingService.getClassSeriesSessions(id).subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.sessionsLoading.set(false);
      },
      error: () => {
        this.sessionsLoading.set(false);
      },
    });
  }

  dayOfWeekName(day: number): string {
    const names = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return names[day - 1] ?? 'Unknown';
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  sessionDotClass(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-[#0D7377]';
      case 'COMPLETED':
        return 'bg-[#10B981]';
      case 'CANCELLED':
        return 'bg-[#F87171]';
      default:
        return 'bg-slate-400';
    }
  }

  sessionStatusClass(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-teal-50 text-[#0D7377]';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }
}
