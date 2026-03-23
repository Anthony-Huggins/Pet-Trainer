import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { ContactInquiry, ContactInquiryStatus } from '../../../../core/models';

@Component({
  selector: 'app-manage-inquiries',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <h1 class="text-3xl font-bold text-slate-800">Contact Inquiries</h1>
      <p class="text-slate-500 mt-1">Manage incoming contact form submissions</p>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D7377]"></div>
        </div>
      } @else if (error()) {
        <div class="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-600 font-medium">Failed to load inquiries</p>
          <p class="text-red-400 text-sm mt-1">{{ error() }}</p>
          <button (click)="loadInquiries()" class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      } @else {
        <!-- Tabs -->
        <div class="flex gap-1 mt-6 border-b border-slate-200">
          @for (tab of tabs; track tab.key) {
            <button (click)="activeTab.set(tab.key)"
                    class="px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
                    [class]="activeTab() === tab.key
                      ? 'border-[#0D7377] text-[#0D7377]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'">
              {{ tab.label }}
              @if (tab.key === 'NEW' && newInquiries().length > 0) {
                <span class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold bg-[#F87171] text-white">{{ newInquiries().length }}</span>
              }
            </button>
          }
        </div>

        <!-- New Tab -->
        @if (activeTab() === 'NEW') {
          @if (newInquiries().length === 0) {
            <div class="mt-16 text-center">
              <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl text-slate-400">&#10003;</span>
              </div>
              <h3 class="text-lg font-semibold text-slate-700">All caught up!</h3>
              <p class="text-sm text-slate-400 mt-1">No new inquiries</p>
            </div>
          } @else {
            <div class="mt-6 space-y-4">
              @for (inq of newInquiries(); track inq.id) {
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="font-semibold text-slate-800">{{ inq.name }}</h3>
                        @if (inq.serviceInterest) {
                          <span class="px-2 py-0.5 bg-teal-50 text-[#0D7377] text-xs font-medium rounded-full">{{ inq.serviceInterest }}</span>
                        }
                      </div>
                      <p class="text-xs text-slate-400 mb-2">{{ inq.email }} {{ inq.phone ? '&middot; ' + inq.phone : '' }} &middot; {{ inq.createdAt | date:'mediumDate' }}</p>
                      @if (inq.subject) {
                        <p class="text-sm font-medium text-slate-700 mb-1">{{ inq.subject }}</p>
                      }
                      <p class="text-sm text-slate-600">{{ inq.message }}</p>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                      <button (click)="openRespondDialog(inq)"
                              class="px-3 py-1.5 bg-[#0D7377] text-white text-xs font-medium rounded-lg hover:bg-teal-800 transition-colors"
                              [disabled]="actionInProgress()">
                        Respond
                      </button>
                      <button (click)="archive(inq)"
                              class="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                              [disabled]="actionInProgress()">
                        Archive
                      </button>
                    </div>
                  </div>

                  <!-- Inline respond form -->
                  @if (respondingTo() === inq.id) {
                    <div class="mt-4 pt-4 border-t border-slate-100">
                      <textarea [(ngModel)]="responseText"
                                rows="3"
                                placeholder="Type your response..."
                                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377] resize-none"></textarea>
                      <div class="flex gap-2 mt-2 justify-end">
                        <button (click)="respondingTo.set(null)"
                                class="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors">
                          Cancel
                        </button>
                        <button (click)="sendResponse(inq)"
                                class="px-3 py-1.5 bg-[#0D7377] text-white text-xs font-medium rounded-lg hover:bg-teal-800 transition-colors"
                                [disabled]="!responseText.trim() || actionInProgress()">
                          Send Response
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }

        <!-- Responded Tab -->
        @if (activeTab() === 'RESOLVED') {
          @if (respondedInquiries().length === 0) {
            <div class="mt-16 text-center">
              <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl text-slate-400">&#10003;</span>
              </div>
              <h3 class="text-lg font-semibold text-slate-700">No responded inquiries</h3>
              <p class="text-sm text-slate-400 mt-1">Responded inquiries will appear here</p>
            </div>
          } @else {
            <div class="mt-6 space-y-4">
              @for (inq of respondedInquiries(); track inq.id) {
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="font-semibold text-slate-800">{{ inq.name }}</h3>
                      @if (inq.serviceInterest) {
                        <span class="px-2 py-0.5 bg-teal-50 text-[#0D7377] text-xs font-medium rounded-full">{{ inq.serviceInterest }}</span>
                      }
                      <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Responded</span>
                    </div>
                    <p class="text-xs text-slate-400 mb-2">{{ inq.email }} &middot; {{ inq.createdAt | date:'mediumDate' }}</p>
                    <p class="text-sm text-slate-600 mb-3">{{ inq.message }}</p>
                    @if (inq.adminResponse) {
                      <div class="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <p class="text-xs font-medium text-slate-500 mb-1">Admin Response:</p>
                        <p class="text-sm text-slate-700">{{ inq.adminResponse }}</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- Archived Tab -->
        @if (activeTab() === 'CLOSED') {
          @if (archivedInquiries().length === 0) {
            <div class="mt-16 text-center">
              <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl text-slate-400">&#128451;</span>
              </div>
              <h3 class="text-lg font-semibold text-slate-700">No archived inquiries</h3>
              <p class="text-sm text-slate-400 mt-1">Archived inquiries will appear here</p>
            </div>
          } @else {
            <div class="mt-6 space-y-4">
              @for (inq of archivedInquiries(); track inq.id) {
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 opacity-75">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-semibold text-slate-800">{{ inq.name }}</h3>
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">Archived</span>
                  </div>
                  <p class="text-xs text-slate-400 mb-2">{{ inq.email }} &middot; {{ inq.createdAt | date:'mediumDate' }}</p>
                  <p class="text-sm text-slate-600">{{ inq.message }}</p>
                </div>
              }
            </div>
          }
        }
      }
    </div>
  `,
})
export class ManageInquiriesComponent implements OnInit {
  private adminService = inject(AdminService);

  tabs = [
    { key: 'NEW', label: 'New' },
    { key: 'RESOLVED', label: 'Responded' },
    { key: 'CLOSED', label: 'Archived' },
  ];
  activeTab = signal('NEW');
  loading = signal(true);
  error = signal<string | null>(null);
  actionInProgress = signal(false);
  respondingTo = signal<string | null>(null);
  responseText = '';
  inquiries = signal<ContactInquiry[]>([]);

  newInquiries = computed(() => this.inquiries().filter(i => i.status === ContactInquiryStatus.NEW || i.status === ContactInquiryStatus.IN_PROGRESS));
  respondedInquiries = computed(() => this.inquiries().filter(i => i.status === ContactInquiryStatus.RESOLVED));
  archivedInquiries = computed(() => this.inquiries().filter(i => i.status === ContactInquiryStatus.CLOSED));

  ngOnInit() {
    this.loadInquiries();
  }

  loadInquiries() {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getAllInquiries().subscribe({
      next: (inquiries) => {
        this.inquiries.set(inquiries);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load inquiries');
        this.loading.set(false);
      },
    });
  }

  openRespondDialog(inquiry: ContactInquiry) {
    this.respondingTo.set(inquiry.id);
    this.responseText = '';
  }

  sendResponse(inquiry: ContactInquiry) {
    if (!this.responseText.trim()) return;
    this.actionInProgress.set(true);
    this.adminService.respondToInquiry(inquiry.id, this.responseText.trim()).subscribe({
      next: (updated) => {
        this.inquiries.update(list => list.map(i => i.id === updated.id ? updated : i));
        this.respondingTo.set(null);
        this.responseText = '';
        this.actionInProgress.set(false);
      },
      error: () => {
        this.actionInProgress.set(false);
        this.loadInquiries();
      },
    });
  }

  archive(inquiry: ContactInquiry) {
    this.actionInProgress.set(true);
    this.adminService.archiveInquiry(inquiry.id).subscribe({
      next: (updated) => {
        this.inquiries.update(list => list.map(i => i.id === updated.id ? updated : i));
        this.actionInProgress.set(false);
      },
      error: () => {
        this.actionInProgress.set(false);
        this.loadInquiries();
      },
    });
  }
}
