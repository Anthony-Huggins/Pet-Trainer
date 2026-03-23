import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { User, UserRole } from '../../../../core/models';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Manage Users</h1>
          <p class="text-slate-500 mt-1">{{ filteredUsers().length }} users found</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mt-6">
        <input type="text" placeholder="Search by name or email..."
               class="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
               [value]="searchQuery()"
               (input)="searchQuery.set($any($event.target).value)" />
        <select class="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377] bg-white"
                [value]="roleFilter()"
                (change)="roleFilter.set($any($event.target).value)">
          <option value="All">All Roles</option>
          <option value="CLIENT">Client</option>
          <option value="TRAINER">Trainer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D7377]"></div>
        </div>
      } @else if (error()) {
        <div class="mt-8 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-600 font-medium">Failed to load users</p>
          <p class="text-red-400 text-sm mt-1">{{ error() }}</p>
          <button (click)="loadUsers()" class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      } @else {
        <!-- Table -->
        <div class="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Name</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Email</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Role</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Status</th>
                  <th class="text-left px-6 py-3 font-semibold text-slate-600">Joined</th>
                  <th class="text-right px-6 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.id) {
                  <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td class="px-6 py-4 font-medium text-slate-800">{{ user.firstName }} {{ user.lastName }}</td>
                    <td class="px-6 py-4 text-slate-500">{{ user.email }}</td>
                    <td class="px-6 py-4">
                      <select class="px-2 py-1 border border-slate-200 rounded text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#0D7377]"
                              [value]="user.role"
                              (change)="changeRole(user, $any($event.target).value)">
                        <option value="CLIENT">Client</option>
                        <option value="TRAINER">Trainer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td class="px-6 py-4">
                      <button (click)="toggleStatus(user)"
                              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                              [class]="user.enabled ? 'bg-emerald-500' : 'bg-slate-300'">
                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                              [class]="user.enabled ? 'translate-x-6' : 'translate-x-1'"></span>
                      </button>
                      <span class="ml-2 text-xs font-medium" [class]="user.enabled ? 'text-emerald-600' : 'text-slate-400'">
                        {{ user.enabled ? 'Active' : 'Disabled' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-slate-500">{{ user.createdAt | date:'mediumDate' }}</td>
                    <td class="px-6 py-4 text-right">
                      <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium" [class]="roleBadge(user.role)">
                        {{ user.role }}
                      </span>
                    </td>
                  </tr>
                }
                @if (filteredUsers().length === 0) {
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-slate-400">No users found matching your criteria</td>
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
export class ManageUsersComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  roleFilter = signal('All');
  users = signal<User[]>([]);

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const role = this.roleFilter();
    return this.users().filter(u => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const matchesSearch = !q || fullName.includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = role === 'All' || u.role === role;
      return matchesSearch && matchesRole;
    });
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load users');
        this.loading.set(false);
      },
    });
  }

  changeRole(user: User, newRole: string) {
    this.adminService.updateUserRole(user.id, newRole as UserRole).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
      },
      error: () => {
        // Revert on failure by re-fetching
        this.loadUsers();
      },
    });
  }

  toggleStatus(user: User) {
    this.adminService.updateUserStatus(user.id, !user.enabled).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
      },
      error: () => {
        this.loadUsers();
      },
    });
  }

  roleBadge(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'TRAINER': return 'bg-teal-100 text-teal-700';
      case 'CLIENT': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
