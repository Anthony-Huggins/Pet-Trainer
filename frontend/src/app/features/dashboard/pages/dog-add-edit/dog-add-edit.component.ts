import { Component, input, signal, computed, inject, OnInit, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DogService } from '../../../../core/services/dog.service';
import { Dog, DogRequest } from '../../../../core/models';

@Component({
  selector: 'app-dog-add-edit',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-3xl mx-auto py-10 px-6">
      <!-- Loading existing dog data -->
      @if (loadingDog()) {
        <div class="flex flex-col items-center justify-center py-24 gap-4">
          <div class="w-10 h-10 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-slate-500">Loading dog data...</p>
        </div>
      }

      <!-- Load error -->
      @if (loadError()) {
        <div class="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
          <p class="text-red-600 font-medium">{{ loadError() }}</p>
          <a routerLink="/dashboard/dogs" class="text-sm text-[#0D7377] hover:underline mt-2 inline-block">Back to My Dogs</a>
        </div>
      }

      @if (!loadingDog() && !loadError()) {
        <h1 class="text-3xl font-bold text-slate-800 mb-8">
          {{ isEditing() ? 'Edit ' + existingDog()?.name : 'Add a New Dog' }}
        </h1>

        <!-- Success Message -->
        @if (successMessage()) {
          <div class="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
            <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-emerald-700 text-sm font-medium">{{ successMessage() }}</span>
          </div>
        }

        <!-- Error Message -->
        @if (saveError()) {
          <div class="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-3">
            <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-red-700 text-sm font-medium">{{ saveError() }}</span>
          </div>
        }

        <!-- Form -->
        <div class="space-y-8">
          <!-- Basic Info Section -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 class="text-lg font-semibold text-slate-800 mb-6">Basic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [value]="name()"
                  (input)="name.set(inputVal($event))"
                  placeholder="e.g. Buddy"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  Breed <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [value]="breed()"
                  (input)="breed.set(inputVal($event))"
                  placeholder="e.g. Golden Retriever"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  [value]="dateOfBirth()"
                  (input)="dateOfBirth.set(inputVal($event))"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Weight (lbs)</label>
                <input
                  type="number"
                  [value]="weight()"
                  (input)="weight.set(numVal($event))"
                  placeholder="e.g. 65"
                  min="0"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-3">Gender</label>
                <div class="flex items-center gap-6">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      [checked]="gender() === 'Male'"
                      (change)="gender.set('Male')"
                      class="w-4 h-4 text-[#0D7377] border-slate-300 focus:ring-[#0D7377]"
                    />
                    <span class="text-sm text-slate-700">Male</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      [checked]="gender() === 'Female'"
                      (change)="gender.set('Female')"
                      class="w-4 h-4 text-[#0D7377] border-slate-300 focus:ring-[#0D7377]"
                    />
                    <span class="text-sm text-slate-700">Female</span>
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-3">Spayed/Neutered</label>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="spayedNeutered()"
                    (change)="spayedNeutered.set(!spayedNeutered())"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0D7377] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D7377]"></div>
                  <span class="ml-3 text-sm text-slate-600">{{ spayedNeutered() ? 'Yes' : 'No' }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Health Info Section -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 class="text-lg font-semibold text-slate-800 mb-6">Health Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Special Needs</label>
                <textarea
                  [value]="specialNeeds()"
                  (input)="specialNeeds.set(inputVal($event))"
                  rows="3"
                  placeholder="Any allergies, medical conditions, or special requirements..."
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent resize-none"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Vet Name</label>
                <input
                  type="text"
                  [value]="vetName()"
                  (input)="vetName.set(inputVal($event))"
                  placeholder="e.g. Dr. Smith"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Vet Phone</label>
                <input
                  type="tel"
                  [value]="vetPhone()"
                  (input)="vetPhone.set(inputVal($event))"
                  placeholder="(555) 123-4567"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Microchip ID</label>
                <input
                  type="text"
                  [value]="microchipId()"
                  (input)="microchipId.set(inputVal($event))"
                  placeholder="e.g. 985112345678901"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-4">
            <a
              routerLink="/dashboard/dogs"
              class="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </a>
            <button
              (click)="saveDog()"
              [disabled]="saving() || !canSave()"
              class="px-6 py-2.5 bg-[#F59E0B] hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving() ? 'Saving...' : 'Save Dog' }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class DogAddEditComponent implements OnInit {
  private dogService = inject(DogService);
  private router = inject(Router);

  id = input<string>();

  isEditing = computed(() => !!this.id());
  existingDog = signal<Dog | null>(null);
  loadingDog = signal(false);
  loadError = signal('');

  // Form fields
  name = signal('');
  breed = signal('');
  dateOfBirth = signal('');
  weight = signal<number | null>(null);
  gender = signal('');
  spayedNeutered = signal(false);
  specialNeeds = signal('');
  vetName = signal('');
  vetPhone = signal('');
  microchipId = signal('');

  saving = signal(false);
  saveError = signal('');
  successMessage = signal('');

  canSave = computed(() => this.name().trim() !== '' && this.breed().trim() !== '');

  ngOnInit(): void {
    const dogId = this.id();
    if (dogId) {
      this.loadingDog.set(true);
      this.dogService.getDog(dogId).subscribe({
        next: (dog) => {
          this.existingDog.set(dog);
          this.populateForm(dog);
          this.loadingDog.set(false);
        },
        error: () => {
          this.loadError.set('Failed to load dog. Please try again.');
          this.loadingDog.set(false);
        },
      });
    }
  }

  private populateForm(dog: Dog): void {
    this.name.set(dog.name);
    this.breed.set(dog.breed ?? '');
    this.dateOfBirth.set(dog.dateOfBirth ?? '');
    this.weight.set(dog.weightLbs ?? null);
    this.gender.set(dog.gender ?? '');
    this.spayedNeutered.set(dog.spayedNeutered ?? false);
    this.specialNeeds.set(dog.specialNeeds ?? '');
    this.vetName.set(dog.veterinarianName ?? '');
    this.vetPhone.set(dog.veterinarianPhone ?? '');
    this.microchipId.set(dog.microchipId ?? '');
  }

  inputVal(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  numVal(event: Event): number | null {
    const val = (event.target as HTMLInputElement).value;
    return val ? Number(val) : null;
  }

  saveDog(): void {
    this.saving.set(true);
    this.saveError.set('');
    this.successMessage.set('');

    const request: DogRequest = {
      name: this.name().trim(),
      breed: this.breed().trim() || undefined,
      dateOfBirth: this.dateOfBirth() || undefined,
      weightLbs: this.weight() ?? undefined,
      gender: this.gender() || undefined,
      spayedNeutered: this.spayedNeutered(),
      microchipId: this.microchipId().trim() || undefined,
      veterinarianName: this.vetName().trim() || undefined,
      veterinarianPhone: this.vetPhone().trim() || undefined,
      specialNeeds: this.specialNeeds().trim() || undefined,
    };

    const dogId = this.id();
    const operation = dogId
      ? this.dogService.updateDog(dogId, request)
      : this.dogService.createDog(request);

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/dashboard/dogs']);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Failed to save dog. Please try again.');
      },
    });
  }
}
