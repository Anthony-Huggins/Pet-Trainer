import { Component, input, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DogService } from '../../../../core/services/dog.service';
import { Dog, DogVaccination } from '../../../../core/models';

@Component({
  selector: 'app-dog-profile',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="max-w-5xl mx-auto py-10 px-6">
      <!-- Loading -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-24 gap-4">
          <div class="w-10 h-10 border-4 border-[#0D7377] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-slate-500">Loading dog profile...</p>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
          <p class="text-red-600 font-medium">{{ error() }}</p>
          <a routerLink="/dashboard/dogs" class="text-sm text-[#0D7377] hover:underline mt-2 inline-block">Back to My Dogs</a>
        </div>
      }

      <!-- Dog Profile -->
      @if (dog()) {
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            @if (dog()!.profilePhotoUrl) {
              <img
                [src]="dog()!.profilePhotoUrl"
                [alt]="dog()!.name"
                class="w-24 h-24 rounded-full object-cover border-4 border-[#0D7377]/20"
              />
            } @else {
              <div class="w-24 h-24 rounded-full bg-[#0D7377] flex items-center justify-center text-white text-3xl font-bold shrink-0">
                {{ dog()!.name[0].toUpperCase() }}
              </div>
            }
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-slate-800">{{ dog()!.name }}</h1>
              <div class="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                @if (dog()!.breed) {
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>
                    {{ dog()!.breed }}
                  </span>
                }
                @if (age() !== null) {
                  <span>{{ age() }} {{ age() === 1 ? 'year' : 'years' }} old</span>
                }
                @if (dog()!.weightLbs) {
                  <span>{{ dog()!.weightLbs }} lbs</span>
                }
                @if (dog()!.gender) {
                  <span>{{ dog()!.gender }}</span>
                }
              </div>
            </div>
            <a
              [routerLink]="'/dashboard/dogs/' + dog()!.id + '/edit'"
              class="px-5 py-2.5 bg-[#F59E0B] hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm shrink-0"
            >
              Edit
            </a>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-slate-200 mb-6">
          <button
            (click)="activeTab.set('overview')"
            [class]="activeTab() === 'overview'
              ? 'px-6 py-3 text-sm font-semibold border-b-2 border-[#0D7377] text-[#0D7377]'
              : 'px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700'"
          >
            Overview
          </button>
          <button
            (click)="activeTab.set('vaccinations')"
            [class]="activeTab() === 'vaccinations'
              ? 'px-6 py-3 text-sm font-semibold border-b-2 border-[#0D7377] text-[#0D7377]'
              : 'px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700'"
          >
            Vaccinations
          </button>
        </div>

        <!-- Overview Tab -->
        @if (activeTab() === 'overview') {
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 class="text-lg font-semibold text-slate-800 mb-6">Dog Details</h2>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <dt class="text-sm text-slate-500">Gender</dt>
                <dd class="mt-0.5 text-slate-800 font-medium">{{ dog()!.gender ?? 'Not specified' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-slate-500">Spayed/Neutered</dt>
                <dd class="mt-0.5 text-slate-800 font-medium">
                  {{ dog()!.spayedNeutered === true ? 'Yes' : dog()!.spayedNeutered === false ? 'No' : 'Not specified' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-slate-500">Date of Birth</dt>
                <dd class="mt-0.5 text-slate-800 font-medium">{{ dog()!.dateOfBirth ? (dog()!.dateOfBirth | date:'mediumDate') : 'Not specified' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-slate-500">Weight</dt>
                <dd class="mt-0.5 text-slate-800 font-medium">{{ dog()!.weightLbs ? dog()!.weightLbs + ' lbs' : 'Not specified' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-slate-500">Microchip ID</dt>
                <dd class="mt-0.5 text-slate-800 font-medium font-mono">{{ dog()!.microchipId ?? 'Not specified' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-slate-500">Special Needs</dt>
                <dd class="mt-0.5 text-slate-800 font-medium">{{ dog()!.specialNeeds ?? 'None' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-slate-500">Veterinarian</dt>
                <dd class="mt-0.5 text-slate-800 font-medium">{{ dog()!.veterinarianName ?? 'Not specified' }}</dd>
              </div>
              <div>
                <dt class="text-sm text-slate-500">Vet Phone</dt>
                <dd class="mt-0.5 text-slate-800 font-medium">{{ dog()!.veterinarianPhone ?? 'Not specified' }}</dd>
              </div>
            </dl>
          </div>
        }

        <!-- Vaccinations Tab -->
        @if (activeTab() === 'vaccinations') {
          <div class="bg-white rounded-xl shadow-sm border border-slate-200">
            <div class="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 class="text-lg font-semibold text-slate-800">Vaccination Records</h2>
              <button class="px-4 py-2 bg-[#0D7377] hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">
                Add Vaccination
              </button>
            </div>

            @if (vaccinations().length === 0) {
              <div class="p-12 text-center">
                <p class="text-slate-500">No vaccination records yet.</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-slate-50 text-left">
                      <th class="px-6 py-3 font-medium text-slate-600">Vaccine</th>
                      <th class="px-6 py-3 font-medium text-slate-600">Date Administered</th>
                      <th class="px-6 py-3 font-medium text-slate-600">Expiration</th>
                      <th class="px-6 py-3 font-medium text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (vax of vaccinations(); track vax.id) {
                      <tr class="hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-800">{{ vax.vaccinationName }}</td>
                        <td class="px-6 py-4 text-slate-600">{{ vax.administeredDate | date:'mediumDate' }}</td>
                        <td class="px-6 py-4 text-slate-600">{{ vax.expirationDate ? (vax.expirationDate | date:'mediumDate') : 'N/A' }}</td>
                        <td class="px-6 py-4">
                          @switch (getVaxStatus(vax)) {
                            @case ('valid') {
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Valid</span>
                            }
                            @case ('expiring') {
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Expiring Soon</span>
                            }
                            @case ('expired') {
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Expired</span>
                            }
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class DogProfileComponent implements OnInit {
  private dogService = inject(DogService);

  id = input.required<string>();

  dog = signal<Dog | null>(null);
  vaccinations = signal<DogVaccination[]>([]);
  loading = signal(true);
  error = signal('');
  activeTab = signal<'overview' | 'vaccinations'>('overview');

  age = computed(() => {
    const dob = this.dog()?.dateOfBirth;
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    return years;
  });

  ngOnInit(): void {
    this.loadDog();
  }

  private loadDog(): void {
    this.loading.set(true);
    this.error.set('');
    this.dogService.getDog(this.id()).subscribe({
      next: (dog) => {
        this.dog.set(dog);
        this.loading.set(false);
        this.loadVaccinations();
      },
      error: (err) => {
        this.error.set('Failed to load dog profile. Please try again.');
        this.loading.set(false);
      },
    });
  }

  private loadVaccinations(): void {
    this.dogService.getVaccinations(this.id()).subscribe({
      next: (vax) => this.vaccinations.set(vax),
      error: () => {},
    });
  }

  getVaxStatus(vax: DogVaccination): 'valid' | 'expiring' | 'expired' {
    if (!vax.expirationDate) return 'valid';
    const exp = new Date(vax.expirationDate);
    const now = new Date();
    if (exp < now) return 'expired';
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    if (exp <= thirtyDays) return 'expiring';
    return 'valid';
  }
}
