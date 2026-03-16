import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-slate-900 text-slate-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="md:col-span-1">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-2xl">🐾</span>
              <span class="text-xl font-bold text-white">PawForward</span>
            </div>
            <p class="text-sm text-slate-400 mb-4">
              Every paw, one step forward.
            </p>
            <p class="text-sm text-slate-400">
              Professional dog training for every breed, every age, every goal.
            </p>
          </div>

          <!-- Services -->
          <div>
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul class="space-y-2">
              <li>
                <a
                  routerLink="/services"
                  [queryParams]="{ category: 'PRIVATE' }"
                  class="text-sm hover:text-teal-400 transition"
                >
                  Private Training
                </a>
              </li>
              <li>
                <a
                  routerLink="/services"
                  [queryParams]="{ category: 'GROUP_CLASS' }"
                  class="text-sm hover:text-teal-400 transition"
                >
                  Group Classes
                </a>
              </li>
              <li>
                <a
                  routerLink="/services"
                  [queryParams]="{ category: 'BOARD_AND_TRAIN' }"
                  class="text-sm hover:text-teal-400 transition"
                >
                  Board & Train
                </a>
              </li>
              <li>
                <a
                  routerLink="/classes"
                  class="text-sm hover:text-teal-400 transition"
                >
                  Class Schedule
                </a>
              </li>
            </ul>
          </div>

          <!-- Company -->
          <div>
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul class="space-y-2">
              <li>
                <a routerLink="/about" class="text-sm hover:text-teal-400 transition">
                  About Us
                </a>
              </li>
              <li>
                <a routerLink="/trainers" class="text-sm hover:text-teal-400 transition">
                  Our Trainers
                </a>
              </li>
              <li>
                <a routerLink="/reviews" class="text-sm hover:text-teal-400 transition">
                  Reviews
                </a>
              </li>
              <li>
                <a routerLink="/contact" class="text-sm hover:text-teal-400 transition">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div>
            <h3 class="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Get in Touch
            </h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>hello&#64;pawforward.com</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(555) PAW-FWRD</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-4 h-4 text-teal-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Training Lane<br />Dogtown, CA 90210</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="border-t border-slate-700 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="text-sm text-slate-500">
            &copy; {{ currentYear }} PawForward Academy. All rights reserved.
          </p>
          <div class="flex gap-6">
            <a href="#" class="text-sm text-slate-500 hover:text-slate-300 transition">
              Privacy Policy
            </a>
            <a href="#" class="text-sm text-slate-500 hover:text-slate-300 transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
