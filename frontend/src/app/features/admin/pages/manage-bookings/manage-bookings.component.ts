import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { Booking, BookingStatus } from '../../../../core/models';

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Manage Bookings</h1>
        <p class="text-slate-500 mt-1">{{ filteredBookings().length }} bookings found</p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mt-6">
        <input type="text" placeholder="Search by client or dog name..."
               class="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
               [value]="searchQuery()"
               (input)="searchQuery.set($any($event.target).value)" />
        <select class="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377] bg-white"
                [value]="statusFilter()"
                (change)="onStatusFilterChange($any($event.target).value)">
          <option value="All">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="WAITLISTED">Waitlisted</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D7377]"></div>
        </div>
      } @else if (error()) {
        <div class="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-600 font-medium">Failed to load bookings</p>
          <p class="text-red-400 text-sm mt-1">{{ error() }}</p>
          <button (click)="loadBookings()" class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      } @else {
        <!-- Table -->
        <div class="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Date</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Time</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Client</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Dog</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Trainer</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Service</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Status</th>
                  <th class="text-right px-6 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (b of filteredBookings(); track b.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td class="px-6 py-4 text-slate-700">{{ b.session?.sessionDate | date:'mediumDate' }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ b.session?.startTime }} - {{ b.session?.endTime }}</td>
                    <td class="px-6 py-4 font-medium text-slate-800">{{ b.clientName }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ b.dogName }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ b.session?.trainerName }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ b.session?.serviceTypeName }}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [class]="statusBadge(b.status)">
                        {{ b.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      @if (b.status === 'CONFIRMED' || b.status === 'WAITLISTED') {
                        <button (click)="updateStatus(b, 'CANCELLED')"
                                class="text-[#F87171] hover:text-red-600 font-medium text-xs mr-2"
                                [disabled]="updating()">Cancel</button>
                      }
                      @if (b.status === 'CONFIRMED') {
                        <button (click)="updateStatus(b, 'COMPLETED')"
                                class="text-[#10B981] hover:text-emerald-700 font-medium text-xs"
                                [disabled]="updating()">Complete</button>
                      }
                    </td>
                  </tr>
                }
                @if (filteredBookings().length === 0) {
                  <tr>
                    <td colspan="8" class="px-6 py-12 text-center text-slate-400">No bookings found</td>
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
export class ManageBookingsComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  updating = signal(false);
  error = signal<string | null>(null);
  searchQuery = signal('');
  statusFilter = signal('All');
  bookings = signal<Booking[]>([]);

  filteredBookings = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    return this.bookings().filter(b => {
      const matchesSearch = !q || b.clientName?.toLowerCase().includes(q) || b.dogName?.toLowerCase().includes(q);
      const matchesStatus = status === 'All' || b.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getAllBookings(undefined, 0, 100).subscribe({
      next: (page) => {
        this.bookings.set(page.content);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load bookings');
        this.loading.set(false);
      },
    });
  }

  onStatusFilterChange(value: string) {
    this.statusFilter.set(value);
  }

  updateStatus(booking: Booking, newStatus: string) {
    this.updating.set(true);
    this.adminService.updateBookingStatus(booking.id, newStatus as BookingStatus).subscribe({
      next: (updated) => {
        this.bookings.update(list => list.map(b => b.id === updated.id ? updated : b));
        this.updating.set(false);
      },
      error: () => {
        this.updating.set(false);
        this.loadBookings();
      },
    });
  }

  statusBadge(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'WAITLISTED': return 'bg-amber-100 text-amber-700';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'NO_SHOW': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
