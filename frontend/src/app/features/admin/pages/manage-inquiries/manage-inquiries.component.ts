import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-manage-inquiries',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <h1 class="text-3xl font-bold text-slate-800">Contact Inquiries</h1>
      <p class="text-slate-500 mt-1">Manage incoming contact form submissions</p>

      <!-- Tabs -->
      <div class="flex gap-1 mt-6 border-b border-slate-200">
        @for (tab of tabs; track tab) {
          <button (click)="activeTab.set(tab)"
                  class="px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
                  [class]="activeTab() === tab
                    ? 'border-[#0D7377] text-[#0D7377]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'">
            {{ tab }}
            @if (tab === 'New') {
              <span class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold bg-[#F87171] text-white">{{ newInquiries().length }}</span>
            }
          </button>
        }
      </div>

      <!-- New Tab -->
      @if (activeTab() === 'New') {
        <div class="mt-6 space-y-4">
          @for (inq of newInquiries(); track inq.email) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-semibold text-slate-800">{{ inq.name }}</h3>
                    <span class="px-2 py-0.5 bg-teal-50 text-[#0D7377] text-xs font-medium rounded-full">{{ inq.service }}</span>
                  </div>
                  <p class="text-xs text-slate-400 mb-2">{{ inq.email }} &middot; {{ inq.date }}</p>
                  <p class="text-sm text-slate-600 line-clamp-2">{{ inq.message }}</p>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <button class="px-3 py-1.5 bg-[#0D7377] text-white text-xs font-medium rounded-lg hover:bg-teal-800 transition-colors">
                    Respond
                  </button>
                  <button class="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    Archive
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Responded Tab -->
      @if (activeTab() === 'Responded') {
        <div class="mt-16 text-center">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl text-slate-400">&#10003;</span>
          </div>
          <h3 class="text-lg font-semibold text-slate-700">No responded inquiries</h3>
          <p class="text-sm text-slate-400 mt-1">Responded inquiries will appear here</p>
        </div>
      }

      <!-- Archived Tab -->
      @if (activeTab() === 'Archived') {
        <div class="mt-16 text-center">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl text-slate-400">&#128451;</span>
          </div>
          <h3 class="text-lg font-semibold text-slate-700">No archived inquiries</h3>
          <p class="text-sm text-slate-400 mt-1">Archived inquiries will appear here</p>
        </div>
      }
    </div>
  `,
})
export class ManageInquiriesComponent {
  tabs = ['New', 'Responded', 'Archived'];
  activeTab = signal('New');

  newInquiries = signal([
    {
      name: 'Mike Davidson',
      email: 'mike.d@email.com',
      service: 'Board & Train',
      date: 'Mar 17, 2026',
      message: 'Hi, I\'m interested in the Board & Train program for my 2-year-old German Shepherd. He has some leash reactivity issues and I was wondering if this program would be a good fit. What does the typical day look like?',
    },
    {
      name: 'Rachel Green',
      email: 'rachel.g@email.com',
      service: 'Private Training',
      date: 'Mar 16, 2026',
      message: 'I just adopted a rescue dog and she\'s having trouble adjusting. She\'s very anxious around new people and other dogs. Would private sessions help with her confidence building?',
    },
    {
      name: 'David Kim',
      email: 'david.k@email.com',
      service: 'Group Classes',
      date: 'Mar 16, 2026',
      message: 'Do you have any evening group classes available? I work during the day and would love to enroll my puppy in your beginner obedience class.',
    },
    {
      name: 'Jennifer Walsh',
      email: 'jen.w@email.com',
      service: 'Puppy Training',
      date: 'Mar 15, 2026',
      message: 'My 4-month-old Labradoodle needs some basic training. What age do you recommend starting, and do you offer any puppy packages?',
    },
  ]);
}
