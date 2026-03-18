import { Component, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';

interface SampleReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  clientName: string;
  dogName: string;
  dogBreed: string;
  date: string;
  isFeatured: boolean;
}

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

      <!-- Overall Stats -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <!-- Left: Average Rating -->
          <div class="text-center md:text-left">
            <div class="flex items-baseline justify-center md:justify-start gap-2">
              <span class="text-6xl font-bold text-slate-800">{{ averageRating }}</span>
              <div class="flex items-center gap-0.5">
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <svg class="w-6 h-6 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                }
              </div>
            </div>
            <p class="text-slate-500 mt-2">Based on {{ reviews.length }} reviews</p>
          </div>

          <!-- Right: Rating Distribution -->
          <div class="space-y-2">
            @for (dist of ratingDistribution; track dist.stars) {
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

      <!-- Filter / Sort Row -->
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

        <select
          (change)="onSortChange($event)"
          class="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D7377]/20 focus:border-[#0D7377]">
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      <!-- Review Cards -->
      @if (filteredReviews().length === 0) {
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
              <h3 class="text-lg font-semibold text-slate-800 mb-2">{{ review.title }}</h3>

              <!-- Body -->
              <p class="text-slate-600 text-sm leading-relaxed mb-4">{{ review.body }}</p>

              <!-- Reviewer Info -->
              <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p class="text-sm font-medium text-slate-700">{{ review.clientName }}</p>
                  <p class="text-xs text-slate-400">{{ review.dogName }} &middot; {{ review.dogBreed }}</p>
                </div>
                <span class="text-xs text-slate-400">{{ formatDate(review.date) }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ReviewsPageComponent {
  readonly reviews: SampleReview[] = [
    {
      id: '1',
      rating: 5,
      title: 'Transformed our reactive dog',
      body: 'After just 6 sessions, our German Shepherd went from lunging at other dogs to calmly walking past them. The positive reinforcement techniques were incredible and we learned so much about reading body language.',
      clientName: 'Sarah Mitchell',
      dogName: 'Rex',
      dogBreed: 'German Shepherd',
      date: '2026-03-10',
      isFeatured: true,
    },
    {
      id: '2',
      rating: 5,
      title: 'Best puppy class in the area',
      body: 'Our Golden Retriever puppy loved every minute of the group classes. The socialization exercises were well-structured and the trainer was patient with every single pup. Highly recommend for new puppy parents!',
      clientName: 'James Rodriguez',
      dogName: 'Biscuit',
      dogBreed: 'Golden Retriever',
      date: '2026-03-05',
      isFeatured: false,
    },
    {
      id: '3',
      rating: 5,
      title: 'Finally, a recall we can trust',
      body: 'We struggled for months with off-leash recall. The structured training plan gave us clear steps and within a few weeks, our Beagle was coming back every single time. Life-changing for our park visits.',
      clientName: 'Emily Chen',
      dogName: 'Mochi',
      dogBreed: 'Beagle',
      date: '2026-02-28',
      isFeatured: true,
    },
    {
      id: '4',
      rating: 4,
      title: 'Great approach to separation anxiety',
      body: 'Our rescue Labrador had severe separation anxiety. The trainer created a custom desensitization plan that we could follow at home. Progress was gradual but steady, and we finally see improvement.',
      clientName: 'Michael Torres',
      dogName: 'Luna',
      dogBreed: 'Labrador Mix',
      date: '2026-02-20',
      isFeatured: false,
    },
    {
      id: '5',
      rating: 5,
      title: 'Exceeded every expectation',
      body: 'Signed up for the advanced obedience package and it was worth every penny. Our Border Collie now performs off-leash heel, distance commands, and even some agility basics. The trainers genuinely care.',
      clientName: 'Amanda Brooks',
      dogName: 'Scout',
      dogBreed: 'Border Collie',
      date: '2026-02-15',
      isFeatured: false,
    },
    {
      id: '6',
      rating: 3,
      title: 'Good foundation but wanted more follow-up',
      body: 'The in-person sessions were solid and the techniques work. I would have appreciated more follow-up resources or check-in calls between sessions to make sure we were practicing correctly at home.',
      clientName: 'David Park',
      dogName: 'Pepper',
      dogBreed: 'French Bulldog',
      date: '2026-01-30',
      isFeatured: false,
    },
  ];

  readonly averageRating = (
    this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length
  ).toFixed(1);

  readonly ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = this.reviews.filter((r) => r.rating === stars).length;
    return {
      stars,
      count,
      percentage: Math.round((count / this.reviews.length) * 100),
    };
  });

  readonly ratingFilters = [
    { label: 'All', value: 0 },
    { label: '5\u2605', value: 5 },
    { label: '4\u2605', value: 4 },
    { label: '3\u2605', value: 3 },
  ];

  activeFilter = signal(0);
  sortOrder = signal<'newest' | 'highest' | 'lowest'>('newest');

  filteredReviews = computed(() => {
    let result = [...this.reviews];

    const filter = this.activeFilter();
    if (filter > 0) {
      result = result.filter((r) => r.rating === filter);
    }

    const sort = this.sortOrder();
    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sort === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  });

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'newest' | 'highest' | 'lowest';
    this.sortOrder.set(value);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
