import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-2xl mx-auto py-20 px-6 text-center">
      <!-- Animated Green Checkmark -->
      <div class="relative w-24 h-24 mx-auto mb-8">
        <div class="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
        <div class="relative w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            class="w-12 h-12 text-green-600 animate-[scale-in_0.3s_ease-out_0.2s_both]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13l4 4L19 7"
              class="animate-[draw-check_0.4s_ease-out_0.4s_both]"
              style="stroke-dasharray: 24; stroke-dashoffset: 24; animation: draw-check 0.4s ease-out 0.4s forwards;"
            />
          </svg>
        </div>
      </div>

      <!-- Heading -->
      <h1 class="text-3xl font-bold text-slate-800 mb-3">Booking Confirmed!</h1>

      <!-- Summary -->
      <p class="text-lg text-slate-500 mb-10 max-w-md mx-auto">
        Your training session has been booked successfully. You'll receive a confirmation email shortly.
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          routerLink="/dashboard/bookings"
          class="w-full sm:w-auto px-8 py-3 bg-[#0D7377] text-white font-semibold rounded-xl hover:bg-[#0a5c5f] transition-colors text-center"
        >
          View My Bookings
        </a>
        <a
          routerLink="/book"
          class="w-full sm:w-auto px-8 py-3 border-2 border-[#0D7377] text-[#0D7377] font-semibold rounded-xl hover:bg-teal-50 transition-colors text-center"
        >
          Book Another Session
        </a>
        <a
          routerLink="/"
          class="text-slate-500 hover:text-slate-700 font-medium transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  `,
  styles: [`
    @keyframes draw-check {
      to { stroke-dashoffset: 0; }
    }
  `],
})
export class BookingSuccessComponent {}
