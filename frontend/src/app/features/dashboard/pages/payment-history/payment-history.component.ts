import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { PaymentService } from '../../../../core/services/payment.service';
import { Payment, PaymentStatus } from '../../../../core/models';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="max-w-6xl mx-auto py-10 px-6">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-slate-800">Payment History</h1>
      <p class="text-slate-500 mt-1">View your transaction history and receipts.</p>

      <!-- Loading State -->
      @if (loading()) {
        <div class="mt-10 text-center py-16">
          <div class="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#0D7377] rounded-full animate-spin"></div>
          <p class="text-slate-500 mt-4">Loading payments...</p>
        </div>
      } @else {
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <p class="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Spent This Month</p>
            <p class="text-3xl font-bold text-slate-800 mt-2">{{ monthlyTotal() | currency:'USD' }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ currentMonth() }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <p class="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Spent All Time</p>
            <p class="text-3xl font-bold text-slate-800 mt-2">{{ allTimeTotal() | currency:'USD' }}</p>
            <p class="text-xs text-slate-400 mt-1">Since account creation</p>
          </div>
        </div>

        <!-- Error State -->
        @if (error()) {
          <div class="mt-10 bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-red-700">
            {{ error() }}
          </div>
        }

        <!-- Payment Table -->
        <div class="mt-10">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            @if (payments().length > 0) {
              <!-- Table Header -->
              <div class="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <div class="col-span-3">Date</div>
                <div class="col-span-3">Description</div>
                <div class="col-span-2">Type</div>
                <div class="col-span-2 text-right">Amount</div>
                <div class="col-span-2 text-center">Status</div>
              </div>

              <!-- Table Rows -->
              @for (payment of payments(); track payment.id) {
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                  <!-- Date -->
                  <div class="sm:col-span-3">
                    <span class="sm:hidden text-xs font-semibold text-slate-400 uppercase">Date: </span>
                    <span class="text-sm text-slate-700">{{ payment.createdAt | date:'MMM d, y, h:mm a' }}</span>
                  </div>
                  <!-- Description -->
                  <div class="sm:col-span-3">
                    <span class="sm:hidden text-xs font-semibold text-slate-400 uppercase">Description: </span>
                    <span class="text-sm text-slate-700">{{ payment.description || 'Training session' }}</span>
                  </div>
                  <!-- Type -->
                  <div class="sm:col-span-2">
                    <span class="sm:hidden text-xs font-semibold text-slate-400 uppercase">Type: </span>
                    <span class="text-sm text-slate-600 capitalize">{{ payment.paymentType.toLowerCase() }}</span>
                  </div>
                  <!-- Amount -->
                  <div class="sm:col-span-2 sm:text-right">
                    <span class="sm:hidden text-xs font-semibold text-slate-400 uppercase">Amount: </span>
                    <span class="text-sm font-semibold text-slate-800">{{ payment.amount | currency:'USD' }}</span>
                  </div>
                  <!-- Status -->
                  <div class="sm:col-span-2 sm:text-center">
                    <span class="sm:hidden text-xs font-semibold text-slate-400 uppercase">Status: </span>
                    <span [class]="getStatusClasses(payment.status)">
                      {{ formatStatus(payment.status) }}
                    </span>
                  </div>
                </div>
              }
            } @else {
              <!-- Empty State -->
              <div class="px-6 py-16 text-center">
                <svg class="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                <h3 class="text-lg font-semibold text-slate-700 mt-4">No payments yet</h3>
                <p class="text-slate-500 mt-2 max-w-md mx-auto">
                  Your payment history will appear here after your first booking.
                </p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class PaymentHistoryComponent implements OnInit {
  payments = signal<Payment[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  allTimeTotal = computed(() =>
    this.payments()
      .filter(p => p.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, p) => sum + p.amount, 0)
  );

  monthlyTotal = computed(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.payments()
      .filter(p => p.status === PaymentStatus.SUCCEEDED && new Date(p.createdAt) >= startOfMonth)
      .reduce((sum, p) => sum + p.amount, 0);
  });

  currentMonth = computed(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.paymentService.getMyPayments().subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load payment history. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  getStatusClasses(status: PaymentStatus): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case PaymentStatus.SUCCEEDED:
        return `${base} bg-emerald-50 text-emerald-700`;
      case PaymentStatus.FAILED:
        return `${base} bg-red-50 text-red-700`;
      case PaymentStatus.PENDING:
        return `${base} bg-yellow-50 text-yellow-700`;
      case PaymentStatus.REFUNDED:
        return `${base} bg-slate-100 text-slate-600`;
      case PaymentStatus.PARTIALLY_REFUNDED:
        return `${base} bg-orange-50 text-orange-700`;
      default:
        return `${base} bg-slate-100 text-slate-600`;
    }
  }

  formatStatus(status: PaymentStatus): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}
