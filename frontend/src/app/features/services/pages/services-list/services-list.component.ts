import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ServiceTypeService } from '../../../../core/services/service-type.service';
import { ServiceType, ServiceCategory } from '../../../../core/models';

interface CategoryTab {
  label: string;
  value: ServiceCategory | null;
}

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgClass],
  template: `
    <div class="bg-[#FAFBFC] min-h-screen">
      <!-- Header -->
      <section class="max-w-6xl mx-auto pt-16 pb-8 px-6">
        <h1 class="text-4xl font-bold text-slate-800">Our Training Services</h1>
        <p class="mt-4 text-lg text-slate-600 max-w-3xl">
          At PawForward Academy, every program is built on positive reinforcement and
          science-based methods. We tailor each session to your dog's unique personality
          and learning style so you both enjoy the journey.
        </p>
      </section>

      <!-- Category Filter Tabs -->
      <section class="max-w-6xl mx-auto px-6 pb-8">
        <div class="flex flex-wrap gap-2">
          @for (tab of tabs; track tab.label) {
            <button
              (click)="selectCategory(tab.value)"
              [ngClass]="{
                'bg-[#0D7377] text-white': activeCategory() === tab.value,
                'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200': activeCategory() !== tab.value
              }"
              class="px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer">
              {{ tab.label }}
            </button>
          }
        </div>
      </section>

      <!-- Loading Skeleton -->
      @if (loading()) {
        <section class="max-w-6xl mx-auto px-6 pb-16">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (i of [1,2,3,4]; track i) {
              <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse">
                <div class="flex items-center gap-3 mb-4">
                  <div class="h-6 w-48 bg-slate-200 rounded"></div>
                  <div class="h-5 w-20 bg-slate-200 rounded-full"></div>
                </div>
                <div class="space-y-2 mb-6">
                  <div class="h-4 w-full bg-slate-200 rounded"></div>
                  <div class="h-4 w-3/4 bg-slate-200 rounded"></div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="h-4 w-24 bg-slate-200 rounded"></div>
                  <div class="h-4 w-20 bg-slate-200 rounded"></div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Empty State -->
      @if (!loading() && filteredServices().length === 0) {
        <section class="max-w-6xl mx-auto px-6 pb-16 text-center py-20">
          <div class="text-slate-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-700 mb-2">No services found</h3>
          <p class="text-slate-500">There are no services in this category right now. Check back soon!</p>
        </section>
      }

      <!-- Services Grid -->
      @if (!loading() && filteredServices().length > 0) {
        <section class="max-w-6xl mx-auto px-6 pb-16">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (service of filteredServices(); track service.id) {
              <div class="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow p-6 flex flex-col">
                <!-- Header -->
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-xl font-semibold text-slate-800">{{ service.name }}</h3>
                  <span
                    [ngClass]="categoryBadgeClass(service.category)"
                    class="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-3">
                    {{ categoryLabel(service.category) }}
                  </span>
                </div>

                <!-- Description -->
                <p class="text-slate-600 text-sm leading-relaxed mb-5 flex-1">
                  {{ truncate(service.description, 150) }}
                </p>

                <!-- Footer -->
                <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div class="flex items-center gap-4 text-sm text-slate-500">
                    @if (service.durationMinutes) {
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ service.durationMinutes }} min
                      </span>
                    }
                    <span class="font-semibold text-slate-800">
                      {{ service.price | currency }}
                    </span>
                  </div>
                  <a
                    [routerLink]="['/services', service.id]"
                    class="inline-flex items-center gap-1 text-sm font-medium text-[#0D7377] hover:text-[#0a5c5f] transition-colors">
                    View Details
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class ServicesListComponent implements OnInit {
  private serviceTypeService: ServiceTypeService;

  tabs: CategoryTab[] = [
    { label: 'All', value: null },
    { label: 'Private Sessions', value: ServiceCategory.PRIVATE },
    { label: 'Group Classes', value: ServiceCategory.GROUP_CLASS },
    { label: 'Board & Train', value: ServiceCategory.BOARD_AND_TRAIN },
  ];

  activeCategory = signal<ServiceCategory | null>(null);
  allServices = signal<ServiceType[]>([]);
  loading = signal(true);

  filteredServices = computed(() => {
    const category = this.activeCategory();
    const services = this.allServices();
    if (!category) return services;
    return services.filter((s) => s.category === category);
  });

  constructor(serviceTypeService: ServiceTypeService) {
    this.serviceTypeService = serviceTypeService;
  }

  ngOnInit(): void {
    this.loadServices();
  }

  selectCategory(category: ServiceCategory | null): void {
    this.activeCategory.set(category);
  }

  categoryLabel(category: ServiceCategory): string {
    switch (category) {
      case ServiceCategory.PRIVATE:
        return 'Private';
      case ServiceCategory.GROUP_CLASS:
        return 'Group Class';
      case ServiceCategory.BOARD_AND_TRAIN:
        return 'Board & Train';
      default:
        return category;
    }
  }

  categoryBadgeClass(category: ServiceCategory): string {
    switch (category) {
      case ServiceCategory.PRIVATE:
        return 'bg-[#0D7377]/10 text-[#0D7377]';
      case ServiceCategory.GROUP_CLASS:
        return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      case ServiceCategory.BOARD_AND_TRAIN:
        return 'bg-[#F87171]/10 text-[#F87171]';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  truncate(text: string | undefined, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  private loadServices(): void {
    this.loading.set(true);
    this.serviceTypeService.getServices().subscribe({
      next: (services) => {
        this.allServices.set(services);
        this.loading.set(false);
      },
      error: () => {
        this.allServices.set([]);
        this.loading.set(false);
      },
    });
  }
}
