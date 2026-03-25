import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReviewService } from '../../../../core/services/review.service';
import { TrainerService } from '../../../../core/services/trainer.service';
import { ServiceTypeService } from '../../../../core/services/service-type.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Review, ReviewRequest, TrainerProfile, ServiceType } from '../../../../core/models';

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="max-w-6xl mx-auto py-16 px-6">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-slate-800">Client Reviews</h1>
        <p class="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
          See what our clients and their dogs have to say about their training experience at PawForward Academy.
        </p>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="text-center">
            <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-[#0D7377]"></div>
            <p class="mt-4 text-slate-500">Loading reviews...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
          <p class="text-red-700">{{ error() }}</p>
          <button (click)="loadReviews()" class="mt-3 text-sm font-semibold text-[#0D7377] hover:underline">Try again</button>
        </div>
      }

      @if (!loading() && !error()) {
        <!-- Overall Stats -->
        @if (reviews().length > 0) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <!-- Left: Average Rating -->
              <div class="text-center md:text-left">
                <div class="flex items-baseline justify-center md:justify-start gap-2">
                  <span class="text-6xl font-bold text-slate-800">{{ averageRating() }}</span>
                  <div class="flex items-center gap-0.5">
                    @for (i of [1, 2, 3, 4, 5]; track i) {
                      <svg class="w-6 h-6 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    }
                  </div>
                </div>
                <p class="text-slate-500 mt-2">Based on {{ reviews().length }} reviews</p>
              </div>

              <!-- Right: Rating Distribution -->
              <div class="space-y-2">
                @for (dist of ratingDistribution(); track dist.stars) {
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-medium text-slate-600 w-8">{{ dist.stars }}&#9733;</span>
                    <div class="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                        [style.width.%]="dist.percentage">
                      </div>
                    </div>
                    <span class="text-sm text-slate-400 w-10 text-right">{{ dist.percentage }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Write a Review button + Filter / Sort Row -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div class="flex flex-wrap gap-2">
            @for (filter of ratingFilters; track filter.label) {
              <button
                (click)="activeFilter.set(filter.value)"
                [ngClass]="{
                  'bg-[#0D7377] text-white': activeFilter() === filter.value,
                  'bg-white text-slate-600 border border-slate-200 hover:border-slate-300': activeFilter() !== filter.value
                }"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {{ filter.label }}
              </button>
            }
          </div>

          <div class="flex items-center gap-3">
            @if (isAuthenticated()) {
              <button
                (click)="showReviewForm.set(!showReviewForm())"
                class="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F59E0B] text-white hover:bg-amber-600 transition">
                {{ showReviewForm() ? 'Cancel' : 'Write a Review' }}
              </button>
            }
            <select
              (change)="onSortChange($event)"
              class="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377]">
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        </div>

        <!-- Review Submission Form -->
        @if (showReviewForm()) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <h2 class="text-xl font-bold text-slate-800 mb-4">Write a Review</h2>

            @if (submitSuccess()) {
              <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <p class="text-emerald-700 font-medium">Your review has been submitted for approval. Thank you!</p>
              </div>
            } @else {
              <form (submit)="onSubmitReview($event)" class="space-y-4">
                <!-- Rating -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Rating *</label>
                  <div class="flex items-center gap-1">
                    @for (i of [1, 2, 3, 4, 5]; track i) {
                      <button
                        type="button"
                        (click)="formRating.set(i)"
                        class="focus:outline-none">
                        <svg
                          class="w-8 h-8 cursor-pointer transition-colors"
                          [ngClass]="i <= formRating() ? 'text-[#F59E0B]' : 'text-slate-200 hover:text-[#F59E0B]/50'"
                          fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    }
                  </div>
                </div>

                <!-- Title -->
                <div>
                  <label for="reviewTitle" class="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    id="reviewTitle"
                    type="text"
                    [value]="formTitle()"
                    (input)="formTitle.set(asInput($event).value)"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/40 focus:border-[#0D7377] transition"
                    placeholder="Summarize your experience" />
                </div>

                <!-- Body -->
                <div>
                  <label for="reviewBody" class="block text-sm font-medium text-slate-700 mb-1">Your Review</label>
                  <textarea
                    id="reviewBody"
                    rows="4"
                    [value]="formBody()"
                    (input)="formBody.set(asTextarea($event).value)"
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/40 focus:border-[#0D7377] transition resize-y"
                    placeholder="Tell us about your experience..."></textarea>
                </div>

                <!-- Trainer selector -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label for="reviewTrainer" class="block text-sm font-medium text-slate-700 mb-1">Trainer <span class="text-slate-400">(optional)</span></label>
                    <select
                      id="reviewTrainer"
                      [value]="formTrainerId()"
                      (change)="formTrainerId.set(asSelect($event).value)"
                      class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/40 focus:border-[#0D7377] transition bg-white">
                      <option value="">Select a trainer</option>
                      @for (trainer of trainers(); track trainer.id) {
                        <option [value]="trainer.id">{{ trainer.name }}</option>
                      }
                    </select>
                  </div>

                  <div>
                    <label for="reviewService" class="block text-sm font-medium text-slate-700 mb-1">Service <span class="text-slate-400">(optional)</span></label>
                    <select
                      id="reviewService"
                      [value]="formServiceTypeId()"
                      (change)="formServiceTypeId.set(asSelect($event).value)"
                      class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/40 focus:border-[#0D7377] transition bg-white">
                      <option value="">Select a service</option>
                      @for (serviceType of serviceTypes(); track serviceType.id) {
                        <option [value]="serviceType.id">{{ serviceType.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                @if (submitError()) {
                  <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p class="text-red-700 text-sm">{{ submitError() }}</p>
                  </div>
                }

                <!-- Submit -->
                <button
                  type="submit"
                  [disabled]="formRating() === 0 || submitting()"
                  [ngClass]="{
                    'bg-[#0D7377] hover:bg-teal-800 cursor-pointer': formRating() > 0 && !submitting(),
                    'bg-slate-300 cursor-not-allowed': formRating() === 0 || submitting()
                  }"
                  class="px-6 py-2.5 rounded-lg text-white font-semibold transition">
                  {{ submitting() ? 'Submitting...' : 'Submit Review' }}
                </button>
              </form>
            }
          </div>
        }

        <!-- Review Cards -->
        @if (filteredReviews().length === 0 && reviews().length > 0) {
          <div class="text-center py-16">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
              <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-slate-800 mb-2">No reviews found</h2>
            <p class="text-slate-500">No reviews match the selected filter.</p>
          </div>
        } @else if (reviews().length === 0) {
          <div class="text-center py-16">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
              <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-slate-800 mb-2">No reviews yet</h2>
            <p class="text-slate-500">Be the first to share your experience!</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (review of filteredReviews(); track review.id) {
              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow relative">
                <!-- Featured Badge -->
                @if (review.isFeatured) {
                  <span class="absolute top-4 right-4 px-2.5 py-1 text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B] rounded-full">
                    Featured
                  </span>
                }

                <!-- Stars -->
                <div class="flex items-center gap-0.5 mb-3">
                  @for (i of [1, 2, 3, 4, 5]; track i) {
                    <svg
                      class="w-5 h-5"
                      [ngClass]="i <= review.rating ? 'text-[#F59E0B]' : 'text-slate-200'"
                      fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  }
                </div>

                <!-- Title -->
                @if (review.title) {
                  <h3 class="text-lg font-semibold text-slate-800 mb-2">{{ review.title }}</h3>
                }

                <!-- Body -->
                @if (review.body) {
                  <p class="text-slate-600 text-sm leading-relaxed mb-4">{{ review.body }}</p>
                }

                <!-- Reviewer Info -->
                <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p class="text-sm font-medium text-slate-700">{{ review.clientName ?? 'Anonymous' }}</p>
                    @if (review.trainerName || review.serviceName) {
                      <p class="text-xs text-slate-400">
                        @if (review.trainerName) { Trainer: {{ review.trainerName }} }
                        @if (review.trainerName && review.serviceName) { &middot; }
                        @if (review.serviceName) { {{ review.serviceName }} }
                      </p>
                    }
                  </div>
                  <span class="text-xs text-slate-400">{{ formatDate(review.createdAt) }}</span>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class ReviewsPageComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private trainerService = inject(TrainerService);
  private serviceTypeService = inject(ServiceTypeService);
  private authService = inject(AuthService);

  reviews = signal<Review[]>([]);
  trainers = signal<TrainerProfile[]>([]);
  serviceTypes = signal<ServiceType[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  isAuthenticated = this.authService.isAuthenticated;

  // Review form state
  showReviewForm = signal(false);
  formRating = signal(0);
  formTitle = signal('');
  formBody = signal('');
  formTrainerId = signal('');
  formServiceTypeId = signal('');
  submitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);

  // Filter/sort
  readonly ratingFilters = [
    { label: 'All', value: 0 },
    { label: '5\u2605', value: 5 },
    { label: '4\u2605', value: 4 },
    { label: '3\u2605', value: 3 },
  ];

  activeFilter = signal(0);
  sortOrder = signal<'newest' | 'highest' | 'lowest'>('newest');

  averageRating = computed(() => {
    const r = this.reviews();
    if (r.length === 0) return '0.0';
    return (r.reduce((sum, rev) => sum + rev.rating, 0) / r.length).toFixed(1);
  });

  ratingDistribution = computed(() => {
    const r = this.reviews();
    if (r.length === 0) return [5, 4, 3, 2, 1].map(stars => ({ stars, count: 0, percentage: 0 }));
    return [5, 4, 3, 2, 1].map(stars => {
      const count = r.filter(rev => rev.rating === stars).length;
      return { stars, count, percentage: Math.round((count / r.length) * 100) };
    });
  });

  filteredReviews = computed(() => {
    let result = [...this.reviews()];

    const filter = this.activeFilter();
    if (filter > 0) {
      result = result.filter(r => r.rating === filter);
    }

    const sort = this.sortOrder();
    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  });

  ngOnInit(): void {
    this.loadReviews();
    this.loadFormData();
  }

  loadReviews(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reviewService.getApprovedReviews().subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load reviews. Please try again.');
        this.loading.set(false);
      },
    });
  }

  private loadFormData(): void {
    this.trainerService.getTrainers().subscribe({
      next: (trainers) => this.trainers.set(trainers),
      error: () => {},
    });
    this.serviceTypeService.getServices().subscribe({
      next: (types) => this.serviceTypes.set(types),
      error: () => {},
    });
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'newest' | 'highest' | 'lowest';
    this.sortOrder.set(value);
  }

  onSubmitReview(event: Event): void {
    event.preventDefault();
    if (this.formRating() === 0 || this.submitting()) return;

    this.submitting.set(true);
    this.submitError.set(null);

    const request: ReviewRequest = {
      rating: this.formRating(),
      title: this.formTitle().trim() || undefined,
      body: this.formBody().trim() || undefined,
      trainerId: this.formTrainerId() || undefined,
      serviceTypeId: this.formServiceTypeId() || undefined,
    };

    this.reviewService.submitReview(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitSuccess.set(true);
        this.formRating.set(0);
        this.formTitle.set('');
        this.formBody.set('');
        this.formTrainerId.set('');
        this.formServiceTypeId.set('');
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set('Failed to submit your review. Please try again.');
      },
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  asInput(event: Event): HTMLInputElement {
    return event.target as HTMLInputElement;
  }

  asTextarea(event: Event): HTMLTextAreaElement {
    return event.target as HTMLTextAreaElement;
  }

  asSelect(event: Event): HTMLSelectElement {
    return event.target as HTMLSelectElement;
  }
}
