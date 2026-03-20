import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TrainingService } from '../../../../core/services/training.service';
import { BoardTrainService } from '../../../../core/services/board-train.service';
import { TrainingLog, BoardTrainProgram } from '../../../../core/models';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="min-h-screen bg-slate-100">
      <div class="max-w-6xl mx-auto py-10 px-6">

        <!-- Greeting -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-800">Welcome back, Trainer!</h1>
          <p class="text-slate-500 mt-1">{{ today | date:'fullDate' }}</p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-[#0D7377]/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-[#0D7377]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-slate-500">Training Logs</p>
                <p class="text-2xl font-bold text-slate-800">{{ recentLogs().length }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-slate-500">Board & Train Programs</p>
                <p class="text-2xl font-bold text-slate-800">{{ activePrograms().length }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-[#F87171]/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-[#F87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-slate-500">In-Progress Programs</p>
                <p class="text-2xl font-bold text-slate-800">{{ inProgressCount() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Today's Schedule (mock data - requires scheduling service) -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-10">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Today's Schedule</h2>
          <div class="space-y-4">
            @for (session of todaySessions; track session.time) {
              <div class="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:border-[#0D7377]/30 transition-colors">
                <div class="w-20 text-center">
                  <span class="text-sm font-semibold text-[#0D7377]">{{ session.time }}</span>
                </div>
                <div class="h-10 w-px bg-slate-200"></div>
                <div class="flex-1">
                  <p class="font-medium text-slate-800">{{ session.service }}</p>
                  <p class="text-sm text-slate-500">
                    {{ session.dogName }} ({{ session.breed }}) &mdash; {{ session.clientName }}
                  </p>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {{ session.location }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Recent Training Logs -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Recent Training Logs</h2>
          @if (logsLoading()) {
            <div class="flex items-center justify-center py-8">
              <div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0D7377]"></div>
              <span class="ml-3 text-slate-500 text-sm">Loading logs...</span>
            </div>
          } @else if (recentLogs().length === 0) {
            <p class="text-slate-500 text-center py-6">No training logs recorded yet.</p>
          } @else {
            <div class="divide-y divide-slate-100">
              @for (log of recentLogs().slice(0, 5); track log.id) {
                <div class="py-3 flex items-center justify-between">
                  <div>
                    <p class="font-medium text-slate-800">{{ log.summary }}</p>
                    <p class="text-sm text-slate-500">{{ log.skillsWorked?.join(', ') }}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-sm text-slate-400">{{ log.logDate }}</span>
                    @if (log.rating) {
                      <div class="flex items-center gap-0.5 justify-end mt-1">
                        @for (star of [1,2,3,4,5]; track star) {
                          <svg class="w-4 h-4" [class]="star <= (log.rating ?? 0) ? 'text-[#F59E0B]' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

      </div>
    </div>
  `,
})
export class TrainerDashboardComponent implements OnInit {
  private trainingService = inject(TrainingService);
  private boardTrainService = inject(BoardTrainService);

  today = new Date();
  logsLoading = signal(false);
  recentLogs = signal<TrainingLog[]>([]);
  activePrograms = signal<BoardTrainProgram[]>([]);
  inProgressCount = signal(0);

  // Mock schedule data - requires scheduling service integration
  todaySessions = [
    {
      time: '9:00 AM',
      service: 'Basic Obedience',
      dogName: 'Luna',
      breed: 'Golden Retriever',
      clientName: 'Sarah Johnson',
      location: 'Room A',
    },
    {
      time: '11:00 AM',
      service: 'Puppy Socialization',
      dogName: 'Max',
      breed: 'French Bulldog',
      clientName: 'David Chen',
      location: 'Outdoor Yard',
    },
    {
      time: '2:00 PM',
      service: 'Advanced Agility',
      dogName: 'Bella',
      breed: 'Border Collie',
      clientName: 'Emily Rodriguez',
      location: 'Agility Course',
    },
  ];

  ngOnInit(): void {
    this.loadTrainerLogs();
    this.loadBoardTrainPrograms();
  }

  private loadTrainerLogs(): void {
    this.logsLoading.set(true);
    this.trainingService.getTrainerLogs().subscribe({
      next: (logs) => {
        this.recentLogs.set(logs);
        this.logsLoading.set(false);
      },
      error: () => {
        this.logsLoading.set(false);
      },
    });
  }

  private loadBoardTrainPrograms(): void {
    this.boardTrainService.getTrainerPrograms().subscribe({
      next: (programs) => {
        this.activePrograms.set(programs);
        this.inProgressCount.set(
          programs.filter(p => p.status === 'IN_PROGRESS').length
        );
      },
      error: () => {
        // Silently handle - board-train may not be available yet
      },
    });
  }
}
