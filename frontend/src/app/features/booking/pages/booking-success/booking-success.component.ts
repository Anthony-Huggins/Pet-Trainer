import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [],
  template: `
    <div class="max-w-2xl mx-auto py-20 px-6 text-center">
      <div class="relative w-24 h-24 mx-auto mb-8">
        <div class="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
        <div class="relative w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h1 class="text-3xl font-bold text-slate-800 mb-3">Payment Successful!</h1>
      <p class="text-lg text-slate-500 mb-4">Your booking is confirmed. Redirecting to your dashboard...</p>
      <p class="text-sm text-slate-400">If you are not redirected, <a href="/dashboard/bookings" class="text-[#0D7377] underline">click here</a>.</p>
    </div>
  `,
})
export class BookingSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    // Redirect to dashboard after a brief success flash
    setTimeout(() => {
      this.router.navigate(['/dashboard/bookings']);
    }, 2000);
  }
}
