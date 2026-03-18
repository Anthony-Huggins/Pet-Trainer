import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  template: `
    <div class="max-w-7xl mx-auto py-10 px-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Manage Users</h1>
          <p class="text-slate-500 mt-1">{{ filteredUsers().length }} users found</p>
        </div>
        <button class="inline-flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white font-medium rounded-lg hover:bg-amber-600 transition-colors text-sm">
          Export CSV
        </button>
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
          <option value="Client">Client</option>
          <option value="Trainer">Trainer</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

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
                <th class="text-center px-6 py-3 font-semibold text-slate-600">Dogs</th>
                <th class="text-center px-6 py-3 font-semibold text-slate-600">Bookings</th>
                <th class="text-left px-6 py-3 font-semibold text-slate-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredUsers(); track user.email) {
                <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-slate-800">{{ user.name }}</td>
                  <td class="px-6 py-4 text-slate-500">{{ user.email }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [class]="roleBadge(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center gap-1.5 text-xs font-medium"
                          [class]="user.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'">
                      <span class="w-1.5 h-1.5 rounded-full"
                            [class]="user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center text-slate-600">{{ user.dogs }}</td>
                  <td class="px-6 py-4 text-center text-slate-600">{{ user.bookings }}</td>
                  <td class="px-6 py-4 text-slate-500">{{ user.joined }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class ManageUsersComponent {
  searchQuery = signal('');
  roleFilter = signal('All');

  users = signal([
    { name: 'Sarah Mitchell', email: 'sarah.m@email.com', role: 'Client', status: 'Active', dogs: 2, bookings: 8, joined: 'Jan 15, 2026' },
    { name: 'James Kelly', email: 'james.k@email.com', role: 'Client', status: 'Active', dogs: 1, bookings: 12, joined: 'Nov 3, 2025' },
    { name: 'Dr. Emily Chen', email: 'emily.c@pawforward.com', role: 'Trainer', status: 'Active', dogs: 0, bookings: 45, joined: 'Sep 1, 2025' },
    { name: 'Mike Davidson', email: 'mike.d@email.com', role: 'Client', status: 'Disabled', dogs: 1, bookings: 3, joined: 'Feb 20, 2026' },
    { name: 'Admin User', email: 'admin@pawforward.com', role: 'Admin', status: 'Active', dogs: 0, bookings: 0, joined: 'Aug 1, 2025' },
  ]);

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const role = this.roleFilter();
    return this.users().filter(u => {
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = role === 'All' || u.role === role;
      return matchesSearch && matchesRole;
    });
  });

  roleBadge(role: string): string {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700';
      case 'Trainer': return 'bg-teal-100 text-teal-700';
      case 'Client': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
