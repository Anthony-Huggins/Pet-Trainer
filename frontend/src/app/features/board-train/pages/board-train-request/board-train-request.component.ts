import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DogService } from '../../../../core/services/dog.service';
import { Dog } from '../../../../core/models';

@Component({
  selector: 'app-board-train-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto py-10 px-6">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-slate-800">Board & Train Request</h1>
      <p class="text-slate-500 mt-1">
        Submit a request for our immersive board and train program. Your dog stays with a
        professional trainer for focused, accelerated learning.
      </p>

      @if (submitted()) {
        <!-- Success State -->
        <div class="mt-10 bg-white rounded-xl border border-emerald-200 shadow-sm px-6 py-16 text-center">
          <div class="mx-auto h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg class="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-800 mt-4">Request Submitted!</h3>
          <p class="text-slate-500 mt-2 max-w-md mx-auto">
            We've received your board & train request. A member of our team will review it and
            reach out within 1-2 business days to confirm availability and finalize details.
          </p>
          <button
            (click)="resetForm()"
            class="mt-6 px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      } @else {
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Form -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
              <!-- Dog Selector -->
              <div>
                <label for="dog" class="block text-sm font-medium text-slate-700 mb-1">Select Dog *</label>
                <select
                  id="dog"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                  [ngModel]="selectedDogId()"
                  (ngModelChange)="selectedDogId.set($event)"
                >
                  <option value="">-- Choose a dog --</option>
                  @for (dog of dogs(); track dog.id) {
                    <option [value]="dog.id">{{ dog.name }}</option>
                  }
                </select>
              </div>

              <!-- Start Date -->
              <div>
                <label for="startDate" class="block text-sm font-medium text-slate-700 mb-1">Preferred Start Date *</label>
                <input
                  id="startDate"
                  type="date"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                  [ngModel]="startDate()"
                  (ngModelChange)="startDate.set($event)"
                />
              </div>

              <!-- Program Length -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Program Length *</label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  @for (week of [1, 2, 3, 4]; track week) {
                    <label
                      class="flex items-center justify-center px-4 py-3 rounded-lg border cursor-pointer transition-colors"
                      [class]="programWeeks() === week
                        ? 'border-[#0D7377] bg-teal-50 text-[#0D7377] ring-2 ring-[#0D7377]'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'"
                    >
                      <input
                        type="radio"
                        name="programWeeks"
                        [value]="week"
                        class="sr-only"
                        [ngModel]="programWeeks()"
                        (ngModelChange)="programWeeks.set($event)"
                      />
                      <span class="font-medium">{{ week }} {{ week === 1 ? 'Week' : 'Weeks' }}</span>
                    </label>
                  }
                </div>
              </div>

              <!-- Goals -->
              <div>
                <label for="goals" class="block text-sm font-medium text-slate-700 mb-1">Training Goals *</label>
                <textarea
                  id="goals"
                  rows="3"
                  placeholder="What would you like your dog to learn? (e.g., basic obedience, leash manners, socialization)"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent resize-none"
                  [ngModel]="goals()"
                  (ngModelChange)="goals.set($event)"
                ></textarea>
              </div>

              <!-- Pickup / Dropoff -->
              <div>
                <label for="pickupInstructions" class="block text-sm font-medium text-slate-700 mb-1">Pickup / Drop-off Instructions</label>
                <textarea
                  id="pickupInstructions"
                  rows="2"
                  placeholder="Any special instructions for pickup or drop-off?"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent resize-none"
                  [ngModel]="pickupInstructions()"
                  (ngModelChange)="pickupInstructions.set($event)"
                ></textarea>
              </div>

              <!-- Emergency Contact -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="emergencyName" class="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Name *</label>
                  <input
                    id="emergencyName"
                    type="text"
                    placeholder="Full name"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                    [ngModel]="emergencyName()"
                    (ngModelChange)="emergencyName.set($event)"
                  />
                </div>
                <div>
                  <label for="emergencyPhone" class="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Phone *</label>
                  <input
                    id="emergencyPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                    [ngModel]="emergencyPhone()"
                    (ngModelChange)="emergencyPhone.set($event)"
                  />
                </div>
              </div>

              <!-- Special Instructions -->
              <div>
                <label for="specialInstructions" class="block text-sm font-medium text-slate-700 mb-1">Special Instructions</label>
                <textarea
                  id="specialInstructions"
                  rows="2"
                  placeholder="Dietary needs, medical conditions, behavioral notes, etc."
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent resize-none"
                  [ngModel]="specialInstructions()"
                  (ngModelChange)="specialInstructions.set($event)"
                ></textarea>
              </div>
            </div>

            <!-- Submit -->
            <button
              (click)="submitRequest()"
              [disabled]="!isFormValid()"
              class="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#F59E0B] text-white font-semibold hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>

          <!-- Price Estimate Card -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
              <h3 class="text-lg font-semibold text-slate-800 mb-4">Price Estimate</h3>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Program length</span>
                  <span class="font-medium text-slate-700">{{ programWeeks() }} {{ programWeeks() === 1 ? 'week' : 'weeks' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Rate per week</span>
                  <span class="font-medium text-slate-700">$450</span>
                </div>
                <div class="border-t border-slate-200 pt-3 flex justify-between">
                  <span class="font-semibold text-slate-800">Estimated Total</span>
                  <span class="text-xl font-bold text-[#0D7377]">{{ '$' + (programWeeks() * 450) }}</span>
                </div>
              </div>
              <p class="text-xs text-slate-400 mt-4">
                Final pricing will be confirmed after reviewing your request. Price may vary based on specific training needs.
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class BoardTrainRequestComponent implements OnInit {
  dogs = signal<Dog[]>([]);
  selectedDogId = signal('');
  startDate = signal('');
  programWeeks = signal(2);
  goals = signal('');
  pickupInstructions = signal('');
  emergencyName = signal('');
  emergencyPhone = signal('');
  specialInstructions = signal('');
  submitted = signal(false);
  loading = signal(false);

  isFormValid = computed(() =>
    !!this.selectedDogId() &&
    !!this.startDate() &&
    !!this.goals() &&
    !!this.emergencyName() &&
    !!this.emergencyPhone()
  );

  constructor(private dogService: DogService) {}

  ngOnInit(): void {
    this.dogService.getMyDogs().subscribe({
      next: (dogs) => this.dogs.set(dogs),
    });
  }

  submitRequest(): void {
    if (!this.isFormValid()) return;
    this.submitted.set(true);
  }

  resetForm(): void {
    this.selectedDogId.set('');
    this.startDate.set('');
    this.programWeeks.set(2);
    this.goals.set('');
    this.pickupInstructions.set('');
    this.emergencyName.set('');
    this.emergencyPhone.set('');
    this.specialInstructions.set('');
    this.submitted.set(false);
  }
}
