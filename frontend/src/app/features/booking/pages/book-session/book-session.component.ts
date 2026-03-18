import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ServiceTypeService } from '../../../../core/services/service-type.service';
import { TrainerService } from '../../../../core/services/trainer.service';
import { DogService } from '../../../../core/services/dog.service';
import { SchedulingService } from '../../../../core/services/scheduling.service';
import { BookingService } from '../../../../core/services/booking.service';
import {
  ServiceType,
  TrainerProfile,
  Dog,
  DogRequest,
  AvailableSlot,
} from '../../../../core/models';

@Component({
  selector: 'app-book-session',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto py-10 px-6">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-slate-800 mb-2">Book a Training Session</h1>
      <p class="text-slate-500 mb-8">Follow the steps below to schedule your dog's training session.</p>

      <!-- Progress Indicator -->
      <div class="flex items-center justify-between mb-10">
        @for (step of steps; track step.number) {
          <div class="flex flex-col items-center flex-1">
            <div class="flex items-center w-full">
              @if (step.number > 1) {
                <div
                  class="flex-1 h-0.5"
                  [class]="step.number <= currentStep() ? 'bg-[#0D7377]' : 'bg-slate-200'"
                ></div>
              }
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors"
                [class]="stepIndicatorClass(step.number)"
              >
                @if (step.number < currentStep()) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                } @else {
                  {{ step.number }}
                }
              </div>
              @if (step.number < 5) {
                <div
                  class="flex-1 h-0.5"
                  [class]="step.number < currentStep() ? 'bg-[#0D7377]' : 'bg-slate-200'"
                ></div>
              }
            </div>
            <span
              class="text-xs mt-2 text-center font-medium"
              [class]="step.number <= currentStep() ? 'text-[#0D7377]' : 'text-slate-400'"
            >
              {{ step.label }}
            </span>
          </div>
        }
      </div>

      <!-- Step Content -->
      <div class="min-h-[400px]">

        <!-- Step 1: Select Service -->
        @if (currentStep() === 1) {
          <div>
            <h2 class="text-xl font-semibold text-slate-800 mb-1">Select a Service</h2>
            <p class="text-slate-500 text-sm mb-6">Choose the type of training session you'd like to book.</p>
            @if (loadingServices()) {
              <div class="flex justify-center py-16">
                <div class="w-8 h-8 border-4 border-slate-200 border-t-[#0D7377] rounded-full animate-spin"></div>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (service of services(); track service.id) {
                  <button
                    (click)="selectedService.set(service)"
                    class="text-left border-2 rounded-xl p-5 transition-all hover:shadow-md"
                    [class]="selectedService()?.id === service.id
                      ? 'border-[#0D7377] bg-teal-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <h3 class="font-semibold text-slate-800">{{ service.name }}</h3>
                      <span
                        class="text-xs font-medium px-2.5 py-1 rounded-full"
                        [class]="categoryBadgeClass(service.category)"
                      >
                        {{ formatCategory(service.category) }}
                      </span>
                    </div>
                    @if (service.description) {
                      <p class="text-sm text-slate-500 mb-3">{{ service.description }}</p>
                    }
                    <div class="flex items-center gap-4 text-sm text-slate-600">
                      @if (service.durationMinutes) {
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {{ service.durationMinutes }} min
                        </span>
                      }
                      <span class="font-semibold text-[#0D7377]">\${{ service.price.toFixed(2) }}</span>
                    </div>
                  </button>
                }
              </div>
            }
          </div>
        }

        <!-- Step 2: Select Dog -->
        @if (currentStep() === 2) {
          <div>
            <h2 class="text-xl font-semibold text-slate-800 mb-1">Select Your Dog</h2>
            <p class="text-slate-500 text-sm mb-6">Choose which dog will attend the training session.</p>
            @if (loadingDogs()) {
              <div class="flex justify-center py-16">
                <div class="w-8 h-8 border-4 border-slate-200 border-t-[#0D7377] rounded-full animate-spin"></div>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (dog of dogs(); track dog.id) {
                  <button
                    (click)="selectedDog.set(dog)"
                    class="text-left border-2 rounded-xl p-5 transition-all hover:shadow-md"
                    [class]="selectedDog()?.id === dog.id
                      ? 'border-[#0D7377] bg-teal-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 class="font-semibold text-slate-800">{{ dog.name }}</h3>
                        @if (dog.breed) {
                          <p class="text-sm text-slate-500">{{ dog.breed }}</p>
                        }
                      </div>
                    </div>
                  </button>
                }

                <!-- Add a Dog Card -->
                <button
                  (click)="showAddDogForm.set(!showAddDogForm())"
                  class="text-left border-2 border-dashed rounded-xl p-5 transition-all hover:shadow-md"
                  [class]="showAddDogForm()
                    ? 'border-[#0D7377] bg-teal-50'
                    : 'border-slate-300 bg-white hover:border-[#0D7377]'"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-[#0D7377]/10 flex items-center justify-center text-[#0D7377] shrink-0">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-semibold text-slate-800">Add a Dog</h3>
                      <p class="text-sm text-slate-500">Register a new dog</p>
                    </div>
                  </div>
                </button>
              </div>

              <!-- Inline Add Dog Form -->
              @if (showAddDogForm()) {
                <div class="mt-6 border border-slate-200 rounded-xl p-6 bg-white">
                  <h3 class="font-semibold text-slate-800 mb-4">Add a New Dog</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                      <input
                        type="text"
                        [(ngModel)]="newDogName"
                        class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                        placeholder="e.g., Buddy"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Breed</label>
                      <input
                        type="text"
                        [(ngModel)]="newDogBreed"
                        class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                        placeholder="e.g., Golden Retriever"
                      />
                    </div>
                  </div>
                  <div class="flex gap-3 mt-4">
                    <button
                      (click)="addDog()"
                      [disabled]="!newDogName.trim() || savingDog()"
                      class="px-4 py-2 bg-[#0D7377] text-white text-sm font-medium rounded-lg hover:bg-[#0a5c5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      @if (savingDog()) {
                        Saving...
                      } @else {
                        Save Dog
                      }
                    </button>
                    <button
                      (click)="showAddDogForm.set(false)"
                      class="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- Step 3: Select Trainer -->
        @if (currentStep() === 3) {
          <div>
            <h2 class="text-xl font-semibold text-slate-800 mb-1">Select a Trainer</h2>
            <p class="text-slate-500 text-sm mb-6">Choose your preferred trainer or let us match you.</p>
            @if (loadingTrainers()) {
              <div class="flex justify-center py-16">
                <div class="w-8 h-8 border-4 border-slate-200 border-t-[#0D7377] rounded-full animate-spin"></div>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Any Available Trainer -->
                <button
                  (click)="selectAnyTrainer()"
                  class="text-left border-2 rounded-xl p-5 transition-all hover:shadow-md md:col-span-2"
                  [class]="selectedTrainer()?.id === 'any'
                    ? 'border-[#0D7377] bg-teal-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] shrink-0">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-semibold text-slate-800">Any Available Trainer</h3>
                      <p class="text-sm text-slate-500">We'll match you with the best available trainer</p>
                    </div>
                  </div>
                </button>

                @for (trainer of trainers(); track trainer.id) {
                  <button
                    (click)="selectedTrainer.set(trainer)"
                    class="text-left border-2 rounded-xl p-5 transition-all hover:shadow-md"
                    [class]="selectedTrainer()?.id === trainer.id
                      ? 'border-[#0D7377] bg-teal-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'"
                  >
                    <div class="flex items-center gap-3 mb-3">
                      <div class="w-12 h-12 rounded-full bg-[#0D7377]/10 flex items-center justify-center text-[#0D7377] font-semibold shrink-0">
                        {{ getInitials(trainer.name) }}
                      </div>
                      <div>
                        <h3 class="font-semibold text-slate-800">{{ trainer.name }}</h3>
                        @if (trainer.yearsExperience) {
                          <p class="text-xs text-slate-500">{{ trainer.yearsExperience }} years experience</p>
                        }
                      </div>
                    </div>
                    @if (trainer.specializations.length > 0) {
                      <div class="flex flex-wrap gap-1.5">
                        @for (spec of trainer.specializations; track spec) {
                          <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{{ spec }}</span>
                        }
                      </div>
                    }
                  </button>
                }
              </div>
            }
          </div>
        }

        <!-- Step 4: Select Date & Time -->
        @if (currentStep() === 4) {
          <div>
            <h2 class="text-xl font-semibold text-slate-800 mb-1">Select Date &amp; Time</h2>
            <p class="text-slate-500 text-sm mb-6">Pick a date and available time slot.</p>

            <!-- Date Chips -->
            <div class="mb-6">
              <h3 class="text-sm font-medium text-slate-700 mb-3">Available Dates</h3>
              <div class="flex flex-wrap gap-2">
                @for (date of next14Days(); track date.value) {
                  <button
                    (click)="selectDate(date.value)"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                    [class]="selectedDate() === date.value
                      ? 'bg-[#0D7377] text-white border-[#0D7377]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#0D7377] hover:text-[#0D7377]'"
                  >
                    <div class="text-xs">{{ date.dayOfWeek }}</div>
                    <div>{{ date.display }}</div>
                  </button>
                }
              </div>
            </div>

            <!-- Time Slots -->
            @if (selectedDate()) {
              <div>
                <h3 class="text-sm font-medium text-slate-700 mb-3">Available Time Slots</h3>
                @if (loadingSlots()) {
                  <div class="flex justify-center py-8">
                    <div class="w-8 h-8 border-4 border-slate-200 border-t-[#0D7377] rounded-full animate-spin"></div>
                  </div>
                } @else if (availableSlots().length === 0) {
                  <div class="text-center py-8 text-slate-500">
                    <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p>No available time slots for this date. Please try another date.</p>
                  </div>
                } @else {
                  <div class="flex flex-wrap gap-2">
                    @for (slot of availableSlots(); track slot.startTime + slot.trainerId) {
                      <button
                        (click)="selectedSlot.set(slot)"
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                        [class]="selectedSlot()?.startTime === slot.startTime && selectedSlot()?.trainerId === slot.trainerId
                          ? 'bg-[#0D7377] text-white border-[#0D7377]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#0D7377] hover:text-[#0D7377]'"
                      >
                        {{ slot.startTime }} - {{ slot.endTime }}
                        @if (selectedTrainer()?.id === 'any') {
                          <div class="text-xs opacity-75">{{ slot.trainerName }}</div>
                        }
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Step 5: Review & Confirm -->
        @if (currentStep() === 5) {
          <div>
            @if (bookingConfirmed()) {
              <!-- Booking Confirmed State -->
              <div class="text-center py-12">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
                <p class="text-slate-500 mb-8">Your training session has been successfully booked.</p>
                <div class="flex justify-center gap-4">
                  <a
                    routerLink="/dashboard/bookings"
                    class="px-6 py-3 bg-[#0D7377] text-white font-semibold rounded-xl hover:bg-[#0a5c5f] transition-colors"
                  >
                    View My Bookings
                  </a>
                  <button
                    (click)="resetWizard()"
                    class="px-6 py-3 border-2 border-[#0D7377] text-[#0D7377] font-semibold rounded-xl hover:bg-teal-50 transition-colors"
                  >
                    Book Another Session
                  </button>
                </div>
              </div>
            } @else {
              <h2 class="text-xl font-semibold text-slate-800 mb-1">Review &amp; Confirm</h2>
              <p class="text-slate-500 text-sm mb-6">Please review your booking details before confirming.</p>

              <div class="border border-slate-200 rounded-xl p-6 bg-white space-y-4">
                <!-- Service -->
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-xs uppercase tracking-wide text-slate-400 font-medium">Service</p>
                    <p class="text-slate-800 font-semibold">{{ selectedService()?.name }}</p>
                    @if (selectedService()?.durationMinutes) {
                      <p class="text-sm text-slate-500">{{ selectedService()?.durationMinutes }} minutes</p>
                    }
                  </div>
                  <span
                    class="text-xs font-medium px-2.5 py-1 rounded-full"
                    [class]="categoryBadgeClass(selectedService()?.category || '')"
                  >
                    {{ formatCategory(selectedService()?.category || '') }}
                  </span>
                </div>
                <hr class="border-slate-100" />

                <!-- Dog -->
                <div>
                  <p class="text-xs uppercase tracking-wide text-slate-400 font-medium">Dog</p>
                  <p class="text-slate-800 font-semibold">{{ selectedDog()?.name }}</p>
                  @if (selectedDog()?.breed) {
                    <p class="text-sm text-slate-500">{{ selectedDog()?.breed }}</p>
                  }
                </div>
                <hr class="border-slate-100" />

                <!-- Trainer -->
                <div>
                  <p class="text-xs uppercase tracking-wide text-slate-400 font-medium">Trainer</p>
                  <p class="text-slate-800 font-semibold">
                    {{ selectedTrainer()?.id === 'any' ? selectedSlot()?.trainerName : selectedTrainer()?.name }}
                  </p>
                </div>
                <hr class="border-slate-100" />

                <!-- Date & Time -->
                <div>
                  <p class="text-xs uppercase tracking-wide text-slate-400 font-medium">Date &amp; Time</p>
                  <p class="text-slate-800 font-semibold">{{ formatDateDisplay(selectedDate()!) }}</p>
                  <p class="text-sm text-slate-500">{{ selectedSlot()?.startTime }} - {{ selectedSlot()?.endTime }}</p>
                </div>
                <hr class="border-slate-100" />

                <!-- Price -->
                <div class="flex justify-between items-center pt-2">
                  <p class="text-lg font-bold text-slate-800">Total</p>
                  <p class="text-2xl font-bold text-[#0D7377]">\${{ selectedService()?.price?.toFixed(2) }}</p>
                </div>
              </div>

              @if (bookingError()) {
                <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {{ bookingError() }}
                </div>
              }
            }
          </div>
        }
      </div>

      <!-- Navigation Buttons -->
      @if (!bookingConfirmed()) {
        <div class="flex justify-between mt-10 pt-6 border-t border-slate-200">
          <button
            (click)="prevStep()"
            [class.invisible]="currentStep() === 1"
            class="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Back
          </button>

          @if (currentStep() < 5) {
            <button
              (click)="nextStep()"
              [disabled]="!canProceed()"
              class="px-6 py-3 bg-[#0D7377] text-white font-semibold rounded-xl hover:bg-[#0a5c5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          } @else if (!bookingConfirmed()) {
            <button
              (click)="confirmBooking()"
              [disabled]="submittingBooking()"
              class="px-8 py-3 bg-[#F59E0B] text-white font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              @if (submittingBooking()) {
                Processing...
              } @else {
                Proceed to Payment
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class BookSessionComponent implements OnInit {
  private serviceTypeService = inject(ServiceTypeService);
  private trainerService = inject(TrainerService);
  private dogService = inject(DogService);
  private schedulingService = inject(SchedulingService);
  private bookingService = inject(BookingService);
  private router = inject(Router);

  steps = [
    { number: 1, label: 'Select Service' },
    { number: 2, label: 'Select Dog' },
    { number: 3, label: 'Select Trainer' },
    { number: 4, label: 'Date & Time' },
    { number: 5, label: 'Review' },
  ];

  // Wizard state
  currentStep = signal(1);

  // Data
  services = signal<ServiceType[]>([]);
  dogs = signal<Dog[]>([]);
  trainers = signal<TrainerProfile[]>([]);
  availableSlots = signal<AvailableSlot[]>([]);

  // Selections
  selectedService = signal<ServiceType | null>(null);
  selectedDog = signal<Dog | null>(null);
  selectedTrainer = signal<TrainerProfile | null>(null);
  selectedDate = signal<string | null>(null);
  selectedSlot = signal<AvailableSlot | null>(null);

  // Loading states
  loadingServices = signal(false);
  loadingDogs = signal(false);
  loadingTrainers = signal(false);
  loadingSlots = signal(false);
  submittingBooking = signal(false);

  // UI state
  showAddDogForm = signal(false);
  newDogName = '';
  newDogBreed = '';
  savingDog = signal(false);
  bookingConfirmed = signal(false);
  bookingError = signal<string | null>(null);

  // Computed
  canProceed = computed(() => {
    switch (this.currentStep()) {
      case 1: return !!this.selectedService();
      case 2: return !!this.selectedDog();
      case 3: return !!this.selectedTrainer();
      case 4: return !!this.selectedSlot();
      default: return true;
    }
  });

  next14Days = computed(() => {
    const days: { value: string; display: string; dayOfWeek: string }[] = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const value = d.toISOString().split('T')[0];
      days.push({
        value,
        display: `${monthNames[d.getMonth()]} ${d.getDate()}`,
        dayOfWeek: dayNames[d.getDay()],
      });
    }
    return days;
  });

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loadingServices.set(true);
    this.serviceTypeService.getServices().subscribe({
      next: (data) => {
        this.services.set(data.filter(s => s.active));
        this.loadingServices.set(false);
      },
      error: () => this.loadingServices.set(false),
    });
  }

  loadDogs() {
    this.loadingDogs.set(true);
    this.dogService.getMyDogs().subscribe({
      next: (data) => {
        this.dogs.set(data);
        this.loadingDogs.set(false);
      },
      error: () => this.loadingDogs.set(false),
    });
  }

  loadTrainers() {
    this.loadingTrainers.set(true);
    this.trainerService.getTrainers().subscribe({
      next: (data) => {
        this.trainers.set(data.filter(t => t.acceptingClients));
        this.loadingTrainers.set(false);
      },
      error: () => this.loadingTrainers.set(false),
    });
  }

  loadAvailableSlots(date: string) {
    const trainerId = this.selectedTrainer()?.id;
    const serviceTypeId = this.selectedService()?.id;
    if (!trainerId || !serviceTypeId) return;

    this.loadingSlots.set(true);
    this.selectedSlot.set(null);

    // For "any" trainer, we use a special handling - pass the first trainer or handle server-side
    const effectiveTrainerId = trainerId === 'any' ? '' : trainerId;

    // If "any" trainer, load slots for all trainers
    if (trainerId === 'any') {
      const allTrainers = this.trainers();
      const allSlots: AvailableSlot[] = [];
      let completed = 0;
      if (allTrainers.length === 0) {
        this.loadingSlots.set(false);
        return;
      }
      allTrainers.forEach(trainer => {
        this.schedulingService.getAvailableSlots(trainer.id, serviceTypeId, date, date).subscribe({
          next: (slots) => {
            allSlots.push(...slots);
            completed++;
            if (completed === allTrainers.length) {
              allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
              this.availableSlots.set(allSlots);
              this.loadingSlots.set(false);
            }
          },
          error: () => {
            completed++;
            if (completed === allTrainers.length) {
              allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
              this.availableSlots.set(allSlots);
              this.loadingSlots.set(false);
            }
          },
        });
      });
    } else {
      this.schedulingService.getAvailableSlots(trainerId, serviceTypeId, date, date).subscribe({
        next: (slots) => {
          this.availableSlots.set(slots);
          this.loadingSlots.set(false);
        },
        error: () => {
          this.availableSlots.set([]);
          this.loadingSlots.set(false);
        },
      });
    }
  }

  selectDate(date: string) {
    this.selectedDate.set(date);
    this.loadAvailableSlots(date);
  }

  selectAnyTrainer() {
    this.selectedTrainer.set({ id: 'any', name: 'Any Available Trainer' } as TrainerProfile);
  }

  nextStep() {
    if (!this.canProceed()) return;
    const step = this.currentStep();
    if (step === 1) this.loadDogs();
    if (step === 2) this.loadTrainers();
    if (step < 5) this.currentStep.set(step + 1);
  }

  prevStep() {
    const step = this.currentStep();
    if (step > 1) this.currentStep.set(step - 1);
  }

  addDog() {
    if (!this.newDogName.trim()) return;
    this.savingDog.set(true);
    const request: DogRequest = {
      name: this.newDogName.trim(),
      breed: this.newDogBreed.trim() || undefined,
    };
    this.dogService.createDog(request).subscribe({
      next: (dog) => {
        this.dogs.update(dogs => [...dogs, dog]);
        this.selectedDog.set(dog);
        this.newDogName = '';
        this.newDogBreed = '';
        this.showAddDogForm.set(false);
        this.savingDog.set(false);
      },
      error: () => this.savingDog.set(false),
    });
  }

  confirmBooking() {
    const slot = this.selectedSlot();
    const dog = this.selectedDog();
    const service = this.selectedService();
    if (!slot || !dog || !service) return;

    this.submittingBooking.set(true);
    this.bookingError.set(null);

    // First create a session, then book it
    const sessionRequest = {
      serviceTypeId: service.id,
      trainerId: slot.trainerId,
      sessionDate: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    };

    this.schedulingService.createSession(sessionRequest).subscribe({
      next: (session) => {
        this.bookingService.createBooking({ sessionId: session.id, dogId: dog.id }).subscribe({
          next: () => {
            this.bookingConfirmed.set(true);
            this.submittingBooking.set(false);
          },
          error: (err) => {
            this.bookingError.set(err?.error?.message || 'Failed to create booking. Please try again.');
            this.submittingBooking.set(false);
          },
        });
      },
      error: (err) => {
        this.bookingError.set(err?.error?.message || 'Failed to create session. Please try again.');
        this.submittingBooking.set(false);
      },
    });
  }

  resetWizard() {
    this.currentStep.set(1);
    this.selectedService.set(null);
    this.selectedDog.set(null);
    this.selectedTrainer.set(null);
    this.selectedDate.set(null);
    this.selectedSlot.set(null);
    this.bookingConfirmed.set(false);
    this.bookingError.set(null);
  }

  // Helpers

  stepIndicatorClass(step: number): string {
    if (step < this.currentStep()) return 'bg-green-500 text-white';
    if (step === this.currentStep()) return 'bg-[#0D7377] text-white';
    return 'bg-slate-200 text-slate-500';
  }

  categoryBadgeClass(category: string): string {
    switch (category) {
      case 'PRIVATE': return 'bg-teal-100 text-teal-700';
      case 'GROUP_CLASS': return 'bg-amber-100 text-amber-700';
      case 'BOARD_AND_TRAIN': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  formatCategory(category: string): string {
    switch (category) {
      case 'PRIVATE': return 'Private';
      case 'GROUP_CLASS': return 'Group Class';
      case 'BOARD_AND_TRAIN': return 'Board & Train';
      default: return category;
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
}
