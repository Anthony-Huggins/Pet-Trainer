import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DogService } from '../../../../core/services/dog.service';
import { TrainingService } from '../../../../core/services/training.service';
import { Dog, TrainingGoal, TrainingLog, DogProgressResponse } from '../../../../core/models';

@Component({
  selector: 'app-training-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto py-10 px-6">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-slate-800">Training Progress</h1>
      <p class="text-slate-500 mt-1">Track your dog's training goals and session history.</p>

      <!-- Dog Selector -->
      <div class="mt-6">
        <label for="dog-select" class="block text-sm font-medium text-slate-700 mb-1">Select Dog</label>
        <select
          id="dog-select"
          class="w-full max-w-xs rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
          [value]="selectedDogId()"
          (change)="onDogChange($event)"
        >
          <option value="">-- Choose a dog --</option>
          @for (dog of dogs(); track dog.id) {
            <option [value]="dog.id">{{ dog.name }}</option>
          }
        </select>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0D7377]"></div>
          <span class="ml-3 text-slate-500">Loading...</span>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p class="text-red-600 font-medium">{{ error() }}</p>
          <button
            (click)="loadProgress()"
            class="mt-3 px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors"
          >Retry</button>
        </div>
      }

      @if (!loading() && !error() && selectedDogId()) {
        <!-- Active Goals -->
        <section class="mt-10">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Active Goals</h2>
          @if (goals().length === 0) {
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
              <p class="text-slate-500">No training goals set for this dog yet.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              @for (goal of goals(); track goal.id) {
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-3">
                    <h3 class="text-lg font-semibold text-slate-800">{{ goal.title }}</h3>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [class]="getStatusClasses(goal.status)"
                    >
                      {{ getStatusLabel(goal.status) }}
                    </span>
                  </div>
                  @if (goal.description) {
                    <p class="text-sm text-slate-500 mb-4">{{ goal.description }}</p>
                  }

                  <!-- Progress Bar -->
                  <div class="mb-2">
                    <div class="flex items-center justify-between text-sm mb-1">
                      <span class="text-slate-600 font-medium">Progress</span>
                      <span class="text-[#0D7377] font-semibold">{{ goal.progressPercent }}%</span>
                    </div>
                    <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        [style.width.%]="goal.progressPercent"
                        [class]="goal.progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#0D7377]'"
                      ></div>
                    </div>
                  </div>

                  @if (goal.targetDate) {
                    <p class="text-xs text-slate-400 mt-3">Target: {{ goal.targetDate }}</p>
                  }
                </div>
              }
            </div>
          }
        </section>

        <!-- Session History -->
        <section class="mt-10">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Session History</h2>
          @if (recentLogs().length === 0) {
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
              <p class="text-slate-500">No training sessions recorded yet.</p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (log of recentLogs(); track log.id) {
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex gap-5">
                  <!-- Date column -->
                  <div class="flex-shrink-0 w-20 text-center">
                    <div class="text-2xl font-bold text-[#0D7377]">{{ formatDay(log.logDate) }}</div>
                    <div class="text-xs text-slate-400 uppercase">{{ formatMonth(log.logDate) }}</div>
                  </div>
                  <!-- Divider -->
                  <div class="w-px bg-slate-200"></div>
                  <!-- Content -->
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <p class="text-sm text-slate-500">Trainer: <span class="font-medium text-slate-700">{{ log.trainerName || 'Unknown' }}</span></p>
                      @if (log.rating) {
                        <div class="flex items-center gap-0.5">
                          @for (star of [1,2,3,4,5]; track star) {
                            <svg class="w-4 h-4" [class]="star <= (log.rating ?? 0) ? 'text-[#F59E0B]' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          }
                        </div>
                      }
                    </div>
                    <p class="text-slate-700">{{ log.summary }}</p>
                    @if (log.skillsWorked && log.skillsWorked.length > 0) {
                      <div class="flex flex-wrap gap-2 mt-3">
                        @for (skill of log.skillsWorked; track skill) {
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-[#0D7377]">
                            {{ skill }}
                          </span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </section>

        <!-- Homework from latest log -->
        @if (latestHomework()) {
          <section class="mt-10">
            <h2 class="text-xl font-semibold text-slate-800 mb-4">Current Homework</h2>
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6m-3 4v6m-3-3h6" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-slate-500 mb-1">From your most recent session</p>
                  <p class="text-slate-700">{{ latestHomework() }}</p>
                </div>
              </div>
            </div>
          </section>
        }
      }

      @if (!loading() && !error() && !selectedDogId()) {
        <div class="text-center py-20">
          <svg class="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" />
          </svg>
          <p class="text-slate-500 mt-4">Select a dog above to view training progress.</p>
        </div>
      }
    </div>
  `,
})
export class TrainingProgressComponent implements OnInit {
  private dogService = inject(DogService);
  private trainingService = inject(TrainingService);

  dogs = signal<Dog[]>([]);
  selectedDogId = signal('');
  loading = signal(false);
  error = signal('');
  goals = signal<TrainingGoal[]>([]);
  recentLogs = signal<TrainingLog[]>([]);
  latestHomework = signal('');

  ngOnInit(): void {
    this.loading.set(true);
    this.dogService.getMyDogs().subscribe({
      next: (dogs) => {
        this.dogs.set(dogs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onDogChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedDogId.set(select.value);
    if (select.value) {
      this.loadProgress();
    } else {
      this.goals.set([]);
      this.recentLogs.set([]);
      this.latestHomework.set('');
    }
  }

  loadProgress(): void {
    const dogId = this.selectedDogId();
    if (!dogId) return;

    this.loading.set(true);
    this.error.set('');
    this.trainingService.getDogProgress(dogId).subscribe({
      next: (progress: DogProgressResponse) => {
        this.goals.set(progress.goals ?? []);
        this.recentLogs.set(progress.recentLogs ?? []);
        // Extract homework from latest log
        const latest = (progress.recentLogs ?? []).find(l => l.homework);
        this.latestHomework.set(latest?.homework ?? '');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load training progress. Please try again.');
        this.loading.set(false);
      },
    });
  }

  formatDay(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.getDate().toString();
  }

  formatMonth(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'short' });
  }

  getStatusClasses(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'completed') return 'bg-emerald-50 text-emerald-700';
    if (s === 'in_progress' || s === 'in-progress') return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-slate-500';
  }

  getStatusLabel(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'completed') return 'Completed';
    if (s === 'in_progress' || s === 'in-progress') return 'In Progress';
    if (s === 'not_started' || s === 'not-started') return 'Not Started';
    return status ?? 'Unknown';
  }
}
