import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { TrainerService } from '../../../../core/services/trainer.service';
import { TrainerProfile } from '../../../../core/models';

@Component({
  selector: 'app-trainer-list',
  standalone: true,
  imports: [RouterLink, NgClass],
  template: `
    <div class="max-w-6xl mx-auto py-16 px-6">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-slate-800">Our Training Team</h1>
        <p class="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
          Meet our certified trainers who are passionate about helping your dog
          reach their full potential. Each brings years of experience and unique
          specializations.
        </p>
      </div>

      <!-- Loading Skeleton -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse">
              <div class="flex flex-col items-center">
                <div class="w-24 h-24 rounded-full bg-slate-200 mb-4"></div>
                <div class="h-6 w-40 bg-slate-200 rounded mb-2"></div>
                <div class="h-4 w-24 bg-slate-200 rounded mb-4"></div>
                <div class="flex gap-2 mb-4">
                  <div class="h-6 w-20 bg-slate-200 rounded-full"></div>
                  <div class="h-6 w-20 bg-slate-200 rounded-full"></div>
                </div>
                <div class="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                <div class="h-10 w-full bg-slate-200 rounded-lg mt-4"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="text-center py-16">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-[#F87171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-slate-800 mb-2">Unable to load trainers</h2>
          <p class="text-slate-500 mb-6">{{ error() }}</p>
          <button
            (click)="loadTrainers()"
            class="px-6 py-2.5 bg-[#0D7377] text-white rounded-lg hover:bg-[#0a5c5f] transition-colors font-medium">
            Try Again
          </button>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && !error() && trainers().length === 0) {
        <div class="text-center py-16">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-[#0D7377]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-slate-800 mb-2">No trainers available</h2>
          <p class="text-slate-500">Check back soon — our team is growing!</p>
        </div>
      }

      <!-- Trainer Grid -->
      @if (!loading() && !error() && trainers().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (trainer of trainers(); track trainer.id) {
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 p-6 flex flex-col">
              <!-- Avatar & Name -->
              <div class="flex flex-col items-center text-center">
                @if (trainer.profilePhotoUrl) {
                  <img
                    [src]="trainer.profilePhotoUrl"
                    [alt]="trainer.name"
                    class="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-slate-100" />
                } @else {
                  <div class="w-24 h-24 rounded-full bg-[#0D7377] flex items-center justify-center mb-4 ring-2 ring-teal-100">
                    <span class="text-2xl font-bold text-white">{{ getInitials(trainer.name) }}</span>
                  </div>
                }

                <h3 class="text-xl font-semibold text-slate-800">{{ trainer.name }}</h3>

                <!-- Accepting Clients Badge -->
                @if (trainer.acceptingClients) {
                  <span class="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[#10B981]">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    Accepting new clients
                  </span>
                } @else {
                  <span class="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    Not accepting clients
                  </span>
                }
              </div>

              <!-- Specializations -->
              @if (trainer.specializations.length > 0) {
                <div class="flex flex-wrap justify-center gap-1.5 mt-4">
                  @for (spec of trainer.specializations; track spec) {
                    <span class="px-2.5 py-1 text-xs font-medium bg-teal-50 text-[#0D7377] rounded-full">
                      {{ spec }}
                    </span>
                  }
                </div>
              }

              <!-- Details -->
              <div class="mt-auto pt-6 space-y-2 text-sm text-slate-600">
                @if (trainer.yearsExperience != null) {
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Experience</span>
                    <span class="font-medium text-slate-700">{{ trainer.yearsExperience }} {{ trainer.yearsExperience === 1 ? 'year' : 'years' }}</span>
                  </div>
                }
                @if (trainer.hourlyRate != null) {
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Hourly Rate</span>
                    <span class="font-medium text-slate-700">\${{ trainer.hourlyRate }}/hr</span>
                  </div>
                }
              </div>

              <!-- View Profile Button -->
              <a
                [routerLink]="['/trainers', trainer.id]"
                class="mt-5 block w-full text-center py-2.5 px-4 rounded-lg border-2 border-[#0D7377] text-[#0D7377] font-medium hover:bg-[#0D7377] hover:text-white transition-colors duration-200">
                View Profile
              </a>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TrainerListComponent implements OnInit {
  trainers = signal<TrainerProfile[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.trainerService.getTrainers().subscribe({
      next: (data) => {
        this.trainers.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Something went wrong while loading our trainers. Please try again.');
        this.loading.set(false);
      },
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
