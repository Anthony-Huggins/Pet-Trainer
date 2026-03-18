import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceTypeService } from '../../../../core/services/service-type.service';
import { ServiceType, ServiceCategory, ServiceTypeRequest } from '../../../../core/models';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Manage Services</h1>
          <p class="text-slate-500 mt-1">{{ services().length }} services configured</p>
        </div>
        <button (click)="openCreateModal()"
                class="inline-flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white font-medium rounded-lg hover:bg-amber-600 transition-colors text-sm">
          + Add Service
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
          <button (click)="loadServices()" class="ml-2 underline">Retry</button>
        </div>
      }

      <!-- Table -->
      @if (!loading() && services().length > 0) {
        <div class="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Name</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Category</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Duration</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Price</th>
                  <th class="text-center px-6 py-3 font-semibold text-slate-600">Max Participants</th>
                  <th class="text-center px-6 py-3 font-semibold text-slate-600">Active</th>
                  <th class="text-right px-6 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (svc of services(); track svc.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td class="px-6 py-4 font-medium text-slate-800">{{ svc.name }}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [ngClass]="categoryBadge(svc.category)">
                        {{ categoryLabel(svc.category) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ svc.durationMinutes ? svc.durationMinutes + ' min' : '—' }}</td>
                    <td class="px-6 py-4 text-slate-800 font-medium">{{ svc.price | currency }}</td>
                    <td class="px-6 py-4 text-center text-slate-600">{{ svc.maxParticipants ?? '—' }}</td>
                    <td class="px-6 py-4 text-center">
                      <span class="inline-flex items-center gap-1.5 text-xs font-medium"
                            [ngClass]="svc.active ? 'text-emerald-600' : 'text-slate-400'">
                        <span class="w-2 h-2 rounded-full"
                              [ngClass]="svc.active ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                        {{ svc.active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button (click)="openEditModal(svc)"
                              class="text-[#0D7377] hover:text-teal-800 font-medium text-xs mr-3">Edit</button>
                      <button (click)="deleteService(svc)"
                              class="text-[#F87171] hover:text-red-600 font-medium text-xs">Delete</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && services().length === 0 && !error()) {
        <div class="mt-12 text-center py-16">
          <p class="text-lg text-slate-500 mb-4">No services configured yet.</p>
          <button (click)="openCreateModal()"
                  class="px-5 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition">
            Create Your First Service
          </button>
        </div>
      }

      <!-- Modal Overlay -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="closeModal()">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="px-6 py-5 border-b border-slate-200">
              <h2 class="text-xl font-bold text-slate-800">
                {{ editingService() ? 'Edit Service' : 'Add New Service' }}
              </h2>
            </div>

            <form (ngSubmit)="saveService()" class="p-6 space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input type="text" [(ngModel)]="form.name" name="name" required
                       class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select [(ngModel)]="form.category" name="category" required
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white">
                  <option value="" disabled>Select a category</option>
                  <option value="PRIVATE">Private Session</option>
                  <option value="GROUP_CLASS">Group Class</option>
                  <option value="BOARD_AND_TRAIN">Board & Train</option>
                </select>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea [(ngModel)]="form.description" name="description" rows="3"
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"></textarea>
              </div>

              <!-- Duration + Price row -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                  <input type="number" [(ngModel)]="form.durationMinutes" name="durationMinutes" min="0"
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Price ($) *</label>
                  <input type="number" [(ngModel)]="form.price" name="price" min="0" step="0.01" required
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
              </div>

              <!-- Max Participants + Deposit -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Max Participants</label>
                  <input type="number" [(ngModel)]="form.maxParticipants" name="maxParticipants" min="1"
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Deposit ($)</label>
                  <input type="number" [(ngModel)]="form.depositAmount" name="depositAmount" min="0" step="0.01"
                         class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                </div>
              </div>

              <!-- Active toggle -->
              <div class="flex items-center gap-3">
                <input type="checkbox" [(ngModel)]="form.active" name="active" id="active"
                       class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                <label for="active" class="text-sm font-medium text-slate-700">Active (visible to clients)</label>
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
                  {{ saving() ? 'Saving...' : (editingService() ? 'Update Service' : 'Create Service') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class ManageServicesComponent implements OnInit {
  services = signal<ServiceType[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  editingService = signal<ServiceType | null>(null);
  saving = signal(false);
  modalError = signal('');

  form: ServiceTypeRequest = this.emptyForm();

  constructor(private serviceTypeService: ServiceTypeService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading.set(true);
    this.error.set('');
    this.serviceTypeService.getAllServices().subscribe({
      next: (data) => {
        this.services.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load services. Make sure you are logged in as an admin.');
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingService.set(null);
    this.form = this.emptyForm();
    this.modalError.set('');
    this.showModal.set(true);
  }

  openEditModal(svc: ServiceType): void {
    this.editingService.set(svc);
    this.form = {
      name: svc.name,
      category: svc.category,
      description: svc.description ?? '',
      durationMinutes: svc.durationMinutes,
      maxParticipants: svc.maxParticipants,
      price: svc.price,
      depositAmount: svc.depositAmount,
      active: svc.active,
      sortOrder: svc.sortOrder,
    };
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingService.set(null);
  }

  saveService(): void {
    if (!this.form.name || !this.form.category || this.form.price == null) {
      this.modalError.set('Name, category, and price are required.');
      return;
    }

    this.saving.set(true);
    this.modalError.set('');

    const editing = this.editingService();
    const request: ServiceTypeRequest = { ...this.form };

    const obs = editing
      ? this.serviceTypeService.updateService(editing.id, request)
      : this.serviceTypeService.createService(request);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadServices();
      },
      error: (err) => {
        this.saving.set(false);
        this.modalError.set(err.error?.message || 'Failed to save service.');
      },
    });
  }

  deleteService(svc: ServiceType): void {
    if (!confirm(`Delete "${svc.name}"? This cannot be undone.`)) return;

    this.serviceTypeService.deleteService(svc.id).subscribe({
      next: () => this.loadServices(),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete service.');
      },
    });
  }

  categoryBadge(category: ServiceCategory): Record<string, boolean> {
    return {
      'bg-teal-100 text-teal-700': category === ServiceCategory.PRIVATE,
      'bg-amber-100 text-amber-700': category === ServiceCategory.GROUP_CLASS,
      'bg-purple-100 text-purple-700': category === ServiceCategory.BOARD_AND_TRAIN,
    };
  }

  categoryLabel(category: ServiceCategory): string {
    switch (category) {
      case ServiceCategory.PRIVATE: return 'Private';
      case ServiceCategory.GROUP_CLASS: return 'Group Class';
      case ServiceCategory.BOARD_AND_TRAIN: return 'Board & Train';
      default: return category;
    }
  }

  private emptyForm(): ServiceTypeRequest {
    return {
      name: '',
      category: '' as ServiceCategory,
      description: '',
      durationMinutes: undefined,
      maxParticipants: undefined,
      price: 0,
      depositAmount: undefined,
      active: true,
      sortOrder: 0,
    };
  }
}
