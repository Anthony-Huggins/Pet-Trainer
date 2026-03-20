import { Component, Input, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardTrainService } from '../../../../core/services/board-train.service';
import { TrainingService } from '../../../../core/services/training.service';
import {
  BoardTrainProgram,
  BoardTrainStatus,
  DailyNote,
  TrainingGoal,
} from '../../../../core/models';

@Component({
  selector: 'app-board-train-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto py-10 px-6">
      <!-- Loading State -->
      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <svg class="animate-spin h-8 w-8 text-[#0D7377]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span class="ml-3 text-slate-500">Loading program details...</span>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl px-6 py-10 text-center">
          <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p class="text-red-700 mt-4">{{ error() }}</p>
        </div>
      }

      @if (program() && !loading()) {
        <!-- Program Header -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold text-slate-800">Board & Train Program</h1>
              <p class="text-slate-500 mt-1">{{ program()!.serviceTypeName || 'Board & Train' }}</p>
            </div>
            <span
              class="inline-flex items-center self-start px-3 py-1 rounded-full text-sm font-medium"
              [ngClass]="statusClasses()"
            >
              {{ statusLabel() }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-100">
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Dog</p>
              <p class="text-sm font-semibold text-slate-700 mt-1">{{ program()!.dogName || '--' }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Dates</p>
              <p class="text-sm font-semibold text-slate-700 mt-1">
                {{ formatDate(program()!.startDate) }} - {{ formatDate(program()!.endDate) }}
              </p>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Trainer</p>
              <p class="text-sm font-semibold text-slate-700 mt-1">{{ program()!.trainerName || 'To be assigned' }}</p>
            </div>
          </div>

          <!-- Emergency Contact & Instructions -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 pt-4 border-t border-slate-100">
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Emergency Contact</p>
              <p class="text-sm text-slate-700 mt-1">{{ program()!.emergencyContactName }} &middot; {{ program()!.emergencyContactPhone }}</p>
            </div>
            @if (program()!.pickupInstructions) {
              <div>
                <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Pickup Instructions</p>
                <p class="text-sm text-slate-700 mt-1">{{ program()!.pickupInstructions }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Progress Timeline -->
        <section class="mt-8">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Program Timeline</h2>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-center gap-3">
              <!-- Drop-off -->
              <div class="flex flex-col items-center">
                <div
                  class="h-10 w-10 rounded-full flex items-center justify-center"
                  [ngClass]="isStarted() ? 'bg-[#0D7377]' : 'bg-slate-200'"
                >
                  <svg class="h-5 w-5" [ngClass]="isStarted() ? 'text-white' : 'text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-xs text-slate-500 mt-1">Drop-off</span>
              </div>

              <!-- Progress bar -->
              <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#0D7377] rounded-full transition-all duration-500"
                  [style.width.%]="progressPercent()"
                ></div>
              </div>

              <!-- Week markers -->
              @for (week of weekMarkers(); track week) {
                <div class="flex flex-col items-center">
                  <div
                    class="h-10 w-10 rounded-full flex items-center justify-center"
                    [ngClass]="currentWeek() >= week ? 'bg-[#0D7377]' : 'bg-slate-200'"
                  >
                    <span class="text-sm font-medium" [ngClass]="currentWeek() >= week ? 'text-white' : 'text-slate-500'">W{{ week }}</span>
                  </div>
                  <span class="text-xs mt-1" [ngClass]="currentWeek() >= week ? 'text-slate-600' : 'text-slate-400'">Week {{ week }}</span>
                </div>
                <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-[#0D7377] rounded-full transition-all duration-500"
                    [style.width.%]="currentWeek() > week ? 100 : 0"
                  ></div>
                </div>
              }

              <!-- Pick-up -->
              <div class="flex flex-col items-center">
                <div
                  class="h-10 w-10 rounded-full flex items-center justify-center"
                  [ngClass]="isCompleted() ? 'bg-[#0D7377]' : 'bg-slate-200'"
                >
                  <svg class="h-5 w-5" [ngClass]="isCompleted() ? 'text-white' : 'text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span class="text-xs text-slate-500 mt-1">Pick-up</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Daily Updates -->
        <section class="mt-8">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Daily Updates</h2>

          @if (notesLoading()) {
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-8 text-center">
              <svg class="animate-spin h-6 w-6 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <p class="text-slate-400 mt-2">Loading daily notes...</p>
            </div>
          } @else if (dailyNotes().length === 0) {
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-12 text-center">
              <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <p class="text-slate-500 mt-4 max-w-md mx-auto">
                Daily updates from your trainer will appear here during your dog's stay.
                You'll receive photos, videos, and progress notes.
              </p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (note of dailyNotes(); track note.date) {
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                        <span class="text-lg">{{ moodEmoji(note.mood) }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-slate-700">{{ formatDate(note.date) }}</p>
                        @if (note.mood) {
                          <p class="text-xs text-slate-400 capitalize">{{ note.mood }}</p>
                        }
                      </div>
                    </div>
                  </div>
                  <p class="text-sm text-slate-600 mt-3 leading-relaxed">{{ note.note }}</p>

                  <!-- Media Thumbnails -->
                  @if (note.mediaUrls && note.mediaUrls.length > 0) {
                    <div class="flex gap-2 mt-3 flex-wrap">
                      @for (url of note.mediaUrls; track url) {
                        <a [href]="url" target="_blank" class="block">
                          <img
                            [src]="url"
                            alt="Daily update media"
                            class="h-16 w-16 object-cover rounded-lg border border-slate-200 hover:ring-2 hover:ring-[#0D7377] transition-all"
                          />
                        </a>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </section>

        <!-- Goals Progress -->
        <section class="mt-8">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Goals Progress</h2>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            @if (goalsLoading()) {
              <div class="text-center py-4">
                <p class="text-sm text-slate-400">Loading goals...</p>
              </div>
            } @else if (trainingGoals().length === 0) {
              <p class="text-sm text-slate-400 text-center py-4">
                No training goals have been set yet. Goals will be configured by your trainer once the program begins.
              </p>
            } @else {
              @for (goal of trainingGoals(); track goal.id) {
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-sm font-medium text-slate-700">{{ goal.title }}</span>
                    <span class="text-xs text-slate-400">{{ goal.progressPercent }}%</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-[#0D7377] rounded-full transition-all duration-500"
                      [style.width.%]="goal.progressPercent"
                    ></div>
                  </div>
                  @if (goal.description) {
                    <p class="text-xs text-slate-400 mt-1">{{ goal.description }}</p>
                  }
                </div>
              }
            }
            <p class="text-xs text-slate-400 pt-2">
              Progress will be updated by your trainer throughout the program.
            </p>
          </div>
        </section>
      }
    </div>
  `,
})
export class BoardTrainDetailComponent implements OnInit {
  @Input() id = '';

  private boardTrainService = inject(BoardTrainService);
  private trainingService = inject(TrainingService);

  // Data
  program = signal<BoardTrainProgram | null>(null);
  dailyNotes = signal<DailyNote[]>([]);
  trainingGoals = signal<TrainingGoal[]>([]);

  // Loading states
  loading = signal(false);
  notesLoading = signal(false);
  goalsLoading = signal(false);
  error = signal('');

  // Computed helpers
  statusLabel = computed(() => {
    const statusMap: Record<BoardTrainStatus, string> = {
      PENDING: 'Pending Review',
      APPROVED: 'Approved',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return statusMap[this.program()?.status ?? 'PENDING'];
  });

  statusClasses = computed(() => {
    const classMap: Record<BoardTrainStatus, string> = {
      PENDING: 'bg-amber-50 text-amber-700',
      APPROVED: 'bg-blue-50 text-blue-700',
      IN_PROGRESS: 'bg-teal-50 text-teal-700',
      COMPLETED: 'bg-emerald-50 text-emerald-700',
      CANCELLED: 'bg-red-50 text-red-700',
    };
    return classMap[this.program()?.status ?? 'PENDING'];
  });

  isStarted = computed(() => {
    const status = this.program()?.status;
    return status === 'IN_PROGRESS' || status === 'COMPLETED';
  });

  isCompleted = computed(() => this.program()?.status === 'COMPLETED');

  totalWeeks = computed(() => {
    const p = this.program();
    if (!p) return 2;
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    const diffMs = end.getTime() - start.getTime();
    return Math.max(1, Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)));
  });

  weekMarkers = computed(() => {
    const weeks = this.totalWeeks();
    return Array.from({ length: weeks }, (_, i) => i + 1);
  });

  currentWeek = computed(() => {
    const p = this.program();
    if (!p || p.status === 'PENDING' || p.status === 'APPROVED') return 0;
    if (p.status === 'COMPLETED') return this.totalWeeks() + 1;
    const start = new Date(p.startDate);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)));
  });

  progressPercent = computed(() => {
    const p = this.program();
    if (!p || p.status === 'PENDING' || p.status === 'APPROVED') return 0;
    if (p.status === 'COMPLETED') return 100;
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  });

  ngOnInit(): void {
    if (this.id) {
      this.loadProgram();
      this.loadDailyNotes();
    } else {
      this.error.set('No program ID provided.');
    }
  }

  private loadProgram(): void {
    this.loading.set(true);
    this.boardTrainService.getById(this.id).subscribe({
      next: (program) => {
        this.program.set(program);
        this.loading.set(false);
        // Load training goals once we know the dog
        if (program.dogId) {
          this.loadTrainingGoals(program.dogId);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message || 'Failed to load program details.';
        this.error.set(message);
      },
    });
  }

  private loadDailyNotes(): void {
    this.notesLoading.set(true);
    this.boardTrainService.getDailyNotes(this.id).subscribe({
      next: (notes) => {
        // Sort notes by date descending (newest first)
        const sorted = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.dailyNotes.set(sorted);
        this.notesLoading.set(false);
      },
      error: () => {
        this.notesLoading.set(false);
      },
    });
  }

  private loadTrainingGoals(dogId: string): void {
    this.goalsLoading.set(true);
    this.trainingService.getGoalsForDog(dogId).subscribe({
      next: (goals) => {
        this.trainingGoals.set(goals);
        this.goalsLoading.set(false);
      },
      error: () => {
        this.goalsLoading.set(false);
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  moodEmoji(mood?: string): string {
    if (!mood) return '\uD83D\uDCDD'; // memo emoji
    const moodMap: Record<string, string> = {
      happy: '\uD83D\uDE0A',
      excited: '\uD83E\uDD29',
      calm: '\uD83D\uDE0C',
      tired: '\uD83D\uDE34',
      anxious: '\uD83D\uDE1F',
      playful: '\uD83E\uDD73',
      focused: '\uD83E\uDDD0',
      stubborn: '\uD83D\uDE24',
    };
    return moodMap[mood.toLowerCase()] || '\uD83D\uDCDD';
  }
}
