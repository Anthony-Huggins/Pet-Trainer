import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DogService } from '../../../../core/services/dog.service';
import { Dog } from '../../../../core/models';

interface TrainingGoal {
  title: string;
  description: string;
  progress: number;
  targetDate: string;
  status: 'in-progress' | 'completed' | 'not-started';
}

interface SessionEntry {
  date: string;
  trainerName: string;
  summary: string;
  skills: string[];
}

@Component({
  selector: 'app-training-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto py-10 px-6">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-slate-800">Training Progress</h1>
      <p class="text-slate-500 mt-1">Track your dog's training goals and session history.</p>

      <!-- Dog Selector -->
      <div class="mt-6">
        <label for="dog-select" class="block text-sm font-medium text-slate-700 mb-1">Select Dog</label>
        <select
          id="dog-select"
          class="w-full max-w-xs rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D7377] focus:border-transparent"
          [value]="selectedDogId()"
          (change)="onDogChange($event)"
        >
          <option value="">-- Choose a dog --</option>
          @for (dog of dogs(); track dog.id) {
            <option [value]="dog.id">{{ dog.name }}</option>
          }
        </select>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0D7377]"></div>
          <span class="ml-3 text-slate-500">Loading...</span>
        </div>
      }

      @if (!loading() && selectedDogId()) {
        <!-- Active Goals -->
        <section class="mt-10">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Active Goals</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (goal of mockGoals; track goal.title) {
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-lg font-semibold text-slate-800">{{ goal.title }}</h3>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class]="getStatusClasses(goal.status)"
                  >
                    {{ getStatusLabel(goal.status) }}
                  </span>
                </div>
                <p class="text-sm text-slate-500 mb-4">{{ goal.description }}</p>

                <!-- Progress Bar -->
                <div class="mb-2">
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="text-slate-600 font-medium">Progress</span>
                    <span class="text-[#0D7377] font-semibold">{{ goal.progress }}%</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      [style.width.%]="goal.progress"
                      [class]="goal.progress === 100 ? 'bg-emerald-500' : 'bg-[#0D7377]'"
                    ></div>
                  </div>
                </div>

                <p class="text-xs text-slate-400 mt-3">Target: {{ goal.targetDate }}</p>
              </div>
            }
          </div>
        </section>

        <!-- Session History -->
        <section class="mt-10">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Session History</h2>
          <div class="space-y-4">
            @for (session of mockSessions; track session.date) {
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex gap-5">
                <!-- Date column -->
                <div class="flex-shrink-0 w-20 text-center">
                  <div class="text-2xl font-bold text-[#0D7377]">{{ session.date.split(' ')[1] }}</div>
                  <div class="text-xs text-slate-400 uppercase">{{ session.date.split(' ')[0] }}</div>
                </div>
                <!-- Divider -->
                <div class="w-px bg-slate-200"></div>
                <!-- Content -->
                <div class="flex-1">
                  <p class="text-sm text-slate-500 mb-1">Trainer: <span class="font-medium text-slate-700">{{ session.trainerName }}</span></p>
                  <p class="text-slate-700">{{ session.summary }}</p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    @for (skill of session.skills; track skill) {
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-[#0D7377]">
                        {{ skill }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      @if (!loading() && !selectedDogId()) {
        <div class="text-center py-20">
          <svg class="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" />
          </svg>
          <p class="text-slate-500 mt-4">Select a dog above to view training progress.</p>
        </div>
      }
    </div>
  `,
})
export class TrainingProgressComponent implements OnInit {
  dogs = signal<Dog[]>([]);
  selectedDogId = signal('');
  loading = signal(false);

  mockGoals: TrainingGoal[] = [
    {
      title: 'Basic Obedience',
      description: 'Sit, stay, down, and come commands with reliable response.',
      progress: 75,
      targetDate: 'April 15, 2026',
      status: 'in-progress',
    },
    {
      title: 'Leash Walking',
      description: 'Walk calmly on a loose leash without pulling or lunging.',
      progress: 40,
      targetDate: 'May 1, 2026',
      status: 'in-progress',
    },
    {
      title: 'Recall Training',
      description: 'Reliable recall in various environments and distractions.',
      progress: 100,
      targetDate: 'March 10, 2026',
      status: 'completed',
    },
  ];

  mockSessions: SessionEntry[] = [
    {
      date: 'Mar 14',
      trainerName: 'Sarah Johnson',
      summary: 'Worked on loose-leash walking in the park. Showed improvement with fewer pulls. Practiced "leave it" near distractions.',
      skills: ['Leash Walking', 'Leave It', 'Focus'],
    },
    {
      date: 'Mar 10',
      trainerName: 'Sarah Johnson',
      summary: 'Final recall session. Passed off-leash recall test with consistent response at 30+ feet.',
      skills: ['Recall', 'Off-Leash', 'Distance Commands'],
    },
    {
      date: 'Mar 5',
      trainerName: 'Mike Chen',
      summary: 'Group class session. Practiced sit-stay with duration up to 2 minutes. Introduced down-stay.',
      skills: ['Sit-Stay', 'Down-Stay', 'Group Behavior'],
    },
  ];

  constructor(private dogService: DogService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.dogService.getMyDogs().subscribe({
      next: (dogs) => {
        this.dogs.set(dogs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onDogChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedDogId.set(select.value);
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700';
      case 'in-progress':
        return 'bg-amber-50 text-amber-700';
      case 'not-started':
        return 'bg-slate-100 text-slate-500';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
      default:
        return status;
    }
  }
}
