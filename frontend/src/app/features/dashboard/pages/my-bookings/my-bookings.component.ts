import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../../core/services/booking.service';
import { Booking, BookingStatus } from '../../../../core/models';

type TabType = 'upcoming' | 'past' | 'cancelled';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-slate-800">My Bookings</h1>
        <a routerLink="/book"
           class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D7377] text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition shadow-sm">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Book Session
        </a>
      </div>

      <!-- Tabs -->
      <div class="border-b border-slate-200 mb-6">
        <nav class="flex gap-6" aria-label="Tabs">
          <button (click)="activeTab.set('upcoming')"
                  [class]="activeTab() === 'upcoming'
                    ? 'border-[#0D7377] text-[#0D7377]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
                  class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition">
            Upcoming
            @if (!loading() && upcomingBookings().length > 0) {
              <span class="ml-2 bg-teal-100 text-[#0D7377] text-xs font-medium px-2 py-0.5 rounded-full">
                {{ upcomingBookings().length }}
              </span>
            }
          </button>
          <button (click)="activeTab.set('past')"
                  [class]="activeTab() === 'past'
                    ? 'border-[#0D7377] text-[#0D7377]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
                  class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition">
            Past
          </button>
          <button (click)="activeTab.set('cancelled')"
                  [class]="activeTab() === 'cancelled'
                    ? 'border-[#0D7377] text-[#0D7377]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
                  class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition">
            Cancelled
          </button>
        </nav>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1, 2, 3]; track i) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="h-5 bg-slate-200 rounded w-48 mb-3"></div>
                  <div class="h-3 bg-slate-200 rounded w-64 mb-2"></div>
                  <div class="h-3 bg-slate-200 rounded w-40 mb-2"></div>
                  <div class="h-3 bg-slate-200 rounded w-32"></div>
                </div>
                <div class="h-6 bg-slate-200 rounded-full w-20"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Booking Cards -->
      @else if (filteredBookings().length === 0) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg class="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          @switch (activeTab()) {
            @case ('upcoming') {
              <p class="text-slate-500 mb-4">No upcoming bookings</p>
              <a routerLink="/book" class="inline-flex items-center px-4 py-2 bg-[#0D7377] text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition">
                Book a Session
              </a>
            }
            @case ('past') {
              <p class="text-slate-500">No past bookings yet</p>
            }
            @case ('cancelled') {
              <p class="text-slate-500">No cancelled bookings</p>
            }
          }
        </div>
      } @else {
        <div class="space-y-4">
          @for (booking of filteredBookings(); track booking.id) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-slate-800">
                    {{ booking.session.serviceTypeName ?? 'Training Session' }}
                  </h3>
                  <div class="mt-2 space-y-1.5">
                    <p class="text-sm text-slate-600 flex items-center gap-2">
                      <svg class="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {{ formatDate(booking.session.sessionDate) }} &middot; {{ formatTime(booking.session.startTime) }} - {{ formatTime(booking.session.endTime) }}
                    </p>
                    <p class="text-sm text-slate-600 flex items-center gap-2">
                      <svg class="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      Trainer: {{ booking.session.trainerName }}
                    </p>
                    <p class="text-sm text-slate-600 flex items-center gap-2">
                      <svg class="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Dog: {{ booking.dogName }}
                    </p>
                    @if (booking.cancellationReason) {
                      <p class="text-sm text-red-600 flex items-center gap-2 mt-1">
                        <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        Reason: {{ booking.cancellationReason }}
                      </p>
                    }
                  </div>
                </div>

                <div class="flex flex-col items-end gap-3 shrink-0">
                  <!-- Status Badge -->
                  <span [class]="getStatusClasses(booking.status)"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ formatStatus(booking.status) }}
                  </span>

                  <!-- Complete Payment Button -->
                  @if (booking.status === BookingStatus.PENDING_PAYMENT) {
                    <button (click)="completePayment(booking)"
                            class="text-sm font-medium text-white bg-[#0D7377] hover:bg-teal-800 px-3 py-1.5 rounded-lg transition">
                      Complete Payment
                    </button>
                  }

                  <!-- Cancel Button -->
                  @if (booking.status === BookingStatus.CONFIRMED) {
                    <button (click)="cancelBooking(booking)"
                            [disabled]="cancellingId() === booking.id"
                            class="text-sm font-medium text-red-600 hover:text-red-700 transition disabled:opacity-50">
                      @if (cancellingId() === booking.id) {
                        Cancelling...
                      } @else {
                        Cancel
                      }
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);

  readonly BookingStatus = BookingStatus;

  bookings = signal<Booking[]>([]);
  loading = signal(true);
  activeTab = signal<TabType>('upcoming');
  cancellingId = signal<string | null>(null);

  upcomingBookings = computed(() =>
    this.bookings().filter(b =>
      b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.WAITLISTED || b.status === BookingStatus.PENDING_PAYMENT
    )
  );

  pastBookings = computed(() =>
    this.bookings().filter(b =>
      b.status === BookingStatus.COMPLETED || b.status === BookingStatus.NO_SHOW
    )
  );

  cancelledBookings = computed(() =>
    this.bookings().filter(b => b.status === BookingStatus.CANCELLED)
  );

  filteredBookings = computed(() => {
    switch (this.activeTab()) {
      case 'upcoming': return this.upcomingBookings();
      case 'past': return this.pastBookings();
      case 'cancelled': return this.cancelledBookings();
    }
  });

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => this.bookings.set(bookings),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  cancelBooking(booking: Booking): void {
    if (!confirm(`Are you sure you want to cancel your ${booking.session.serviceTypeName ?? 'training'} session on ${this.formatDate(booking.session.sessionDate)}?`)) {
      return;
    }

    this.cancellingId.set(booking.id);
    this.bookingService.cancelBooking(booking.id).subscribe({
      next: (updated) => {
        this.bookings.update(bookings =>
          bookings.map(b => b.id === updated.id ? updated : b)
        );
        this.cancellingId.set(null);
      },
      error: () => this.cancellingId.set(null),
    });
  }

  completePayment(booking: Booking): void {
    this.bookingService.checkoutBooking(booking.id).subscribe({
      next: (response) => {
        window.location.href = response.checkoutUrl;
      },
      error: () => alert('Failed to start payment. Please try again.'),
    });
  }

  getStatusClasses(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING_PAYMENT:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.CONFIRMED:
        return 'bg-emerald-100 text-emerald-800';
      case BookingStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case BookingStatus.WAITLISTED:
        return 'bg-amber-100 text-amber-800';
      case BookingStatus.NO_SHOW:
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  formatStatus(status: BookingStatus): string {
    if (status === BookingStatus.PENDING_PAYMENT) return 'Pending Payment';
    if (status === BookingStatus.NO_SHOW) return 'No Show';
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
}
