import { Component, inject, signal, OnInit } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SchedulingService } from '../../../../core/services/scheduling.service';
import { ClassSeries } from '../../../../core/models';

@Component({
  selector: 'app-class-schedule',
  standalone: true,
  imports: [NgClass, DatePipe, RouterLink],
  template: `
    <div class="bg-[#FAFBFC] min-h-screen py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <!-- Page Heading -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-slate-800">Group Class Schedule</h1>
          <p class="mt-3 text-lg text-slate-500">
            Browse our upcoming group training classes and find the perfect fit for you and your dog.
          </p>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-slate-200 border-t-[#0D7377] rounded-full animate-spin"></div>
            <p class="mt-4 text-slate-500">Loading classes...</p>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto">
            <p class="text-red-600 font-medium">{{ error() }}</p>
            <button
              (click)="loadClasses()"
              class="mt-3 text-[#0D7377] font-semibold hover:underline">
              Try again
            </button>
          </div>
        }

        <!-- Empty State -->
        @if (!loading() && !error() && classes().length === 0) {
          <div class="text-center py-20">
            <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-slate-800 mb-2">No Classes Scheduled</h2>
            <p class="text-slate-500">Check back soon for upcoming group training classes.</p>
          </div>
        }

        <!-- Class Cards List -->
        @if (!loading() && !error() && classes().length > 0) {
          <div class="space-y-5">
            @for (cls of classes(); track cls.id) {
              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                  <!-- Left: Class Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 flex-wrap mb-2">
                      <h2 class="text-xl font-bold text-slate-800">{{ cls.title }}</h2>
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-700': cls.status === 'OPEN',
                          'bg-amber-100 text-amber-700': cls.status === 'WAITLIST',
                          'bg-red-100 text-red-700': cls.status === 'FULL',
                          'bg-slate-100 text-slate-600': cls.status !== 'OPEN' && cls.status !== 'WAITLIST' && cls.status !== 'FULL'
                        }">
                        {{ cls.status }}
                      </span>
                    </div>

                    @if (cls.description) {
                      <p class="text-slate-500 mb-3 line-clamp-2">{{ cls.description }}</p>
                    }

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
                      <!-- Trainer -->
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{{ cls.trainerName }}</span>
                      </div>

                      <!-- Schedule -->
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{{ getDayName(cls.dayOfWeek) }}s, {{ cls.startTime }} - {{ cls.endTime }}</span>
                      </div>

                      <!-- Dates -->
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{{ cls.startDate | date:'MMM d' }} - {{ cls.endDate | date:'MMM d, y' }}</span>
                      </div>

                      <!-- Location -->
                      @if (cls.location) {
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{{ cls.location }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Right: Enrollment + Action -->
                  <div class="flex flex-col items-end gap-4 md:min-w-[200px]">
                    <!-- Spots Info -->
                    <div class="w-full">
                      <div class="flex justify-between text-sm mb-1.5">
                        <span class="text-slate-500">Spots remaining</span>
                        <span class="font-semibold text-slate-700">{{ cls.spotsAvailable }} / {{ cls.maxParticipants }}</span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-300"
                          [ngClass]="{
                            'bg-emerald-500': getEnrollmentPercent(cls) < 75,
                            'bg-amber-500': getEnrollmentPercent(cls) >= 75 && getEnrollmentPercent(cls) < 100,
                            'bg-red-500': getEnrollmentPercent(cls) >= 100
                          }"
                          [style.width.%]="getEnrollmentPercent(cls)">
                        </div>
                      </div>
                    </div>

                    <!-- Action Button -->
                    <a
                      [routerLink]="['/classes', cls.id]"
                      class="inline-flex items-center justify-center px-6 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm w-full md:w-auto text-center"
                      [ngClass]="{
                        'bg-[#F59E0B] hover:bg-amber-600 text-white': cls.status === 'OPEN',
                        'bg-slate-700 hover:bg-slate-800 text-white': cls.status === 'WAITLIST',
                        'bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none': cls.status === 'FULL' || cls.status === 'CANCELLED'
                      }">
                      @if (cls.status === 'OPEN') {
                        Enroll Now
                      } @else if (cls.status === 'WAITLIST') {
                        Join Waitlist
                      } @else if (cls.status === 'FULL') {
                        Class Full
                      } @else {
                        Unavailable
                      }
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ClassScheduleComponent implements OnInit {
  private schedulingService = inject(SchedulingService);

  classes = signal<ClassSeries[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  private readonly dayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading.set(true);
    this.error.set(null);

    this.schedulingService.getUpcomingClasses().subscribe({
      next: (data) => {
        this.classes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load classes. Please try again.');
        this.loading.set(false);
      },
    });
  }

  getDayName(dayOfWeek: number): string {
    return this.dayNames[dayOfWeek - 1] ?? 'Unknown';
  }

  getEnrollmentPercent(cls: ClassSeries): number {
    if (cls.maxParticipants === 0) return 0;
    return Math.round((cls.currentEnrollment / cls.maxParticipants) * 100);
  }
}
