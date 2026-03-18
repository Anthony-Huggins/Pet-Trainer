import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-packages',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto py-10 px-6">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-slate-800">My Packages</h1>
      <p class="text-slate-500 mt-1">Manage your purchased training packages and sessions.</p>

      <!-- Empty State -->
      <div class="mt-10 bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-16 text-center">
        <svg class="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <h3 class="text-lg font-semibold text-slate-700 mt-4">No packages purchased yet</h3>
        <p class="text-slate-500 mt-2 max-w-md mx-auto">
          Training packages let you pre-purchase multiple sessions at a discount.
          Browse our available packages to get started.
        </p>
        <a
          routerLink="/services"
          class="inline-flex items-center mt-6 px-6 py-3 rounded-lg bg-[#F59E0B] text-white font-semibold hover:bg-amber-600 transition-colors shadow-sm"
        >
          Browse Packages
          <svg class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>

      <!-- Package Cards Layout (hidden until packages API is built) -->
      <!--
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800">Package Name</h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>
          </div>

          <div class="flex items-center justify-center my-6">
            <div class="relative w-24 h-24">
              <svg class="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <path class="text-slate-100" stroke="currentColor" stroke-width="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="text-[#0D7377]" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="60, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-slate-800">3/5</span>
              </div>
            </div>
          </div>

          <p class="text-sm text-slate-500 text-center">Sessions remaining</p>
          <p class="text-xs text-slate-400 text-center mt-2">Expires: June 30, 2026</p>

          <button class="w-full mt-5 px-4 py-2.5 rounded-lg bg-[#0D7377] text-white font-medium hover:bg-teal-700 transition-colors">
            Book Using Package
          </button>
        </div>
      </div>
      -->
    </div>
  `,
})
export class MyPackagesComponent {}
