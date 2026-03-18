import { Component, signal, computed } from '@angular/core';

interface ClientCard {
  clientName: string;
  dogName: string;
  breed: string;
  activeGoals: number;
  lastSession: string;
  vaccinationCompliant: boolean;
}

@Component({
  selector: 'app-trainer-clients',
  standalone: true,
  template: `
    <div class="min-h-screen bg-slate-100">
      <div class="max-w-6xl mx-auto py-10 px-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 class="text-3xl font-bold text-slate-800">My Clients</h1>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search clients..."
              class="pl-10 pr-4 py-2 w-72 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
              (input)="onSearch($event)"
            />
          </div>
        </div>

        <!-- Client Cards -->
        @if (filteredClients().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            @for (client of filteredClients(); track client.clientName) {
              <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-[#0D7377]/30 transition-all">
                <div class="flex items-start gap-4">
                  <!-- Dog Photo Placeholder -->
                  <div class="w-16 h-16 rounded-full bg-[#0D7377]/10 flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8 text-[#0D7377]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.5 11.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-7.5 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm3-10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-slate-800">{{ client.clientName }}</h3>
                    <p class="text-sm text-slate-500">{{ client.dogName }} &mdash; {{ client.breed }}</p>

                    <div class="mt-4 flex flex-wrap items-center gap-4 text-sm">
                      <div>
                        <span class="text-slate-400">Active Goals:</span>
                        <span class="ml-1 font-medium text-slate-700">{{ client.activeGoals }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400">Last Session:</span>
                        <span class="ml-1 font-medium text-slate-700">{{ client.lastSession }}</span>
                      </div>
                    </div>

                    <div class="mt-3 flex items-center justify-between">
                      <div class="flex items-center gap-1.5">
                        <span
                          class="w-2.5 h-2.5 rounded-full"
                          [class]="client.vaccinationCompliant ? 'bg-[#10B981]' : 'bg-[#F87171]'"
                        ></span>
                        <span class="text-xs" [class]="client.vaccinationCompliant ? 'text-[#10B981]' : 'text-[#F87171]'">
                          {{ client.vaccinationCompliant ? 'Vaccines Compliant' : 'Vaccines Overdue' }}
                        </span>
                      </div>
                      <button class="text-sm font-medium text-[#0D7377] hover:text-[#0D7377]/80 transition-colors">
                        View Details &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
            <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-700 mb-2">No clients found</h3>
            <p class="text-slate-500">Try adjusting your search or check back when clients are assigned to you.</p>
          </div>
        }

      </div>
    </div>
  `,
})
export class TrainerClientsComponent {
  searchTerm = signal('');

  clients: ClientCard[] = [
    {
      clientName: 'Sarah Johnson',
      dogName: 'Luna',
      breed: 'Golden Retriever',
      activeGoals: 3,
      lastSession: 'Mar 16, 2026',
      vaccinationCompliant: true,
    },
    {
      clientName: 'David Chen',
      dogName: 'Max',
      breed: 'French Bulldog',
      activeGoals: 2,
      lastSession: 'Mar 15, 2026',
      vaccinationCompliant: true,
    },
    {
      clientName: 'Emily Rodriguez',
      dogName: 'Bella',
      breed: 'Border Collie',
      activeGoals: 4,
      lastSession: 'Mar 14, 2026',
      vaccinationCompliant: false,
    },
    {
      clientName: 'Michael Park',
      dogName: 'Rocky',
      breed: 'German Shepherd',
      activeGoals: 2,
      lastSession: 'Mar 13, 2026',
      vaccinationCompliant: true,
    },
  ];

  filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.clients;
    return this.clients.filter(
      c =>
        c.clientName.toLowerCase().includes(term) ||
        c.dogName.toLowerCase().includes(term) ||
        c.breed.toLowerCase().includes(term)
    );
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
