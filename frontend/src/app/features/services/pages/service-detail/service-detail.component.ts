import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceTypeService } from '../../../../core/services/service-type.service';
import { ServiceType, ServiceCategory } from '../../../../core/models';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <!-- Loading State -->
    @if (loading()) {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-[#0D7377]"></div>
          <p class="mt-4 text-slate-500 text-lg">Loading service details...</p>
        </div>
      </div>
    }

    <!-- Error State -->
    @if (error()) {
      <div class="max-w-4xl mx-auto py-16 px-6">
        <div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-[#F87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 class="mt-4 text-xl font-semibold text-slate-800">Unable to load service</h2>
          <p class="mt-2 text-slate-600">{{ error() }}</p>
          <a routerLink="/services" class="mt-6 inline-block rounded-lg bg-[#0D7377] px-6 py-2.5 text-white font-medium hover:bg-teal-800 transition">
            Back to Services
          </a>
        </div>
      </div>
    }

    <!-- Service Detail -->
    @if (service()) {
      <!-- Breadcrumb -->
      <div class="bg-slate-50 border-b border-slate-200">
        <nav class="max-w-6xl mx-auto px-6 py-3">
          <ol class="flex items-center gap-2 text-sm text-slate-500">
            <li><a routerLink="/" class="hover:text-[#0D7377] transition">Home</a></li>
            <li><span class="text-slate-300">/</span></li>
            <li><a routerLink="/services" class="hover:text-[#0D7377] transition">Services</a></li>
            <li><span class="text-slate-300">/</span></li>
            <li class="text-[#0D7377] font-medium">{{ service()!.name }}</li>
          </ol>
        </nav>
      </div>

      <!-- Hero Area -->
      <div class="bg-gradient-to-br from-[#0D7377] to-teal-800 text-white">
        <div class="max-w-6xl mx-auto px-6 py-16">
          <span class="inline-block rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
            [ngClass]="categoryBadgeClass(service()!.category)">
            {{ categoryLabel(service()!.category) }}
          </span>
          <h1 class="text-4xl md:text-5xl font-bold">{{ service()!.name }}</h1>
          @if (service()!.description) {
            <p class="mt-4 text-lg text-teal-100 max-w-3xl leading-relaxed">{{ service()!.description }}</p>
          }
          <div class="mt-6 flex flex-wrap items-center gap-6 text-teal-100">
            @if (service()!.durationMinutes) {
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ service()!.durationMinutes }} minutes</span>
              </div>
            }
            @if (service()!.maxParticipants) {
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Up to {{ service()!.maxParticipants }} participants</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Two-Column Content -->
      <div class="max-w-6xl mx-auto px-6 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">

          <!-- Left Column (wider) -->
          <div class="lg:col-span-2 space-y-10">
            <!-- Full Description -->
            @if (service()!.description) {
              <section>
                <h2 class="text-2xl font-bold text-slate-800 mb-4">About This Service</h2>
                <p class="text-slate-600 leading-relaxed text-lg">{{ service()!.description }}</p>
              </section>
            }

            <!-- What to Expect -->
            <section>
              <h2 class="text-2xl font-bold text-slate-800 mb-4">What to Expect</h2>
              <div class="bg-slate-50 rounded-xl p-6 space-y-4">
                @for (item of whatToExpect(); track item) {
                  <div class="flex items-start gap-3">
                    <div class="mt-1 flex-shrink-0 h-6 w-6 rounded-full bg-[#10B981] flex items-center justify-center">
                      <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-slate-700">{{ item }}</p>
                  </div>
                }
              </div>
            </section>

            <!-- What to Bring -->
            <section>
              <h2 class="text-2xl font-bold text-slate-800 mb-4">What to Bring</h2>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @for (item of whatToBring(); track item) {
                  <li class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-4">
                    <svg class="h-5 w-5 text-[#F59E0B] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span class="text-slate-700">{{ item }}</span>
                  </li>
                }
              </ul>
            </section>
          </div>

          <!-- Right Sidebar -->
          <div class="lg:col-span-1">
            <div class="sticky top-8 space-y-6">
              <!-- Pricing Card -->
              <div class="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <p class="text-sm text-slate-500 font-medium">Starting at</p>
                  <p class="text-4xl font-bold text-[#0D7377]">{{ service()!.price | currency }}</p>
                  @if (service()!.durationMinutes) {
                    <p class="text-sm text-slate-500 mt-1">per {{ service()!.durationMinutes }}-minute session</p>
                  }
                </div>
                <div class="p-6 space-y-4">
                  @if (service()!.durationMinutes) {
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-slate-500">Duration</span>
                      <span class="font-medium text-slate-800">{{ service()!.durationMinutes }} min</span>
                    </div>
                  }
                  @if (service()!.maxParticipants) {
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-slate-500">Max Participants</span>
                      <span class="font-medium text-slate-800">{{ service()!.maxParticipants }}</span>
                    </div>
                  }
                  @if (service()!.depositAmount) {
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-slate-500">Deposit Required</span>
                      <span class="font-medium text-[#F59E0B]">{{ service()!.depositAmount | currency }}</span>
                    </div>
                  }
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-500">Category</span>
                    <span class="font-medium text-slate-800">{{ categoryLabel(service()!.category) }}</span>
                  </div>
                  <hr class="border-slate-100" />
                  <a routerLink="/book"
                    class="block w-full text-center rounded-lg bg-[#F59E0B] px-6 py-3.5 text-white font-semibold text-lg hover:bg-amber-600 transition shadow-md hover:shadow-lg">
                    Book Now
                  </a>
                  <p class="text-xs text-slate-400 text-center">No commitment required. Free cancellation up to 24h before.</p>
                </div>
              </div>

              <!-- Max Participants Card (for group classes) -->
              @if (service()!.category === ServiceCategory.GROUP_CLASS && service()!.maxParticipants) {
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div class="flex items-center gap-3">
                    <svg class="h-8 w-8 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p class="font-semibold text-slate-800">Group Class</p>
                      <p class="text-sm text-slate-600">Limited to {{ service()!.maxParticipants }} participants per session for personalized attention.</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="bg-gradient-to-r from-[#0D7377] to-teal-700">
        <div class="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 class="text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p class="mt-4 text-teal-100 text-lg max-w-2xl mx-auto">
            Give your dog the training they deserve. Book a session today and see the difference professional training makes.
          </p>
          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a routerLink="/book"
              class="rounded-lg bg-[#F59E0B] px-8 py-3.5 text-white font-semibold text-lg hover:bg-amber-600 transition shadow-lg hover:shadow-xl">
              Book a Session
            </a>
            <a routerLink="/services"
              class="rounded-lg bg-white/10 border border-white/30 px-8 py-3.5 text-white font-semibold text-lg hover:bg-white/20 transition">
              View All Services
            </a>
          </div>
        </div>
      </div>
    }
  `,
})
export class ServiceDetailComponent implements OnInit {
  readonly ServiceCategory = ServiceCategory;

  id = input<string>('');

  private serviceTypeService = inject(ServiceTypeService);

  service = signal<ServiceType | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  whatToExpect = signal<string[]>([]);
  whatToBring = signal<string[]>([]);

  ngOnInit(): void {
    const serviceId = this.id();
    if (!serviceId) {
      this.error.set('Service not found.');
      this.loading.set(false);
      return;
    }

    this.serviceTypeService.getService(serviceId).subscribe({
      next: (service) => {
        this.service.set(service);
        this.whatToExpect.set(this.getWhatToExpect(service));
        this.whatToBring.set(this.getWhatToBring(service));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load this service. It may no longer be available.');
        this.loading.set(false);
      },
    });
  }

  categoryLabel(category: ServiceCategory): string {
    const labels: Record<ServiceCategory, string> = {
      [ServiceCategory.PRIVATE]: 'Private Training',
      [ServiceCategory.GROUP_CLASS]: 'Group Class',
      [ServiceCategory.BOARD_AND_TRAIN]: 'Board & Train',
    };
    return labels[category] ?? category;
  }

  categoryBadgeClass(category: ServiceCategory): string {
    const classes: Record<ServiceCategory, string> = {
      [ServiceCategory.PRIVATE]: 'bg-teal-600/30 text-teal-100 border border-teal-400/30',
      [ServiceCategory.GROUP_CLASS]: 'bg-amber-500/30 text-amber-100 border border-amber-400/30',
      [ServiceCategory.BOARD_AND_TRAIN]: 'bg-purple-500/30 text-purple-100 border border-purple-400/30',
    };
    return classes[category] ?? 'bg-slate-500/30 text-slate-100';
  }

  private getWhatToExpect(service: ServiceType): string[] {
    const base = [
      'A professional assessment of your dog\'s current training level',
      'Customized training exercises tailored to your dog\'s needs',
      'Take-home tips and techniques to continue practice between sessions',
    ];

    if (service.category === ServiceCategory.PRIVATE) {
      return [
        'One-on-one attention from a certified trainer',
        ...base,
        'Progress tracking and follow-up plan',
      ];
    }
    if (service.category === ServiceCategory.GROUP_CLASS) {
      return [
        'Structured class with socialization opportunities',
        ...base,
        'Interaction with other dogs in a controlled environment',
      ];
    }
    return [
      'Full immersion training experience',
      'Daily structured training sessions with certified trainers',
      'Regular progress updates and photos',
      'Comprehensive graduation report with continued training plan',
    ];
  }

  private getWhatToBring(service: ServiceType): string[] {
    const base = [
      'Your dog on a secure leash and collar',
      'High-value training treats',
      'Water bowl and fresh water',
      'Vaccination records (first visit)',
    ];

    if (service.category === ServiceCategory.BOARD_AND_TRAIN) {
      return [
        ...base,
        'Your dog\'s regular food (enough for the stay)',
        'Favorite toy or comfort item',
        'Crate or bed if preferred',
        'Any medications with instructions',
      ];
    }
    return [...base, 'A positive attitude and patience'];
  }
}
