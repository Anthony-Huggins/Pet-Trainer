import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board-train-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto py-10 px-6">
      <!-- Program Header -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-slate-800">Board & Train Program</h1>
            <p class="text-slate-500 mt-1">Program ID: {{ id || 'N/A' }}</p>
          </div>
          <span class="inline-flex items-center self-start px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700">
            Pending Review
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-100">
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Dog</p>
            <p class="text-sm font-semibold text-slate-700 mt-1">--</p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Dates</p>
            <p class="text-sm font-semibold text-slate-700 mt-1">--</p>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Trainer</p>
            <p class="text-sm font-semibold text-slate-700 mt-1">To be assigned</p>
          </div>
        </div>
      </div>

      <!-- Progress Timeline -->
      <section class="mt-8">
        <h2 class="text-xl font-semibold text-slate-800 mb-4">Program Timeline</h2>
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div class="flex items-center gap-3">
            <!-- Drop-off -->
            <div class="flex flex-col items-center">
              <div class="h-10 w-10 rounded-full bg-[#0D7377] flex items-center justify-center">
                <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-xs text-slate-500 mt-1">Drop-off</span>
            </div>

            <!-- Progress bar -->
            <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full w-0 bg-[#0D7377] rounded-full"></div>
            </div>

            <!-- Week markers -->
            @for (week of [1, 2]; track week) {
              <div class="flex flex-col items-center">
                <div class="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <span class="text-sm font-medium text-slate-500">W{{ week }}</span>
                </div>
                <span class="text-xs text-slate-400 mt-1">Week {{ week }}</span>
              </div>
              <div class="flex-1 h-2 bg-slate-100 rounded-full"></div>
            }

            <!-- Pick-up -->
            <div class="flex flex-col items-center">
              <div class="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-12 text-center">
          <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <p class="text-slate-500 mt-4 max-w-md mx-auto">
            Daily updates from your trainer will appear here during your dog's stay.
            You'll receive photos, videos, and progress notes.
          </p>
        </div>
      </section>

      <!-- Goals Progress -->
      <section class="mt-8">
        <h2 class="text-xl font-semibold text-slate-800 mb-4">Goals Progress</h2>
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          @for (goal of placeholderGoals; track goal.name) {
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-medium text-slate-700">{{ goal.name }}</span>
                <span class="text-xs text-slate-400">Not started</span>
              </div>
              <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full w-0 bg-[#0D7377] rounded-full"></div>
              </div>
            </div>
          }
          <p class="text-xs text-slate-400 pt-2">
            Progress will be updated by your trainer throughout the program.
          </p>
        </div>
      </section>
    </div>
  `,
})
export class BoardTrainDetailComponent {
  @Input() id = '';

  placeholderGoals = [
    { name: 'Basic Obedience' },
    { name: 'Leash Manners' },
    { name: 'Socialization' },
    { name: 'Crate Training' },
  ];
}
