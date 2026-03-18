import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, CreateTrainerRequest } from '../../../../core/services/admin.service';
import { TrainerProfile } from '../../../../core/models';

@Component({
  selector: 'app-manage-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Manage Trainers</h1>
          <p class="text-slate-500 mt-1">{{ trainers().length }} trainers on staff</p>
        </div>
        <button (click)="openCreateModal()"
                class="inline-flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white font-medium rounded-lg hover:bg-amber-600 transition-colors text-sm">
          + Add Trainer
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="mt-8 flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ error() }}
          <button (click)="loadTrainers()" class="ml-2 underline">Retry</button>
        </div>
      }

      <!-- Trainer Cards -->
      @if (!loading() && trainers().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          @for (trainer of trainers(); track trainer.id) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white bg-[#0D7377]">
                  {{ getInitials(trainer.name) }}
                </div>
                <div>
                  <h3 class="font-semibold text-slate-800">{{ trainer.name }}</h3>
                  <p class="text-xs text-slate-500">{{ trainer.email }}</p>
                </div>
              </div>

              @if (trainer.specializations && trainer.specializations.length > 0) {
                <div class="flex flex-wrap gap-1.5 mb-4">
                  @for (spec of trainer.specializations; track spec) {
                    <span class="px-2 py-0.5 bg-teal-50 text-[#0D7377] text-xs font-medium rounded-full">{{ spec }}</span>
                  }
                </div>
              }

              <div class="grid grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-slate-100">
                <div class="text-center">
                  <p class="text-lg font-bold text-slate-800">{{ trainer.yearsExperience ?? '—' }}</p>
                  <p class="text-xs text-slate-500">Years exp.</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-bold text-slate-800">{{ trainer.hourlyRate ? ('$' + trainer.hourlyRate) : '—' }}</p>
                  <p class="text-xs text-slate-500">Hourly rate</p>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">Accepting clients</span>
                <span class="inline-flex items-center gap-1.5 text-xs font-medium"
                      [ngClass]="trainer.acceptingClients ? 'text-emerald-600' : 'text-slate-400'">
                  <span class="w-2 h-2 rounded-full"
                        [ngClass]="trainer.acceptingClients ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                  {{ trainer.acceptingClients ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && trainers().length === 0 && !error()) {
        <div class="mt-12 text-center py-16">
          <p class="text-lg text-slate-500 mb-4">No trainers on staff yet.</p>
          <button (click)="openCreateModal()"
                  class="px-5 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition">
            Add Your First Trainer
          </button>
        </div>
      }

      <!-- Create Trainer Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="closeModal()">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="px-6 py-5 border-b border-slate-200">
              <h2 class="text-xl font-bold text-slate-800">Add New Trainer</h2>
              <p class="text-sm text-slate-500 mt-1">This creates a user account and trainer profile.</p>
            </div>

            <form (ngSubmit)="saveTrainer()" class="p-6 space-y-4">
              <!-- Account Info -->
              <div class="text-sm font-semibold text-slate-600 uppercase tracking-wider">Account</div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input type="text" [(ngModel)]="form.firstName" name="firstName" required
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input type="text" [(ngModel)]="form.lastName" name="lastName" required
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input type="email" [(ngModel)]="form.email" name="email" required
                       class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                  <input type="password" [(ngModel)]="form.password" name="password" required
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="text" [(ngModel)]="form.phone" name="phone"
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
              </div>

              <!-- Trainer Profile -->
              <div class="text-sm font-semibold text-slate-600 uppercase tracking-wider pt-2">Trainer Profile</div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea [(ngModel)]="form.bio" name="bio" rows="3"
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Specializations (comma-separated)</label>
                <input type="text" [(ngModel)]="specializationsInput" name="specializations"
                       placeholder="e.g. Obedience, Agility, Puppy Training"
                       class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Certifications (comma-separated)</label>
                <input type="text" [(ngModel)]="certificationsInput" name="certifications"
                       placeholder="e.g. CPDT-KA, AKC CGC Evaluator"
                       class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Years Experience</label>
                  <input type="number" [(ngModel)]="form.yearsExperience" name="yearsExperience" min="0"
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Hourly Rate ($)</label>
                  <input type="number" [(ngModel)]="form.hourlyRate" name="hourlyRate" min="0" step="0.01"
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
              </div>

              <!-- Modal Error -->
              @if (modalError()) {
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {{ modalError() }}
                </div>
              }

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" (click)="closeModal()"
                        class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition">
                  Cancel
                </button>
                <button type="submit" [disabled]="saving()"
                        class="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-sm transition disabled:opacity-50">
                  {{ saving() ? 'Creating...' : 'Create Trainer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class ManageTrainersComponent implements OnInit {
  trainers = signal<TrainerProfile[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  saving = signal(false);
  modalError = signal('');

  form: CreateTrainerRequest = this.emptyForm();
  specializationsInput = '';
  certificationsInput = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.loading.set(true);
    this.error.set('');
    this.adminService.getAllTrainers().subscribe({
      next: (data) => {
        this.trainers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load trainers. Make sure you are logged in as an admin.');
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.form = this.emptyForm();
    this.specializationsInput = '';
    this.certificationsInput = '';
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveTrainer(): void {
    if (!this.form.email || !this.form.firstName || !this.form.lastName || !this.form.password) {
      this.modalError.set('First name, last name, email, and password are required.');
      return;
    }

    this.saving.set(true);
    this.modalError.set('');

    const request: CreateTrainerRequest = {
      ...this.form,
      specializations: this.parseCommaSeparated(this.specializationsInput),
      certifications: this.parseCommaSeparated(this.certificationsInput),
    };

    this.adminService.createTrainer(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadTrainers();
      },
      error: (err) => {
        this.saving.set(false);
        this.modalError.set(err.error?.message || 'Failed to create trainer.');
      },
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private parseCommaSeparated(input: string): string[] {
    if (!input.trim()) return [];
    return input.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  }

  private emptyForm(): CreateTrainerRequest {
    return {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      bio: '',
      specializations: [],
      certifications: [],
      yearsExperience: undefined,
      hourlyRate: undefined,
      acceptingClients: true,
    };
  }
}
