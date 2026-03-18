import { Component, OnInit, inject, input, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrainerService } from '../../../../core/services/trainer.service';
import { TrainerProfile, TrainerAvailability } from '../../../../core/models';

@Component({
  selector: 'app-trainer-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <!-- Loading State -->
    @if (loading()) {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-[#0D7377]"></div>
          <p class="mt-4 text-slate-500 text-lg">Loading trainer profile...</p>
        </div>
      </div>
    }

    <!-- Error State -->
    @if (error()) {
      <div class="max-w-4xl mx-auto py-16 px-6">
        <div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-[#F87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 class="mt-4 text-xl font-semibold text-slate-800">Unable to load trainer profile</h2>
          <p class="mt-2 text-slate-600">{{ error() }}</p>
          <a routerLink="/trainers" class="mt-6 inline-block rounded-lg bg-[#0D7377] px-6 py-2.5 text-white font-medium hover:bg-teal-800 transition">
            Back to Trainers
          </a>
        </div>
      </div>
    }

    <!-- Trainer Profile -->
    @if (trainer()) {
      <!-- Banner / Header -->
      <div class="bg-gradient-to-br from-[#0D7377] to-teal-800">
        <div class="max-w-6xl mx-auto px-6 py-16">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
            <!-- Photo or Initials -->
            @if (trainer()!.profilePhotoUrl) {
              <img [src]="trainer()!.profilePhotoUrl" [alt]="trainer()!.name"
                class="h-32 w-32 rounded-full object-cover border-4 border-white/30 shadow-xl" />
            } @else {
              <div class="h-32 w-32 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center shadow-xl">
                <span class="text-4xl font-bold text-white">{{ initials() }}</span>
              </div>
            }

            <div class="text-center md:text-left">
              <h1 class="text-4xl md:text-5xl font-bold text-white">{{ trainer()!.name }}</h1>

              <!-- Certifications as Badges -->
              @if (trainer()!.certifications.length > 0) {
                <div class="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                  @for (cert of trainer()!.certifications; track cert) {
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-sm text-teal-100">
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      {{ cert }}
                    </span>
                  }
                </div>
              }

              <!-- Status -->
              <div class="mt-4">
                @if (trainer()!.acceptingClients) {
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 px-3 py-1 text-sm text-emerald-200">
                    <span class="h-2 w-2 rounded-full bg-[#10B981] animate-pulse"></span>
                    Accepting New Clients
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-500/20 border border-slate-400/30 px-3 py-1 text-sm text-slate-300">
                    <span class="h-2 w-2 rounded-full bg-slate-400"></span>
                    Not Accepting Clients
                  </span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-6 py-12 space-y-12">

        <!-- Stats Bar -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          @if (trainer()!.yearsExperience != null) {
            <div class="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
              <p class="text-3xl font-bold text-[#0D7377]">{{ trainer()!.yearsExperience }}+</p>
              <p class="mt-1 text-sm text-slate-500 font-medium">Years Experience</p>
            </div>
          }
          @if (trainer()!.hourlyRate != null) {
            <div class="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
              <p class="text-3xl font-bold text-[#0D7377]">{{ trainer()!.hourlyRate | currency }}</p>
              <p class="mt-1 text-sm text-slate-500 font-medium">Hourly Rate</p>
            </div>
          }
          <div class="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
            @if (trainer()!.acceptingClients) {
              <p class="text-3xl font-bold text-[#10B981]">Open</p>
            } @else {
              <p class="text-3xl font-bold text-slate-400">Closed</p>
            }
            <p class="mt-1 text-sm text-slate-500 font-medium">Availability Status</p>
          </div>
        </div>

        <!-- Bio Section -->
        @if (trainer()!.bio) {
          <section>
            <h2 class="text-2xl font-bold text-slate-800 mb-4">About</h2>
            <div class="bg-white border border-slate-200 rounded-xl p-6">
              <p class="text-slate-600 leading-relaxed text-lg whitespace-pre-line">{{ trainer()!.bio }}</p>
            </div>
          </section>
        }

        <!-- Specializations -->
        @if (trainer()!.specializations.length > 0) {
          <section>
            <h2 class="text-2xl font-bold text-slate-800 mb-4">Specializations</h2>
            <div class="flex flex-wrap gap-3">
              @for (spec of trainer()!.specializations; track spec) {
                <span class="inline-block rounded-full bg-[#0D7377]/10 border border-[#0D7377]/20 px-5 py-2.5 text-[#0D7377] font-semibold text-sm">
                  {{ spec }}
                </span>
              }
            </div>
          </section>
        }

        <!-- Weekly Availability Grid -->
        <section>
          <h2 class="text-2xl font-bold text-slate-800 mb-4">Weekly Availability</h2>
          @if (loadingAvailability()) {
            <div class="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-[#0D7377]"></div>
              <p class="mt-3 text-slate-500">Loading availability...</p>
            </div>
          } @else if (availability().length === 0) {
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
              <p class="text-slate-500">No availability information posted yet.</p>
            </div>
          } @else {
            <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div class="grid grid-cols-7 divide-x divide-slate-200">
                @for (day of dayNames; track day; let i = $index) {
                  <div class="min-w-0">
                    <div class="bg-slate-50 px-2 py-3 text-center border-b border-slate-200">
                      <p class="text-xs font-semibold text-slate-700 uppercase tracking-wide">{{ day }}</p>
                    </div>
                    <div class="p-2 space-y-1.5 min-h-[80px]">
                      @for (slot of getSlotsForDay(i); track slot.id) {
                        @if (slot.available) {
                          <div class="rounded-md bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-1.5 text-center">
                            <p class="text-xs font-medium text-emerald-700">{{ formatTime(slot.startTime) }}</p>
                            <p class="text-xs text-emerald-600">{{ formatTime(slot.endTime) }}</p>
                          </div>
                        } @else {
                          <div class="rounded-md bg-slate-100 border border-slate-200 px-2 py-1.5 text-center">
                            <p class="text-xs font-medium text-slate-400">{{ formatTime(slot.startTime) }}</p>
                            <p class="text-xs text-slate-400">{{ formatTime(slot.endTime) }}</p>
                          </div>
                        }
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </section>

        <!-- Book CTA -->
        @if (trainer()!.acceptingClients) {
          <section class="bg-gradient-to-r from-[#0D7377] to-teal-700 rounded-2xl p-10 text-center">
            <h2 class="text-3xl font-bold text-white">Book with {{ trainer()!.name.split(' ')[0] }}</h2>
            <p class="mt-3 text-teal-100 text-lg max-w-xl mx-auto">
              Ready to start your dog's training journey? Schedule a session and see the results.
            </p>
            <a routerLink="/book"
              class="mt-6 inline-block rounded-lg bg-[#F59E0B] px-8 py-3.5 text-white font-semibold text-lg hover:bg-amber-600 transition shadow-lg hover:shadow-xl">
              Book a Session
            </a>
          </section>
        }
      </div>
    }
  `,
})
export class TrainerProfileComponent implements OnInit {
  id = input<string>('');

  private trainerService = inject(TrainerService);

  trainer = signal<TrainerProfile | null>(null);
  availability = signal<TrainerAvailability[]>([]);
  loading = signal(true);
  loadingAvailability = signal(true);
  error = signal<string | null>(null);

  readonly dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  initials = computed(() => {
    const name = this.trainer()?.name ?? '';
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  ngOnInit(): void {
    const trainerId = this.id();
    if (!trainerId) {
      this.error.set('Trainer not found.');
      this.loading.set(false);
      this.loadingAvailability.set(false);
      return;
    }

    this.trainerService.getTrainer(trainerId).subscribe({
      next: (trainer) => {
        this.trainer.set(trainer);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load this trainer profile. It may no longer be available.');
        this.loading.set(false);
        this.loadingAvailability.set(false);
      },
    });

    this.trainerService.getTrainerAvailability(trainerId).subscribe({
      next: (availability) => {
        this.availability.set(availability);
        this.loadingAvailability.set(false);
      },
      error: () => {
        this.loadingAvailability.set(false);
      },
    });
  }

  getSlotsForDay(dayOfWeek: number): TrainerAvailability[] {
    return this.availability().filter((slot) => slot.dayOfWeek === dayOfWeek);
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return minutes === 0 ? `${displayHour} ${period}` : `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}
