import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-manage-reviews',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <h1 class="text-3xl font-bold text-slate-800">Manage Reviews</h1>
      <p class="text-slate-500 mt-1">Moderate and manage customer reviews</p>

      <!-- Tabs -->
      <div class="flex gap-1 mt-6 border-b border-slate-200">
        @for (tab of tabs; track tab) {
          <button (click)="activeTab.set(tab)"
                  class="px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
                  [class]="activeTab() === tab
                    ? 'border-[#0D7377] text-[#0D7377]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'">
            {{ tab }}
            @if (tab === 'Pending Approval') {
              <span class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold bg-[#F87171] text-white">{{ pendingReviews().length }}</span>
            }
          </button>
        }
      </div>

      <!-- Pending Approval Tab -->
      @if (activeTab() === 'Pending Approval') {
        <div class="mt-6 space-y-4">
          @for (review of pendingReviews(); track review.reviewer) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="flex gap-0.5">
                      @for (star of starsArray(review.rating); track $index) {
                        <span class="text-[#F59E0B] text-sm">&#9733;</span>
                      }
                      @for (star of starsArray(5 - review.rating); track $index) {
                        <span class="text-slate-300 text-sm">&#9733;</span>
                      }
                    </div>
                    <span class="text-xs text-slate-400">{{ review.date }}</span>
                  </div>
                  <p class="text-slate-700 text-sm italic">"{{ review.text }}"</p>
                  <p class="text-xs text-slate-500 mt-2">- {{ review.reviewer }} &middot; {{ review.service }}</p>
                </div>
                <div class="flex gap-2 ml-4 flex-shrink-0">
                  <button class="px-3 py-1.5 bg-[#10B981] text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                    Approve
                  </button>
                  <button class="px-3 py-1.5 bg-[#F87171] text-white text-xs font-medium rounded-lg hover:bg-red-500 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- All Reviews Tab -->
      @if (activeTab() === 'All Reviews') {
        <div class="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Rating</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Reviewer</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Service</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Date</th>
                  <th class="text-center px-6 py-3 font-semibold text-slate-600">Featured</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (review of allReviews(); track review.reviewer) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex gap-0.5">
                        @for (star of starsArray(review.rating); track $index) {
                          <span class="text-[#F59E0B] text-xs">&#9733;</span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 font-medium text-slate-800">{{ review.reviewer }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ review.service }}</td>
                    <td class="px-6 py-4 text-slate-500">{{ review.date }}</td>
                    <td class="px-6 py-4 text-center">
                      <button (click)="toggleFeatured(review)"
                              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                              [class]="review.featured ? 'bg-[#F59E0B]' : 'bg-slate-300'">
                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                              [class]="review.featured ? 'translate-x-6' : 'translate-x-1'"></span>
                      </button>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [class]="review.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                        {{ review.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class ManageReviewsComponent {
  tabs = ['Pending Approval', 'All Reviews'];
  activeTab = signal('Pending Approval');

  pendingReviews = signal([
    { rating: 5, text: 'Amazing experience! Buddy learned so much in just a few sessions. Dr. Chen is incredibly patient and knowledgeable.', reviewer: 'Sarah Mitchell', service: 'Private Training', date: 'Mar 16, 2026' },
    { rating: 4, text: 'Great group class. Rex loved it and we saw real improvement in his behavior around other dogs.', reviewer: 'James Kelly', service: 'Group Obedience', date: 'Mar 15, 2026' },
    { rating: 5, text: 'The puppy socialization class was exactly what Coco needed. Highly recommend!', reviewer: 'Lisa Park', service: 'Puppy Socialization', date: 'Mar 14, 2026' },
  ]);

  allReviews = signal([
    { rating: 5, reviewer: 'Sarah Mitchell', service: 'Private Training', date: 'Mar 16, 2026', featured: true, status: 'Approved' },
    { rating: 4, reviewer: 'James Kelly', service: 'Group Obedience', date: 'Mar 15, 2026', featured: false, status: 'Approved' },
    { rating: 5, reviewer: 'Lisa Park', service: 'Puppy Socialization', date: 'Mar 14, 2026', featured: false, status: 'Pending' },
    { rating: 3, reviewer: 'Tom Watson', service: 'Private Training', date: 'Mar 10, 2026', featured: false, status: 'Approved' },
    { rating: 5, reviewer: 'Anna Lopez', service: 'Board & Train', date: 'Mar 8, 2026', featured: true, status: 'Approved' },
  ]);

  starsArray(count: number): number[] {
    return Array(count).fill(0);
  }

  toggleFeatured(review: any) {
    this.allReviews.update(list =>
      list.map(r => r.reviewer === review.reviewer ? { ...r, featured: !r.featured } : r)
    );
  }
}
