import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-trainer-availability-manage',
  standalone: true,
  template: `
    <div class="min-h-screen bg-slate-100">
      <div class="max-w-6xl mx-auto py-10 px-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 class="text-3xl font-bold text-slate-800">Manage Availability</h1>
            <p class="text-slate-500 mt-1">Your availability determines when clients can book sessions with you.</p>
          </div>
          <button
            (click)="saveAvailability()"
            class="px-6 py-2.5 rounded-lg bg-[#F59E0B] text-white font-medium hover:bg-[#F59E0B]/90 transition-colors self-start"
          >Save Availability</button>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-6 mb-4">
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded bg-[#10B981]"></span>
            <span class="text-sm text-slate-600">Available</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded bg-slate-200"></span>
            <span class="text-sm text-slate-600">Unavailable</span>
          </div>
        </div>

        @if (saveSuccess()) {
          <div class="mb-4 p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-sm font-medium">
            Availability saved successfully!
          </div>
        }

        <!-- Availability Grid -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <!-- Day Headers -->
          <div class="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200">
            <div class="p-3 bg-slate-50"></div>
            @for (day of days; track day) {
              <div class="p-3 text-center border-l border-slate-200 bg-slate-50">
                <p class="text-sm font-semibold text-slate-700">{{ day }}</p>
              </div>
            }
          </div>

          <!-- Time Rows -->
          @for (hour of hours; track hour; let hi = $index) {
            <div class="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100 last:border-b-0">
              <div class="p-2 text-right pr-4 text-xs text-slate-400 bg-slate-50 border-r border-slate-200 flex items-center justify-end">
                {{ formatHour(hour) }}
              </div>
              @for (day of days; track day; let di = $index) {
                <button
                  type="button"
                  (click)="toggleSlot(di, hi)"
                  class="h-12 border-l border-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:ring-inset"
                  [class]="grid()[di][hi] ? 'bg-[#10B981]/20 hover:bg-[#10B981]/30' : 'bg-white hover:bg-slate-50'"
                >
                  @if (grid()[di][hi]) {
                    <svg class="w-4 h-4 mx-auto text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  }
                </button>
              }
            </div>
          }
        </div>

      </div>
    </div>
  `,
})
export class TrainerAvailabilityManageComponent {
  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  saveSuccess = signal(false);

  // 2D signal array: grid[dayIndex][hourIndex] = available
  grid = signal<boolean[][]>(this.createDefaultGrid());

  private createDefaultGrid(): boolean[][] {
    // Default: weekdays 9am-5pm available, weekends unavailable
    return this.days.map((_, dayIdx) =>
      this.hours.map((hour) => {
        if (dayIdx >= 5) return false; // Weekend
        if (hour >= 9 && hour <= 16) return true; // 9am-4pm (block starts at that hour)
        return false;
      })
    );
  }

  toggleSlot(dayIdx: number, hourIdx: number) {
    this.saveSuccess.set(false);
    const current = this.grid();
    const updated = current.map((day, di) =>
      day.map((val, hi) => (di === dayIdx && hi === hourIdx ? !val : val))
    );
    this.grid.set(updated);
  }

  formatHour(hour: number): string {
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  }

  saveAvailability() {
    // Placeholder: would send to API
    this.saveSuccess.set(true);
  }
}
