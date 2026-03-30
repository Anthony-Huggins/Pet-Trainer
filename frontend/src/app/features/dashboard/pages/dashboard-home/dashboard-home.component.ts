import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { BookingService } from '../../../../core/services/booking.service';
import { DogService } from '../../../../core/services/dog.service';
import { User, Booking, Dog, ClassEnrollment, BookingStatus } from '../../../../core/models';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <!-- Greeting -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800">
          Welcome back, {{ user()?.firstName ?? 'there' }}!
        </h1>
        <p class="text-slate-500 mt-1">{{ todayFormatted }}</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <!-- Upcoming Appointments -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Upcoming Appointments</p>
              @if (loading()) {
                <div class="h-8 w-12 bg-slate-200 rounded animate-pulse mt-1"></div>
              } @else {
                <p class="text-2xl font-bold text-slate-800 mt-1">{{ upcomingCount() }}</p>
              }
            </div>
            <div class="h-12 w-12 bg-teal-50 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Dogs Registered -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Dogs Registered</p>
              @if (loading()) {
                <div class="h-8 w-12 bg-slate-200 rounded animate-pulse mt-1"></div>
              } @else {
                <p class="text-2xl font-bold text-slate-800 mt-1">{{ dogs().length }}</p>
              }
            </div>
            <div class="h-12 w-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Sessions Completed -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Sessions Completed</p>
              @if (loading()) {
                <div class="h-8 w-12 bg-slate-200 rounded animate-pulse mt-1"></div>
              } @else {
                <p class="text-2xl font-bold text-slate-800 mt-1">{{ completedCount() }}</p>
              }
            </div>
            <div class="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Active Enrollments -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">Active Enrollments</p>
              @if (loading()) {
                <div class="h-8 w-12 bg-slate-200 rounded animate-pulse mt-1"></div>
              } @else {
                <p class="text-2xl font-bold text-slate-800 mt-1">{{ enrollments().length }}</p>
              }
            </div>
            <div class="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
              <svg class="h-6 w-6 text-[#F87171]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Upcoming Appointments (2/3) -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-slate-800">Upcoming Appointments</h2>
            <a routerLink="/dashboard/bookings" class="text-sm font-medium text-[#0D7377] hover:text-teal-800 transition">
              View All &rarr;
            </a>
          </div>

          @if (loading()) {
            <div class="space-y-4">
              @for (i of [1, 2, 3]; track i) {
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 animate-pulse">
                  <div class="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                  <div class="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div class="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              }
            </div>
          } @else if (upcomingBookings().length === 0) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <svg class="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p class="text-slate-500 mb-4">No upcoming appointments</p>
              <a routerLink="/book" class="inline-flex items-center px-4 py-2 bg-[#0D7377] text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition">
                Book a Session
              </a>
            </div>
          } @else {
            <div class="space-y-4">
              @for (booking of upcomingBookings().slice(0, 3); track booking.id) {
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="font-semibold text-slate-800">{{ booking.session.serviceTypeName ?? 'Training Session' }}</h3>
                      <div class="mt-2 space-y-1">
                        <p class="text-sm text-slate-500 flex items-center gap-1.5">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {{ formatDate(booking.session.sessionDate) }} &middot; {{ formatTime(booking.session.startTime) }} - {{ formatTime(booking.session.endTime) }}
                        </p>
                        <p class="text-sm text-slate-500 flex items-center gap-1.5">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          Trainer: {{ booking.session.trainerName }}
                        </p>
                        <p class="text-sm text-slate-500 flex items-center gap-1.5">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Dog: {{ booking.dogName }}
                        </p>
                      </div>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      Confirmed
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick Actions (1/3) -->
        <div>
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div class="space-y-4">
            <a routerLink="/book"
               class="block bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-[#0D7377]/30 transition group">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition">
                  <svg class="h-5 w-5 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-slate-800">Book a Session</p>
                  <p class="text-sm text-slate-500">Schedule a training appointment</p>
                </div>
              </div>
            </a>

            <a routerLink="/dashboard/dogs/new"
               class="block bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-amber-300/50 transition group">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition">
                  <svg class="h-5 w-5 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-slate-800">Add a Dog</p>
                  <p class="text-sm text-slate-500">Register a new dog profile</p>
                </div>
              </div>
            </a>

            <a routerLink="/classes"
               class="block bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-red-300/50 transition group">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition">
                  <svg class="h-5 w-5 text-[#F87171]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-slate-800">View Classes</p>
                  <p class="text-sm text-slate-500">Browse group training classes</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardHomeComponent implements OnInit {
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private dogService = inject(DogService);

  user = this.authService.user;
  bookings = signal<Booking[]>([]);
  dogs = signal<Dog[]>([]);
  enrollments = signal<ClassEnrollment[]>([]);
  loading = signal(true);

  upcomingBookings = computed(() =>
    this.bookings().filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING_PAYMENT)
  );

  upcomingCount = computed(() => this.upcomingBookings().length);

  completedCount = computed(() =>
    this.bookings().filter(b => b.status === BookingStatus.COMPLETED).length
  );

  todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 3) this.loading.set(false);
    };

    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => this.bookings.set(bookings),
      error: () => {},
      complete: checkDone,
    });

    this.dogService.getMyDogs().subscribe({
      next: (dogs) => this.dogs.set(dogs),
      error: () => {},
      complete: checkDone,
    });

    this.bookingService.getMyEnrollments().subscribe({
      next: (enrollments) => this.enrollments.set(enrollments),
      error: () => {},
      complete: checkDone,
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
}
