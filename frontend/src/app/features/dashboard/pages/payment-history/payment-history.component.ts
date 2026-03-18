import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto py-10 px-6">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-slate-800">Payment History</h1>
      <p class="text-slate-500 mt-1">View your transaction history and receipts.</p>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p class="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Spent This Month</p>
          <p class="text-3xl font-bold text-slate-800 mt-2">$0.00</p>
          <p class="text-xs text-slate-400 mt-1">March 2026</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p class="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Spent All Time</p>
          <p class="text-3xl font-bold text-slate-800 mt-2">$0.00</p>
          <p class="text-xs text-slate-400 mt-1">Since account creation</p>
        </div>
      </div>

      <!-- Payment Table -->
      <div class="mt-10">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <!-- Table Header -->
          <div class="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div class="col-span-3">Date</div>
            <div class="col-span-4">Description</div>
            <div class="col-span-2 text-right">Amount</div>
            <div class="col-span-2 text-center">Status</div>
            <div class="col-span-1 text-center">Receipt</div>
          </div>

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
        </div>
      </div>
    </div>
  `,
})
export class PaymentHistoryComponent {}
