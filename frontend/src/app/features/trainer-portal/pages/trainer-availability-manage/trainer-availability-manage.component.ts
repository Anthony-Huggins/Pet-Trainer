import { Component, inject, signal, OnInit } from '@angular/core';
import { TrainerService } from '../../../../core/services/trainer.service';
import { TrainerAvailability } from '../../../../core/models';

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
            [disabled]="saving()"
            class="px-6 py-2.5 rounded-lg bg-[#F59E0B] text-white font-medium hover:bg-[#F59E0B]/90 transition-colors self-start disabled:opacity-50 disabled:cursor-not-allowed"
          >{{ saving() ? 'Saving...' : 'Save Availability' }}</button>
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

        @if (saveError()) {
          <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {{ saveError() }}
          </div>
        }

        <!-- Loading -->
        @if (loading()) {
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
            <div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0D7377]"></div>
            <p class="text-slate-500 mt-4">Loading availability...</p>
          </div>
        }

        <!-- Availability Grid -->
        @if (!loading()) {
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
        }

      </div>
    </div>
  `,
})
export class TrainerAvailabilityManageComponent implements OnInit {
  private trainerService = inject(TrainerService);

  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  loading = signal(false);
  saving = signal(false);
  saveSuccess = signal(false);
  saveError = signal('');

  // Track existing availability IDs so we can delete them before re-saving
  private existingIds: string[] = [];

  // 2D signal array: grid[dayIndex][hourIndex] = available
  grid = signal<boolean[][]>(this.createEmptyGrid());

  private createEmptyGrid(): boolean[][] {
    return this.days.map(() => this.hours.map(() => false));
  }

  private createDefaultGrid(): boolean[][] {
    // Default: weekdays 9am-5pm available, weekends unavailable
    return this.days.map((_, dayIdx) =>
      this.hours.map((hour) => {
        if (dayIdx >= 5) return false;
        if (hour >= 9 && hour <= 16) return true;
        return false;
      })
    );
  }

  ngOnInit(): void {
    this.loadAvailability();
  }

  private loadAvailability(): void {
    this.loading.set(true);
    this.trainerService.getMyAvailability().subscribe({
      next: (slots) => {
        this.existingIds = slots.map(s => s.id);
        if (slots.length > 0) {
          this.grid.set(this.mapAvailabilityToGrid(slots));
        } else {
          this.grid.set(this.createDefaultGrid());
        }
        this.loading.set(false);
      },
      error: () => {
        // Use defaults if loading fails
        this.grid.set(this.createDefaultGrid());
        this.loading.set(false);
      },
    });
  }

  private mapAvailabilityToGrid(slots: TrainerAvailability[]): boolean[][] {
    const grid = this.createEmptyGrid();
    for (const slot of slots) {
      if (!slot.available) continue;
      // dayOfWeek: 0=Monday..6=Sunday (matching our grid)
      const dayIdx = slot.dayOfWeek;
      if (dayIdx < 0 || dayIdx > 6) continue;

      // Parse start/end time to mark hour slots
      const startHour = parseInt(slot.startTime.split(':')[0], 10);
      const endHour = parseInt(slot.endTime.split(':')[0], 10);

      for (let h = startHour; h < endHour; h++) {
        const hourIdx = this.hours.indexOf(h);
        if (hourIdx >= 0) {
          grid[dayIdx][hourIdx] = true;
        }
      }
    }
    return grid;
  }

  toggleSlot(dayIdx: number, hourIdx: number) {
    this.saveSuccess.set(false);
    this.saveError.set('');
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

  saveAvailability(): void {
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set('');

    // First delete all existing availability entries, then create new ones
    const deleteOps = this.existingIds.map(id =>
      this.trainerService.deleteAvailability(id)
    );

    // Build new availability entries from the grid
    // Merge consecutive hours for the same day into single slots
    const newSlots = this.buildSlotsFromGrid();

    if (deleteOps.length === 0) {
      this.createNewSlots(newSlots);
      return;
    }

    // Delete existing, then create new
    let completed = 0;
    let hasError = false;
    for (const op of deleteOps) {
      op.subscribe({
        next: () => {
          completed++;
          if (completed === deleteOps.length && !hasError) {
            this.existingIds = [];
            this.createNewSlots(newSlots);
          }
        },
        error: () => {
          if (!hasError) {
            hasError = true;
            this.saving.set(false);
            this.saveError.set('Failed to update availability. Please try again.');
          }
        },
      });
    }
  }

  private buildSlotsFromGrid(): { dayOfWeek: number; startTime: string; endTime: string }[] {
    const slots: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
    const grid = this.grid();

    for (let di = 0; di < this.days.length; di++) {
      let rangeStart: number | null = null;
      for (let hi = 0; hi < this.hours.length; hi++) {
        if (grid[di][hi]) {
          if (rangeStart === null) rangeStart = this.hours[hi];
        } else {
          if (rangeStart !== null) {
            slots.push({
              dayOfWeek: di,
              startTime: `${String(rangeStart).padStart(2, '0')}:00`,
              endTime: `${String(this.hours[hi]).padStart(2, '0')}:00`,
            });
            rangeStart = null;
          }
        }
      }
      // Close any open range at the end
      if (rangeStart !== null) {
        const lastHour = this.hours[this.hours.length - 1] + 1;
        slots.push({
          dayOfWeek: di,
          startTime: `${String(rangeStart).padStart(2, '0')}:00`,
          endTime: `${String(lastHour).padStart(2, '0')}:00`,
        });
      }
    }
    return slots;
  }

  private createNewSlots(
    slots: { dayOfWeek: number; startTime: string; endTime: string }[]
  ): void {
    if (slots.length === 0) {
      this.saving.set(false);
      this.saveSuccess.set(true);
      return;
    }

    let completed = 0;
    let hasError = false;
    const newIds: string[] = [];

    for (const slot of slots) {
      this.trainerService.addAvailability({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        recurring: true,
        available: true,
      }).subscribe({
        next: (created) => {
          newIds.push(created.id);
          completed++;
          if (completed === slots.length && !hasError) {
            this.existingIds = newIds;
            this.saving.set(false);
            this.saveSuccess.set(true);
          }
        },
        error: () => {
          if (!hasError) {
            hasError = true;
            this.saving.set(false);
            this.saveError.set('Failed to save some availability slots. Please try again.');
          }
        },
      });
    }
  }
}
