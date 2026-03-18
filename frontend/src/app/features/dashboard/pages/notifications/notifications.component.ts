import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto py-10 px-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Notifications</h1>
          <p class="text-slate-500 mt-1">Stay up to date with your training activity.</p>
        </div>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium text-[#0D7377] border border-[#0D7377] hover:bg-teal-50 transition-colors"
          disabled
        >
          Mark All Read
        </button>
      </div>

      <!-- Empty State -->
      <div class="mt-10 bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-16 text-center">
        <div class="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
          <svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-700 mt-4">You're all caught up!</h3>
        <p class="text-slate-500 mt-2 max-w-sm mx-auto">
          No new notifications. We'll let you know when there's something important about your bookings, training, or account.
        </p>
      </div>

      <!-- Notification List Layout (hidden until notifications API is built) -->
      <!--
      <div class="mt-8 space-y-3">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow border-l-4 border-l-[#0D7377]">
          <div class="flex-shrink-0 h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center">
            <svg class="h-5 w-5 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex items-start justify-between">
              <h4 class="text-sm font-semibold text-slate-800">Booking Confirmed</h4>
              <span class="text-xs text-slate-400">2 hours ago</span>
            </div>
            <p class="text-sm text-slate-500 mt-1">Your session with Sarah Johnson on March 20 has been confirmed.</p>
          </div>
        </div>
      </div>
      -->
    </div>
  `,
})
export class NotificationsComponent {}
