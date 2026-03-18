import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DogService } from '../../../../core/services/dog.service';
import { Dog } from '../../../../core/models';

@Component({
  selector: 'app-my-dogs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-slate-800">My Dogs</h1>
        <a routerLink="/dashboard/dogs/new"
           class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition shadow-sm">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Dog
        </a>
      </div>

      <!-- Loading Skeleton -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1, 2, 3]; track i) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
              <div class="flex items-center gap-4 mb-4">
                <div class="h-16 w-16 bg-slate-200 rounded-full"></div>
                <div class="flex-1">
                  <div class="h-5 bg-slate-200 rounded w-24 mb-2"></div>
                  <div class="h-3 bg-slate-200 rounded w-32"></div>
                </div>
              </div>
              <div class="space-y-2">
                <div class="h-3 bg-slate-200 rounded w-20"></div>
                <div class="h-3 bg-slate-200 rounded w-28"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @else if (dogs().length === 0) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div class="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-800 mb-2">No dogs yet</h3>
          <p class="text-slate-500 mb-6">Add your first dog to get started!</p>
          <a routerLink="/dashboard/dogs/new"
             class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition shadow-sm">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Your First Dog
          </a>
        </div>
      }

      <!-- Dog Cards Grid -->
      @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (dog of dogs(); track dog.id) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
              <!-- Dog Avatar & Name -->
              <div class="flex items-center gap-4 mb-5">
                @if (dog.profilePhotoUrl) {
                  <img [src]="dog.profilePhotoUrl" [alt]="dog.name"
                       class="h-16 w-16 rounded-full object-cover border-2 border-slate-100">
                } @else {
                  <div class="h-16 w-16 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center">
                    <svg class="h-8 w-8 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                    </svg>
                  </div>
                }
                <div>
                  <h3 class="text-lg font-semibold text-slate-800">{{ dog.name }}</h3>
                  <p class="text-sm text-slate-500">{{ dog.breed ?? 'Breed not specified' }}</p>
                </div>
              </div>

              <!-- Dog Details -->
              <div class="space-y-2 mb-5">
                @if (dog.dateOfBirth) {
                  <div class="flex items-center gap-2 text-sm text-slate-600">
                    <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
                    </svg>
                    Age: {{ calculateAge(dog.dateOfBirth) }}
                  </div>
                }
                @if (dog.weightLbs) {
                  <div class="flex items-center gap-2 text-sm text-slate-600">
                    <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                    </svg>
                    Weight: {{ dog.weightLbs }} lbs
                  </div>
                }
                @if (dog.gender) {
                  <div class="flex items-center gap-2 text-sm text-slate-600">
                    <svg class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                    {{ dog.gender }}
                  </div>
                }
              </div>

              <!-- View Profile Link -->
              <a [routerLink]="['/dashboard/dogs', dog.id]"
                 class="inline-flex items-center gap-1 text-sm font-medium text-[#0D7377] hover:text-teal-800 transition">
                View Profile
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </a>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MyDogsComponent implements OnInit {
  private dogService = inject(DogService);

  dogs = signal<Dog[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.dogService.getMyDogs().subscribe({
      next: (dogs) => this.dogs.set(dogs),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  calculateAge(dateOfBirth: string): string {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years > 0) {
      return years === 1 ? '1 year' : `${years} years`;
    }
    return months <= 1 ? '< 1 month' : `${months} months`;
  }
}
