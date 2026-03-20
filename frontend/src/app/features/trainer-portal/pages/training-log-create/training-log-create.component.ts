import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DogService } from '../../../../core/services/dog.service';
import { TrainingService } from '../../../../core/services/training.service';
import { Dog, TrainingLogRequest } from '../../../../core/models';

@Component({
  selector: 'app-training-log-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-100">
      <div class="max-w-3xl mx-auto py-10 px-6">

        @if (saved()) {
          <!-- Success State -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
            <div class="w-16 h-16 mx-auto rounded-full bg-[#10B981]/10 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Training Log Saved!</h2>
            <p class="text-slate-500 mb-6">Your training log has been recorded successfully.</p>
            <button
              (click)="resetForm()"
              class="px-6 py-2.5 rounded-lg bg-[#F59E0B] text-white font-medium hover:bg-[#F59E0B]/90 transition-colors"
            >Create Another Log</button>
          </div>
        } @else {
          <!-- Form -->
          <h1 class="text-3xl font-bold text-slate-800 mb-8">Create Training Log</h1>

          <!-- Error Banner -->
          @if (errorMessage()) {
            <div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-600">{{ errorMessage() }}</p>
            </div>
          }

          <div class="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">

            <!-- Session Details Section -->
            <div class="p-6">
              <h2 class="text-lg font-semibold text-slate-800 mb-4">Session Details</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Dog <span class="text-[#F87171]">*</span></label>
                  @if (dogsLoading()) {
                    <div class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400">Loading dogs...</div>
                  } @else {
                    <select
                      class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                      [ngModel]="selectedDogId()"
                      (ngModelChange)="selectedDogId.set($event)"
                    >
                      <option value="">Select a dog...</option>
                      @for (dog of dogs(); track dog.id) {
                        <option [value]="dog.id">{{ dog.name }} ({{ dog.breed }})</option>
                      }
                    </select>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                    [ngModel]="sessionDate()"
                    (ngModelChange)="sessionDate.set($event)"
                  />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 mb-1">Session Rating</label>
                  <div class="flex items-center gap-1 mt-1">
                    @for (star of [1,2,3,4,5]; track star) {
                      <button
                        type="button"
                        (click)="rating.set(star)"
                        class="focus:outline-none"
                      >
                        <svg
                          class="w-8 h-8 transition-colors"
                          [class]="star <= rating() ? 'text-[#F59E0B]' : 'text-slate-200 hover:text-[#F59E0B]/50'"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Training Notes Section -->
            <div class="p-6">
              <h2 class="text-lg font-semibold text-slate-800 mb-4">Training Notes</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">
                    Summary <span class="text-[#F87171]">*</span>
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Provide a brief summary of this session..."
                    class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377] resize-none"
                    [ngModel]="summary()"
                    (ngModelChange)="summary.set($event)"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Skills Worked</label>
                  <input
                    type="text"
                    placeholder="e.g. sit, stay, recall, loose-leash walking"
                    class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                    [ngModel]="skillsWorked()"
                    (ngModelChange)="onSkillsChange($event)"
                  />
                  @if (skillTags().length > 0) {
                    <div class="flex flex-wrap gap-2 mt-2">
                      @for (tag of skillTags(); track tag) {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0D7377]/10 text-[#0D7377]">
                          {{ tag }}
                        </span>
                      }
                    </div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Behavior Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Note any behavioral observations..."
                    class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377] resize-none"
                    [ngModel]="behaviorNotes()"
                    (ngModelChange)="behaviorNotes.set($event)"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Homework Assigned</label>
                  <textarea
                    rows="3"
                    placeholder="Describe exercises or activities for the client to practice..."
                    class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377] resize-none"
                    [ngModel]="homework()"
                    (ngModelChange)="homework.set($event)"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="p-6 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="resetForm()"
                class="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >Cancel</button>
              <button
                type="button"
                (click)="saveLog()"
                [disabled]="!canSubmit() || submitting()"
                class="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                [class]="canSubmit() && !submitting() ? 'bg-[#F59E0B] hover:bg-[#F59E0B]/90' : 'bg-[#F59E0B]/50'"
              >
                @if (submitting()) {
                  <span class="flex items-center gap-2">
                    <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Saving...
                  </span>
                } @else {
                  Save Log
                }
              </button>
            </div>

          </div>
        }

      </div>
    </div>
  `,
})
export class TrainingLogCreateComponent implements OnInit {
  private dogService = inject(DogService);
  private trainingService = inject(TrainingService);
  private router = inject(Router);

  dogs = signal<Dog[]>([]);
  dogsLoading = signal(false);
  selectedDogId = signal('');
  sessionDate = signal(new Date().toISOString().split('T')[0]);
  summary = signal('');
  skillsWorked = signal('');
  behaviorNotes = signal('');
  homework = signal('');
  rating = signal(0);
  saved = signal(false);
  submitting = signal(false);
  errorMessage = signal('');

  skillTags = signal<string[]>([]);

  canSubmit = computed(() => !!this.summary() && !!this.selectedDogId());

  ngOnInit(): void {
    this.dogsLoading.set(true);
    this.dogService.getMyDogs().subscribe({
      next: (dogs) => {
        this.dogs.set(dogs);
        this.dogsLoading.set(false);
      },
      error: () => {
        this.dogsLoading.set(false);
      },
    });
  }

  onSkillsChange(value: string) {
    this.skillsWorked.set(value);
    if (!value.trim()) {
      this.skillTags.set([]);
    } else {
      this.skillTags.set(
        value.split(',').map(s => s.trim()).filter(s => s.length > 0)
      );
    }
  }

  saveLog() {
    if (!this.summary() || !this.selectedDogId()) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    const request: TrainingLogRequest = {
      dogId: this.selectedDogId(),
      logDate: this.sessionDate(),
      summary: this.summary(),
      skillsWorked: this.skillTags(),
      behaviorNotes: this.behaviorNotes() || undefined,
      homework: this.homework() || undefined,
      rating: this.rating() > 0 ? this.rating() : undefined,
    };

    this.trainingService.createLog(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.set(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Failed to save training log. Please try again.'
        );
      },
    });
  }

  resetForm() {
    this.selectedDogId.set('');
    this.sessionDate.set(new Date().toISOString().split('T')[0]);
    this.summary.set('');
    this.skillsWorked.set('');
    this.behaviorNotes.set('');
    this.homework.set('');
    this.rating.set(0);
    this.skillTags.set([]);
    this.saved.set(false);
    this.submitting.set(false);
    this.errorMessage.set('');
  }
}
