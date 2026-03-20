import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-cancel',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-2xl mx-auto py-20 px-6 text-center">
      <!-- Orange/Amber Warning Icon -->
      <div class="w-24 h-24 mx-auto mb-8 bg-amber-100 rounded-full flex items-center justify-center">
        <svg
          class="w-12 h-12 text-[#F59E0B]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <!-- Heading -->
      <h1 class="text-3xl font-bold text-slate-800 mb-3">Payment Not Completed</h1>

      <!-- Message -->
      <p class="text-lg text-slate-500 mb-10 max-w-md mx-auto">
        Your payment was not completed and no charges were made.
        Your booking is still pending &mdash; you can try again whenever you're ready.
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          routerLink="/book"
          class="w-full sm:w-auto px-8 py-3 bg-[#F59E0B] text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors text-center"
        >
          Try Again
        </a>
        <a
          routerLink="/"
          class="w-full sm:w-auto px-8 py-3 border-2 border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-center"
        >
          Go Home
        </a>
      </div>
    </div>
  `,
})
export class BookingCancelComponent {}
