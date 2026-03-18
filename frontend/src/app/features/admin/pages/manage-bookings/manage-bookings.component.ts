import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Manage Bookings</h1>
        <p class="text-slate-500 mt-1">{{ filteredBookings().length }} bookings found</p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mt-6">
        <input type="date" class="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
               [value]="dateFrom()" (change)="dateFrom.set($any($event.target).value)" />
        <input type="date" class="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
               [value]="dateTo()" (change)="dateTo.set($any($event.target).value)" />
        <select class="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377] bg-white"
                [value]="trainerFilter()" (change)="trainerFilter.set($any($event.target).value)">
          <option value="All">All Trainers</option>
          <option value="Dr. Emily Chen">Dr. Emily Chen</option>
          <option value="Marcus Rivera">Marcus Rivera</option>
        </select>
        <select class="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377] bg-white"
                [value]="statusFilter()" (change)="statusFilter.set($any($event.target).value)">
          <option value="All">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

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
              @for (b of filteredBookings(); track b.client + b.date) {
                <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4 text-slate-700">{{ b.date }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ b.time }}</td>
                  <td class="px-6 py-4 font-medium text-slate-800">{{ b.client }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ b.dog }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ b.trainer }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ b.service }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [class]="statusBadge(b.status)">
                      {{ b.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button class="text-[#0D7377] hover:text-teal-800 font-medium text-xs mr-2">View</button>
                    @if (b.status === 'Confirmed' || b.status === 'Pending') {
                      <button class="text-[#F87171] hover:text-red-600 font-medium text-xs mr-2">Cancel</button>
                    }
                    @if (b.status === 'Confirmed') {
                      <button class="text-[#10B981] hover:text-emerald-700 font-medium text-xs">Complete</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class ManageBookingsComponent {
  dateFrom = signal('');
  dateTo = signal('');
  trainerFilter = signal('All');
  statusFilter = signal('All');

  bookings = signal([
    { date: 'Mar 17, 2026', time: '9:00 AM', client: 'Sarah Mitchell', dog: 'Buddy', trainer: 'Dr. Emily Chen', service: 'Private Training', status: 'Confirmed' },
    { date: 'Mar 17, 2026', time: '11:00 AM', client: 'James Kelly', dog: 'Rex', trainer: 'Marcus Rivera', service: 'Advanced Agility', status: 'Confirmed' },
    { date: 'Mar 18, 2026', time: '2:00 PM', client: 'Lisa Park', dog: 'Coco', trainer: 'Dr. Emily Chen', service: 'Group Obedience', status: 'Pending' },
    { date: 'Mar 15, 2026', time: '10:00 AM', client: 'Tom Watson', dog: 'Duke', trainer: 'Marcus Rivera', service: 'Private Training', status: 'Completed' },
    { date: 'Mar 14, 2026', time: '3:00 PM', client: 'Mike Davidson', dog: 'Luna', trainer: 'Dr. Emily Chen', service: 'Puppy Socialization', status: 'Cancelled' },
  ]);

  filteredBookings = computed(() => {
    const trainer = this.trainerFilter();
    const status = this.statusFilter();
    return this.bookings().filter(b => {
      const matchesTrainer = trainer === 'All' || b.trainer === trainer;
      const matchesStatus = status === 'All' || b.status === status;
      return matchesTrainer && matchesStatus;
    });
  });

  statusBadge(status: string): string {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
