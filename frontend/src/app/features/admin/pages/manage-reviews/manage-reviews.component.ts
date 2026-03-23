import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { ReviewAdmin } from '../../../../core/models';

@Component({
  selector: 'app-manage-reviews',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <h1 class="text-3xl font-bold text-slate-800">Manage Reviews</h1>
      <p class="text-slate-500 mt-1">Moderate and manage customer reviews</p>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D7377]"></div>
        </div>
      } @else if (error()) {
        <div class="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-600 font-medium">Failed to load reviews</p>
          <p class="text-red-400 text-sm mt-1">{{ error() }}</p>
          <button (click)="loadReviews()" class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      } @else {
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
          @if (pendingReviews().length === 0) {
            <div class="mt-16 text-center">
              <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl text-slate-400">&#10003;</span>
              </div>
              <h3 class="text-lg font-semibold text-slate-700">All caught up!</h3>
              <p class="text-sm text-slate-400 mt-1">No reviews pending approval</p>
            </div>
          } @else {
            <div class="mt-6 space-y-4">
              @for (review of pendingReviews(); track review.id) {
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
                        <span class="text-xs text-slate-400">{{ review.createdAt | date:'mediumDate' }}</span>
                      </div>
                      @if (review.title) {
                        <p class="text-sm font-medium text-slate-800 mb-1">{{ review.title }}</p>
                      }
                      <p class="text-slate-700 text-sm italic">"{{ review.body }}"</p>
                      <p class="text-xs text-slate-500 mt-2">- {{ review.clientName }} &middot; {{ review.serviceTypeName || 'General' }}</p>
                    </div>
                    <div class="flex gap-2 ml-4 flex-shrink-0">
                      <button (click)="approve(review)"
                              class="px-3 py-1.5 bg-[#10B981] text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                              [disabled]="actionInProgress()">
                        Approve
                      </button>
                      <button (click)="reject(review)"
                              class="px-3 py-1.5 bg-[#F87171] text-white text-xs font-medium rounded-lg hover:bg-red-500 transition-colors"
                              [disabled]="actionInProgress()">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
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
                  @for (review of allReviews(); track review.id) {
                    <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex gap-0.5">
                          @for (star of starsArray(review.rating); track $index) {
                            <span class="text-[#F59E0B] text-xs">&#9733;</span>
                          }
                        </div>
                      </td>
                      <td class="px-6 py-4 font-medium text-slate-800">{{ review.clientName }}</td>
                      <td class="px-6 py-4 text-slate-600">{{ review.serviceTypeName || 'General' }}</td>
                      <td class="px-6 py-4 text-slate-500">{{ review.createdAt | date:'mediumDate' }}</td>
                      <td class="px-6 py-4 text-center">
                        <button (click)="toggleFeatured(review)"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                [class]="review.featured ? 'bg-[#F59E0B]' : 'bg-slate-300'"
                                [disabled]="actionInProgress()">
                          <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                                [class]="review.featured ? 'translate-x-6' : 'translate-x-1'"></span>
                        </button>
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [class]="review.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                          {{ review.approved ? 'Approved' : 'Pending' }}
                        </span>
                      </td>
                    </tr>
                  }
                  @if (allReviews().length === 0) {
                    <tr>
                      <td colspan="6" class="px-6 py-12 text-center text-slate-400">No reviews yet</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class ManageReviewsComponent implements OnInit {
  private adminService = inject(AdminService);

  tabs = ['Pending Approval', 'All Reviews'];
  activeTab = signal('Pending Approval');
  loading = signal(true);
  error = signal<string | null>(null);
  actionInProgress = signal(false);
  reviews = signal<ReviewAdmin[]>([]);

  pendingReviews = computed(() => this.reviews().filter(r => !r.approved));
  allReviews = computed(() => this.reviews());

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getAllReviews().subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load reviews');
        this.loading.set(false);
      },
    });
  }

  approve(review: ReviewAdmin) {
    this.actionInProgress.set(true);
    this.adminService.approveReview(review.id).subscribe({
      next: (updated) => {
        this.reviews.update(list => list.map(r => r.id === updated.id ? updated : r));
        this.actionInProgress.set(false);
      },
      error: () => {
        this.actionInProgress.set(false);
        this.loadReviews();
      },
    });
  }

  reject(review: ReviewAdmin) {
    this.actionInProgress.set(true);
    this.adminService.rejectReview(review.id).subscribe({
      next: (updated) => {
        this.reviews.update(list => list.filter(r => r.id !== updated.id));
        this.actionInProgress.set(false);
      },
      error: () => {
        this.actionInProgress.set(false);
        this.loadReviews();
      },
    });
  }

  toggleFeatured(review: ReviewAdmin) {
    this.actionInProgress.set(true);
    this.adminService.toggleFeaturedReview(review.id).subscribe({
      next: (updated) => {
        this.reviews.update(list => list.map(r => r.id === updated.id ? updated : r));
        this.actionInProgress.set(false);
      },
      error: () => {
        this.actionInProgress.set(false);
        this.loadReviews();
      },
    });
  }

  starsArray(count: number): number[] {
    return Array(Math.max(0, count)).fill(0);
  }
}
